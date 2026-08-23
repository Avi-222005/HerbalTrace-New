import validator from 'validator'
import DOMPurify from 'dompurify'

// Input validation utilities to prevent SQL injection and XSS
export const validateInput = {
  // Sanitize HTML content
  sanitizeHtml: (input) => {
    if (typeof input !== 'string') return ''
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [] 
    })
  },

  // Validate tracking code format
  trackingCode: (code) => {
    if (!code || typeof code !== 'string') return false
    // Only allow alphanumeric characters, hyphens, and underscores
    const sanitized = validator.escape(code)
    const pattern = /^[A-Z]{2}-[A-Z]{3}-\d{4}-\d{3}$/
    return pattern.test(sanitized) ? sanitized : false
  },

  // Validate email
  email: (email) => {
    if (!email || typeof email !== 'string') return false
    const sanitized = validator.normalizeEmail(email)
    return validator.isEmail(sanitized) ? sanitized : false
  },

  // Validate phone number
  phone: (phone) => {
    if (!phone || typeof phone !== 'string') return false
    const sanitized = validator.escape(phone)
    return validator.isMobilePhone(sanitized) ? sanitized : false
  },

  // Validate name (letters, spaces, hyphens only)
  name: (name) => {
    if (!name || typeof name !== 'string') return false
    const sanitized = validator.escape(name)
    const pattern = /^[a-zA-Z\s\-']{2,50}$/
    return pattern.test(sanitized) ? sanitized : false
  },

  // Validate message content
  message: (message) => {
    if (!message || typeof message !== 'string') return false
    const sanitized = DOMPurify.sanitize(validator.escape(message))
    return sanitized.length >= 10 && sanitized.length <= 1000 ? sanitized : false
  },

  // Validate company name
  company: (company) => {
    if (!company || typeof company !== 'string') return ''
    const sanitized = validator.escape(company)
    const pattern = /^[a-zA-Z0-9\s\-&.,]{2,100}$/
    return pattern.test(sanitized) ? sanitized : ''
  }
}

// Rate limiting helper
export const rateLimit = {
  attempts: new Map(),
  
  canMakeRequest: (identifier, maxAttempts = 5, windowMs = 300000) => { // 5 attempts per 5 minutes
    const now = Date.now()
    const userAttempts = rateLimit.attempts.get(identifier) || []
    
    // Filter out old attempts
    const recentAttempts = userAttempts.filter(time => now - time < windowMs)
    
    if (recentAttempts.length >= maxAttempts) {
      return false
    }
    
    // Record this attempt
    recentAttempts.push(now)
    rateLimit.attempts.set(identifier, recentAttempts)
    
    return true
  }
}

// Secure API request helper
export const secureRequest = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  // Add CSRF token if available
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }

  try {
    const response = await fetch(endpoint, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw new Error('Request failed. Please try again.')
  }
}

// Debounce utility for search inputs
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Format date safely
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Generate secure random ID
export const generateSecureId = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}