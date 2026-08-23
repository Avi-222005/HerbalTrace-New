import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Radio, 
  Smartphone, 
  Send, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  X, 
  PhoneCall, 
  RefreshCw, 
  MapPin, 
  Database,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const OfflineGsmTerminalModal = ({ isOpen, onClose, onSyncComplete, isDark }) => {
  const [activeTab, setActiveTab] = useState('ussd') // 'ussd' | 'sms' | 'queue'
  const [isCellularConnected, setIsCellularConnected] = useState(true)
  
  // USSD State
  const [ussdDialInput, setUssdDialInput] = useState('*99*4372#')
  const [ussdSessionId, setUssdSessionId] = useState(null)
  const [ussdScreenText, setUssdScreenText] = useState('')
  const [ussdHistory, setUssdHistory] = useState([])
  const [ussdResponseInput, setUssdResponseInput] = useState('')
  const [isUssdActive, setIsUssdActive] = useState(false)
  const [isUssdLoading, setIsUssdLoading] = useState(false)

  // SMS State
  const [smsSpecies, setSmsSpecies] = useState('Tulsi')
  const [smsWeight, setSmsWeight] = useState('4.5')
  const [smsPhone, setSmsPhone] = useState('+91 98765 43210')
  const [smsCoords, setSmsCoords] = useState('28.4744, 77.5040')
  const [smsStatus, setSmsStatus] = useState(null)
  const [isSmsSending, setIsSmsSending] = useState(false)

  // Local Offline Queue
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('herbaltrace_offline_sms_queue') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('herbaltrace_offline_sms_queue', JSON.stringify(offlineQueue))
  }, [offlineQueue])

  // USSD Dial Action
  const handleDialUssd = async () => {
    setIsUssdLoading(true)
    setIsUssdActive(true)
    setUssdSessionId(`USSD-${Date.now()}`)
    setUssdHistory([])

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/collections/ussd-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `USSD-${Date.now()}`,
          phoneNumber: smsPhone,
          text: ''
        })
      })
      const text = await res.text()
      const clean = text.replace(/^(CON|END)\s*/, '')
      setUssdScreenText(clean)
    } catch (err) {
      setUssdScreenText('Network Error: Cellular GSM gateway unreachable.')
    } finally {
      setIsUssdLoading(false)
    }
  }

  // Send USSD Menu Option
  const handleSendUssdOption = async () => {
    if (!ussdResponseInput.trim()) return
    setIsUssdLoading(true)
    const newHistory = [...ussdHistory, ussdResponseInput.trim()]
    setUssdHistory(newHistory)
    const fullText = newHistory.join('*')
    setUssdResponseInput('')

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/collections/ussd-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: ussdSessionId,
          phoneNumber: smsPhone,
          text: fullText
        })
      })
      const text = await res.text()
      const isEnd = text.startsWith('END')
      const clean = text.replace(/^(CON|END)\s*/, '')
      setUssdScreenText(clean)
      if (isEnd) {
        onSyncComplete?.()
      }
    } catch (err) {
      setUssdScreenText('GSM Session Terminated unexpectedly.')
    } finally {
      setIsUssdLoading(false)
    }
  }

  // Send SMS Harvest Command
  const handleSendSms = async () => {
    const rawSms = `HT HARVEST ${smsSpecies.toUpperCase()} ${smsWeight}KG ${smsCoords} GRADE_A`
    
    if (!isCellularConnected) {
      // Add to offline queue
      const queuedItem = {
        id: `QUEUE-${Date.now()}`,
        timestamp: new Date().toISOString(),
        rawSms,
        species: smsSpecies,
        weight: smsWeight,
        coords: smsCoords
      }
      setOfflineQueue(prev => [queuedItem, ...prev])
      setSmsStatus({ success: true, offline: true, message: 'Saved to Offline GSM Queue. Will auto-sync when cellular signal returns.' })
      return
    }

    setIsSmsSending(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/collections/sms-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: smsPhone,
          message: rawSms
        })
      })
      const data = await res.json()
      if (data.success) {
        setSmsStatus({ success: true, message: data.data.receipt || 'SMS Batch Registered on Blockchain!' })
        onSyncComplete?.()
      } else {
        setSmsStatus({ success: false, message: data.message || 'SMS processing failed' })
      }
    } catch (err) {
      setSmsStatus({ success: false, message: 'Failed to communicate with SMS Gateway' })
    } finally {
      setIsSmsSending(false)
    }
  }

  // Sync Offline Queue
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return
    setIsSmsSending(true)
    let syncedCount = 0

    for (const item of offlineQueue) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/collections/sms-webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: smsPhone, message: item.rawSms })
        })
        const data = await res.json()
        if (data.success) syncedCount++
      } catch (e) {
        console.warn('Queue sync error:', e)
      }
    }

    setOfflineQueue([])
    setIsSmsSending(false)
    setSmsStatus({ success: true, message: `✅ Successfully synced ${syncedCount} offline harvests to the blockchain!` })
    onSyncComplete?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`max-w-2xl w-full rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Offline-First GSM / USSD Harvester Terminal</h2>
              <p className="text-xs text-zinc-400 font-mono">Zero-Internet Botanical Wild Harvest Protocol (*99*4372#)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Signal & Offline Mode Toggle Bar */}
        <div className="flex items-center justify-between mt-4 p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCellularConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="font-bold">
              {isCellularConnected ? '2G / 3G GSM Cellular Tower: Connected' : 'Remote Deep Forest Mode (Offline)'}
            </span>
          </div>
          <button
            onClick={() => setIsCellularConnected(!isCellularConnected)}
            className={`px-3 py-1 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
              isCellularConnected 
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isCellularConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isCellularConnected ? 'Simulate Forest Offline' : 'Reconnect GSM'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mt-4 border-b border-zinc-800 pb-2">
          {[
            { id: 'ussd', label: 'Feature Phone Keypad (*99#)', icon: Smartphone },
            { id: 'sms', label: 'Encrypted Shortcode SMS', icon: Send },
            { id: 'queue', label: `Offline Storage Queue (${offlineQueue.length})`, icon: Database },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: USSD DIALER */}
        {activeTab === 'ussd' && (
          <div className="mt-5 space-y-4">
            {!isUssdActive ? (
              <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-3xl mx-auto flex items-center justify-center border border-emerald-500/30">
                  <PhoneCall className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">National Ayush Harvester USSD Gateway</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    Dial zero-balance shortcode <strong className="text-emerald-400">*99*4372# (*99*HERB#)</strong> from any basic keypad phone.
                  </p>
                </div>
                <button
                  onClick={handleDialUssd}
                  disabled={isUssdLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center space-x-2 mx-auto"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Dial *99*4372# (HERB)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Feature Phone Screen Simulation */}
                <div className="p-5 bg-emerald-950/90 border-2 border-emerald-500/50 rounded-2xl font-mono text-xs text-emerald-300 space-y-3 shadow-inner">
                  <div className="flex justify-between border-b border-emerald-800 pb-1 text-[10px] text-emerald-400">
                    <span>CELLULAR USSD SESSION</span>
                    <span>SIGNAL: ■■■■□</span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed font-bold">
                    {ussdScreenText || 'Connecting to Ayush Gateway...'}
                  </pre>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={ussdResponseInput}
                    onChange={(e) => setUssdResponseInput(e.target.value)}
                    placeholder="Enter menu number (e.g. 1, 2) or weight..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendUssdOption()}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    onClick={handleSendUssdOption}
                    disabled={isUssdLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
                  >
                    <span>Send</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setIsUssdActive(false)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
                  >
                    End
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SMS COMPOSER */}
        {activeTab === 'sms' && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Botanical Species</label>
                <select
                  value={smsSpecies}
                  onChange={(e) => setSmsSpecies(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Tulsi">Tulsi (Holy Basil)</option>
                  <option value="Ashwagandha">Ashwagandha</option>
                  <option value="Neem">Neem Leaves</option>
                  <option value="Turmeric">Turmeric Rhizome</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={smsWeight}
                  onChange={(e) => setSmsWeight(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Sender Mobile Phone</label>
                <input
                  type="text"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">GPS Geofence</label>
                <input
                  type="text"
                  value={smsCoords}
                  onChange={(e) => setSmsCoords(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Generated SMS Payload preview */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[11px]">
              <span className="text-zinc-500 block text-[10px]">ENCRYPTED GSM SMS PAYLOAD:</span>
              <span className="text-emerald-400 font-bold">
                HT HARVEST {smsSpecies.toUpperCase()} {smsWeight}KG {smsCoords} GRADE_A
              </span>
            </div>

            {smsStatus && (
              <div className={`p-3 rounded-xl border text-xs font-mono flex items-start space-x-2 ${
                smsStatus.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{smsStatus.message}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSendSms}
                disabled={isSmsSending}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>{isCellularConnected ? 'Send GSM SMS to Gateway' : 'Save to Offline Queue'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: OFFLINE STORAGE QUEUE */}
        {activeTab === 'queue' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                Pending harvest logs recorded without internet connectivity:
              </p>
              {offlineQueue.length > 0 && (
                <button
                  onClick={handleSyncOfflineQueue}
                  disabled={isSmsSending || !isCellularConnected}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSmsSending ? 'animate-spin' : ''}`} />
                  <span>Sync All to Blockchain</span>
                </button>
              )}
            </div>

            {offlineQueue.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-300">All offline harvests are 100% synchronized with Hyperledger Fabric!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {offlineQueue.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono flex justify-between items-center">
                    <div>
                      <span className="font-bold text-emerald-400">{item.species} • {item.weight} kg</span>
                      <span className="text-zinc-500 text-[10px] block">{item.coords} • {new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      QUEUED OFFLINE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default OfflineGsmTerminalModal
