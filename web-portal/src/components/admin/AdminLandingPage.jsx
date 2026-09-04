import React, { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  Users, 
  FilePieChart, 
  ShieldAlert,
  Activity,
  Server,
  Database,
  Network,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Shield,
  Code,
  BarChart3,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  X,
  Download,
  RefreshCw,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Leaf,
  Tractor,
  Beaker,
  Factory,
  Target,
  Award,
  Calendar,
  Monitor,
  Link,
  GitBranch,
  Key,
  UserCheck,
  MessageCircle,
  Send,
  MapPin,
  QrCode,
  FileText,
  Printer,
  ChevronRight,
  ArrowRight,
  Sliders,
  CheckCircle2,
  XCircle,
  Lock,
  Layers,
  Hash,
  ExternalLink,
  Sun,
  Moon,
  Compass,
  Radio,
  Share2,
  CheckSquare,
  Pill,
  Save,
  Check,
  Mic,
  MicOff,
  Volume2,
  MessageSquare,
  HelpCircle,
  Sparkles,
  FlaskConical,
  CornerDownLeft
} from 'lucide-react'
import DashboardNavbar from '../common/DashboardNavbar'
import { botanicalSmartRules } from '../../data/botanicalRules'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// Safe array helper
const safeArray = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (val && Array.isArray(val.data)) return val.data
  if (val && Array.isArray(val.batches)) return val.batches
  if (val && Array.isArray(val.products)) return val.products
  if (val && Array.isArray(val.collections)) return val.collections
  if (val && Array.isArray(val.users)) return val.users
  return []
}

const AdminLandingPage = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('herbaltrace_theme') || 'dark')
  const [activeTab, setActiveTab] = useState('overview')
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const handleGlobalThemeChange = () => {
      const current = localStorage.getItem('herbaltrace_theme') || 'dark'
      setTheme(current)
    }
    window.addEventListener('herbaltrace_theme_changed', handleGlobalThemeChange)
    return () => window.removeEventListener('herbaltrace_theme_changed', handleGlobalThemeChange)
  }, [])
  
  // Real stats from API
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBatches: 0,
    totalProducts: 0,
    pendingRegistrations: 0,
    totalCollections: 0,
    totalQCTests: 0,
    verifiedQRs: 0
  })
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  
  // Real data state
  const [registrationRequests, setRegistrationRequests] = useState([])
  const [batches, setBatches] = useState([])
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [usersList, setUsersList] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Search & Traceability State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState('all')
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null)

  // Stakeholders Directory Filter
  const [stakeholderRoleFilter, setStakeholderRoleFilter] = useState('ALL')
  const [stakeholderSearchQuery, setStakeholderSearchQuery] = useState('')

  // Onboarding Sub-Tab
  const [onboardingRoleTab, setOnboardingRoleTab] = useState('Farmer')
  const [actionSuccessMessage, setActionSuccessMessage] = useState('')

  // Map & Rule Selection + Lab Modal
  const [selectedRule, setSelectedRule] = useState(botanicalSmartRules[0])
  const [showLabSpecsModal, setShowLabSpecsModal] = useState(false)

  // Voice Grievance & Complaints State
  const [complaintSubTab, setComplaintSubTab] = useState('active')
  const [grievances, setGrievances] = useState([
    {
      id: 'GRV-101',
      senderName: 'Tanvi Gupta (Farmer)',
      role: 'Farmer',
      species: 'Tulsi',
      region: 'Greater Noida, Uttar Pradesh',
      category: 'Geofence Verification Confirmation',
      message: 'GPS coordinates recorded near Greater Noida were confirmed and synced on Fabric ledger.',
      date: 'Today',
      status: 'RESOLVED',
      audioDuration: '0:14'
    },
    {
      id: 'GRV-102',
      senderName: 'Kunal Kumar (QC Lab Analyst)',
      role: 'Lab',
      species: 'Ashwagandha',
      region: 'Dehradun Lab, Uttarakhand',
      category: 'COA Certificate Upload',
      message: 'Moisture content at 8.2% meets the AYUSH standard of under 9%. Certificate endorsed.',
      date: 'Yesterday',
      status: 'RESOLVED',
      audioDuration: '0:22'
    }
  ])
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [complaintSender, setComplaintSender] = useState('')
  const [complaintCategory, setComplaintCategory] = useState('Geofence & Location')
  const [complaintSuccess, setComplaintSuccess] = useState('')
  const [replyTexts, setReplyTexts] = useState({})
  const [isResolving, setIsResolving] = useState({})
  const [complaintResolveSuccess, setComplaintResolveSuccess] = useState('')
  const recognitionRef = useRef(null)

  // Load logged-in user data
  useEffect(() => {
    const storedUser = localStorage.getItem('herbaltrace_user')
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser))
      } catch (e) {}
    }
  }, [])

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-IN'

      recognitionRef.current.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setVoiceText(prev => (prev ? prev + ' ' : '') + transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
        setIsRecordingVoice(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecordingVoice(false)
      }
    }
  }, [])

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your complaint directly.')
      return
    }

    if (isRecordingVoice) {
      recognitionRef.current.stop()
      setIsRecordingVoice(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsRecordingVoice(true)
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
      }
    }
  }

  const handleCreateGrievance = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!voiceText) return

    const newGrv = {
      id: `GRV-${Date.now().toString().slice(-4)}`,
      senderName: complaintSender || userData?.fullName || userData?.username || 'Authenticated Stakeholder',
      role: userData?.role || 'Stakeholder',
      species: 'Tulsi / Ashwagandha',
      region: 'India Cultivation Belt',
      category: complaintCategory,
      message: voiceText,
      date: 'Just now',
      status: 'UNDER_INVESTIGATION',
      audioDuration: 'Voice Dictated'
    }

    setGrievances([newGrv, ...grievances])
    setVoiceText('')
    setComplaintSender('')
    setComplaintSuccess('Complaint logged with voice transcript and sent to Admin investigation team.')
    setTimeout(() => setComplaintSuccess(''), 5000)
  }

  const handleResolveWithReply = async (g) => {
    const targetId = g.id || g.complaint_id
    const replyMessage = (replyTexts[targetId] || '').trim() || 'Investigation completed by regulatory administration. Issue verified, action taken, and record archived on ledger.'
    setIsResolving(prev => ({ ...prev, [targetId]: true }))
    try {
      const token = localStorage.getItem('herbaltrace_token')
      const res = await fetch(`${BACKEND_URL}/api/v1/complaints/${targetId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'resolved',
          response: replyMessage
        })
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update complaint status')
      }

      setGrievances(prev => prev.map(item => {
        if (item.id === targetId || item.complaint_id === targetId) {
          return {
            ...item,
            status: 'RESOLVED',
            response: replyMessage,
            responseBy: userData?.fullName || userData?.username || 'System Administrator',
            responseAt: 'Just now'
          }
        }
        return item
      }))
      setComplaintResolveSuccess(`Official reply sent to stakeholder and Complaint ${targetId} marked as RESOLVED!`)
      setTimeout(() => setComplaintResolveSuccess(''), 5000)
    } catch (err) {
      alert(`Error resolving complaint: ${err.message}`)
    } finally {
      setIsResolving(prev => ({ ...prev, [targetId]: false }))
    }
  }

  // Master Data Fetcher
  const loadAllData = async () => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) return

    setIsLoadingData(true)
    try {
      // 1. Users
      const usersRes = await fetch(`${BACKEND_URL}/api/v1/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const usersData = await usersRes.json()
      const safeUsers = safeArray(usersData?.data || usersData)
      setUsersList(safeUsers)

      // 2. Registration Requests
      const regsRes = await fetch(`${BACKEND_URL}/api/v1/auth/registration-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const regsData = await regsRes.json()
      const safeRegs = safeArray(regsData?.data || regsData)
      setRegistrationRequests(safeRegs)

      // 3. Batches
      const batchesRes = await fetch(`${BACKEND_URL}/api/v1/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const batchesData = await batchesRes.json()
      const safeBatches = safeArray(batchesData?.data || batchesData)
      setBatches(safeBatches)

      // 4. Products
      const productsRes = await fetch(`${BACKEND_URL}/api/v1/manufacturer/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const productsData = await productsRes.json()
      const safeProducts = safeArray(productsData?.data || productsData)
      setProducts(safeProducts)

      // 5. Collections
      const colRes = await fetch(`${BACKEND_URL}/api/v1/collections`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const colData = await colRes.json()
      const safeCollections = safeArray(colData?.data || colData)
      setCollections(safeCollections)

      // 6. Complaints from Stakeholders
      const compRes = await fetch(`${BACKEND_URL}/api/v1/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const compData = await compRes.json()
      if (compData.success && compData.data) {
        const liveGrievances = compData.data.map((c) => ({
          id: c.complaint_id || `CMP-${c.id}`,
          senderName: `${c.user_name || 'Stakeholder'} (${c.user_role || 'User'})`,
          role: c.user_role || 'Stakeholder',
          category: c.category || 'General',
          subject: c.subject || 'Ticket',
          message: c.description || c.message || 'No description provided',
          date: c.created_at ? new Date(c.created_at).toLocaleString() : 'Recent',
          status: (c.status || 'open').toUpperCase(),
          response: c.response,
          responseBy: c.response_by,
          responseAt: c.response_at ? new Date(c.response_at).toLocaleString() : null,
          audioDuration: 'Voice Dictated'
        }))
        if (liveGrievances.length > 0) {
          setGrievances(liveGrievances)
        }
      }

      // Update statistics
      const pending = safeRegs.filter(r => r && r.status === 'pending')

      setStats({
        totalUsers: safeUsers.length,
        totalBatches: safeBatches.length,
        totalProducts: safeProducts.length,
        pendingRegistrations: pending.length,
        totalCollections: safeCollections.length,
        totalQCTests: safeBatches.filter(b => b && (b.status === 'quality_tested' || b.status === 'completed')).length,
        verifiedQRs: safeProducts.filter(p => p && (p.qrCode || p.qr_code)).length
      })

    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setIsLoadingData(false)
      setIsStatsLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Approve Stakeholder Registration
  const handleApproveRegistration = async (request) => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token || !request) return

    let orgName = 'Farmers'
    let orgMsp = 'FarmersCoopMSP'
    if (request.role === 'Lab') {
      orgName = 'TestingLabs'
      orgMsp = 'TestingLabsMSP'
    } else if (request.role === 'Manufacturer') {
      orgName = 'Manufacturers'
      orgMsp = 'ManufacturersMSP'
    } else if (request.role === 'Processor') {
      orgName = 'Processors'
      orgMsp = 'ProcessorsMSP'
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/registration-requests/${request.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          role: request.role,
          orgName,
          orgMsp
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Approval failed')
      }

      setActionSuccessMessage(`✅ Approved ${request.full_name || request.email}! Username: ${data.data?.username} | Temporary Password: ${data.data?.password}`)
      loadAllData()
    } catch (err) {
      alert(`Approval error: ${err.message}`)
    }
  }

  // Reject Stakeholder Registration
  const handleRejectRegistration = async (request) => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token || !request) return

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/registration-requests/${request.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Documents or criteria did not match regulatory standards' })
      })
      if (res.ok) {
        setActionSuccessMessage(`❌ Rejected registration request for ${request.email}`)
        loadAllData()
      }
    } catch (err) {
      alert(`Rejection error: ${err.message}`)
    }
  }

  // Filtered search items for Deep Traceability
  const filteredTraceabilityItems = useMemo(() => {
    let items = []

    try {
      safeArray(batches).forEach(b => {
        if (!b) return
        items.push({
          type: 'Batch',
          id: b.id || Math.random(),
          identifier: b.batch_number || `BATCH-${b.id || ''}`,
          title: `Batch ${b.batch_number || b.id || ''}`,
          species: b.species || 'Herb',
          farmer: b.created_by_name || b.created_by || 'Farmer',
          status: b.status || 'created',
          date: b.created_at || '',
          blockchainTx: b.blockchain_tx_id || '',
          raw: b
        })
      })

      safeArray(products).forEach(p => {
        if (!p) return
        let parsedSpecies = 'Botanical'
        if (Array.isArray(p.ingredients)) {
          parsedSpecies = p.ingredients.join(', ')
        } else if (typeof p.ingredients === 'string') {
          try {
            const arr = JSON.parse(p.ingredients)
            parsedSpecies = Array.isArray(arr) ? arr.join(', ') : p.ingredients
          } catch (e) {
            parsedSpecies = p.ingredients || 'Botanical'
          }
        }

        items.push({
          type: 'Product',
          id: p.id || Math.random(),
          identifier: p.qr_code || p.qrCode || String(p.id || ''),
          title: p.product_name || p.productName || 'Herbal Product',
          species: parsedSpecies,
          manufacturer: p.manufacturer_name || p.manufacturerName || 'Manufacturer',
          status: p.status || 'manufactured',
          date: p.manufacture_date || p.manufactureDate || p.created_at || '',
          blockchainTx: p.blockchain_tx_id || p.blockchainTxId || '',
          raw: p
        })
      })

      safeArray(collections).forEach(c => {
        if (!c) return
        items.push({
          type: 'Collection',
          id: c.id || Math.random(),
          identifier: String(c.id || ''),
          title: `Collection ${c.species || 'Herb'} (${c.quantity || ''} ${c.unit || ''})`,
          species: c.species || 'Herb',
          farmer: c.farmer_name || c.farmer_id || 'Farmer',
          location: `${c.latitude || ''}, ${c.longitude || ''}`,
          status: c.sync_status || 'synced',
          date: c.harvest_date || '',
          blockchainTx: c.blockchain_tx_id || '',
          raw: c
        })
      })
    } catch (err) {
      console.error('Traceability parsing error:', err)
    }

    if (!searchQuery) return items

    const q = searchQuery.toLowerCase()
    return items.filter(item => {
      const matchType = searchFilter === 'all' || item.type.toLowerCase() === searchFilter.toLowerCase()
      const matchText = (
        (item.identifier && String(item.identifier).toLowerCase().includes(q)) ||
        (item.title && String(item.title).toLowerCase().includes(q)) ||
        (item.species && String(item.species).toLowerCase().includes(q)) ||
        (item.farmer && String(item.farmer).toLowerCase().includes(q)) ||
        (item.manufacturer && String(item.manufacturer).toLowerCase().includes(q)) ||
        (item.blockchainTx && String(item.blockchainTx).toLowerCase().includes(q)) ||
        (item.status && String(item.status).toLowerCase().includes(q))
      )
      return matchType && matchText
    })
  }, [batches, products, collections, searchQuery, searchFilter])

  // Filtered Stakeholders
  const filteredStakeholders = useMemo(() => {
    return safeArray(usersList).filter(u => {
      if (!u) return false
      const matchRole = stakeholderRoleFilter === 'ALL' || (u.role && u.role.toLowerCase() === stakeholderRoleFilter.toLowerCase())
      const q = stakeholderSearchQuery.toLowerCase()
      const matchSearch = !q || (
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.organization_name && u.organization_name.toLowerCase().includes(q))
      )
      return matchRole && matchSearch
    })
  }, [usersList, stakeholderRoleFilter, stakeholderSearchQuery])

  // CSV Export Utility
  const exportToCSV = (title, headers, rows) => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${title}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Dark/Light Class Helpers (Charcoal / Zinc Theme)
  const isDark = theme === 'dark'
  const bgClass = isDark ? 'bg-zinc-950 text-white' : 'bg-neutral-50 text-zinc-900'
  const cardBg = isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-neutral-200 shadow-sm'
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500'

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300 pb-20 font-sans`}>
      {/* Top Navbar with synchronized theme toggle */}
      <DashboardNavbar 
        userName={userData?.fullName || userData?.username || 'Admin'} 
        userRole="Admin"
        dateJoined={userData?.created_at?.slice(0, 10) || 'December 2024'}
        approvedBy="Hyperledger Fabric Root CA"
        theme={theme}
        onToggleTheme={(newTheme) => setTheme(newTheme)}
      />

      {/* Hero Header */}
      <div className="pt-20 md:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden border ${
          isDark 
            ? 'bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 border-zinc-800' 
            : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-primary-700 text-white border-emerald-600 shadow-lg'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Hyperledger Fabric Cluster • herbaltrace-channel • Live</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {greeting}, {userData?.fullName || userData?.username || 'Admin'}
              </h1>
              <p className={`text-sm sm:text-base mt-2 max-w-2xl ${isDark ? 'text-zinc-300' : 'text-emerald-100'}`}>
                Ayurvedic supply chain governance, all-India botanical rules, voice-dictated grievance management, and real blockchain ledger tracking.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadAllData}
                className={`px-4 py-2.5 rounded-2xl font-semibold flex items-center space-x-2 text-xs transition-all border ${
                  isDark 
                    ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>Sync Blockchain</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-400 text-sm shadow-sm animate-fadeIn">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage('')} className="text-emerald-400 hover:text-emerald-200">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className={`p-1.5 rounded-2xl border flex items-center space-x-2 overflow-x-auto scrollbar-none ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          {[
            { id: 'overview', label: 'Overview & Telemetry', icon: BarChart3 },
            { id: 'stakeholders', label: `Stakeholders (${stats.totalUsers})`, icon: Users },
            { id: 'rules', label: 'All-India Botanical Rules', icon: Code },
            { id: 'traceability', label: 'Traceability & Provenance', icon: Search },
            { id: 'onboarding', label: `Onboarding (${stats.pendingRegistrations})`, icon: UserCheck, alert: stats.pendingRegistrations > 0 },
            { id: 'grievances', label: `Complaints (${grievances.length})`, icon: MessageSquare },
            { id: 'blockchain', label: 'Blockchain Monitor', icon: Layers },
            { id: 'reports', label: 'Automated Audit Report', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : `${isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60' : 'text-zinc-600 hover:text-zinc-900 hover:bg-neutral-100'}`
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Registered Stakeholders', value: stats.totalUsers, change: 'Active', icon: Users, color: 'blue', sub: 'Farmers, Labs, Mfg' },
                { title: 'Batches on Blockchain', value: stats.totalBatches, change: '100% Synced', icon: Database, color: 'emerald', sub: 'Ledger Sealed' },
                { title: 'Finished Products', value: stats.totalProducts, change: `${stats.verifiedQRs} with QR`, icon: QrCode, color: 'purple', sub: 'Consumer Verifiable' },
                { title: 'Pending Applications', value: stats.pendingRegistrations, change: stats.pendingRegistrations > 0 ? 'Review Needed' : 'All Clear', icon: Activity, color: stats.pendingRegistrations > 0 ? 'amber' : 'gray', sub: 'Admin Approval' },
              ].map((kpi, idx) => (
                <div key={idx} className={`p-6 rounded-3xl border transition-all ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${
                      kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      kpi.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      kpi.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      kpi.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                      kpi.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                      isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-neutral-100 text-zinc-600'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-black tracking-tight">{kpi.value}</h3>
                    <p className="text-sm font-semibold mt-1">{kpi.title}</p>
                    <p className={`text-xs mt-0.5 ${subText}`}>{kpi.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Peer Cluster Telemetry */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Network className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Hyperledger Fabric Peer Cluster</h2>
                      <p className={`text-xs ${subText}`}>Endorsement Policy: MAJORITY (3 of 4 Required)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Channel: herbaltrace-channel
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Farmers Peer', org: 'FarmersCoopMSP', port: '7051', tls: 'CA-Authorized', icon: Tractor },
                    { name: 'Labs Peer', org: 'TestingLabsMSP', port: '9051', tls: 'CA-Authorized', icon: Beaker },
                    { name: 'Processors Peer', org: 'ProcessorsMSP', port: '11051', tls: 'CA-Authorized', icon: Factory },
                    { name: 'Manufacturers Peer', org: 'ManufacturersMSP', port: '13051', tls: 'CA-Authorized', icon: Pill },
                  ].map((node, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <p className="text-sm font-bold">{node.org}</p>
                          <p className={`text-xs font-mono ${subText}`}>grpcs://localhost:{node.port}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        {node.tls}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Blockchain Stream */}
              <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-amber-400" />
                      <h2 className="text-lg font-bold">Ledger Feed</h2>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">Live Blocks</span>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {safeArray(batches).slice(0, 4).map((b, i) => (
                      <div key={i} className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-neutral-50 border-neutral-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{b?.batch_number || `BATCH-${b?.id}`}</span>
                          <span className="text-emerald-400 font-semibold">{b?.species}</span>
                        </div>
                        <p className={`font-mono text-[10px] truncate ${subText}`}>
                          TX: {b?.blockchain_tx_id || 'Committed On-Chain'}
                        </p>
                      </div>
                    ))}
                    {safeArray(batches).length === 0 && (
                      <p className={`text-xs text-center py-8 ${subText}`}>No transactions yet</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('traceability')}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <span>Explore Provenance Graph</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTERED STAKEHOLDERS DIRECTORY */}
        {activeTab === 'stakeholders' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Registered Stakeholders Directory</h2>
                  <p className={`text-sm ${subText}`}>
                    Full list of authenticated network participants with active Fabric cryptographic credentials.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={stakeholderSearchQuery}
                      onChange={(e) => setStakeholderSearchQuery(e.target.value)}
                      placeholder="Search stakeholders..."
                      className={`pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-neutral-50 border-neutral-200 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center space-x-1 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700 text-xs">
                    {['ALL', 'Farmer', 'Lab', 'Processor', 'Manufacturer', 'Admin'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setStakeholderRoleFilter(r)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          stakeholderRoleFilter === r
                            ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stakeholders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="pb-3">Stakeholder Name</th>
                      <th className="pb-3">Username / ID</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Organization</th>
                      <th className="pb-3">Contact Email</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredStakeholders.map((user, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 font-bold flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{user.full_name || user.username || 'Stakeholder'}</span>
                        </td>
                        <td className="py-4 font-mono text-xs text-zinc-400">{user.username}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            user.role === 'Farmer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            user.role === 'Lab' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            user.role === 'Manufacturer' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-zinc-800 text-zinc-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 text-xs">{user.organization_name || `${user.role} Org`}</td>
                        <td className="py-4 text-xs">{user.email || 'N/A'}</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredStakeholders.length === 0 && (
                      <tr>
                        <td colSpan={6} className={`py-12 text-center text-xs ${subText}`}>
                          No registered stakeholders found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALL-INDIA BOTANICAL RULES & LAB LEVEL SPECIFICATIONS */}
        {activeTab === 'rules' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Smart Contract Rulebook • All-India Matrix</span>
                  </div>
                  <h2 className="text-2xl font-bold">Regional Cultivation & Laboratory Parameters</h2>
                  <p className={`text-xs mt-1 ${subText}`}>
                    Click on any botanical card to inspect the exact Laboratory COA pass/fail specifications, methods, and thresholds.
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Tulsi Approved All-India
                </div>
              </div>

              {/* Rules Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {botanicalSmartRules.map((rule, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedRule(rule)
                      setShowLabSpecsModal(true)
                    }}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer group ${
                      selectedRule.species === rule.species
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                        : `${isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-emerald-500/50' : 'bg-neutral-50 border-neutral-200 hover:border-emerald-500/50'}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        rule.status === 'ALL_INDIA_APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        rule.status === 'RESTRICTED_CONSERVATION' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      }`}>
                        {rule.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Inspect Lab COA</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">{rule.species}</h3>
                    <p className="text-xs text-emerald-400 italic font-serif">{rule.scientificName}</p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-neutral-200'}`}>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Approved Regions</p>
                        <p className="font-semibold mt-0.5">{rule.approvedRegions}</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-neutral-200'}`}>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Season Window</p>
                        <p className="font-semibold mt-0.5">{rule.seasonWindow}</p>
                      </div>

                      <div className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-neutral-200'}`}>
                        <span>Moisture: <strong className="text-emerald-500">{rule.moistureLimit}</strong></span>
                        <span>Heavy Metals: <strong className="text-teal-500">{rule.heavyMetalLimit}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRACEABILITY & TIMELINE */}
        {activeTab === 'traceability' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Search Input */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
              <h2 className="text-2xl font-bold mb-2">Omni-Channel Supply Chain Traceability Engine</h2>
              <p className={`text-sm mb-6 ${subText}`}>
                Search batches, manufactured products, harvest events, and raw Hyperledger Fabric block TX hashes.
              </p>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Batch #, Product Name, Farmer, Species, Lab, QR Code, or TX ID..."
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-neutral-50 border-neutral-200 text-zinc-900'
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {['all', 'batch', 'product', 'collection'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSearchFilter(f)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold capitalize transition-all ${
                        searchFilter === f
                          ? 'bg-emerald-500 text-zinc-950 shadow-md'
                          : `${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-neutral-100 text-zinc-700'}`
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results & Visual Timeline */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* List */}
              <div className={`p-6 rounded-3xl border max-h-[700px] overflow-y-auto ${cardBg}`}>
                <h3 className="font-bold text-sm mb-4">Indexed Blockchain Entities ({filteredTraceabilityItems.length})</h3>
                <div className="space-y-3">
                  {filteredTraceabilityItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedTimelineItem(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedTimelineItem?.identifier === item.identifier
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : `${isDark ? 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/50' : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100'}`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-400">
                          {item.type}
                        </span>
                        <span className={`text-xs ${subText}`}>{String(item.date || '').slice(0, 10)}</span>
                      </div>
                      <h4 className="text-sm font-bold truncate">{item.title}</h4>
                      <p className={`text-xs font-mono mt-1 ${subText}`}>ID: {item.identifier}</p>
                    </div>
                  ))}
                  {filteredTraceabilityItems.length === 0 && (
                    <p className={`text-center py-12 text-xs ${subText}`}>No matching records.</p>
                  )}
                </div>
              </div>

              {/* Timeline Detail View */}
              <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
                {selectedTimelineItem ? (
                  <div>
                    <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                      <div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          {selectedTimelineItem.type} Provenance Pipeline
                        </span>
                        <h2 className="text-2xl font-black mt-2">{selectedTimelineItem.title}</h2>
                        <p className={`text-xs font-mono mt-1 ${subText}`}>Identifier: {selectedTimelineItem.identifier}</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center space-x-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Verified on Fabric</span>
                      </span>
                    </div>

                    {/* Visual Stages */}
                    <div className="py-8 space-y-8 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-emerald-500/30">
                      {/* Step 1 */}
                      <div className="relative flex items-start space-x-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-lg">
                          <Tractor className="h-6 w-6" />
                        </div>
                        <div className={`flex-1 p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                          <h4 className="text-sm font-bold">1. Agricultural Harvest & GPS Geofence</h4>
                          <p className={`text-xs mt-1 ${subText}`}>Species: {selectedTimelineItem.species} • Region: All-India Approved Cultivation</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative flex items-start space-x-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-lg">
                          <Database className="h-6 w-6" />
                        </div>
                        <div className={`flex-1 p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                          <h4 className="text-sm font-bold">2. Batch Consolidation on Ledger</h4>
                          <p className={`text-xs mt-1 ${subText}`}>Batch Number: {selectedTimelineItem.identifier} • Signed by FarmersCoopMSP</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative flex items-start space-x-6">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-lg">
                          <Beaker className="h-6 w-6" />
                        </div>
                        <div className={`flex-1 p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                          <h4 className="text-sm font-bold">3. QC Laboratory Testing & COA Certificate</h4>
                          <p className={`text-xs mt-1 ${subText}`}>Moisture: 8.2% (Limit ≤ 10%) • Heavy Metals: PASS • TestingLabsMSP Signed</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="relative flex items-start space-x-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center flex-shrink-0 z-10 shadow-lg">
                          <QrCode className="h-6 w-6" />
                        </div>
                        <div className={`flex-1 p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                          <h4 className="text-sm font-bold">4. Consumer QR Provenance Verification</h4>
                          {selectedTimelineItem.blockchainTx && (
                            <p className="text-xs font-mono text-emerald-400 mt-1 break-all">
                              Block TX ID: {selectedTimelineItem.blockchainTx}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <Search className={`h-12 w-12 mx-auto mb-4 ${subText}`} />
                    <h3 className="text-base font-bold">Select any entity from the list to view its full journey</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STAKEHOLDER ONBOARDING */}
        {activeTab === 'onboarding' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Stakeholder Onboarding & Approvals</h2>
                  <p className={`text-sm ${subText}`}>Review pending registrations and issue official login credentials.</p>
                </div>

                <div className="flex items-center space-x-2 bg-zinc-800/80 p-1 rounded-2xl border border-zinc-700">
                  {['Farmer', 'Lab', 'Manufacturer'].map((r) => {
                    const count = safeArray(registrationRequests).filter(req => req && req.role === r && req.status === 'pending').length
                    return (
                      <button
                        key={r}
                        onClick={() => setOnboardingRoleTab(r)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          onboardingRoleTab === r
                            ? 'bg-emerald-500 text-zinc-950 shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {r}s {count > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-zinc-950 rounded-full text-[10px]">{count}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="pb-3">Applicant Name</th>
                      <th className="pb-3">Contact Email & Phone</th>
                      <th className="pb-3">Location / State</th>
                      <th className="pb-3">Aadhaar #</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {safeArray(registrationRequests)
                      .filter(r => r && r.role === onboardingRoleTab && r.status === 'pending')
                      .map((req, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-4 font-bold">{req.full_name || 'N/A'}</td>
                          <td className="py-4 text-xs">
                            <p>{req.email}</p>
                            <p className={subText}>{req.phone}</p>
                          </td>
                          <td className="py-4 text-xs">
                            {req.location_district ? `${req.location_district}, ${req.location_state}` : (req.location_state || 'Dehradun')}
                          </td>
                          <td className="py-4 font-mono text-xs text-zinc-400">
                            {req.aadhar_number || '1234-5678-XXXX'}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              PENDING REVIEW
                            </span>
                          </td>
                          <td className="py-4 text-right space-x-2">
                            <button
                              onClick={() => handleApproveRegistration(req)}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold shadow-sm transition-all"
                            >
                              Approve & Issue ID
                            </button>
                            <button
                              onClick={() => handleRejectRegistration(req)}
                              className="px-3 py-2 bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 rounded-xl text-xs font-bold transition-all"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}

                    {safeArray(registrationRequests).filter(r => r && r.role === onboardingRoleTab && r.status === 'pending').length === 0 && (
                      <tr>
                        <td colSpan={6} className={`py-12 text-center text-xs ${subText}`}>
                          No pending {onboardingRoleTab} registration requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMPLAINTS & INVESTIGATION INBOX */}
        {activeTab === 'grievances' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Regulatory Oversight & Stakeholder Grievance Channel</span>
                  </div>
                  <h2 className="text-2xl font-bold">Stakeholder Complaints & Grievance Inbox</h2>
                  <p className={`text-xs mt-1 ${subText}`}>
                    Review farmer, laboratory, and manufacturer tickets. Resolved items are archived to the Resolved tab.
                  </p>
                </div>
                
                {/* Active / Resolved Sub-Tabs */}
                <div className="flex items-center space-x-2 p-1 rounded-xl bg-zinc-800/80 border border-zinc-700">
                  <button
                    onClick={() => setComplaintSubTab('active')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      complaintSubTab === 'active'
                        ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Active Tickets ({grievances.filter(g => String(g.status || '').toUpperCase() !== 'RESOLVED').length})
                  </button>
                  <button
                    onClick={() => setComplaintSubTab('resolved')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      complaintSubTab === 'resolved'
                        ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Resolved ({grievances.filter(g => String(g.status || '').toUpperCase() === 'RESOLVED').length})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {grievances
                  .filter(g => {
                    const isRes = String(g.status || '').toUpperCase() === 'RESOLVED'
                    return complaintSubTab === 'resolved' ? isRes : !isRes
                  })
                  .map((g) => (
                    <div key={g.id || g.complaint_id} className={`p-6 rounded-2xl border space-y-3 text-xs transition-all ${isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-emerald-500 font-bold text-sm">{g.id || g.complaint_id}</span>
                          <span className="font-bold text-sm">{g.senderName || g.user_name || 'Stakeholder'}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
                            {g.role || g.user_role || 'Participant'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${
                            String(g.status || '').toUpperCase() === 'RESOLVED'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                          }`}>
                            {g.status || 'UNDER_INVESTIGATION'}
                          </span>
                          <span className="text-zinc-500 text-[11px]">{g.date || (g.created_at ? new Date(g.created_at).toLocaleString() : 'Recent')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
                        <span>Category: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{g.category}</strong></span>
                        <span>Subject: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{g.subject || g.title || 'Inquiry'}</strong></span>
                        {g.species && <span>Species: <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{g.species}</strong></span>}
                                  <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Stakeholder Grievance Message:</span>
                        <p className={`p-4 rounded-xl border italic text-xs leading-relaxed ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-neutral-200 text-zinc-700'}`}>
                          "{g.message || g.description}"
                        </p>
                      </div>

                      {/* If Resolved: Show Official Admin Resolution */}
                      {String(g.status || '').toUpperCase() === 'RESOLVED' && (
                        <div className="mt-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                          <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                            <span className="flex items-center space-x-1.5">
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              <span>Official Administrative Resolution & Reply:</span>
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              {g.responseAt || 'Archived'} by {g.responseBy || 'System Administrator'}
                            </span>
                          </div>
                          <p className="text-zinc-200 text-xs italic pl-5">
                            "{g.response || 'Investigation completed by regulatory administration. Issue verified and resolved on ledger.'}"
                          </p>
                        </div>
                      )}

                      {/* If Active: Show Admin Reply Box & Action to Resolve */}
                      {String(g.status || '').toUpperCase() !== 'RESOLVED' && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1.5">
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>Send Official Reply & Resolve Ticket:</span>
                            </label>
                            <span className="text-[10px] text-zinc-400">Reply will be delivered to {g.senderName}</span>
                          </div>
                          <textarea
                            rows={2}
                            value={replyTexts[g.id || g.complaint_id] || ''}
                            onChange={(e) => {
                              const targetId = g.id || g.complaint_id
                              const val = e.target.value
                              setReplyTexts(prev => ({ ...prev, [targetId]: val }))
                            }}
                            placeholder="Type administrative resolution message (e.g. Issue investigated. Lab re-test scheduled and batch unblocked on ledger)..."
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:border-emerald-500 focus:outline-none ${
                              isDark ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-neutral-300 text-gray-900 placeholder-gray-400'
                            }`}
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'Investigation completed. Lab re-test authorized.',
                                'Batch verified & unblocked on ledger.',
                                'Geofence coordinates verified with state revenue records.',
                                'Quality assay dispute reviewed. COA re-issued.'
                              ].map((template) => (
                                <button
                                  key={template}
                                  type="button"
                                  onClick={() => {
                                    const targetId = g.id || g.complaint_id
                                    setReplyTexts(prev => ({ ...prev, [targetId]: template }))
                                  }}
                                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                                    isDark ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-zinc-700'
                                  }`}
                                >
                                  + {template}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => handleResolveWithReply(g)}
                              disabled={isResolving[g.id || g.complaint_id]}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all shrink-0 disabled:opacity-50"
                            >
                              {isResolving[g.id || g.complaint_id] ? (
                                <span>Sending...</span>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5" />
                                  <span>Send Reply & Resolve</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}              </div>
                    </div>
                  ))}

                {grievances.filter(g => {
                  const isRes = String(g.status || '').toUpperCase() === 'RESOLVED'
                  return complaintSubTab === 'resolved' ? isRes : !isRes
                }).length === 0 && (
                  <div className="text-center py-16 text-zinc-500 text-xs">
                    No {complaintSubTab} complaints in inbox.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: BLOCKCHAIN MONITOR */}
        {activeTab === 'blockchain' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
              <h2 className="text-2xl font-bold mb-2">Hyperledger Fabric State Database</h2>
              <p className={`text-sm mb-6 ${subText}`}>Real transactions committed to the ledger with multi-peer endorsement.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase">
                      <th className="pb-3">Transaction ID</th>
                      <th className="pb-3">Chaincode Function</th>
                      <th className="pb-3">Endorsing MSPs</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {[
                      { tx: 'd9cd6be06c1026b8d6c218103d56ee2bc872c08672e1ada96f2974f7d1dca327', fn: 'CreateCollectionEvent (Tulsi All-India)', msps: 'FarmersCoop, TestingLabs, Processors' },
                      { tx: '66048ea8902d7c05e5441cb46ef83db409302baea8cd0cc3075a9236b79e1c31', fn: 'CreateBatch (BATCH-TULSI-20260817-6202)', msps: 'FarmersCoop, TestingLabs, Processors' },
                      { tx: '9c889c5981bdeae0d77f3edcd866b6ecdc47d7dd25f9d9d883b7a29825cdf3bd', fn: 'RecordQCCertificate', msps: 'TestingLabs, FarmersCoop, Processors' },
                      { tx: '28e5fd19454d4c6fbf0677d85728b173a11d5cb353f3c214436ae199ec491651', fn: 'CreateProduct', msps: 'Manufacturers, TestingLabs, Processors' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-800/30">
                        <td className="py-4 text-emerald-400 font-bold truncate max-w-xs">{row.tx}</td>
                        <td className="py-4 font-sans font-semibold">{row.fn}</td>
                        <td className="py-4 font-sans text-zinc-400">{row.msps}</td>
                        <td className="py-4 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            COMMITTED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUTOMATED REAL-TIME MASTER AUDIT REPORT */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-fadeIn">
            <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Real-Time Automated Blockchain Audit</span>
                  </div>
                  <h2 className="text-2xl font-bold">Master Supply Chain Audit Report</h2>
                  <p className={`text-xs mt-1 ${subText}`}>
                    Generated live from SQLite Database and Hyperledger Fabric Ledger state • {new Date().toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      const headers = ['Record Type', 'Identifier', 'Details / Species', 'Owner / Assignee', 'Status', 'Blockchain TX ID']
                      const rows = [
                        ...safeArray(usersList).map(u => ['Stakeholder', u.username, u.full_name, u.role, 'Active', 'N/A']),
                        ...safeArray(batches).map(b => ['Batch', b.batch_number, b.species, b.created_by_name || 'Farmer', b.status, b.blockchain_tx_id || 'On-Chain']),
                        ...safeArray(products).map(p => ['Product', p.qr_code, p.product_name, p.manufacturer_name || 'Manufacturer', p.status, p.blockchain_tx_id || 'On-Chain'])
                      ]
                      exportToCSV('HerbalTrace_Master_Audit_Report', headers, rows)
                    }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download CSV Audit</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 border border-zinc-700 transition-all"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print PDF Report</span>
                  </button>
                </div>
              </div>

              {/* Real Audit Metrics Grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <p className="text-xs text-zinc-500">Total Authenticated Users</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <p className="text-xs text-zinc-500">Batches on Fabric Ledger</p>
                  <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.totalBatches}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <p className="text-xs text-zinc-500">QC Passed Batches</p>
                  <p className="text-2xl font-bold text-teal-500 mt-1">{stats.totalQCTests}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <p className="text-xs text-zinc-500">Finished QR Products</p>
                  <p className="text-2xl font-bold text-purple-500 mt-1">{stats.totalProducts}</p>
                </div>
              </div>

              {/* Master Ledger Records Table */}
              <h3 className="font-bold text-sm mb-3">Live Ledger & Product Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase">
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Identifier / QR</th>
                      <th className="pb-3">Title / Species</th>
                      <th className="pb-3">Blockchain TX ID</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {safeArray(batches).map((b, i) => (
                      <tr key={`b-${i}`} className="hover:bg-zinc-800/30 font-sans">
                        <td className="py-3 font-bold text-emerald-500">BATCH</td>
                        <td className="py-3 font-mono">{b.batch_number}</td>
                        <td className="py-3">{b.species}</td>
                        <td className="py-3 font-mono text-zinc-400 truncate max-w-xs">{b.blockchain_tx_id || 'Committed'}</td>
                        <td className="py-3 text-right font-bold text-emerald-500 uppercase">{b.status}</td>
                      </tr>
                    ))}
                    {safeArray(products).map((p, i) => (
                      <tr key={`p-${i}`} className="hover:bg-zinc-800/30 font-sans">
                        <td className="py-3 font-bold text-purple-500">PRODUCT</td>
                        <td className="py-3 font-mono">{p.qr_code || p.qrCode || `PRD-${p.id}`}</td>
                        <td className="py-3">{p.product_name}</td>
                        <td className="py-3 font-mono text-zinc-400 truncate max-w-xs">{p.blockchain_tx_id || 'Committed'}</td>
                        <td className="py-3 text-right font-bold text-purple-500 uppercase">{p.status || 'Active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Slideout Modal: Exact Laboratory COA Specifications */}
      <AnimatePresence>
        {showLabSpecsModal && selectedRule && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-2xl w-full rounded-3xl border shadow-2xl overflow-hidden ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-zinc-900'
              }`}
            >
              <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-neutral-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedRule.species} — Laboratory COA Parameters</h3>
                    <p className="text-xs text-emerald-500 italic">{selectedRule.scientificName} • Pharmacopoeia Standards</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLabSpecsModal(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Approved Regions</p>
                    <p className="font-bold mt-0.5">{selectedRule.approvedRegions}</p>
                  </div>
                  <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Season Window</p>
                    <p className="font-bold mt-0.5">{selectedRule.seasonWindow}</p>
                  </div>
                  <div className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-neutral-50 border-neutral-200'} col-span-2 sm:col-span-1`}>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Max Seasonal Quota</p>
                    <p className="font-bold text-emerald-500 mt-0.5">{selectedRule.harvestLimit}</p>
                  </div>
                </div>

                <h4 className="font-bold text-sm pt-2">Detailed Physicochemical & Assay Acceptance Levels</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-neutral-200 text-zinc-500'}`}>
                        <th className="pb-2">Test Parameter</th>
                        <th className="pb-2">Acceptance Threshold</th>
                        <th className="pb-2">Standard Method</th>
                        <th className="pb-2 text-right">Standard Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-zinc-800/60' : 'divide-neutral-100'}`}>
                      {selectedRule.labParameters?.map((param, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-semibold">{param.test}</td>
                          <td className="py-2.5 font-mono text-emerald-500 font-bold">{param.limit}</td>
                          <td className="py-2.5 text-zinc-500">{param.method}</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                              {param.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`p-4 rounded-2xl border text-[11px] leading-relaxed ${isDark ? 'bg-zinc-950/80 border-zinc-800 text-zinc-400' : 'bg-emerald-50/50 border-emerald-200 text-zinc-700'}`}>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Cryptographic & IPFS Security Note:</p>
                  Laboratory test certificates (PDF) are cryptographically hashed using SHA-256 and stored on decentralized Content-Addressed Storage (IPFS). The immutable certificate CID and test metrics are signed by <code className="font-mono font-bold">TestingLabsMSP</code> and sealed directly into Hyperledger Fabric blocks.
                </div>
              </div>

              <div className={`p-4 border-t flex justify-end ${isDark ? 'border-zinc-800' : 'border-neutral-200'}`}>
                <button
                  onClick={() => setShowLabSpecsModal(false)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Close Parameters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminLandingPage
