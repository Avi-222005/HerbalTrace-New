import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  PackageCheck, 
  RotateCw, 
  Scale, 
  QrCode,
  Thermometer,
  Droplets,
  Clock,
  Package,
  Factory,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Activity,
  BarChart3,
  Settings,
  Download,
  Eye,
  X,
  Zap,
  Wind,
  Timer,
  Boxes,
  Shield,
  FileText,
  TrendingUp,
  MessageCircle,
  Send,
  RefreshCw,
  Beaker,
  Info,
  CheckCircle2,
  ExternalLink,
  Code,
  Layers,
  Sparkles
} from 'lucide-react'
import DashboardNavbar from '../common/DashboardNavbar'
import ComplaintModal from '../common/ComplaintModal'
import { useEnums } from '../../hooks/useEnums'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const ManufacturerLandingPage = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCreateProductModal, setShowCreateProductModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [showFhirModal, setShowFhirModal] = useState(false)
  
  // API state
  const [batches, setBatches] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState(null)
  
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('herbaltrace_theme') || 'dark')
  const isDark = theme === 'dark'

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('herbaltrace_theme') || 'dark')
    window.addEventListener('herbaltrace_theme_changed', handleThemeChange)
    return () => window.removeEventListener('herbaltrace_theme_changed', handleThemeChange)
  }, [])

  const { enums } = useEnums()

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Fetch batches and products
  const fetchData = async () => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) return

    setIsLoading(true)
    setError('')

    try {
      const batchesResponse = await fetch(`${BACKEND_URL}/api/v1/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const batchesResult = await batchesResponse.json()
      if (batchesResult.success && Array.isArray(batchesResult.data)) {
        setBatches(batchesResult.data)
      }

      const productsResponse = await fetch(`${BACKEND_URL}/api/v1/manufacturer/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const productsResult = await productsResponse.json()
      if (productsResult.success) {
        setProducts(productsResult.data || [])
      }
    } catch (err) {
      setError('Failed to fetch manufacturing data')
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('herbaltrace_user')
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser))
      } catch (e) {}
    }
    fetchData()
  }, [])

  // Manufactured batch numbers set to ensure 1 QR for 1 batch
  const manufacturedBatchNumbers = useMemo(() => {
    return new Set(products.map(p => p.batch_id || p.batchId).filter(Boolean))
  }, [products])

  // Filter only pending / approved raw material batches that have NOT yet been turned into a product
  const availableRawBatches = useMemo(() => {
    return batches.filter(b => {
      const bNum = b.batch_number || b.id
      const isAlreadyManufactured = manufacturedBatchNumbers.has(bNum) || 
        b.status === 'processing_complete' || 
        b.status === 'manufactured'
      return !isAlreadyManufactured
    })
  }, [batches, manufacturedBatchNumbers])

  // Stats calculation
  const stats = [
    { id: 1, title: 'Available Raw Batches', value: String(availableRawBatches.length), change: `${availableRawBatches.length} Pending`, trend: 'up', icon: Package, color: 'blue' },
    { id: 2, title: 'Finished Products', value: String(products.length), change: `+${products.length}`, trend: 'up', icon: Factory, color: 'green' },
    { id: 3, title: 'QR Passports Issued', value: String(products.filter(p => p.qr_code || p.qrCode).length), change: '100% On-Chain', trend: 'up', icon: QrCode, color: 'purple' },
    { id: 4, title: 'GMP Extraction Yield', value: '98.4%', change: '+1.2%', trend: 'up', icon: TrendingUp, color: 'orange' }
  ]

  const incomingBatches = availableRawBatches.map(b => ({
    id: b.batch_number || b.id,
    dbId: b.id,
    herb: b.species || 'Unknown',
    quantity: `${b.total_quantity || 0} ${b.unit || 'kg'}`,
    totalQuantity: b.total_quantity,
    unit: b.unit || 'kg',
    farmer: b.farmer_name || 'Ayush Registered Co-op',
    labStatus: (b.status === 'approved' || b.status === 'quality_tested') ? 'Approved' : 'Verified Intake',
    receivedDate: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : '-',
    status: b.status
  }))

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Dashboard Navbar */}
      <DashboardNavbar 
        userName={userData?.fullName || userData?.username || 'Ayurvedic Manufacturer'} 
        userRole="Manufacturer"
        dateJoined={userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'GMP Licensed'}
        approvedBy="ManufacturersMSP • Fabric CA"
        theme={theme}
        onToggleTheme={(t) => setTheme(t)}
      />

      {/* Header Banner */}
      <div className="pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-primary-700 rounded-3xl p-6 md:p-8 shadow-xl text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
                  <span>GMP Pharmaceutical Formulation Unit • Cleanroom Grade A</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold">{greeting}, {userData?.fullName || 'Ayush Manufacturer'}</h1>
                <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-xl">
                  Transform lab-certified raw botanical harvests into finished Ayurvedic formulations with cryptographic batch passport QR codes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateProductModal(true)}
                  className="bg-white text-emerald-800 px-5 py-2.5 rounded-2xl font-bold flex items-center space-x-2 hover:bg-emerald-50 transition-all text-xs md:text-sm shadow-lg"
                >
                  <Plus className="h-4 w-4 text-emerald-600" />
                  <span>Create Product & Generate QR</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowComplaintModal(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center space-x-2 transition-all text-xs md:text-sm shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Raise Grievance</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'
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
                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Manufacturing GMP Pipeline Visualizer */}
        <div className={`p-6 rounded-3xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <Factory className="h-5 w-5 text-emerald-500" />
                <span>Ayurvedic Formulation & Manufacturing Pipeline (MES)</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>GMP Schedule T Compliant Process Flow</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 self-start">
              ISO 9001:2015 & Ayush Premium Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { step: '01', title: 'Raw Intake & Lab QA', desc: 'DNA Verified & Heavy Metals Cleared', icon: PackageCheck, color: 'emerald' },
              { step: '02', title: 'CO2 Supercritical Extraction', desc: 'Low-temp Phytochemical Extraction', icon: Thermometer, color: 'teal' },
              { step: '03', title: 'Standardization (10:1)', desc: 'Active Marker Potency Assay Assured', icon: Scale, color: 'blue' },
              { step: '04', title: 'Cleanroom Bottling', desc: 'Nitrogen Flushed Amber Glass', icon: Boxes, color: 'purple' },
              { step: '05', title: 'Tamper-Proof QR Passport', desc: 'Fabric Hash & Consumer Monograph', icon: QrCode, color: 'amber' },
            ].map((st, i) => (
              <div 
                key={st.step} 
                className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    STAGE {st.step}
                  </span>
                  <st.icon className="h-4 w-4 text-emerald-500" />
                </div>
                <h4 className="font-bold text-xs leading-snug">{st.title}</h4>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`p-1.5 rounded-2xl border flex items-center space-x-2 overflow-x-auto scrollbar-none ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          {[
            { id: 'overview', label: 'Overview & Formulation', icon: BarChart3 },
            { id: 'batches', label: `Available Raw Batches (${availableRawBatches.length})`, icon: Package },
            { id: 'products', label: `Manufactured Products (${products.length})`, icon: Factory },
            { id: 'inventory', label: 'Botanical Inventory', icon: Boxes }
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
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & PRODUCTS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Products Grid */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Active Finished Formulations</h3>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Consumer-ready batches with signed digital passports</p>
                </div>
                <button
                  onClick={() => setShowCreateProductModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Product Formulation</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div 
                    key={p.id || p.productId || p.qr_code}
                    className={`p-5 rounded-2xl border space-y-4 transition-all ${
                      isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-400">
                          {p.product_type || p.productType || 'Extract Formulation'}
                        </span>
                        <h4 className="font-bold text-sm mt-1.5">{p.product_name || p.productName}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {p.status || 'Active'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Batch Ref:</span>
                        <span className={`font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{p.batch_id || p.batchId}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Pack Quantity:</span>
                        <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{p.quantity} {p.unit || 'bottles'}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Expiry Date:</span>
                        <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{p.expiry_date || p.expiryDate || '2028-12-31'}</span>
                      </div>
                    </div>

                    {p.qr_code_image || p.qrCodeImage ? (
                      <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-between shadow-inner">
                        <img 
                          src={p.qr_code_image || p.qrCodeImage} 
                          alt="Product QR" 
                          className="w-16 h-16 rounded-lg"
                        />
                        <div className="text-right space-y-1">
                          <span className="text-[10px] font-mono text-zinc-500 block">{p.qr_code || p.qrCode}</span>
                          <a
                            href={`/verify/${p.qr_code || p.qrCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-500 transition-all"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Scan Test</span>
                          </a>
                        </div>
                      </div>
                    ) : null}

                    <div className="pt-2 border-t border-zinc-800/50 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span className="truncate max-w-[180px]">TX: {p.blockchain_tx_id || p.blockchainTxId || 'Verified On-Chain'}</span>
                      <button
                        onClick={() => {
                          setSelectedProduct(p)
                          setShowFhirModal(true)
                        }}
                        className="text-emerald-500 hover:text-emerald-400 font-sans font-bold flex items-center space-x-1"
                      >
                        <Code className="h-3 w-3" />
                        <span>FHIR Monograph</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  <Factory className="h-12 w-12 mx-auto mb-3 text-zinc-400" />
                  <p className="font-semibold text-sm">No finished formulations created yet</p>
                  <p className="text-xs mt-1">Select an approved raw material batch to create a packaged Ayurvedic product.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BATCH MANAGEMENT */}
        {activeTab === 'batches' && (
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'
          }`}>
            <h3 className="text-lg font-bold mb-4">Raw Botanical Batches for Manufacturing</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-neutral-200 text-zinc-500'} uppercase`}>
                    <th className="pb-3">Batch Number</th>
                    <th className="pb-3">Botanical Species</th>
                    <th className="pb-3">Quantity Available</th>
                    <th className="pb-3">Harvest Source</th>
                    <th className="pb-3">QC Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-zinc-800/50' : 'divide-neutral-100'}`}>
                  {incomingBatches.map((b) => (
                    <tr key={b.id} className={`${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-neutral-50'} font-sans`}>
                      <td className="py-3.5 font-mono font-bold text-emerald-500">{b.id}</td>
                      <td className="py-3.5 font-semibold">{b.herb}</td>
                      <td className="py-3.5">{b.quantity}</td>
                      <td className="py-3.5">{b.farmer}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.labStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {b.labStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setShowCreateProductModal(true)
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                        >
                          Formulate Product
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & QR */}
        {activeTab === 'products' && (
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'
          }`}>
            <h3 className="text-lg font-bold mb-4">Packaged Products & Tamper-Proof QR Ledgers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id || p.qr_code} className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <h4 className="font-bold text-sm">{p.product_name || p.productName}</h4>
                  <p className="text-xs text-zinc-400 font-mono">QR: {p.qr_code || p.qrCode}</p>
                  {p.qr_code_image || p.qrCodeImage ? (
                    <div className="bg-white p-3 rounded-xl border border-neutral-200 text-center">
                      <img src={p.qr_code_image || p.qrCodeImage} alt="QR Code" className="w-32 h-32 mx-auto" />
                      <a 
                        href={p.qr_code_image || p.qrCodeImage} 
                        download={`QR-${p.qr_code || p.qrCode}.png`}
                        className="mt-2 inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-500"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download QR PNG</span>
                      </a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900 shadow-sm'
          }`}>
            <h3 className="text-lg font-bold mb-4">Raw Botanical Material Warehouse Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['Tulsi (Holy Basil)', 'Ashwagandha', 'Neem Leaves', 'Turmeric Rhizomes'].map((spec, i) => (
                <div key={spec} className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <span className="text-emerald-500 font-mono text-[10px] font-bold uppercase">HERB STOCK #{i+1}</span>
                  <h4 className="font-bold text-sm mt-1">{spec}</h4>
                  <p className="text-xl font-extrabold mt-2">{40 + i * 15} kg</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Grade A Organic Certified</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Creation Modal */}
      <AnimatePresence>
        {showCreateProductModal && (
          <CreateProductModal 
            batches={incomingBatches} 
            isDark={isDark}
            onClose={() => setShowCreateProductModal(false)} 
            onSuccess={() => {
              setShowCreateProductModal(false)
              fetchData()
            }}
          />
        )}
      </AnimatePresence>

      {/* Grievance Modal */}
      <AnimatePresence>
        {showComplaintModal && (
          <ComplaintModal 
            role="Manufacturer"
            onClose={() => setShowComplaintModal(false)} 
          />
        )}
      </AnimatePresence>

      {/* FHIR Monograph Standard Modal */}
      <AnimatePresence>
        {showFhirModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-2xl w-full rounded-3xl border shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">FHIR Medication Resource (HL7 / Ayush Standard)</h3>
                </div>
                <button onClick={() => setShowFhirModal(false)} className="p-1 rounded-lg hover:bg-zinc-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto border border-zinc-800">
{JSON.stringify({
  resourceType: "Medication",
  id: selectedProduct.id || selectedProduct.qr_code,
  meta: {
    profile: ["http://hl7.org/fhir/StructureDefinition/Medication", "http://ayush.gov.in/fhir/BotanicalProduct"],
    lastUpdated: new Date().toISOString()
  },
  code: {
    coding: [
      {
        system: "http://ayush.gov.in/pharmacopoeia",
        code: selectedProduct.batch_id || selectedProduct.batchId,
        display: selectedProduct.product_name || selectedProduct.productName
      }
    ],
    text: selectedProduct.product_name || selectedProduct.productName
  },
  status: "active",
  manufacturer: {
    display: "Ayush GMP Certified Manufacturing Facility",
    reference: "Organization/TestingLabsMSP"
  },
  form: {
    coding: [{ system: "http://snomed.info/sct", code: "385055001", display: selectedProduct.product_type || "Herbal Extract Powder" }]
  },
  ingredient: [
    {
      itemCodeableConcept: { text: selectedProduct.ingredients || "Botanical Extract" },
      isActive: true,
      strength: { numerator: { value: 10, unit: "ratio" }, denominator: { value: 1, unit: "extract" } }
    }
  ],
  batch: {
    lotNumber: selectedProduct.batch_id || selectedProduct.batchId,
    expirationDate: selectedProduct.expiry_date || selectedProduct.expiryDate || "2028-12-31"
  },
  extension: [
    {
      url: "http://herbaltrace.gov.in/fhir/StructureDefinition/blockchainProvenance",
      valueString: selectedProduct.blockchain_tx_id || "198ced6d6ef34ab6bce9b9e9fd41174d4c0dcb5ef896482c27669d5d10b78107"
    },
    {
      url: "http://herbaltrace.gov.in/fhir/StructureDefinition/digitalPassportQRCode",
      valueUri: `${window.location.origin}/verify/${selectedProduct.qr_code || selectedProduct.qrCode}`
    }
  ]
}, null, 2)}
              </pre>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowFhirModal(false)}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500"
                >
                  Close Monograph
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Product Creation Modal with Smart URL Encoding & QR Generation
const CreateProductModal = ({ batches, isDark, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    batchId: batches[0]?.dbId || batches[0]?.id || '',
    productName: batches[0] ? `Ayurvedic Pure ${batches[0].herb} Extract Formulation` : '',
    productType: 'powder',
    quantity: '100',
    unit: 'bottles',
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-12-31',
    ingredients: batches[0] ? `Pure ${batches[0].herb} Extract, Bio-enhancers Q.S.` : '',
    certifications: 'GMP Certified, Ayush Premium Mark, ISO 9001:2015',
    processingSteps: [{ processType: 'Drying', temperature: '45', duration: '120', equipment: 'Solar Tray Dryer', notes: 'Moisture controlled to 6%' }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdProduct, setCreatedProduct] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'batchId') {
      const b = batches.find(item => String(item.dbId || item.id || item.batch_number) === String(value))
      if (b) {
        setFormData(prev => ({
          ...prev,
          batchId: value,
          productName: `Ayurvedic Pure ${b.herb || b.species || 'Botanical'} Extract Formulation`,
          ingredients: `Pure ${b.herb || b.species || 'Botanical'} Extract (Batch ${b.id || b.batch_number}), Excipients Q.S.`
        }))
        return
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) {
      setError('Please sign in first')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const selectedBatch = batches.find(b => String(b.dbId || b.id || b.batch_number) === String(formData.batchId)) || batches[0]
      if (!selectedBatch) {
        throw new Error('Please select a valid raw material batch')
      }

      const payload = {
        batchId: selectedBatch.dbId || selectedBatch.id,
        productName: formData.productName,
        productType: formData.productType,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
        processingSteps: formData.processingSteps
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/manufacturer/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create product')
      }

      setCreatedProduct(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (createdProduct) {
    const scanUrl = `${window.location.origin}/verify/${createdProduct.qrCode || createdProduct.qr_code}`
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border shadow-2xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900'
          }`}
        >
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold">Product Passport Issued!</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Cryptographic batch payload committed to Hyperledger Fabric</p>

          {createdProduct.qrCodeImage && (
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 mb-4 inline-block shadow-inner">
              <img src={createdProduct.qrCodeImage} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
          )}

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-left text-xs font-mono space-y-1 mb-4">
            <div className="text-zinc-400">QR Code: <span className="text-emerald-400 font-bold">{createdProduct.qrCode}</span></div>
            <div className="text-zinc-400 truncate">TxID: <span className="text-zinc-300">{createdProduct.blockchainTxId}</span></div>
            <div className="text-zinc-400 truncate">Scan URL: <span className="text-primary-400">{scanUrl}</span></div>
          </div>

          <div className="flex space-x-3">
            <a
              href={createdProduct.qrCodeImage}
              download={`QR-${createdProduct.qrCode}.png`}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Download QR</span>
            </a>
            <button
              onClick={() => { onSuccess(); onClose(); }}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl border border-zinc-700"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`rounded-3xl border shadow-2xl w-full max-w-2xl my-8 overflow-hidden ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-neutral-200 bg-neutral-50'
        }`}>
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-emerald-500" />
            <span>Formulate Product & Generate Passport QR</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1">Select Raw Herb Batch *</label>
            <select
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              required
              className={`w-full px-3.5 py-2.5 border rounded-xl font-medium ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Choose an approved batch</option>
              {batches.map(batch => (
                <option key={batch.dbId || batch.id} value={batch.dbId || batch.id}>
                  {batch.id} - {batch.herb} ({batch.quantity} - {batch.labStatus})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Product Formulation Name *</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              required
              className={`w-full px-3.5 py-2.5 border rounded-xl ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Pack Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                className={`w-full px-3.5 py-2.5 border rounded-xl ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 border rounded-xl ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="bottles">Bottles (60 Caps)</option>
                <option value="tins">Extract Tins (100g)</option>
                <option value="packs">Packs (500g)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Botanical Ingredients & Excipients</label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows={2}
              className={`w-full px-3.5 py-2.5 border rounded-xl ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Quality Certifications & Marks</label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 border rounded-xl ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs ${
                isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? 'Signing on Blockchain...' : 'Commit & Generate QR Passport'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ManufacturerLandingPage
