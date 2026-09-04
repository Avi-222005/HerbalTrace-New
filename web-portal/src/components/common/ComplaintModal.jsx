import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, CheckCircle, AlertCircle, RefreshCw, Clock, ShieldCheck, FileText, Send, User, ChevronRight } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export const ComplaintModal = ({ onClose, defaultCategory = '', role = 'Stakeholder' }) => {
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'track'
  const [category, setCategory] = useState(defaultCategory || 'Geofence & Location Dispute')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Tracking state
  const [myComplaints, setMyComplaints] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  const [isDark] = useState(() => localStorage.getItem('herbaltrace_theme') === 'dark')

  const categories = [
    'Geofence & Location Dispute',
    'Payment & Quality Multiplier',
    'Quality Test Result Dispute',
    'Pickup / Logistics Delay',
    'Smart Contract Season Window',
    'Equipment Malfunction',
    'Sample Quality Discrepancy',
    'Other Operational Inquiry'
  ]

  const fetchMyComplaints = async () => {
    setIsLoadingHistory(true)
    try {
      const token = localStorage.getItem('herbaltrace_token')
      if (!token) return
      const res = await fetch(`${BACKEND_URL}/api/v1/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setMyComplaints(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching complaints:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchMyComplaints()
  }, [])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!category || !message.trim()) {
      setErrorMessage('Please select a Complaint Type and describe your issue.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const token = localStorage.getItem('herbaltrace_token')
      const response = await fetch(`${BACKEND_URL}/api/v1/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          subject: category, // Category automatically becomes the subject
          message: message.trim(),
          description: message.trim(),
          priority
        })
      })

      const result = await response.json()
      if (result.success) {
        setIsSubmitted(true)
        fetchMyComplaints()
        setTimeout(() => {
          setIsSubmitted(false)
          setMessage('')
          setActiveTab('track')
        }, 1800)
      } else {
        setErrorMessage(result.message || 'Failed to submit complaint')
      }
    } catch (err) {
      console.error('Complaint error:', err)
      setErrorMessage('Error submitting complaint to network')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`rounded-3xl max-w-xl w-full p-6 shadow-2xl border transition-all my-8 ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Grievance & Resolution Hub</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                Official dispute & escalation portal • Direct to Ayush Regulators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`mt-4 p-1 rounded-2xl flex items-center space-x-1 ${isDark ? 'bg-zinc-950 border border-zinc-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'new'
                ? 'bg-red-500 text-white shadow-md'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>File New Grievance</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('track')
              fetchMyComplaints()
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'track'
                ? 'bg-red-500 text-white shadow-md'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Track My Tickets ({myComplaints.length})</span>
          </button>
        </div>

        {/* TAB 1: New Grievance */}
        {activeTab === 'new' && (
          <div className="mt-5 space-y-4">
            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl"
              >
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-emerald-400">Grievance Successfully Filed!</h3>
                <p className="text-xs text-zinc-300">
                  Your ticket has been dispatched to the regulatory oversight committee. Switching to tracking tab...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Complaint Type (Automatically acts as Subject) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Complaint Type (Automatically set as Subject) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500 focus:bg-white'
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Low', color: 'border-blue-500/40 text-blue-400' },
                      { id: 'medium', label: 'Medium', color: 'border-amber-500/40 text-amber-400' },
                      { id: 'high', label: 'Urgent', color: 'border-red-500/40 text-red-400' }
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPriority(p.id)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          priority === p.id
                            ? 'bg-red-500 text-white border-red-500 shadow-md'
                            : `${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'} ${p.color}`
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                    Issue Description & Details *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide full details, batch numbers, dates, or dispute reasons..."
                    required
                    className={`w-full p-4 rounded-2xl text-xs border transition-all resize-none ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-zinc-600'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-500 focus:bg-white placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Submitting to Regulatory Desk...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Grievance to Admin</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Track Complaints */}
        {activeTab === 'track' && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                {myComplaints.length} Ticket(s) on Record
              </span>
              <button
                onClick={fetchMyComplaints}
                disabled={isLoadingHistory}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center space-x-1"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-red-400 mb-2" />
                <p className="text-xs text-zinc-500">Loading complaint ledger...</p>
              </div>
            ) : myComplaints.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50 text-emerald-500" />
                <p className="text-xs font-bold">No active grievances filed.</p>
                <p className="text-[11px] mt-1">All your batches and operations are in good standing.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {myComplaints.map((c) => {
                  const status = (c.status || 'PENDING').toUpperCase()
                  const statusBadge = 
                    status === 'RESOLVED' ? { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Resolved' } :
                    status === 'IN_REVIEW' ? { bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Under Review' } :
                    status === 'REJECTED' ? { bg: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Closed' } :
                    { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Pending' }

                  return (
                    <div
                      key={c.id || c.complaint_id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDark ? 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                            ID: {c.complaint_id || c.id}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-0.5">
                            {c.category || c.subject}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                        {c.description || c.message}
                      </p>

                      {c.admin_response && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                            Official Admin Resolution:
                          </span>
                          <p className="text-zinc-200 text-[11px] mt-0.5">{c.admin_response}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/40 text-[10px] text-zinc-500">
                        <span>Priority: <strong className="text-zinc-300 capitalize">{c.priority || 'Medium'}</strong></span>
                        <span>{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default ComplaintModal
