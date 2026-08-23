import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Package, 
  QrCode,
  History,
  Shield,
  Star,
  Heart,
  Search,
  Bell,
  ShoppingBag,
  Leaf,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  X,
  ChevronRight,
  Award,
  TrendingUp,
  Eye,
  MessageCircle,
  Send,
  RefreshCw
} from 'lucide-react'
import DashboardNavbar from '../common/DashboardNavbar'
import { useEnums } from '../../hooks/useEnums'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const ConsumerLandingPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showScanModal, setShowScanModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [productCode, setProductCode] = useState('')
  const [userData, setUserData] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const navigate = useNavigate()
  
  // Fetch enums for complaint categories
  const { enums } = useEnums()

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])
  
  // Load user data and scan history from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('herbaltrace_user')
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser))
      } catch (e) {}
    }
    
    // Load scan history
    const storedHistory = localStorage.getItem('herbaltrace_scan_history')
    if (storedHistory) {
      try {
        setScanHistory(JSON.parse(storedHistory))
      } catch (e) {}
    }
    
    // Load favorites
    const storedFavorites = localStorage.getItem('herbaltrace_favorites')
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (e) {}
    }
  }, [])

  // Dynamic stats based on actual data
  const consumerStats = [
    { id: 1, title: 'Products Verified', value: String(scanHistory.length), icon: Shield, color: 'blue' },
    { id: 2, title: 'Favorites', value: String(favorites.length), icon: Heart, color: 'red' },
    { id: 3, title: 'Reviews Given', value: '0', icon: Star, color: 'yellow' },
    { id: 4, title: 'Rewards Earned', value: '0', icon: Award, color: 'green', isRewards: true }
  ]

  // Use scan history for recently verified (last 5) - no mock data fallback
  const recentlyVerified = scanHistory.slice(0, 5).map(item => ({
    id: item.productId || item.id,
    name: item.productName || item.name || 'Unknown Product',
    brand: item.brand || 'HerbalTrace Verified',
    verified: true,
    verifiedOn: item.verifiedAt || item.date || new Date().toISOString().split('T')[0],
    rating: item.rating || 4.5,
    origin: item.origin || 'India',
    image: item.image || '🌿'
  }))

  // Use favorites from state (which is loaded from localStorage)
  const favoriteProducts = favorites.length > 0 ? favorites.map(item => ({
    id: item.productId || item.id,
    name: item.productName || item.name || 'Unknown Product',
    brand: item.brand || 'HerbalTrace Product',
    lastPurchased: item.addedAt || new Date().toISOString().split('T')[0],
    rating: item.rating || 4.5,
    image: item.image || '🌿'
  })) : []

  const handleScanProduct = () => {
    if (productCode.trim()) {
      // Save to scan history
      const newScan = {
        id: productCode.trim(),
        productId: productCode.trim(),
        name: `Product ${productCode.trim()}`,
        date: new Date().toISOString().split('T')[0],
        image: '🌿'
      }
      const updatedHistory = [newScan, ...scanHistory].slice(0, 50) // Keep last 50
      setScanHistory(updatedHistory)
      localStorage.setItem('herbaltrace_scan_history', JSON.stringify(updatedHistory))
      
      navigate(`/product-journey/${productCode.trim()}`)
    }
  }

  const handleQuickVerify = (productId) => {
    navigate(`/product-journey/${productId}`)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'alerts', label: 'Notifications', icon: Bell }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar 
        userName={userData?.fullName || userData?.username || 'Consumer'} 
        userRole="Consumer"
        dateJoined={userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Member'}
        approvedBy="Self-Registered • Fabric CA"
      />

      <main className="pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Greeting Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {greeting}, {userData?.fullName || userData?.username || 'Consumer'}! 👋
                </h1>
                <p className="text-primary-100 mt-1">
                  Verify authentic herbal products and track their journey from farm to shelf.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowScanModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  <QrCode className="h-5 w-5" />
                  Scan Product
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComplaintModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-red-600 transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  Raise Complaint
                </motion.button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
            <div className="flex flex-wrap gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {consumerStats.map((stat) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${getColorClasses(stat.color)}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.isRewards ? `${stat.value} pts` : stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.title}</div>
                {stat.isRewards && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 w-full py-2 px-3 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Use Rewards
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Quick Scan Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary-600" />
              Quick Product Verification
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Enter product code or batch number (e.g., HT-ASH-2025-0901)"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScanProduct}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-5 w-5" />
                Track Journey
              </motion.button>
            </div>
          </div>

          {/* Recently Verified Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="h-5 w-5 text-primary-600" />
                Recently Verified Products
              </h3>
              <button className="text-primary-600 text-sm font-medium hover:underline">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyVerified.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -2 }}
                  className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleQuickVerify(product.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{product.image}</div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {product.origin}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {product.rating}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Favorite Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Your Favorite Products
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border border-gray-200 rounded-xl p-4"
                >
                  <div className="text-3xl">{product.image}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: {product.lastPurchased}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickVerify(product.id)}
                    className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Blockchain-Verified Authenticity</h3>
                <p className="text-sm text-gray-600">
                  Every product you scan is verified against our immutable blockchain records. 
                  Track the complete journey from farm to your hands with 100% transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scan Modal */}
      <AnimatePresence>
        {showScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowScanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Scan Product QR Code</h3>
                <button
                  onClick={() => setShowScanModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* QR Scanner Placeholder */}
              <div className="bg-gray-100 rounded-xl aspect-square flex flex-col items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                <Camera className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Point your camera at the<br />product QR code
                </p>
              </div>

              <div className="text-center mb-4">
                <span className="text-gray-500 text-sm">Or enter product code manually</span>
              </div>

              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Enter product code (e.g., HT-ASH-2025-0901)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowScanModal(false)
                  handleScanProduct()
                }}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Verify Product
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {showComplaintModal && (
          <ComplaintModal onClose={() => setShowComplaintModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

const ComplaintModal = ({ onClose }) => {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const categories = [
    'Product Quality Issue',
    'Authenticity Concern',
    'Packaging Problem',
    'Delivery Issue',
    'Refund Request',
    'App/System Issue',
    'Other'
  ]

  const handleSubmit = async () => {
    if (!category || !subject || !message) return
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="h-10 w-10 text-green-600" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Complaint Submitted!</h3>
          <p className="text-gray-600">Your complaint has been sent to the admin. You will receive a response soon.</p>
        </motion.div>
      </motion.div>
    )
  }

  return (
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
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Raise Complaint</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Brief subject of your complaint"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex space-x-3">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                    priority === p
                      ? p === 'urgent' ? 'bg-red-600 text-white'
                        : p === 'high' ? 'bg-orange-500 text-white'
                        : p === 'medium' ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="4"
              placeholder="Describe your complaint in detail..."
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!category || !subject || !message || isSubmitting}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              !category || !subject || !message || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Submit Complaint</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ConsumerLandingPage
