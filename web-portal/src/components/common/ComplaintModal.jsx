import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, CheckCircle, Mic, MicOff, AlertCircle, Volume2, Globe } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export const ComplaintModal = ({ onClose, defaultCategory = '', role = 'Stakeholder' }) => {
  const [category, setCategory] = useState(defaultCategory || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('medium')
  const [voiceLang, setVoiceLang] = useState('hi-IN')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const recognitionRef = useRef(null)
  
  const [isDark] = useState(() => localStorage.getItem('herbaltrace_theme') === 'dark')

  const voiceLanguages = [
    { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'mr-IN', name: 'मराठी (Marathi)' },
    { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'bn-IN', name: 'বাংলা (Bengali)' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)' }
  ]

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

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [])

  const toggleVoice = async () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      setIsRecording(false)
      setRecordingStatus('')
      return
    }

    // 1. Explicitly trigger browser microphone permission dialog
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Once permission granted, release stream and proceed to speech recognition
        stream.getTracks().forEach(track => track.stop())
      } catch (permissionErr) {
        console.warn('Microphone permission denied or not available:', permissionErr)
        alert('Microphone permission is required for voice typing. Please allow microphone access in your browser address bar.')
        return
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = voiceLang

      rec.onstart = () => {
        setIsRecording(true)
        const currentLangObj = voiceLanguages.find(l => l.code === voiceLang)
        setRecordingStatus(`Listening in ${currentLangObj?.name || 'selected language'}... Speak now`)
      }

      rec.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript.trim()) {
          setMessage(prev => {
            const cleaned = prev ? prev.trim() + ' ' : ''
            return cleaned + transcript.trim()
          })
        }
      }

      rec.onerror = (err) => {
        console.warn('Speech recognition error:', err)
        setIsRecording(false)
        setRecordingStatus('')
      }

      rec.onend = () => {
        setIsRecording(false)
        setRecordingStatus('')
      }

      recognitionRef.current = rec
      rec.start()
    } catch (err) {
      console.error('Speech recognition initiation failed:', err)
      setIsRecording(false)
      setRecordingStatus('')
    }
  }

  const handleSubmit = async () => {
    if (!category || !subject.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields (Category, Subject, Message).')
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
          subject: subject.trim(),
          message: message.trim(),
          priority
        })
      })

      const result = await response.json()
      if (result.success) {
        setIsSubmitted(true)
        setTimeout(() => {
          onClose()
        }, 2000)
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

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900'
          }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30"
          >
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Complaint Submitted to Admin!</h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
            Your ticket has been delivered to the regulatory investigation team. Status: <strong>Under Investigation</strong>.
          </p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Submit Grievance to Admin</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Regulatory Ticket Desk • {role}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2 mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        <div className="space-y-4 text-xs">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
              Grievance Category <span className="text-red-500">*</span>
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 text-xs ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select Grievance Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
              Subject <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 text-xs ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Brief summary of your grievance"
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <label className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                Message Details <span className="text-red-500">*</span>
              </label>

              {/* Compact Voice Dictation Control Bar */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  title="Select voice input language"
                  className={`p-1.5 rounded-lg text-[10px] font-medium flex items-center space-x-1 transition-all ${
                    isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Globe className="h-3 w-3" />
                  <span>{voiceLanguages.find(l => l.code === voiceLang)?.name.split(' ')[0]}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-sm ${
                    isRecording 
                      ? 'bg-rose-600 text-white animate-pulse'
                      : isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  <span>{isRecording ? 'Stop Recording' : 'Voice Dictate'}</span>
                </button>
              </div>
            </div>

            {/* Language Selector Dropdown (Shown only when toggled) */}
            <AnimatePresence>
              {showLangPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-2 overflow-hidden"
                >
                  <div className={`p-2.5 rounded-xl border flex flex-wrap gap-1.5 text-[10px] ${
                    isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <span className="w-full text-zinc-400 font-semibold mb-1">Voice Recognition Language:</span>
                    {voiceLanguages.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setVoiceLang(l.code)
                          setShowLangPicker(false)
                        }}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                          voiceLang === l.code
                            ? 'bg-emerald-600 text-white'
                            : isDark ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {recordingStatus && (
              <p className="text-[11px] text-rose-500 font-bold mb-1.5 flex items-center space-x-1.5 animate-pulse">
                <Volume2 className="h-3 w-3" />
                <span>{recordingStatus}</span>
              </p>
            )}

            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleSubmit()
                }
              }}
              className={`w-full border rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows="4"
              placeholder="Type your complaint details here or click Voice Dictate to speak... (Press Ctrl+Enter to submit)"
            />
          </div>
        </div>
        
        <div className={`flex space-x-3 mt-6 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
          <button 
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-colors ${
              isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!category || !subject || !message || isSubmitting}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
              !category || !subject || !message || isSubmitting
                ? isDark ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
            }`}
          >
            {isSubmitting ? (
              <span>Sending...</span>
            ) : (
              <span>Submit Complaint</span>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ComplaintModal
