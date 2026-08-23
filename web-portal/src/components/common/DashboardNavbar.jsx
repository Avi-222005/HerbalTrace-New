import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut, 
  ChevronDown, 
  User, 
  Settings, 
  Bell, 
  X, 
  Camera, 
  Calendar, 
  Shield, 
  Upload,
  Lock,
  CheckCircle,
  AlertTriangle,
  Zap,
  FileText,
  Key,
  Check,
  Radio,
  CheckCircle2,
  Trash2,
  Sun,
  Moon
} from 'lucide-react'
import logoImage from '../../assets/logo.png'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const DashboardNavbar = ({ 
  userName = 'User', 
  userRole = 'Stakeholder', 
  userAvatar = null,
  dateJoined = 'December 2024',
  approvedBy = 'System Admin',
  theme = null,
  onToggleTheme = null
}) => {
  const navigate = useNavigate()
  
  // Local theme state if not passed from parent
  const [currentTheme, setCurrentTheme] = useState(() => {
    return theme || localStorage.getItem('herbaltrace_theme') || 'dark'
  })

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
    setCurrentTheme(nextTheme)
    localStorage.setItem('herbaltrace_theme', nextTheme)
    if (onToggleTheme) {
      onToggleTheme(nextTheme)
    }
    // Dispatch custom event so all open components can sync
    window.dispatchEvent(new Event('herbaltrace_theme_changed'))
  }

  useEffect(() => {
    const handleThemeChange = () => {
      const stored = localStorage.getItem('herbaltrace_theme')
      if (stored && stored !== currentTheme) {
        setCurrentTheme(stored)
      }
    }
    window.addEventListener('herbaltrace_theme_changed', handleThemeChange)
    return () => window.removeEventListener('herbaltrace_theme_changed', handleThemeChange)
  }, [currentTheme])

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [profileImage, setProfileImage] = useState(userAvatar)
  const fileInputRef = useRef(null)
  const profileMenuRef = useRef(null)
  const notificationsMenuRef = useRef(null)

  // Click outside listener to automatically close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Settings Modal Tabs
  const [settingsTab, setSettingsTab] = useState('password') // 'password' | 'profile'
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' })

  // Role-specific notifications
  const getRoleNotifications = (role) => {
    if (role === 'Farmer') {
      return [
        { id: 1, title: 'Harvest Geofence Verified', message: 'Tulsi collection verified in All-India approved zone.', time: '10m ago', unread: true },
        { id: 2, title: 'Batch Consolidated', message: 'Your harvest batch has been signed by FarmersCoopMSP.', time: '1h ago', unread: true },
        { id: 3, title: 'Quality COA Passed', message: 'Laboratory certified 8.2% moisture & heavy metals pass.', time: '2h ago', unread: false }
      ]
    }
    if (role === 'Laboratory' || role === 'Lab') {
      return [
        { id: 1, title: 'New Batch for Analysis', message: 'Batch BATCH-TULSI assigned for Physicochemical COA.', time: '5m ago', unread: true },
        { id: 2, title: 'TestingLabsMSP Certificate Endorsed', message: 'COA signed and committed to Hyperledger Fabric.', time: '45m ago', unread: false }
      ]
    }
    if (role === 'Manufacturer') {
      return [
        { id: 1, title: 'Approved Batch Ready', message: 'Batch passed QC and ready for Ayurvedic formulation.', time: '20m ago', unread: true },
        { id: 2, title: 'QR Code Generated', message: 'Cryptographic consumer verification QR active.', time: '2h ago', unread: false }
      ]
    }
    return [
      { id: 1, title: 'Fabric Peer Cluster Synced', message: '4 endorsement peers active across Farmers, Labs, Processors, Manufacturers.', time: 'Just now', unread: true },
      { id: 2, title: 'All-India Tulsi Geofence Active', message: 'Smart contract season window valid across all states.', time: '15m ago', unread: true }
    ]
  }

  const [notifications, setNotifications] = useState(() => getRoleNotifications(userRole))
  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = () => {
    localStorage.removeItem('herbaltrace_user')
    localStorage.removeItem('herbaltrace_token')
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'HT'
    const words = name.trim().split(/\s+/)
    if (words.length === 0 || !words[0]) return 'HT'
    return words
      .map(word => (word && word[0]) ? word[0] : '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'HT'
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordStatus({ loading: true, error: '', success: '' })

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ loading: false, error: 'New password and confirmation do not match', success: '' })
      return
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ loading: false, error: 'Password must be at least 8 characters', success: '' })
      return
    }

    const token = localStorage.getItem('herbaltrace_token')
    if (!token) {
      setPasswordStatus({ loading: false, error: 'Please sign in to change password', success: '' })
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Password update failed')
      }

      setPasswordStatus({ loading: false, error: '', success: 'Password changed successfully in database!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.message || 'Error updating password', success: '' })
    }
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  const isDark = currentTheme === 'dark'

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-colors duration-300 border-b shadow-sm ${
        isDark 
          ? 'bg-zinc-900/90 text-white border-zinc-800' 
          : 'bg-white/90 text-zinc-900 border-neutral-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo & Brand */}
            <div 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <img 
                src={logoImage} 
                alt="HerbalTrace Logo" 
                className="h-10 w-10 md:h-11 md:w-11 object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <span className={`text-xl md:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Herbal<span className="text-emerald-500">Trace</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  Fabric Mainnet
                </span>
              </div>
            </div>

            {/* Right Section - Theme Switcher, Notifications & Profile */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Dynamic Theme Toggle in Navbar */}
              <motion.button
                onClick={toggleTheme}
                animate={{ rotate: isDark ? 360 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-colors ${
                  isDark 
                    ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700' 
                    : 'bg-neutral-100 border-neutral-200 text-zinc-700 hover:bg-neutral-200'
                }`}
                title="Toggle Warm Dark / Clean Light Theme"
              >
                {isDark ? <Sun className="h-4 sm:h-5 w-4 sm:w-5" /> : <Moon className="h-4 sm:h-5 w-4 sm:w-5" />}
              </motion.button>

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notificationsMenuRef}>
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    setShowProfileMenu(false)
                  }}
                  className={`relative p-2 sm:p-2.5 rounded-2xl transition-all border ${
                    isDark 
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800' 
                      : 'text-zinc-700 hover:text-zinc-900 hover:bg-neutral-100 border-neutral-200'
                  }`}
                  title="Notifications & Alerts"
                >
                  <Bell className="h-4 sm:h-5 w-4 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full animate-ping" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl shadow-2xl overflow-hidden z-50 border ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-zinc-900'
                      }`}
                    >
                      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-neutral-200'}`}>
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-emerald-500" />
                          <h4 className="font-bold text-sm">Notifications</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-[10px] text-emerald-500 font-bold hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800 text-zinc-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-zinc-800/60">
                        {notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => setShowNotifications(false)}
                            className={`p-3.5 transition-colors text-xs cursor-pointer ${
                              isDark 
                                ? (n.unread ? 'bg-zinc-800/40 hover:bg-zinc-800/60' : 'hover:bg-zinc-800/20')
                                : (n.unread ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-neutral-50')
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <p className={`font-bold ${isDark ? (n.unread ? 'text-emerald-300' : 'text-zinc-300') : (n.unread ? 'text-emerald-800' : 'text-zinc-800')}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-zinc-400">{n.time}</span>
                            </div>
                            <p className={`mt-1 text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Section */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu)
                    setShowNotifications(false)
                  }}
                  className={`flex items-center space-x-2.5 p-1.5 sm:p-2 rounded-2xl transition-all border ${
                    isDark 
                      ? 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/80' 
                      : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200'
                  }`}
                >
                  <div className="relative">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={userName}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-emerald-500/60"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-xs border border-emerald-400/40 shadow-inner">
                        {getInitials(userName)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                  </div>
                  
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className={`text-xs font-bold max-w-[120px] truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{userName}</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">{userRole}</span>
                  </div>
                  
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-3 w-60 rounded-3xl shadow-2xl border py-2 z-50 ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-zinc-900'
                      }`}
                    >
                      <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-neutral-200'}`}>
                        <p className="font-bold text-sm truncate">{userName}</p>
                        <p className="text-xs text-emerald-500 font-medium">{userRole} Access</p>
                      </div>

                      <div className="py-2">
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false)
                            setShowProfileModal(true)
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs transition-colors ${
                            isDark ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'text-zinc-700 hover:bg-neutral-100 hover:text-zinc-900'
                          }`}
                        >
                          <User className="h-4 w-4 text-emerald-500" />
                          <span>View Profile & CA Details</span>
                        </button>
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false)
                            setShowSettingsModal(true)
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs transition-colors ${
                            isDark ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'text-zinc-700 hover:bg-neutral-100 hover:text-zinc-900'
                          }`}
                        >
                          <Settings className="h-4 w-4 text-teal-500" />
                          <span>Settings & Password</span>
                        </button>
                      </div>

                      <div className={`border-t pt-2 px-2 ${isDark ? 'border-zinc-800' : 'border-neutral-200'}`}>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Click outside backdrop */}
        {(showProfileMenu || showNotifications) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowProfileMenu(false)
              setShowNotifications(false)
            }}
          />
        )}
      </nav>

      {/* Settings Modal (Password Change + Profile Photo) */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-zinc-900'
              }`}
            >
              <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? 'border-zinc-800' : 'border-neutral-200'}`}>
                <div className="flex items-center space-x-2.5">
                  <Settings className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">Account Settings</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowSettingsModal(false)
                    setPasswordStatus({ loading: false, error: '', success: '' })
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs inside Settings */}
              <div className={`flex border-b px-6 pt-3 space-x-4 text-xs font-bold ${isDark ? 'border-zinc-800' : 'border-neutral-200'}`}>
                <button
                  onClick={() => setSettingsTab('password')}
                  className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
                    settingsTab === 'password'
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-white'
                  }`}
                >
                  <Key className="h-4 w-4" />
                  <span>Security & Password</span>
                </button>
                <button
                  onClick={() => setSettingsTab('profile')}
                  className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
                    settingsTab === 'profile'
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-white'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  <span>Profile Image</span>
                </button>
              </div>

              {/* Password Tab Content */}
              {settingsTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-neutral-50 border-neutral-300 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-neutral-50 border-neutral-300 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      required
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-neutral-50 border-neutral-300 text-zinc-900'
                      }`}
                    />
                  </div>

                  {passwordStatus.error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>{passwordStatus.error}</span>
                    </div>
                  )}

                  {passwordStatus.success && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs flex items-center space-x-2">
                      <Check className="h-4 w-4 flex-shrink-0" />
                      <span>{passwordStatus.success}</span>
                    </div>
                  )}

                  <div className="pt-3 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors ${
                        isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-neutral-200 text-zinc-700 hover:bg-neutral-300'
                      }`}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={passwordStatus.loading}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {passwordStatus.loading ? 'Updating...' : 'Save Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* Profile Photo Tab Content */}
              {settingsTab === 'profile' && (
                <div className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt={userName}
                          className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/40"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-2xl border-4 border-neutral-300 dark:border-zinc-800">
                          {getInitials(userName)}
                        </div>
                      )}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-zinc-950 rounded-full hover:bg-emerald-400 transition-colors shadow-lg"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold mt-3">{userName}</p>
                    <p className="text-xs text-zinc-400">{userRole}</p>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDark ? 'border-zinc-700 hover:border-emerald-500 bg-zinc-950/40' : 'border-neutral-300 hover:border-emerald-500 bg-neutral-50'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/png,image/jpeg,image/jpg" 
                      onChange={handleImageUpload}
                      className="hidden" 
                    />
                    <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Click to upload avatar</p>
                    <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setShowSettingsModal(false)}
                      className="w-full py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Details Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-neutral-200 text-zinc-900'
              }`}
            >
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-8 text-center relative text-white">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="relative inline-block">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={userName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-emerald-400 font-black text-2xl border-4 border-white/20 shadow-lg mx-auto">
                      {getInitials(userName)}
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-zinc-900 rounded-full" />
                </div>
                
                <h2 className="text-lg font-bold text-white mt-3">{userName}</h2>
                <p className="text-emerald-200 text-xs font-semibold">{userRole} Profile</p>
              </div>
              
              <div className="p-6 space-y-3 text-xs">
                <div className={`flex items-center space-x-3 p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <User className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Role Authorization</p>
                    <p className="font-bold">{userRole}</p>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <Shield className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Root CA Certification</p>
                    <p className="font-bold">{approvedBy}</p>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 p-3 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Session / Join Date</p>
                    <p className="font-bold">{dateJoined}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-colors ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-zinc-900'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DashboardNavbar
