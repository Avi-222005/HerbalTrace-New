import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, FileText, MapPin, Building, ChevronDown, CheckCircle, Loader2 } from 'lucide-react'

const JoinNetworkModal = ({ isOpen, onClose }) => {
  const [stakeholderType, setStakeholderType] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadharNumber: '',
    latitude: '',
    longitude: '',
    organizationName: '',
    district: '',
    state: '',
    additionalInfo: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

    const stakeholderOptions = [
    { value: 'farmer', label: 'Farmer', icon: '🌱' },
    { value: 'laboratory', label: 'Laboratory', icon: '🧪' },
    { value: 'manufacturer', label: 'Manufacturer', icon: '🏭' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }))
          setGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setGettingLocation(false)
          alert('Unable to get your location. Please enter coordinates manually.')
        }
      )
    } else {
      setGettingLocation(false)
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setStakeholderType('')
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      aadharNumber: '',
      latitude: '',
      longitude: '',
      organizationName: '',
      district: '',
      state: '',
      additionalInfo: ''
    })
    setSubmitted(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-600 to-green-600 px-6 py-4 rounded-t-2xl">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-white">Join the Network</h2>
            <p className="text-white/80 text-sm mt-1">Register as a stakeholder in the HerbalTrace ecosystem</p>
          </div>

          {submitted ? (
            /* Success State */
            <motion.div
              className="p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for joining HerbalTrace. We'll review your application and get back to you within 24-48 hours.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Stakeholder Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stakeholder Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {stakeholderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStakeholderType(option.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                        stakeholderType === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {stakeholderType && (
                <motion.div
                  className="space-y-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        required
                        maxLength={10}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Aadhar Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Number
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        placeholder="12-digit Aadhar number"
                        maxLength={12}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter your 12-digit Aadhar number for verification</p>
                  </div>

                  {/* Location Coordinates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Coordinates
                    </label>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="flex items-center space-x-2 px-4 py-2 mb-3 border border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 transition-all disabled:opacity-50"
                    >
                      {gettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span>{gettingLocation ? 'Getting Location...' : 'Get Current Location'}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="Latitude"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="Longitude"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Organization Name - Only for non-farmers */}
                  {stakeholderType !== 'farmer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          placeholder="Enter organization name"
                          required={stakeholderType !== 'farmer'}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* District and State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          placeholder="District"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your experience, certifications, or any relevant details..."
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-green-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Submit Registration</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default JoinNetworkModal
