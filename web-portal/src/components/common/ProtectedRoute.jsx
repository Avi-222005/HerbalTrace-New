import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, LogIn, Lock, AlertCircle, ArrowRight } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('herbaltrace_token')
      const userStr = localStorage.getItem('herbaltrace_user')

      if (!token || !userStr) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const user = JSON.parse(userStr)
      const role = user.role || user.stakeholderType || 'Admin'

      // Safe token expiry check
      try {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const tokenPayload = JSON.parse(atob(payloadBase64))
        if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
          localStorage.removeItem('herbaltrace_token')
          localStorage.removeItem('herbaltrace_user')
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }
      } catch (e) {
        // Continue if parsing fails
      }

      setIsAuthenticated(true)
      setUserRole(role)
      setIsLoading(false)
    } catch (error) {
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [location.pathname])

  const handleInlineLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Authentication failed')
      }

      const role = result.data?.user?.role || 'Admin'
      localStorage.setItem('herbaltrace_token', result.data.token)
      localStorage.setItem('herbaltrace_user', JSON.stringify({
        stakeholderType: role,
        userId: result.data?.user?.userId,
        username: result.data?.user?.username,
        fullName: result.data?.user?.fullName,
        email: result.data?.user?.email,
        role: role,
        isLoggedIn: true
      }))

      setIsAuthenticated(true)
      setUserRole(role)
    } catch (err) {
      setLoginError(err.message || 'Login failed')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Verifying blockchain identity session...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - Show elegant in-place portal login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">HerbalTrace Portal Access</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with your verified Hyperledger Fabric credentials
            </p>
          </div>

          <form onSubmit={handleInlineLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username / User ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or freshfarmer..."
                required
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-red-400 text-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span>Authenticating with Ledger...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              ← Back to Public Website
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check role-based access if allowedRoles specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const roleRoutes = {
      'Admin': '/admin',
      'Farmer': '/farmer',
      'Lab': '/laboratory',
      'Manufacturer': '/manufacturer',
      'Consumer': '/consumer',
      'Regulator': '/regulator'
    }
    const correctRoute = roleRoutes[userRole] || '/'
    return <Navigate to={correctRoute} replace />
  }

  return children
}

export default ProtectedRoute
