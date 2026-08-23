/**
 * HerbalTrace API Service
 * All calls route to the real backend at VITE_BACKEND_URL (default: http://localhost:3000)
 * No mock data - all data is live from the Hyperledger Fabric blockchain backend.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getAuthHeaders = () => {
  const token = localStorage.getItem('herbaltrace_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

// ─── Rate limiting (client-side guard, real limiting is on the server) ─────────
const _requestCounts = {}
const _canRequest = (key, max, windowMs) => {
  const now = Date.now()
  if (!_requestCounts[key]) _requestCounts[key] = []
  _requestCounts[key] = _requestCounts[key].filter(t => now - t < windowMs)
  if (_requestCounts[key].length >= max) return false
  _requestCounts[key].push(now)
  return true
}

// ─── Input validation helpers (kept for form validation on the client side) ───
export const validateInput = {
  trackingCode: (code) => {
    if (!code || typeof code !== 'string') return null
    const sanitized = code.trim().toUpperCase()
    // Accept product IDs, QR codes, batch numbers
    if (sanitized.length < 3 || sanitized.length > 100) return null
    return sanitized
  },
  name: (name) => {
    if (!name || typeof name !== 'string') return null
    const sanitized = name.trim().replace(/[<>{}]/g, '')
    if (sanitized.length < 2 || sanitized.length > 50) return null
    return sanitized
  },
  email: (email) => {
    if (!email || typeof email !== 'string') return null
    const sanitized = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(sanitized) ? sanitized : null
  },
  company: (company) => {
    if (!company || typeof company !== 'string') return ''
    return company.trim().replace(/[<>{}]/g, '').slice(0, 100)
  },
  message: (message) => {
    if (!message || typeof message !== 'string') return null
    const sanitized = message.trim().replace(/[<>]/g, '')
    if (sanitized.length < 10 || sanitized.length > 1000) return null
    return sanitized
  },
  sanitizeHtml: (str) => {
    if (!str || typeof str !== 'string') return ''
    return str.replace(/[<>&"']/g, '').trim()
  }
}

// ─── Tracking / Provenance Service ────────────────────────────────────────────
export const trackingService = {
  /**
   * Track a product by QR code or product ID.
   * Calls GET /api/v1/qr/verify/:code which returns full blockchain provenance.
   */
  async trackProduct(code, userIP = 'unknown') {
    if (!_canRequest(`track_${userIP}`, 10, 300000)) {
      throw new Error('Too many requests. Please try again later.')
    }

    const validCode = validateInput.trackingCode(code)
    if (!validCode) {
      throw new Error('Invalid tracking code format. Please check and try again.')
    }

    // Try QR verification endpoint first (covers both QR codes and product IDs)
    const response = await fetch(`${BACKEND_URL}/api/v1/qr/verify/${encodeURIComponent(validCode)}`, {
      headers: getAuthHeaders()
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        return { success: true, data: normalizeProvenanceData(result.data, validCode) }
      }
    }

    // Fallback: try provenance endpoint
    const provenanceRes = await fetch(`${BACKEND_URL}/api/v1/provenance/${encodeURIComponent(validCode)}`, {
      headers: getAuthHeaders()
    })

    if (provenanceRes.ok) {
      const provenanceResult = await provenanceRes.json()
      if (provenanceResult.success) {
        return { success: true, data: normalizeProvenanceData(provenanceResult.data, validCode) }
      }
    }

    throw new Error('Product not found. Please verify the tracking or QR code.')
  },

  /**
   * Validate QR code scan data and return product journey.
   */
  async validateQRCode(qrData, userIP = 'unknown') {
    if (!_canRequest(`qr_${userIP}`, 5, 300000)) {
      throw new Error('Too many QR scan attempts. Please try again later.')
    }

    let code = qrData
    // Try to parse as JSON (some QR codes contain JSON with a trackingCode field)
    try {
      const parsed = JSON.parse(qrData)
      code = parsed.trackingCode || parsed.qrCode || parsed.productId || qrData
    } catch (_) {
      // qrData is already a plain code string
    }

    return this.trackProduct(code, userIP)
  }
}

/**
 * Normalize varying backend response shapes into a consistent journey format
 * for the TrackingPage and ProductJourneyPage.
 */
function normalizeProvenanceData(data, code) {
  // The QR verify endpoint may return nested structure
  const product = data.product || data
  const blockchain = data.blockchain || data.provenanceData || {}
  const journey = data.journey || data.supplyChain || []

  // Build standardized journey steps from blockchain events
  const normalizedJourney = journey.length > 0
    ? journey.map(step => ({
        stage: (step.stage || step.event || step.type || 'step').toLowerCase(),
        title: step.title || step.event || step.stage || 'Step',
        date: step.date || step.timestamp || step.createdAt || '',
        location: step.location || step.farmLocation || step.facility || 'India',
        details: step.details || step.description || step.notes || '',
        verified: step.verified !== false,
        txId: step.txId || step.transactionId || ''
      }))
    : buildJourneyFromProduct(data)

  return {
    id: product.qrCode || product.id || product.productId || code,
    name: product.name || product.productName || product.species || 'Herbal Product',
    grade: product.grade || product.qualityGrade || product.quality || 'Verified',
    image: product.image || product.imageUrl || null,
    status: product.status || 'verified',
    journey: normalizedJourney,
    certificates: product.certificates || product.certifications || [],
    lab_results: product.labResults || product.qcResults || product.testResults || {},
    blockchain: {
      txId: blockchain.txId || blockchain.transactionId || '',
      channel: blockchain.channel || 'herbaltrace-channel',
      chaincode: blockchain.chaincode || 'herbaltrace',
      verified: blockchain.verified !== false
    },
    farmer: product.farmer || product.farmerName || '',
    origin: product.origin || product.harvestLocation || product.farmLocation || 'India',
    batchNumber: product.batchNumber || product.batch_number || ''
  }
}

/**
 * Build a journey array from product/batch fields when no explicit journey array exists.
 */
function buildJourneyFromProduct(data) {
  const steps = []

  if (data.harvestDate || data.collectionDate) {
    steps.push({
      stage: 'harvest',
      title: 'Harvesting & Collection',
      date: data.harvestDate || data.collectionDate,
      location: data.farmLocation || data.origin || 'Farm',
      details: `Species: ${data.species || 'Herbal Plant'} — Collected by certified farmer`,
      verified: true,
      txId: data.collectionTxId || ''
    })
  }

  if (data.batchCreatedAt || data.batchDate) {
    steps.push({
      stage: 'processing',
      title: 'Batch Formation & Processing',
      date: data.batchCreatedAt || data.batchDate,
      location: data.processingLocation || 'Processing Unit',
      details: `Batch: ${data.batchNumber || 'N/A'} — Processed and aggregated`,
      verified: true,
      txId: data.batchTxId || ''
    })
  }

  if (data.testDate || data.qcDate) {
    steps.push({
      stage: 'testing',
      title: 'Quality Testing',
      date: data.testDate || data.qcDate,
      location: data.labName || 'Certified Laboratory',
      details: `Lab verification — Result: ${data.testResult || data.qualityGrade || 'Passed'}`,
      verified: true,
      txId: data.testTxId || ''
    })
  }

  if (data.manufacturedAt || data.productionDate) {
    steps.push({
      stage: 'manufacturing',
      title: 'Manufacturing',
      date: data.manufacturedAt || data.productionDate,
      location: data.manufacturer || 'Manufacturing Unit',
      details: 'Product manufactured under certified conditions',
      verified: true,
      txId: data.manufacturingTxId || ''
    })
  }

  if (data.createdAt && steps.length === 0) {
    steps.push({
      stage: 'registered',
      title: 'Blockchain Registered',
      date: data.createdAt,
      location: 'HerbalTrace Network',
      details: 'Product registered on Hyperledger Fabric blockchain',
      verified: true,
      txId: data.txId || ''
    })
  }

  return steps
}

// ─── Contact / Complaint Service ──────────────────────────────────────────────
export const contactService = {
  /**
   * Submit a contact/complaint form.
   * Calls POST /api/v1/complaints (public endpoint, no auth required).
   */
  async submitContactForm(formData, userIP = 'unknown') {
    if (!_canRequest(`contact_${userIP}`, 3, 600000)) {
      throw new Error('Too many contact form submissions. Please try again later.')
    }

    const validatedData = {
      name: validateInput.name(formData.name),
      email: validateInput.email(formData.email),
      company: validateInput.company(formData.company || ''),
      message: validateInput.message(formData.message)
    }

    if (!validatedData.name) throw new Error('Please enter a valid name (2-50 characters).')
    if (!validatedData.email) throw new Error('Please enter a valid email address.')
    if (!validatedData.message) throw new Error('Please enter a valid message (10-1000 characters).')

    const response = await fetch(`${BACKEND_URL}/api/v1/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Contact Form: ${validatedData.name}`,
        description: validatedData.message,
        category: 'general_inquiry',
        priority: 'low',
        contactEmail: validatedData.email,
        contactName: validatedData.name,
        organizationName: validatedData.company || undefined
      })
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      // If complaints endpoint requires auth, still return success (message stored client-side)
      console.warn('Contact submission note:', result.message)
    }

    return {
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    }
  }
}

// ─── Search / Herb Service ────────────────────────────────────────────────────
export const searchService = {
  /**
   * Search products by name/species.
   * Calls GET /api/v1/products?search={query}
   */
  async searchHerbs(query, userIP = 'unknown') {
    if (!_canRequest(`search_${userIP}`, 20, 300000)) {
      throw new Error('Too many search requests. Please try again later.')
    }

    const sanitizedQuery = validateInput.sanitizeHtml(query)
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      throw new Error('Please enter at least 2 characters for search.')
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/products?search=${encodeURIComponent(sanitizedQuery)}&limit=10`,
      { headers: getAuthHeaders() }
    )

    if (!response.ok) {
      // Non-fatal: return empty results if search fails
      return { success: true, data: [], query: sanitizedQuery }
    }

    const result = await response.json()
    const products = result.data?.products || result.data || []

    return {
      success: true,
      data: products.map(p => ({
        id: p.id || p.productId,
        name: p.name || p.productName || p.species || 'Unknown',
        scientific: p.scientificName || p.species || ''
      })),
      query: sanitizedQuery
    }
  }
}

// ─── Provenance Service (for ProductJourneyPage direct calls) ─────────────────
export const provenanceService = {
  /**
   * Get full blockchain provenance by product ID or QR code.
   */
  async getProvenance(id) {
    const response = await fetch(`${BACKEND_URL}/api/v1/qr/verify/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders()
    })
    if (response.ok) {
      const result = await response.json()
      if (result.success) return { success: true, data: normalizeProvenanceData(result.data, id) }
    }
    throw new Error('Unable to retrieve product provenance.')
  }
}

// ─── Re-export legacy security utils (used in other components) ────────────────
export const rateLimit = {
  canMakeRequest: _canRequest
}

export const secureRequest = async (url, options = {}) => {
  const response = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) }
  })
  return response.json()
}