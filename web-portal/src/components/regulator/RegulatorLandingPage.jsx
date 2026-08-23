import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  MapPin, 
  Leaf, 
  FileCheck, 
  ShieldCheck,
  Eye,
  Map,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  Globe,
  BarChart3,
  FileText,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Plus,
  MoreHorizontal,
  X,
  Award,
  Target,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Camera,
  Microscope,
  FlaskConical,
  Navigation,
  ExternalLink,
  RefreshCw,
  MessageCircle,
  Send
} from 'lucide-react'
import DashboardNavbar from '../common/DashboardNavbar'
import ComplaintModal from '../common/ComplaintModal'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const RegulatorLandingPage = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [selectedViolation, setSelectedViolation] = useState(null)
  const [mapView, setMapView] = useState('supply-chain')
  const [showComplaintModal, setShowComplaintModal] = useState(false)

  // Live data state
  const [userData, setUserData] = useState(null)
  const [batches, setBatches] = useState([])
  const [alerts, setAlerts] = useState([])
  const [qcTests, setQcTests] = useState([])
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('herbaltrace_theme') || 'dark')

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('herbaltrace_user')
    if (userStr) {
      try { setUserData(JSON.parse(userStr)) } catch (_) {}
    }
    const handleTheme = () => setTheme(localStorage.getItem('herbaltrace_theme') || 'dark')
    window.addEventListener('herbaltrace_theme_changed', handleTheme)
    return () => window.removeEventListener('herbaltrace_theme_changed', handleTheme)
  }, [])

  // Fetch live data from backend
  useEffect(() => {
    const token = localStorage.getItem('herbaltrace_token')
    if (!token) { setIsLoading(false); return }
    const headers = { Authorization: `Bearer ${token}` }

    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const [batchRes, alertRes, testRes, compRes] = await Promise.allSettled([
          fetch(`${BACKEND_URL}/api/v1/batches?limit=100`, { headers }),
          fetch(`${BACKEND_URL}/api/v1/alerts?limit=100`, { headers }),
          fetch(`${BACKEND_URL}/api/v1/qc/tests?limit=100`, { headers }),
          fetch(`${BACKEND_URL}/api/v1/complaints?limit=100`, { headers })
        ])

        if (batchRes.status === 'fulfilled' && batchRes.value.ok) {
          const d = await batchRes.value.json()
          setBatches(d.data?.batches || d.data || [])
        }
        if (alertRes.status === 'fulfilled' && alertRes.value.ok) {
          const d = await alertRes.value.json()
          setAlerts(d.data || [])
        }
        if (testRes.status === 'fulfilled' && testRes.value.ok) {
          const d = await testRes.value.json()
          setQcTests(d.data?.tests || d.data || [])
        }
        if (compRes.status === 'fulfilled' && compRes.value.ok) {
          const d = await compRes.value.json()
          setComplaints(d.data?.complaints || d.data || [])
        }
      } catch (err) {
        console.error('Regulator data fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [])

  // Derive live stats from fetched data
  const verifiedBatches = batches.filter(b => b.status === 'verified' || b.status === 'completed' || b.status === 'lab_completed')
  const passedTests = qcTests.filter(t => t.status === 'passed' || t.overallResult === 'passed')
  const failedTests = qcTests.filter(t => t.status === 'failed' || t.overallResult === 'failed')
  const complianceRate = qcTests.length > 0 ? Math.round((passedTests.length / qcTests.length) * 100) : 0
  const activeAlerts = alerts.filter(a => a.status === 'pending' || a.status === 'active')

  const blockchainStats = [
    { id: 1, title: 'Verified Batches', value: String(verifiedBatches.length), change: `${batches.length} total`, trend: 'up', icon: Database, color: 'blue' },
    { id: 2, title: 'Compliance Rate', value: `${complianceRate}%`, change: `${passedTests.length}/${qcTests.length} tests`, trend: 'up', icon: ShieldCheck, color: 'green' },
    { id: 3, title: 'Active Alerts', value: String(activeAlerts.length), change: `${alerts.length} total`, trend: 'up', icon: AlertTriangle, color: 'orange' },
    { id: 4, title: 'Complaints', value: String(complaints.length), change: 'Total filed', trend: 'up', icon: FileText, color: 'purple' }
  ]

  // Map batches to display format
  const blockchainRecords = batches.slice(0, 20).map(b => ({
    id: b.batch_number || b.id,
    herb: b.species || b.commonName || 'Unknown',
    farmer: b.farmerName || b.farmer_name || 'Farmer',
    location: b.location || b.farmLocation || 'India',
    harvestDate: b.harvestDate || b.created_at || '',
    status: b.status === 'verified' || b.status === 'completed' ? 'Verified' :
             b.status === 'failed' ? 'Flagged' : 'Under Review',
    compliance: b.status === 'verified' ? 'NMPB Compliant' :
                b.status === 'failed' ? 'Violation Detected' : 'Pending Verification',
    testResults: passedTests.find(t => t.batchId === b.id || t.batch_id === b.id) ? 'Passed' :
                 failedTests.find(t => t.batchId === b.id || t.batch_id === b.id) ? 'Failed' : 'Pending',
    sustainabilityScore: 'N/A',
    transactions: b.transactionCount || 0
  }))

  // Map failed tests + alerts to violations
  const violations = [
    ...failedTests.slice(0, 10).map((t, i) => ({
      id: `TEST-${t.id || i}`,
      type: 'Failed Quality Test',
      batch: t.batchId || t.batch_id || 'N/A',
      herb: t.species || t.herb || 'Unknown',
      farmer: t.farmerName || 'Unknown',
      location: t.location || 'India',
      severity: 'High',
      detectedOn: t.completedAt || t.created_at || '',
      details: t.remarks || t.notes || 'Quality test failed AYUSH standards',
      status: 'Under Investigation'
    })),
    ...activeAlerts.slice(0, 5).map((a, i) => ({
      id: `ALERT-${a.id || i}`,
      type: a.alert_type || a.title || 'Alert',
      batch: a.batchId || a.batch_id || 'N/A',
      herb: a.species || 'Unknown',
      farmer: a.farmerName || 'Unknown',
      location: a.location || 'India',
      severity: a.severity || 'Medium',
      detectedOn: a.created_at || '',
      details: a.message || a.details || 'Alert raised on blockchain network',
      status: a.status === 'pending' ? 'Action Required' : 'Under Investigation'
    }))
  ]

  // Sustainability ratings dynamically mapped from live ledger batches
  const sustainabilityRatings = batches.slice(0, 10).map(b => ({
    id: b.batch_number || b.id,
    herb: b.species || 'Unknown',
    farmer: b.farmerName || 'Farmer',
    overallScore: b.status === 'verified' ? 'A' : b.status === 'failed' ? 'C' : 'B',
    carbonFootprint: b.sustainability?.carbonFootprint || 'Low',
    waterUsage: b.sustainability?.waterUsage || 'Efficient',
    biodiversityImpact: b.sustainability?.biodiversityImpact || 'Positive',
    soilHealth: b.sustainability?.soilHealth || 'Good',
    socialImpact: b.sustainability?.socialImpact || 'High',
    certifications: b.certifications || []
  }))


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navbar */}
      <DashboardNavbar 
        userName={userData?.fullName || userData?.username || 'Regulator'} 
        userRole="Regulator"
        dateJoined={userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Member'}
        approvedBy="AYUSH Ministry • Fabric CA"
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
                <h1 className="text-2xl md:text-3xl font-bold text-white">{greeting}, {userData?.fullName || 'Regulator'}</h1>
                <p className="text-primary-100 text-sm md:text-base mt-2">Medicinal Plant Conservation Authority</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary-700 px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:bg-primary-50 transition-colors text-sm md:text-base shadow-md"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Report Violation</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComplaintModal(true)}
                  className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:bg-red-600 transition-colors text-sm md:text-base shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Raise Complaint</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blockchain Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {blockchainStats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.id * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Regulatory Overview', icon: BarChart3 },
            { id: 'blockchain', label: 'Blockchain Records', icon: Database },
            { id: 'supply-chain', label: 'Supply Chain Maps', icon: Map },
            { id: 'violations', label: 'Violation Detection', icon: AlertTriangle },
            { id: 'sustainability', label: 'Sustainability Ratings', icon: Leaf },
            { id: 'reports', label: 'Compliance Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
              className="grid lg:grid-cols-3 gap-8"
            >
              <RegulatoryOverview />
              <ComplianceMetrics />
              <RecentViolations violations={violations.slice(0, 3)} onSelectViolation={setSelectedViolation} />
            </motion.div>
          )}

          {activeTab === 'blockchain' && (
            <motion.div
              key="blockchain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <BlockchainRecordsView records={blockchainRecords} onSelectBatch={setSelectedBatch} />
            </motion.div>
          )}

          {activeTab === 'supply-chain' && (
            <motion.div
              key="supply-chain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <SupplyChainMaps mapView={mapView} setMapView={setMapView} />
            </motion.div>
          )}

          {activeTab === 'violations' && (
            <motion.div
              key="violations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <ViolationDetection violations={violations} onSelectViolation={setSelectedViolation} />
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
              <SustainabilityRatings ratings={sustainabilityRatings} />
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <ComplianceReports />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedBatch && (
          <BatchDetailModal batch={selectedBatch} onClose={() => setSelectedBatch(null)} />
        )}
        {selectedViolation && (
          <ViolationDetailModal violation={selectedViolation} onClose={() => setSelectedViolation(null)} />
        )}
        {showComplaintModal && (
          <ComplaintModal onClose={() => setShowComplaintModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Regulatory Overview Component
const RegulatoryOverview = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Regulatory Overview</h2>
    <div className="space-y-4">
      {[
        { label: 'NMPB Compliance', status: 'Good', value: '96.2%', color: 'green' },
        { label: 'AYUSH Standards', status: 'Excellent', value: '98.5%', color: 'blue' },
        { label: 'Conservation Zones', status: 'Monitored', value: '12 Active', color: 'purple' },
        { label: 'Seasonal Restrictions', status: 'Enforced', value: '3 Active', color: 'orange' }
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{item.label}</p>
            <p className="text-sm text-gray-600">{item.value}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${item.color}-100 text-${item.color}-700`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// Compliance Metrics Component
const ComplianceMetrics = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Compliance Metrics</h2>
    <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
      <p className="text-gray-500">Compliance chart placeholder</p>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-600">Violation Rate</p>
        <p className="font-bold text-2xl text-red-600">3.8%</p>
      </div>
      <div>
        <p className="text-gray-600">Resolution Time</p>
        <p className="font-bold text-2xl text-green-600">2.3 days</p>
      </div>
    </div>
  </div>
)

// Recent Violations Component
const RecentViolations = ({ violations, onSelectViolation }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Violations</h2>
    <div className="space-y-4">
      {violations.map((violation) => (
        <div key={violation.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => onSelectViolation(violation)}>
          <div className={`p-2 rounded-lg ${
            violation.severity === 'Critical' ? 'bg-red-100' :
            violation.severity === 'High' ? 'bg-orange-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`h-4 w-4 ${
              violation.severity === 'Critical' ? 'text-red-600' :
              violation.severity === 'High' ? 'text-orange-600' : 'text-yellow-600'
            }`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{violation.type}</p>
            <p className="text-xs text-gray-600">{violation.herb} - {violation.farmer}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            violation.severity === 'Critical' ? 'bg-red-100 text-red-700' :
            violation.severity === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {violation.severity}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// Blockchain Records View Component
const BlockchainRecordsView = ({ records, onSelectBatch }) => (
  <div>
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Blockchain Records - Read-Only Access</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search batch records..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Herb</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sustainability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-mono text-sm text-gray-900">{record.id}</div>
                  <div className="text-xs text-gray-500">{record.transactions} transactions</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{record.herb}</div>
                  <div className="text-sm text-gray-600">{record.location}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{record.farmer}</div>
                  <div className="text-xs text-gray-600">{record.harvestDate}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'Verified' ? 'bg-green-100 text-green-700' :
                    record.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.compliance === 'NMPB Compliant' ? 'bg-blue-100 text-blue-700' :
                    record.compliance === 'Pending Verification' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {record.compliance}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.sustainabilityScore.includes('A') ? 'bg-green-100 text-green-700' :
                    record.sustainabilityScore.includes('B') ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {record.sustainabilityScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => onSelectBatch(record)}>
                      <Eye className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

// Supply Chain Maps Component
const SupplyChainMaps = ({ mapView, setMapView }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Visual Supply Chain Maps</h2>
        <div className="flex space-x-2">
          {[
            { id: 'supply-chain', label: 'Supply Chain' },
            { id: 'geo-zones', label: 'Geo-Fenced Zones' },
            { id: 'seasonal', label: 'Seasonal Restrictions' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setMapView(view.id)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                mapView === view.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-96 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{
            mapView === 'supply-chain' ? 'Interactive Supply Chain Map' :
            mapView === 'geo-zones' ? 'Geo-Fenced Protection Zones' :
            'Seasonal Collection Restrictions'
          }</p>
          <p className="text-sm text-gray-400 mt-2">Real-time tracking and compliance visualization</p>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900">Compliant Zones</h4>
          <p className="text-2xl font-bold text-green-600">847</p>
          <p className="text-sm text-green-700">Active collection sites</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-900">Restricted Zones</h4>
          <p className="text-2xl font-bold text-red-600">12</p>
          <p className="text-sm text-red-700">Protected areas</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900">Seasonal Restrictions</h4>
          <p className="text-2xl font-bold text-yellow-600">3</p>
          <p className="text-sm text-yellow-700">Currently active</p>
        </div>
      </div>
    </div>
  </div>
)

// Violation Detection Component
const ViolationDetection = ({ violations, onSelectViolation }) => (
  <div>
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Automated Violation Detection</h2>
        <div className="flex items-center space-x-3">
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>All Severities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Under Investigation</option>
            <option>Action Required</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>
    </div>

    <div className="p-6">
      <div className="space-y-4">
        {violations.map((violation) => (
          <motion.div
            key={violation.id}
            whileHover={{ scale: 1.01 }}
            className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer"
            onClick={() => onSelectViolation(violation)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  violation.severity === 'Critical' ? 'bg-red-100' :
                  violation.severity === 'High' ? 'bg-orange-100' : 'bg-yellow-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    violation.severity === 'Critical' ? 'text-red-600' :
                    violation.severity === 'High' ? 'text-orange-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{violation.type}</h3>
                  <p className="text-sm text-gray-600">Batch: {violation.batch}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  violation.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                  violation.severity === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {violation.severity}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  violation.status === 'Action Required' ? 'bg-red-100 text-red-700' :
                  violation.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {violation.status}
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Herb</p>
                <p className="font-medium">{violation.herb}</p>
              </div>
              <div>
                <p className="text-gray-500">Farmer</p>
                <p className="font-medium">{violation.farmer}</p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium">{violation.location}</p>
              </div>
              <div>
                <p className="text-gray-500">Detected</p>
                <p className="font-medium">{violation.detectedOn}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700">{violation.details}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
)

// Sustainability Ratings Component
const SustainabilityRatings = ({ ratings }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Batch-wise Sustainability Ratings</h2>
      <div className="space-y-6">
        {ratings.map((rating) => (
          <div key={rating.id} className="p-6 border border-gray-200 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{rating.herb}</h3>
                <p className="text-sm text-gray-600">Batch: {rating.id} - Farmer: {rating.farmer}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  rating.overallScore.includes('A') ? 'text-green-600' :
                  rating.overallScore.includes('B') ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {rating.overallScore}
                </div>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-4">
              {[
                { label: 'Carbon Footprint', value: rating.carbonFootprint, icon: Wind },
                { label: 'Water Usage', value: rating.waterUsage, icon: Droplets },
                { label: 'Biodiversity Impact', value: rating.biodiversityImpact, icon: Leaf },
                { label: 'Soil Health', value: rating.soilHealth, icon: Target },
                { label: 'Social Impact', value: rating.socialImpact, icon: Award }
              ].map((metric) => (
                <div key={metric.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <metric.icon className="h-5 w-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                  <p className={`font-semibold text-sm ${
                    ['Excellent', 'High', 'Low', 'Efficient', 'Positive'].includes(metric.value) ? 'text-green-600' :
                    ['Good', 'Medium', 'Moderate', 'Neutral'].includes(metric.value) ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            {rating.certifications.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Certifications:</p>
                <div className="flex flex-wrap gap-2">
                  {rating.certifications.map((cert) => (
                    <span key={cert} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Compliance Reports Component
const ComplianceReports = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Export NMPB/AYUSH Compliance Reports</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">NMPB Reports</h3>
          <div className="space-y-3">
            {[
              { name: 'Monthly Collection Report', date: 'November 2025', size: '2.3 MB' },
              { name: 'Conservation Compliance', date: 'November 2025', size: '1.8 MB' },
              { name: 'Violation Summary', date: 'November 2025', size: '894 KB' }
            ].map((report) => (
              <div key={report.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">AYUSH Reports</h3>
          <div className="space-y-3">
            {[
              { name: 'Quality Standards Report', date: 'November 2025', size: '3.1 MB' },
              { name: 'Lab Testing Summary', date: 'November 2025', size: '2.7 MB' },
              { name: 'Manufacturing Compliance', date: 'November 2025', size: '1.5 MB' }
            ].map((report) => (
              <div key={report.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-xl">
        <h4 className="font-medium text-blue-900 mb-2">Custom Report Generation</h4>
        <p className="text-sm text-blue-700 mb-4">Generate custom compliance reports with specific parameters</p>
        <div className="grid md:grid-cols-3 gap-4">
          <select className="border border-blue-200 rounded-lg px-3 py-2 text-sm">
            <option>Report Type</option>
            <option>NMPB Compliance</option>
            <option>AYUSH Standards</option>
            <option>Sustainability</option>
          </select>
          <select className="border border-blue-200 rounded-lg px-3 py-2 text-sm">
            <option>Date Range</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  </div>
)

// Modal Components
const BatchDetailModal = ({ batch, onClose }) => (
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
        <h2 className="text-xl font-semibold text-gray-900">Batch Details - {batch.id}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(batch).filter(([key]) => key !== 'id').map(([key, value]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
          View Full Chain
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Export Data
        </button>
      </div>
    </motion.div>
  </motion.div>
)

const ViolationDetailModal = ({ violation, onClose }) => (
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
        <h2 className="text-xl font-semibold text-gray-900">Violation Details - {violation.id}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(violation).filter(([key]) => key !== 'id').map(([key, value]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
          Take Action
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Generate Report
        </button>
      </div>
    </motion.div>
  </motion.div>
)


export default RegulatorLandingPage;

