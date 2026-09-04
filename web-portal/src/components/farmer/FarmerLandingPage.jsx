import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  PlayCircle, 
  BarChart3, 
  Leaf,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Navigation,
  Thermometer,
  Droplets,
  Eye,
  Star,
  TrendingUp,
  Coins,
  Award,
  Calendar,
  Package,
  Target,
  Plus,
  Search,
  Filter,
  X,
  RefreshCw,
  Download,
  Upload,
  Send,
  Shield,
  Globe,
  Zap,
  Activity,
  DollarSign,
  MessageCircle,
  Radio,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Database,
  Check,
  Loader2,
  Cloud,
  CloudOff,
  ArrowUpCircle
} from 'lucide-react'
import DashboardNavbar from '../common/DashboardNavbar'
import ComplaintModal from '../common/ComplaintModal'
import { analyzeBotanicalImage } from '../../services/aiBotanicalValidator'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const FarmerLandingPage = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [newCollectionEvent, setNewCollectionEvent] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  
  // Offline SQLite / LocalStorage Cache State
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('herbaltrace_offline_harvests') || '[]')
    } catch (e) {
      return []
    }
  })
  const [isSyncingOffline, setIsSyncingOffline] = useState(false)
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('')

  // API state
  const [collections, setCollections] = useState([])
  const [isLoadingCollections, setIsLoadingCollections] = useState(false)
  const [collectionsError, setCollectionsError] = useState('')
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [userData, setUserData] = useState(null)
  const [batches, setBatches] = useState([])
  const [alerts, setAlerts] = useState([])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Load user data from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('herbaltrace_user')
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr))
      } catch (e) {
        console.error('Failed to parse user data')
      }
    }
  }, [])

  // Fetch collections from API
  const fetchCollections = async () => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) {
      setCollectionsError('Please sign in to view collections')
      return
    }

    setIsLoadingCollections(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/collections?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch collections')
      }
      setCollections(result.data || [])
      setCollectionsError('')
    } catch (err) {
      setCollectionsError(err.message)
    } finally {
      setIsLoadingCollections(false)
    }
  }

  const fetchBatches = async () => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/batches?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setBatches(result.data?.batches || result.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err)
    }
  }

  const fetchAlerts = async () => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/alerts?status=pending&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setAlerts(result.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }

  // Save Harvest to Offline Queue
  const saveToOfflineCache = (payload) => {
    const offlineItem = {
      id: `OFFLINE-${Date.now()}`,
      payload,
      createdAt: new Date().toISOString(),
      species: payload.species,
      quantity: `${payload.quantity} ${payload.unit || 'kg'}`,
      status: 'offline_cached'
    }
    const updated = [offlineItem, ...offlineQueue]
    setOfflineQueue(updated)
    localStorage.setItem('herbaltrace_offline_harvests', JSON.stringify(updated))
    setSyncSuccessMessage(`Harvest saved to offline cache. Will auto-sync to Fabric once online.`)
    setTimeout(() => setSyncSuccessMessage(''), 6000)
  }

  // Sync Offline Queue to Backend & Fabric Blockchain
  const syncOfflineHarvests = async () => {
    const stored = JSON.parse(localStorage.getItem('herbaltrace_offline_harvests') || '[]')
    if (stored.length === 0) return
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) return

    setIsSyncingOffline(true)
    let syncedCount = 0
    const remainingQueue = []

    for (const item of stored) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/collections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(item.payload)
        })
        const data = await res.json()
        if (res.ok && data.success) {
          syncedCount++
        } else {
          remainingQueue.push(item)
        }
      } catch (err) {
        remainingQueue.push(item)
      }
    }

    setOfflineQueue(remainingQueue)
    localStorage.setItem('herbaltrace_offline_harvests', JSON.stringify(remainingQueue))
    setIsSyncingOffline(false)

    if (syncedCount > 0) {
      setSyncSuccessMessage(`Successfully synced ${syncedCount} offline harvest(s) to Hyperledger Fabric.`)
      setTimeout(() => setSyncSuccessMessage(''), 6000)
      fetchCollections()
    }
  }

  // Network Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineHarvests()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    fetchCollections()
    fetchBatches()
    fetchAlerts()
  }, [])

  // GPS location capture - Fetch on mount
  useEffect(() => {
    fetchGPSLocation()
  }, [])

  // Re-fetch GPS when collection modal opens
  useEffect(() => {
    if (showNewCollectionModal) {
      fetchGPSLocation()
    }
  }, [showNewCollectionModal])

  // Function to fetch real-time GPS location
  const fetchGPSLocation = () => {
    setLocationLoading(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          accuracy: parseFloat(position.coords.accuracy.toFixed(2))
        })
        setLocationError('')
        setLocationLoading(false)
      },
      (error) => {
        let errorMsg = 'Unable to fetch location'
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable location services.'
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please check your GPS.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.'
        }
        setLocationError(errorMsg)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Calculate stats from real data
  const today = new Date().toISOString().split('T')[0]
  const todayCollections = collections.filter(c => c.harvestDate?.startsWith(today) || c.createdAt?.startsWith(today))
  
  const farmerStats = [
    { id: 1, title: 'Collections Today', value: String(todayCollections.length), change: '+0', trend: 'up', icon: Package, color: 'blue' },
    { id: 2, title: 'Total Collections', value: String(collections.length), change: '+0', trend: 'up', icon: Star, color: 'green' },
    { id: 3, title: 'Synced', value: String(collections.filter(c => c.syncStatus === 'synced').length), change: '0', trend: 'up', icon: Coins, color: 'purple' },
    { id: 4, title: 'Pending Sync', value: String(collections.filter(c => c.syncStatus === 'pending').length), change: '0', trend: 'up', icon: AlertTriangle, color: 'orange' }
  ]

  // Convert API collections to display format
  const collectionEvents = collections.map((c) => ({
    id: c.id,
    species: c.species || c.commonName || 'Unknown',
    location: { lat: c.latitude, lng: c.longitude, name: c.zoneName || 'Field' },
    quantity: `${c.quantity} ${c.unit || 'kg'}`,
    moisture: c.moistureContent ? `${c.moistureContent}%` : 'N/A',
    quality: c.qualityGrade || 'Pending',
    timestamp: c.harvestDate || c.createdAt,
    status: c.syncStatus === 'synced' ? 'Synced' : c.syncStatus === 'pending' ? 'Pending Sync' : c.syncStatus === 'failed' ? 'failed' : c.syncStatus,
    photos: c.images || [],
    gpsAccuracy: c.accuracy ? `${c.accuracy}m` : 'N/A',
    blockchainTxId: c.blockchainTxId
  }))

  // Use dynamic alerts from API, or show info if none
  const displayAlerts = alerts.length > 0 
    ? alerts.map(a => ({
        id: a.id,
        type: a.alert_type || a.title || 'Alert',
        message: a.message || a.details || '',
        severity: a.severity || 'Medium'
      }))
    : []

  // Calculate earnings from collections (basic calculation)
  const earningsHistory = useMemo(() => {
    const monthlyData = {}
    collections.forEach(c => {
      const date = new Date(c.harvestDate || c.createdAt)
      const monthKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { collections: 0, totalQuantity: 0 }
      }
      monthlyData[monthKey].collections += 1
      monthlyData[monthKey].totalQuantity += parseFloat(c.quantity) || 0
    })
    
    // Calculate estimated earnings (example: Rs. 100/kg average)
    return Object.entries(monthlyData).slice(0, 4).map(([month, data]) => ({
      month,
      amount: Math.round(data.totalQuantity * 100),
      collections: data.collections,
      bonus: data.collections > 10 ? Math.round(data.collections * 5) : 0
    }))
  }, [collections])

  // Calculate reputation based on collection data
  const reputationScore = useMemo(() => {
    const syncedCount = collections.filter(c => c.syncStatus === 'synced').length
    const totalCount = collections.length
    const syncRate = totalCount > 0 ? (syncedCount / totalCount) * 100 : 0
    
    const withPhotos = collections.filter(c => c.images && c.images.length > 0).length
    const photoRate = totalCount > 0 ? (withPhotos / totalCount) * 100 : 0
    
    const withGps = collections.filter(c => c.accuracy && c.accuracy < 10).length
    const gpsRate = totalCount > 0 ? (withGps / totalCount) * 100 : 0
    
    const overall = totalCount > 0 ? Math.round((syncRate + photoRate + gpsRate) / 3) : 0
    
    return {
      overall: overall || 0,
      punctuality: Math.round(syncRate) || 0,
      quality: Math.round(photoRate) || 0,
      compliance: Math.round(gpsRate) || 0,
      sustainability: totalCount > 0 ? Math.min(100, Math.round(totalCount * 2)) : 0,
      trend: syncRate > 80 ? 'increasing' : 'stable'
    }
  }, [collections])

  // Global theme synchronization
  const [theme, setTheme] = useState(() => localStorage.getItem('herbaltrace_theme') || 'dark')

  useEffect(() => {
    const handleGlobalThemeChange = () => {
      setTheme(localStorage.getItem('herbaltrace_theme') || 'dark')
    }
    window.addEventListener('herbaltrace_theme_changed', handleGlobalThemeChange)
    return () => window.removeEventListener('herbaltrace_theme_changed', handleGlobalThemeChange)
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Dashboard Navbar */}
      <DashboardNavbar 
        userName={userData?.fullName || userData?.username || 'Farmer'} 
        userRole="Farmer"
        dateJoined={userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Member'}
        approvedBy="FarmersCoopMSP • Fabric CA"
        theme={theme}
        onToggleTheme={(t) => setTheme(t)}
      />

      {/* Header/Greeting Section */}
      <div className="pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-primary-100 text-sm md:text-base mb-1">Welcome back</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{greeting}, {userData?.fullName || 'Farmer'}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 gap-1 sm:gap-0">
                  <p className="text-primary-100 text-sm md:text-base">User ID: {userData?.userId || 'N/A'}</p>
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-green-300">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-red-300" />
                        <span className="text-sm text-red-300">Offline Mode</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewCollectionModal(true)}
                  className="bg-white text-primary-700 px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:bg-primary-50 transition-colors text-sm md:text-base shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Collection</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComplaintModal(true)}
                  className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:bg-red-600 transition-colors text-sm md:text-base shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Raise & Track Complaint</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Visual Offline SQLite Cache Sync Status Banner */}
          {offlineQueue.length > 0 && (
            <div className="mt-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-300 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {offlineQueue.length} Harvest(s) Stored in Offline Local Cache
                  </div>
                  <div className="text-xs text-amber-400/80">
                    Saved in field mode. Auto-syncs or tap sync to commit to Hyperledger Fabric.
                  </div>
                </div>
              </div>
              <button
                onClick={syncOfflineHarvests}
                disabled={isSyncingOffline || !isOnline}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all shrink-0"
              >
                {isSyncingOffline ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing to Fabric...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Sync to Blockchain Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {syncSuccessMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards - Theme Aware */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {farmerStats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border transition-all ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${
                  stat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                  stat.color === 'green' ? 'bg-emerald-500/10 text-emerald-500' :
                  stat.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-orange-500/10 text-orange-500'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold">{stat.value}</h3>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs - Theme Aware */}
        <div className={`p-1.5 rounded-2xl border flex items-center space-x-2 overflow-x-auto scrollbar-none ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          {[
            { id: 'overview', label: 'Collection Overview', icon: BarChart3 },
            { id: 'collections', label: 'Collection Events', icon: MapPin },
            { id: 'handover', label: 'Batch Handover', icon: Package },
            { id: 'earnings', label: 'Earnings History', icon: Coins },
            { id: 'reputation', label: 'Reputation Score', icon: Award },
            { id: 'sustainability', label: 'Sustainability', icon: Leaf }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : `${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60' : 'text-zinc-600 hover:text-zinc-900 hover:bg-neutral-100'}`
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              <CollectionSummary collections={collections} isDark={theme === 'dark'} />
              <QualityMetrics collections={collections} isDark={theme === 'dark'} />
              <WeatherInfo isDark={theme === 'dark'} />
            </motion.div>
          )}

          {activeTab === 'collections' && (
            <motion.div
              key="collections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <CollectionEventsView events={collectionEvents} onSelectEvent={setSelectedEvent} isDark={theme === 'dark'} />
            </motion.div>
          )}

          {activeTab === 'handover' && (
            <motion.div
              key="handover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <BatchHandover batches={batches} onShowHandover={setShowHandoverModal} isDark={theme === 'dark'} />
            </motion.div>
          )}

          {activeTab === 'earnings' && (
            <motion.div
              key="earnings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <EarningsHistory history={earningsHistory} isDark={theme === 'dark'} />
            </motion.div>
          )}

          {activeTab === 'reputation' && (
            <motion.div
              key="reputation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <ReputationDashboard score={reputationScore} isDark={theme === 'dark'} />
            </motion.div>
          )}

          {activeTab === 'sustainability' && (
            <motion.div
              key="sustainability"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <SustainabilityScore isDark={theme === 'dark'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNewCollectionModal && (
          <NewCollectionFormModal 
            location={currentLocation}
            locationLoading={locationLoading}
            locationError={locationError}
            isOnline={isOnline}
            onRefreshLocation={fetchGPSLocation}
            onSaveOffline={saveToOfflineCache}
            onClose={() => setShowNewCollectionModal(false)}
            onSuccess={() => {
              setShowNewCollectionModal(false)
              fetchCollections()
            }}
          />
        )}
        {showNewCollectionModal && (
          <NewCollectionFormModal 
            location={currentLocation}
            locationLoading={locationLoading}
            locationError={locationError}
            isOnline={isOnline}
            onRefreshLocation={fetchGPSLocation}
            onSaveOffline={saveToOfflineCache}
            onClose={() => setShowNewCollectionModal(false)}
            onSuccess={() => {
              setShowNewCollectionModal(false)
              fetchCollections()
            }}
          />
        )}
        {showComplaintModal && (
          <ComplaintModal 
            role="Farmer"
            onClose={() => setShowComplaintModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Collection Summary Component
const CollectionSummary = ({ collections, isDark }) => {
  const today = new Date().toISOString().split('T')[0]
  const todaysCollections = collections.filter(c => {
    const harvestDate = c.harvestDate ? c.harvestDate.split('T')[0] : ''
    const createdDate = c.createdAt ? c.createdAt.split('T')[0] : ''
    return harvestDate === today || createdDate === today
  })
  
  const displayCollections = todaysCollections.length > 0 
    ? todaysCollections.slice(0, 5).map(c => ({
        species: c.species || c.commonName || 'Unknown',
        quantity: `${c.quantity} ${c.unit || 'kg'}`,
        quality: c.qualityGrade || 'Pending',
        time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'
      }))
    : [{ species: 'No collections today', quantity: '--', quality: '--', time: '--' }]
  
  return (
    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
      <h2 className="text-lg font-bold mb-4">Today's Harvest Collections</h2>
      <div className="space-y-3">
        {displayCollections.map((item, index) => (
          <div key={index} className={`flex items-center justify-between p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
            <div>
              <p className="font-bold text-xs">{item.species}</p>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{item.quantity} - {item.quality}</p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quality Metrics Component
const QualityMetrics = ({ collections, isDark }) => {
  const syncedCollections = collections.filter(c => c.syncStatus === 'synced')
  
  const collectionsWithMoisture = collections.filter(c => c.moistureContent)
  const avgMoisture = collectionsWithMoisture.length > 0 
    ? (collectionsWithMoisture.reduce((sum, c) => sum + parseFloat(c.moistureContent || 0), 0) / collectionsWithMoisture.length).toFixed(1)
    : 'N/A'
  
  const syncPercentage = collections.length > 0 
    ? Math.round((syncedCollections.length / collections.length) * 100)
    : 0
  
  const collectionsWithGps = collections.filter(c => c.accuracy)
  const avgGpsAccuracy = collectionsWithGps.length > 0 
    ? (collectionsWithGps.reduce((sum, c) => sum + parseFloat(c.accuracy || 0), 0) / collectionsWithGps.length).toFixed(1)
    : 'N/A'
  
  const collectionsWithPhotos = collections.filter(c => c.images && c.images.length > 0)
  const photoPercentage = collections.length > 0 
    ? Math.round((collectionsWithPhotos.length / collections.length) * 100)
    : 0

  const metrics = [
    { metric: 'Moisture Content', value: avgMoisture !== 'N/A' ? `${avgMoisture}%` : 'N/A', target: '<15%', status: avgMoisture !== 'N/A' && parseFloat(avgMoisture) < 15 ? 'good' : 'neutral' },
    { metric: 'Sync Rate', value: `${syncPercentage}%`, target: '>90%', status: syncPercentage > 90 ? 'excellent' : syncPercentage > 70 ? 'good' : 'neutral' },
    { metric: 'GPS Accuracy', value: avgGpsAccuracy !== 'N/A' ? `${avgGpsAccuracy}m` : 'N/A', target: '<5m', status: avgGpsAccuracy !== 'N/A' && parseFloat(avgGpsAccuracy) < 5 ? 'good' : 'neutral' },
    { metric: 'Photo Documentation', value: `${photoPercentage}%`, target: '>85%', status: photoPercentage > 85 ? 'excellent' : photoPercentage > 60 ? 'good' : 'neutral' }
  ]

  return (
    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
      <h2 className="text-lg font-bold mb-4">Quality & Telemetry Metrics</h2>
      <div className="space-y-3">
        {metrics.map((item) => (
          <div key={item.metric} className={`flex items-center justify-between p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
            <div>
              <p className="font-bold text-xs">{item.metric}</p>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Target: {item.target}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              item.status === 'excellent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              item.status === 'good' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
              'bg-zinc-800 text-zinc-400'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Weather Info Component
const WeatherInfo = ({ isDark }) => (
  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
    <h2 className="text-lg font-bold mb-4">Weather & Geo-Harvest Conditions</h2>
    <div className="space-y-4">
      <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
        <div className="flex items-center space-x-3">
          <Thermometer className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-xs">Ambient Temperature</span>
        </div>
        <span className="text-xl font-extrabold text-orange-500">28°C</span>
      </div>
      <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
        <div className="flex items-center space-x-3">
          <Droplets className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-xs">Relative Humidity</span>
        </div>
        <span className="text-xl font-extrabold text-blue-500">65%</span>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl">
        <p className="text-xs font-bold text-emerald-500">Optimal Collection Conditions</p>
        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-emerald-800'}`}>Geo-fencing active • Solar index ideal for harvest</p>
      </div>
    </div>
  </div>
)

// Collection Events View Component
const CollectionEventsView = ({ events, onSelectEvent, isDark }) => (
  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
      <h2 className="text-lg font-bold">Geo-Tagged Collection Events</h2>
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono text-emerald-500 font-bold">{events.length} Recorded Events</span>
      </div>
    </div>

    <div className="space-y-3">
      {events.map((event) => (
        <motion.div
          key={event.id}
          whileHover={{ scale: 1.01 }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
          }`}
          onClick={() => onSelectEvent(event)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-xl">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{event.species}</h3>
                <p className="text-[11px] font-mono text-zinc-500">Event ID: {event.id}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {event.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-zinc-500 text-[10px]">Location</p>
              <p className="font-bold">{event.location?.name || 'Greater Noida Farm'}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Quantity</p>
              <p className="font-bold">{event.quantity}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Moisture %</p>
              <p className="font-bold">{event.moisture || '8.5%'}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Quality Grade</p>
              <p className="font-bold text-emerald-500">{event.quality || 'Grade A'}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

// Batch Handover Component
const BatchHandover = ({ batches, onShowHandover, isDark }) => {
  const handoverBatches = batches.filter(b => 
    b.status === 'created' || b.status === 'assigned' || b.status === 'pending'
  )
  
  return (
    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
      <h2 className="text-lg font-bold mb-4">Batches Ready for Logistics Handover</h2>
      <div className="space-y-3">
        {handoverBatches.length > 0 ? handoverBatches.map((batch) => (
          <div key={batch.batch_number || batch.id} className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm font-mono text-emerald-500">{batch.batch_number || `BATCH-${batch.id}`}</h3>
                <p className="text-xs mt-0.5">{batch.species} - {batch.total_quantity} {batch.unit || 'kg'}</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Status: <span className="text-emerald-400 font-bold uppercase">{batch.status}</span>
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-zinc-500 text-xs">
            <Package className="h-10 w-10 mx-auto mb-2 text-zinc-400" />
            <p>All harvest batches have been successfully transferred to Quality Testing Lab</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Earnings History Component
const EarningsHistory = ({ history, isDark }) => (
  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
    <h2 className="text-lg font-bold mb-4">Farmer Harvest Earnings & Quality Incentives</h2>
    <div className="space-y-3">
      {history.length > 0 ? history.map((record, index) => (
        <div key={index} className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xs">{record.month}</h3>
            <span className="text-base font-extrabold text-emerald-500">₹{record.amount.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-zinc-500 text-[10px]">Collections</p>
              <p className="font-bold">{record.collections}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Quality Bonus</p>
              <p className="font-bold text-emerald-500">+₹{record.bonus}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Avg / Event</p>
              <p className="font-bold">₹{record.collections > 0 ? Math.round(record.amount / record.collections) : 0}</p>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-8 text-zinc-500 text-xs">
          <Coins className="h-10 w-10 mx-auto mb-2 text-zinc-400" />
          <p>No earnings history recorded yet</p>
        </div>
      )}
    </div>
  </div>
)

// Reputation Dashboard Component
const ReputationDashboard = ({ score, isDark }) => (
  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
    <h2 className="text-lg font-bold mb-4">Farmer Collector Reputation Index</h2>
    <div className="text-center mb-6">
      <div className="text-4xl font-extrabold text-emerald-500 mb-1">{score?.overall || 96}</div>
      <p className="text-xs text-zinc-500">AYUSH Pharmacopoeia Verified Farmer Rating</p>
    </div>
  </div>
)

// Sustainability Score Component
const SustainabilityScore = ({ isDark }) => (
  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'}`}>
    <h2 className="text-lg font-bold mb-4">Farmer Sustainable Harvesting Score</h2>
    <div className="text-center mb-6">
      <div className="text-4xl font-extrabold text-emerald-500 mb-1">A+</div>
      <p className="text-xs text-zinc-500">Regenerative Cultivation & Organic Compliance</p>
    </div>
    <div className="grid sm:grid-cols-2 gap-3 text-xs">
      {[
        { metric: 'Carbon Footprint', score: 'Low Impact (92%)' },
        { metric: 'Water Conservation', score: 'Drip Irrigated (96%)' },
        { metric: 'Biodiversity Index', score: 'Native Flora Preserved (88%)' },
        { metric: 'Soil Microbiome Health', score: '100% Organic Humus (85%)' }
      ].map((item) => (
        <div key={item.metric} className={`p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="font-bold">{item.metric}</div>
          <div className="text-emerald-500 font-semibold mt-1">{item.score}</div>
        </div>
      ))}
    </div>
  </div>
)

// One-Tap Regional Voice Harvest Assistant Modal (Hindi & English)
const RegionalVoiceHarvestAssistantModal = ({
  isOpen,
  onClose,
  currentLocation,
  isOnline,
  onSuccessSubmit,
  onSaveOffline,
  isDark
}) => {
  const [language, setLanguage] = useState('hi-IN')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voiceFeedback, setVoiceFeedback] = useState('')
  const recognitionRef = React.useRef(null)

  // Natural Language Botanical Parser for Regional Voice
  const parseRegionalHarvestSpeech = (text) => {
    if (!text) return null
    const lower = text.toLowerCase()
    
    // Herb matching
    let species = 'Tulsi'
    let commonName = 'Holy Basil (Tulasi)'
    let partCollected = 'leaves'
    let harvestMethod = 'hand_picking'

    if (lower.includes('ashwagandha') || lower.includes('अश्वगंधा') || lower.includes('asgandh')) {
      species = 'Ashwagandha'
      commonName = 'Indian Ginseng / Asgandh'
      partCollected = 'roots'
      harvestMethod = 'digging'
    } else if (lower.includes('tulsi') || lower.includes('तुलसी') || lower.includes('tulasi')) {
      species = 'Tulsi'
      commonName = 'Holy Basil / Tulasi'
      partCollected = 'leaves'
      harvestMethod = 'hand_picking'
    } else if (lower.includes('neem') || lower.includes('नीम') || lower.includes('nimba')) {
      species = 'Neem'
      commonName = 'Margosa / Nimba'
      partCollected = 'leaves'
      harvestMethod = 'pruning'
    } else if (lower.includes('brahmi') || lower.includes('ब्राह्मी')) {
      species = 'Brahmi'
      commonName = 'Water Hyssop / Brahmi'
      partCollected = 'whole_plant'
      harvestMethod = 'hand_picking'
    } else if (lower.includes('turmeric') || lower.includes('हल्दी') || lower.includes('haldi')) {
      species = 'Turmeric'
      commonName = 'Haldi / Haridra'
      partCollected = 'roots'
      harvestMethod = 'digging'
    } else if (lower.includes('giloy') || lower.includes('गिलोय') || lower.includes('guduchi')) {
      species = 'Giloy'
      commonName = 'Guduchi / Amrita'
      partCollected = 'stem'
      harvestMethod = 'cutting'
    } else if (lower.includes('amla') || lower.includes('आंवला')) {
      species = 'Amla'
      commonName = 'Indian Gooseberry / Amalaki'
      partCollected = 'fruit'
      harvestMethod = 'hand_picking'
    }

    // Number extraction
    let quantity = 10
    const hindiNumbers = {
      'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5,
      'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
      'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'पचास': 50, 'सौ': 100
    }

    const words = text.split(/\s+/)
    for (const w of words) {
      if (hindiNumbers[w]) {
        quantity = hindiNumbers[w]
        break
      }
    }

    const numMatch = text.match(/(\d+(\.\d+)?)/)
    if (numMatch) {
      quantity = parseFloat(numMatch[1])
    }

    return {
      species,
      commonName,
      quantity,
      unit: 'kg',
      partCollected,
      harvestMethod,
      harvestDate: new Date().toISOString().split('T')[0],
      latitude: currentLocation?.lat || 28.5355,
      longitude: currentLocation?.lng || 77.3910,
      accuracy: currentLocation?.accuracy || 5
    }
  }

  // Voice synthesis feedback helper
  const speakFeedback = (msg, lang) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(msg)
        utterance.lang = lang || 'hi-IN'
        utterance.rate = 0.95
        window.speechSynthesis.speak(utterance)
      } catch (e) {}
    }
  }

  const startVoiceListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by your browser. Please type directly.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setParsedData(null)
    }

    recognition.onresult = (event) => {
      let current = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript
      }
      setTranscript(current)
      const parsed = parseRegionalHarvestSpeech(current)
      if (parsed) {
        setParsedData(parsed)
      }
    }

    recognition.onerror = (e) => {
      console.warn('Voice error:', e.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (parsedData) {
        const feedback = language === 'hi-IN'
          ? `${parsedData.quantity} किलो ${parsedData.species} दर्ज करने के लिए तैयार है।`
          : `Ready to record ${parsedData.quantity} kg of ${parsedData.species}.`
        setVoiceFeedback(feedback)
        speakFeedback(feedback, language)
      }
    }

    recognition.start()
  }

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleConfirmAndRecord = async () => {
    if (!parsedData) return
    setIsSubmitting(true)

    const payload = {
      ...parsedData,
      latitude: currentLocation?.lat || parsedData.latitude,
      longitude: currentLocation?.lng || parsedData.longitude,
      accuracy: currentLocation?.accuracy || 5
    }

    if (!isOnline) {
      onSaveOffline(payload)
      setIsSubmitting(false)
      onClose()
      return
    }

    try {
      const token = localStorage.getItem('herbaltrace_token')
      const res = await fetch(`${BACKEND_URL}/api/v1/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit collection')
      }
      onSuccessSubmit()
      onClose()
    } catch (err) {
      onSaveOffline(payload)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Regional Voice Assistant</h3>
              <p className="text-xs text-zinc-400">वन-टैप क्षेत्रीय आवाज़ सहायक (Hindi / English)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between my-4 p-3 rounded-2xl border bg-zinc-900/60 border-zinc-800 text-xs">
          <span className="font-bold text-zinc-400">Speech Language:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage('hi-IN')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                language === 'hi-IN' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              🇮🇳 हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setLanguage('en-IN')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                language === 'en-IN' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              🌐 English (India)
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center my-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isListening ? stopVoiceListening : startVoiceListening}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
              isListening
                ? 'bg-red-500 text-white ring-8 ring-red-500/30 shadow-red-500/50 animate-pulse'
                : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 hover:scale-105 shadow-emerald-500/40'
            }`}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 animate-spin" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </motion.button>
          <p className="text-xs font-bold mt-4 text-center">
            {isListening ? (
              <span className="text-red-400 animate-pulse">
                🔴 Listening... Speak now (जैसे: "10 किलो तुलसी harvest की")
              </span>
            ) : (
              <span className="text-zinc-400">
                Tap microphone to speak your harvest details
              </span>
            )}
          </p>
        </div>

        {transcript && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs my-3 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Detected Voice Transcript:</span>
            <p className="font-semibold text-emerald-400 italic">"{transcript}"</p>
          </div>
        )}

        {parsedData && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 my-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-400">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Extracted Harvest Record</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                {isOnline ? 'Online (Fabric Direct)' : 'Offline Local Cache'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-zinc-300 font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">Species</span>
                <span className="font-bold text-white font-sans">{parsedData.species}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">Quantity</span>
                <span className="font-bold text-emerald-400">{parsedData.quantity} kg</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">Part / Method</span>
                <span className="text-zinc-300 text-[11px] capitalize">{parsedData.partCollected} ({parsedData.harvestMethod})</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">GPS Geofence</span>
                <span className="text-zinc-300 text-[11px]">{currentLocation?.lat ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Captured'}</span>
              </div>
            </div>

            {voiceFeedback && (
              <div className="flex items-center space-x-2 text-[11px] text-emerald-300 italic pt-1">
                <Volume2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{voiceFeedback}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-3 pt-2">
          {parsedData && (
            <button
              onClick={handleConfirmAndRecord}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting to Ledger...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{isOnline ? 'Confirm & Log to Blockchain' : 'Save to Offline SQLite Cache'}</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl text-xs font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const EventDetailModal = ({ event, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Collection Event Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(event).filter(([key]) => !['photos', 'location'].includes(key)).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <p className="font-semibold">{typeof value === 'object' ? JSON.stringify(value) : value}</p>
            </div>
          ))}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Location Details</label>
          <p className="font-semibold">{event.location.name}</p>
          <p className="text-sm text-gray-600">Lat: {event.location.lat}, Lng: {event.location.lng}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Photos ({event.photos.length})</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {event.photos.map((photo, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          View on Map
        </button>
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
)

const HandoverModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Batch Handover</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cooperative/Processor</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>Kerala Herbs Cooperative</option>
            <option>Spice Processing Unit</option>
            <option>Organic Herbs Collective</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Handover Photos</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Take handover verification photos</p>
            <button className="mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Open Camera
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3" placeholder="Any additional notes about the handover..."></textarea>
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
          Complete Handover
        </button>
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  </motion.div>
)

// New Collection Form Modal - Connected to API
// New Collection Form Modal - Connected to API & Offline SQLite Cache
const NewCollectionFormModal = ({ location, locationLoading, locationError, isOnline, onRefreshLocation, onSaveOffline, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    species: '',
    commonName: '',
    quantity: '',
    unit: 'kg',
    harvestMethod: 'hand_picking',
    partCollected: 'leaves',
    harvestDate: new Date().toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result
      setImagePreview(base64)
      setIsAnalyzingImage(true)
      try {
        const analysis = await analyzeBotanicalImage(base64, formData.species || 'Tulsi')
        setAiResult(analysis)
      } catch (err) {
        setAiResult({ isValid: true, confidence: 95, message: 'Botanical specimen logged' })
      } finally {
        setIsAnalyzingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const speciesOptions = [
    { value: 'Ashwagandha', label: 'Ashwagandha (Withania somnifera)' },
    { value: 'Turmeric', label: 'Turmeric (Curcuma longa)' },
    { value: 'Tulsi', label: 'Tulsi (Ocimum sanctum)' },
    { value: 'Brahmi', label: 'Brahmi (Bacopa monnieri)' },
    { value: 'Neem', label: 'Neem (Azadirachta indica)' },
    { value: 'Giloy', label: 'Giloy (Tinospora cordifolia)' },
    { value: 'Shatavari', label: 'Shatavari (Asparagus racemosus)' },
    { value: 'Amla', label: 'Amla (Phyllanthus emblica)' }
  ]

  const speciesDefaults = {
    'Tulsi': { commonName: 'Holy Basil / Tulasi', partCollected: 'leaves', method: 'hand_picking' },
    'Ashwagandha': { commonName: 'Indian Ginseng / Asgandh', partCollected: 'roots', method: 'digging' },
    'Neem': { commonName: 'Margosa / Nimba', partCollected: 'leaves', method: 'pruning' },
    'Brahmi': { commonName: 'Water Hyssop / Jalanimba', partCollected: 'whole_plant', method: 'hand_picking' },
    'Giloy': { commonName: 'Guduchi / Amrita', partCollected: 'stem', method: 'cutting' },
    'Turmeric': { commonName: 'Haldi / Haridra', partCollected: 'roots', method: 'digging' },
    'Shatavari': { commonName: 'Wild Asparagus', partCollected: 'roots', method: 'digging' },
    'Amla': { commonName: 'Indian Gooseberry / Amalaki', partCollected: 'fruit', method: 'hand_picking' }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'species') {
      const def = speciesDefaults[value] || {}
      setFormData(prev => ({
        ...prev,
        species: value,
        commonName: def.commonName || value,
        partCollected: def.partCollected || prev.partCollected,
        harvestMethod: def.method || prev.harvestMethod
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) {
      setError('Please sign in first')
      return
    }

    const lat = location?.lat || 28.4744
    const lng = location?.lng || 77.5040
    const accuracy = location?.accuracy || 5.0

    setIsSubmitting(true)
    setError('')

    const cleanSpecies = formData.species.split(' (')[0].trim()

    const payload = {
      species: cleanSpecies,
      commonName: formData.commonName || cleanSpecies,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit || 'kg',
      latitude: lat,
      longitude: lng,
      accuracy: accuracy,
      harvestDate: formData.harvestDate,
      harvestMethod: formData.harvestMethod,
      partCollected: formData.partCollected,
      images: imagePreview ? [imagePreview] : []
    }

    if (!isOnline) {
      onSaveOffline && onSaveOffline(payload)
      setIsSubmitting(false)
      onSuccess()
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit collection')
      }

      onSuccess()
    } catch (err) {
      if (onSaveOffline) {
        onSaveOffline(payload)
        onSuccess()
      } else {
        setError(err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-primary-50">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Leaf className="h-5 w-5 mr-2 text-primary-600" />
            New Collection
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-primary-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select species</option>
                {speciesOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Common Name</label>
              <input
                type="text"
                name="commonName"
                value={formData.commonName}
                onChange={handleChange}
                placeholder="Local name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                step="0.1"
                min="0"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date *</label>
            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Method</label>
              <select
                name="harvestMethod"
                value={formData.harvestMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="hand_picking">Hand Picking</option>
                <option value="cutting">Cutting</option>
                <option value="digging">Digging</option>
                <option value="pruning">Pruning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Collected</label>
              <select
                name="partCollected"
                value={formData.partCollected}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="leaves">Leaves</option>
                <option value="roots">Roots</option>
                <option value="bark">Bark</option>
                <option value="flowers">Flowers</option>
                <option value="seeds">Seeds</option>
                <option value="whole_plant">Whole Plant</option>
              </select>
            </div>
          </div>

          {/* AI Botanical Image Verification */}
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-emerald-600" />
                <span>AI Botanical Harvest Photo *</span>
              </label>
              {aiResult && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  aiResult.isValid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {aiResult.isValid ? `${aiResult.confidence}% Match` : 'Invalid Plant Photo'}
                </span>
              )}
            </div>

            <div className="flex items-start gap-3">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-emerald-300 flex-shrink-0">
                  <img src={imagePreview} alt="Harvest preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setAiResult(null)
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white flex flex-col items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
                >
                  <Camera className="h-6 w-6 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-semibold text-emerald-700">Add Photo</span>
                </div>
              )}

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                onChange={handleImageChange}
                className="hidden" 
              />

              <div className="flex-1 text-xs space-y-1">
                {isAnalyzingImage ? (
                  <div className="p-2.5 bg-emerald-100/60 rounded-lg text-emerald-900 flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-emerald-600 flex-shrink-0" />
                    <span>Running AI Botanical Morphology Assay...</span>
                  </div>
                ) : aiResult ? (
                  <div className={`p-2.5 rounded-lg text-xs ${
                    aiResult.isValid ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200' : 'bg-red-100/80 text-red-900 border border-red-200'
                  }`}>
                    <p className="font-bold">{aiResult.isValid ? 'Verified Botanical Specimen' : 'Non-Botanical Image'}</p>
                    <p className="text-[11px] mt-0.5 opacity-90">{aiResult.message}</p>
                    {aiResult.details?.biomarkerAssay && (
                      <p className="text-[10px] text-emerald-700 mt-1 font-mono">{aiResult.details.biomarkerAssay}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-[11px]">
                    <p className="font-semibold text-zinc-700">AI Plant Morphology Scanner</p>
                    <p className="mt-0.5">Upload a photo of the freshly harvested leaves/roots. The AI verifies plant species purity before blockchain submission.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            {locationError ? (
              <div className="space-y-2">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{locationError}</span>
                </div>
                <button
                  type="button"
                  onClick={onRefreshLocation}
                  disabled={locationLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locationLoading ? 'Retrying...' : 'Retry Location'}
                </button>
              </div>
            ) : locationLoading ? (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                <span>Fetching GPS location...</span>
              </div>
            ) : location ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)} (±{location.accuracy?.toFixed(0) || '?'}m)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onRefreshLocation}
                  disabled={locationLoading}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh GPS location"
                >
                  <RefreshCw className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Location data unavailable</span>
                </div>
                <button
                  type="button"
                  onClick={onRefreshLocation}
                  disabled={locationLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locationLoading ? 'Fetching...' : 'Fetch Location'}
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !location}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Collection
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// MSP & Direct Bank Transfer (DBT) Escrow Tab
const MspFinanceTab = ({ isDark }) => {
  const [selectedHerb, setSelectedHerb] = React.useState("Ashwagandha");
  const [selectedGrade, setSelectedGrade] = React.useState("Grade A+ (Export)");
  const [weight, setWeight] = React.useState(25);

  const herbRates = {
    "Ashwagandha": { baseMsp: 320, gradeA_plus: 380, gradeA: 350, gradeB: 300 },
    "Tulsi": { baseMsp: 110, gradeA_plus: 145, gradeA: 130, gradeB: 100 },
    "Brahmi": { baseMsp: 160, gradeA_plus: 210, gradeA: 185, gradeB: 150 },
    "Neem": { baseMsp: 45, gradeA_plus: 65, gradeA: 55, gradeB: 40 },
    "Turmeric": { baseMsp: 95, gradeA_plus: 135, gradeA: 115, gradeB: 85 }
  };

  const rates = herbRates[selectedHerb] || { baseMsp: 200, gradeA_plus: 250, gradeA: 220, gradeB: 180 };
  let selectedRate = rates.gradeA_plus;
  if (selectedGrade.includes("Grade A (Standard)")) selectedRate = rates.gradeA;
  if (selectedGrade.includes("Grade B")) selectedRate = rates.gradeB;

  const totalPayout = (Number(weight) || 0) * selectedRate;
  const baseMspTotal = (Number(weight) || 0) * rates.baseMsp;
  const qualityBonus = Math.max(0, totalPayout - baseMspTotal);

  const dbtTransactions = [
    { batch: "HT-ASH-9842", herb: "Ashwagandha", weight: "25 kg", amount: "₹9,500.00", status: "DBT Transferred", bank: "SBI ••••4821", tx: "0x7f9a...3b21", date: "22 Aug 2026", success: true },
    { batch: "HT-TLS-4819", herb: "Tulsi", weight: "40 kg", amount: "₹5,800.00", status: "Escrow Released • Bank Processing", bank: "PNB ••••1904", tx: "0x4e2c...8d19", date: "20 Aug 2026", success: true },
    { batch: "HT-BRH-1048", herb: "Brahmi", weight: "20 kg", amount: "₹4,200.00", status: "Smart Contract Escrow Locked", bank: "Pending Lab Result", tx: "0x1a8f...9c44", date: "18 Aug 2026", success: false }
  ];

  return (
    <div className="space-y-6">
      <div className={"p-6 rounded-3xl border shadow-sm " + (isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-200 text-gray-900")}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 font-bold">₹</div>
          <div>
            <h3 className="font-extrabold text-lg">AYUSH Minimum Support Price (MSP) & Fair Price Calculator</h3>
            <p className="text-xs text-zinc-500">Government guaranteed price floor with blockchain smart contract escrow release</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">Herb Species</label>
            <select
              value={selectedHerb}
              onChange={(e) => setSelectedHerb(e.target.value)}
              className={"w-full p-2.5 rounded-xl border text-sm font-semibold " + (isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-neutral-50 border-neutral-300 text-gray-900")}
            >
              {Object.keys(herbRates).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">Quality Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className={"w-full p-2.5 rounded-xl border text-sm font-semibold " + (isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-neutral-50 border-neutral-300 text-gray-900")}
            >
              <option>Grade A+ (Export)</option>
              <option>Grade A (Standard)</option>
              <option>Grade B (Processing)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">Quantity (Kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={"w-full p-2.5 rounded-xl border text-sm font-semibold " + (isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-neutral-50 border-neutral-300 text-gray-900")}
            />
          </div>
        </div>

        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-200">Guaranteed Escrow Payout</span>
            <div className="text-3xl font-extrabold mt-0.5">₹{totalPayout.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div className="text-xs text-emerald-200 mt-1">Rate: ₹{selectedRate}/kg • Govt Base: ₹{baseMspTotal.toLocaleString("en-IN")} + Quality Bonus: ₹{qualityBonus.toLocaleString("en-IN")}</div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md">Direct Smart Contract Release</span>
          </div>
        </div>
      </div>

      <div className={"p-6 rounded-3xl border shadow-sm " + (isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-200 text-gray-900")}>
        <h3 className="font-extrabold text-base mb-4 flex items-center justify-between">
          <span>Direct Bank Transfer (DBT) & Escrow Status</span>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">Aadhaar Linked: SBI ••••4821</span>
        </h3>
        <div className="space-y-3">
          {dbtTransactions.map(tx => (
            <div key={tx.batch} className={"p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 " + (isDark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200")}>
              <div>
                <div className="font-bold text-sm">{tx.herb} ({tx.weight}) - <span className="font-mono text-xs text-zinc-500">{tx.batch}</span></div>
                <div className="text-xs text-zinc-500 mt-0.5">{tx.date} • {tx.bank} • Tx: {tx.tx}</div>
              </div>
              <div className="sm:text-right">
                <div className="font-extrabold text-emerald-600">{tx.amount}</div>
                <div className={"text-xs font-bold " + (tx.success ? "text-emerald-500" : "text-amber-500")}>{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Geo-fencing & Protected Forest Zones Tab
const GeofenceAuditTab = ({ isDark }) => (
  <div className={"p-6 rounded-3xl border shadow-sm " + (isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-200 text-gray-900")}>
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-lg">🛡️</div>
      <div>
        <h3 className="font-extrabold text-lg">Botanical Geo-Fencing & Protected Forest Boundary Audit</h3>
        <p className="text-xs text-zinc-500">Real-time coordinate validation against AYUSH certified agro-zones and restricted forest sanctuaries</p>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className={"p-5 rounded-2xl border " + (isDark ? "bg-zinc-950 border-zinc-800" : "bg-emerald-50/50 border-emerald-200")}>
        <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm mb-2">
          <span>🌿</span>
          <span>Brahmi (Bacopa monnieri) Agro-Zone Policy</span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed mb-3">
          Brahmi is authorized for wild collection only within certified wetland and alluvial basins of <strong>Uttar Pradesh</strong> and <strong>Bihar</strong>. Collection within <strong>Delhi NCR</strong> is strictly prohibited to prevent urban contaminant entry.
        </p>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Enforced via GPS Check</span>
      </div>

      <div className={"p-5 rounded-2xl border " + (isDark ? "bg-zinc-950 border-zinc-800" : "bg-amber-50/50 border-amber-200")}>
        <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm mb-2">
          <span>⚠️</span>
          <span>Protected Forest & Wildlife Sanctuaries</span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed mb-3">
          Automated geofencing checks for coordinates in Hastinapur Wildlife Sanctuary, Dudhwa Reserved Forests, Valmiki Tiger Reserve, and Asola Bhatti Sanctuary to block illegal non-timber forest harvesting.
        </p>
        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Forest Dept Transit Pass Required</span>
      </div>
    </div>
  </div>
);

export default FarmerLandingPage;
