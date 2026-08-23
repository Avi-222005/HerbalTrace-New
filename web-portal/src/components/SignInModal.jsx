import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// Role to path mapping - auto-detected from backend response
const rolePathMap = {
  Admin: '/admin',
  Farmer: '/farmer',
  Lab: '/laboratory',
  Laboratory: '/laboratory',
  Manufacturer: '/manufacturer',
  Consumer: '/consumer',
  Regulator: '/regulator'
}

const SignInModal = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const { language } = useLanguage()
  const contentMap = {
    en: {
      title: 'Sign in',
      usernameLabel: 'Username / User ID',
      usernamePlaceholder: 'Enter your username or user ID',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter Password',
      submitButton: 'Sign in',
      switchPrompt: 'New to HerbalTrace?',
      switchButton: 'Create an account',
      closeAria: 'Close sign in form',
      togglePasswordAria: 'Toggle password visibility'
    },
    hi: {
      title: 'साइन इन करें',
      usernameLabel: 'उपयोगकर्ता नाम / यूज़र आईडी',
      usernamePlaceholder: 'अपना उपयोगकर्ता नाम या यूज़र आईडी दर्ज करें',
      passwordLabel: 'पासवर्ड',
      passwordPlaceholder: 'पासवर्ड दर्ज करें',
      submitButton: 'साइन इन करें',
      switchPrompt: 'हर्बल ट्रेस पर नए हैं?',
      switchButton: 'खाता बनाएं',
      closeAria: 'साइन इन फॉर्म बंद करें',
      togglePasswordAria: 'पासवर्ड दृश्यता बदलें'
    }
  }

  const content = contentMap[language] || contentMap.en

  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed')
      }

      // Auto-detect role from backend response - no need to select manually
      const loggedInRole = result?.data?.user?.role
      if (!loggedInRole) {
        throw new Error('Unable to determine user role')
      }

      const targetPath = rolePathMap[loggedInRole] || '/'

      localStorage.setItem('herbaltrace_token', result.data.token)
      localStorage.setItem('herbaltrace_user', JSON.stringify({
        stakeholderType: loggedInRole,
        userId: result?.data?.user?.userId,
        username: result?.data?.user?.username,
        fullName: result?.data?.user?.fullName,
        email: result?.data?.user?.email,
        role: loggedInRole,
        isLoggedIn: true
      }))

      onClose()
      setCredentials({ username: '', password: '' })
      setShowPassword(false)
      navigate(targetPath)
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setCredentials({ username: '', password: '' })
    setShowPassword(false)
    setError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-custom-strong overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900">{content.title}</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label={content.closeAria}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 lg:py-8 bg-white space-y-5">
                {/* Username / User ID */}
                <label className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
                  <span>
                    {content.usernameLabel}<span className="text-red-500"> *</span>
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder={content.usernamePlaceholder}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </label>

                <label className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
                  <span>
                    {content.passwordLabel}<span className="text-red-500"> *</span>
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder={content.passwordPlaceholder}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      aria-label={content.togglePasswordAria}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full btn-primary disabled:opacity-70">
                  {isSubmitting ? 'Signing in...' : content.submitButton}
                </button>

                <p className="text-sm text-center text-gray-600">
                  {content.switchPrompt}{' '}
                  <button
                    type="button"
                    className="text-primary-600 font-semibold hover:underline"
                    onClick={() => {
                      handleClose()
                      onSwitchToSignUp()
                    }}
                  >
                    {content.switchButton}
                  </button>
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SignInModal
