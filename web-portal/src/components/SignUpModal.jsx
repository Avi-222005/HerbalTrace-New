import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const roleOptions = [
  { value: 'Farmer', label: { en: 'Farmer', hi: 'किसान' } },
  { value: 'Lab', label: { en: 'Laboratory', hi: 'प्रयोगशाला' } },
  { value: 'Manufacturer', label: { en: 'Manufacturer', hi: 'निर्माता' } },
  { value: 'Consumer', label: { en: 'Consumer', hi: 'उपभोक्ता' } }
]

const stateOptions = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

export const indianStateDistricts = {
  'Uttar Pradesh': ['Greater Noida', 'Noida', 'Lucknow', 'Varanasi', 'Prayagraj', 'Kanpur', 'Agra', 'Meerut', 'Gorakhpur', 'Bareilly', 'Aligarh', 'Moradabad', 'Mathura', 'Jhansi'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital', 'Rishikesh', 'Udham Singh Nagar', 'Almora', 'Pauri Garhwal', 'Chamoli', 'Pithoragarh', 'Tehri'],
  'Madhya Pradesh': ['Neemuch', 'Mandsaur', 'Indore', 'Bhopal', 'Ujjain', 'Gwalior', 'Jabalpur', 'Ratlam', 'Rewa', 'Satna', 'Hoshangabad'],
  'Rajasthan': ['Jodhpur', 'Nagaur', 'Jaipur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer', 'Alwar', 'Barmer', 'Chittorgarh', 'Pali', 'Sikar'],
  'Kerala': ['Wayanad', 'Idukki', 'Palakkad', 'Kozhikode', 'Ernakulam', 'Thrissur', 'Thiruvananthapuram', 'Kottayam', 'Kasaragod', 'Malappuram'],
  'Karnataka': ['Bangalore Rural', 'Mysore', 'Shimoga', 'Uttara Kannada', 'Dakshina Kannada', 'Belgaum', 'Dharwad', 'Tumkur', 'Chikmagalur', 'Coorg'],
  'Maharashtra': ['Pune', 'Nashik', 'Nagpur', 'Kolhapur', 'Satara', 'Aurangabad', 'Ahmednagar', 'Solapur', 'Thane', 'Sangli', 'Ratnagiri'],
  'Gujarat': ['Anand', 'Junagadh', 'Rajkot', 'Ahmedabad', 'Surat', 'Vadodara', 'Kutch', 'Mehsana', 'Patan', 'Bharuch'],
  'Tamil Nadu': ['Coimbatore', 'Salem', 'Madurai', 'Dindigul', 'Tirunelveli', 'Erode', 'Theni', 'Dharmapuri', 'Nilgiris', 'Tiruchirappalli'],
  'Himachal Pradesh': ['Kullu', 'Mandi', 'Kangra', 'Shimla', 'Chamba', 'Solan', 'Sirmaur', 'Lahaul and Spiti', 'Kinnaur'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Jorhat', 'Silchar', 'Nagaon', 'Tezpur', 'Tinsukia', 'Cachar'],
  'West Bengal': ['Darjeeling', 'Kalimpong', 'Jalpaiguri', 'Kolkata', 'Howrah', 'Hooghly', 'Bankura', 'Purulia', 'Alipurduar'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi']
}

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  aadharNumber: '',
  role: '',
  organizationName: '',
  locationState: '',
  locationDistrict: ''
}

const SignUpModal = ({ isOpen, onClose, onSwitchToSignIn }) => {
  const { language } = useLanguage()
  const contentMap = {
    en: {
      title: 'Register',
      closeAria: 'Close registration form',
      firstNameLabel: 'First Name',
      firstNamePlaceholder: 'Enter First Name',
      lastNameLabel: 'Last Name',
      lastNamePlaceholder: 'Enter Last Name',
      stateLabel: 'State',
      statePlaceholder: '--Select State--',
      districtLabel: 'District',
      districtPlaceholder: 'Enter District',
      phoneLabel: 'Phone No',
      phonePlaceholder: '+91 XXXXXXXXXX',
      emailLabel: 'Email',
      emailPlaceholder: 'abc@example.com',
      aadharLabel: 'Aadhaar Number',
      aadharPlaceholder: 'XXXX XXXX XXXX',
      roleLabel: 'Role',
      rolePlaceholder: '--Select Role--',
      organizationLabel: 'Organization Name',
      organizationPlaceholder: 'Enter Organization (optional)',
      submitButton: 'Submit Registration',
      switchPrompt: 'Already have an account?',
      switchButton: 'Sign in',
      successTitle: 'Registration Submitted!',
      successMessage: 'Your registration request has been submitted. An admin will review it and send your login credentials via email.',
      errorTitle: 'Registration Failed'
    },
    hi: {
      title: 'रजिस्टर करें',
      closeAria: 'पंजीकरण फॉर्म बंद करें',
      firstNameLabel: 'पहला नाम',
      firstNamePlaceholder: 'पहला नाम दर्ज करें',
      lastNameLabel: 'अंतिम नाम',
      lastNamePlaceholder: 'अंतिम नाम दर्ज करें',
      stateLabel: 'राज्य',
      statePlaceholder: '--राज्य चुनें--',
      districtLabel: 'जिला',
      districtPlaceholder: 'जिला दर्ज करें',
      phoneLabel: 'फ़ोन नंबर',
      phonePlaceholder: '+91 XXXXXXXXXX',
      emailLabel: 'ईमेल',
      emailPlaceholder: 'abc@example.com',
      aadharLabel: 'आधार नंबर',
      aadharPlaceholder: 'XXXX XXXX XXXX',
      roleLabel: 'भूमिका',
      rolePlaceholder: '--भूमिका चुनें--',
      organizationLabel: 'संगठन का नाम',
      organizationPlaceholder: 'संगठन दर्ज करें (वैकल्पिक)',
      submitButton: 'पंजीकरण जमा करें',
      switchPrompt: 'पहले से खाता है?',
      switchButton: 'साइन इन करें',
      successTitle: 'पंजीकरण जमा!',
      successMessage: 'आपका पंजीकरण अनुरोध जमा कर दिया गया है। एक व्यवस्थापक इसकी समीक्षा करेगा और आपके लॉगिन क्रेडेंशियल ईमेल द्वारा भेजेगा।',
      errorTitle: 'पंजीकरण विफल'
    }
  }

  const content = contentMap[language] || contentMap.en
  const roles = roleOptions.map((r) => ({
    value: r.value,
    label: r.label[language] || r.label.en
  }))

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null) // { type: 'success' | 'error', message: string }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear any previous result when user starts typing
    if (submitResult) setSubmitResult(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        aadharNumber: formData.aadharNumber,
        role: formData.role,
        organizationName: formData.organizationName || undefined,
        locationState: formData.locationState,
        locationDistrict: formData.locationDistrict
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/auth/registration-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Registration failed')
      }

      setSubmitResult({
        type: 'success',
        message: content.successMessage,
        requestId: result.data?.requestId
      })
      setFormData(initialFormState)
    } catch (err) {
      setSubmitResult({
        type: 'error',
        message: err.message || 'Unable to submit registration'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setFormData(initialFormState)
    setSubmitResult(null)
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

              <form onSubmit={handleSubmit} className="px-6 py-6 lg:py-8 bg-white max-h-[70vh] overflow-y-auto">
                {submitResult?.type === 'success' ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.successTitle}</h3>
                    <p className="text-gray-600 mb-6">{submitResult.message}</p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-primary"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {submitResult?.type === 'error' && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                        {content.errorTitle}: {submitResult.message}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label={content.firstNameLabel}
                          name="firstName"
                          placeholder={content.firstNamePlaceholder}
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                        <InputField
                          label={content.lastNameLabel}
                          name="lastName"
                          placeholder={content.lastNamePlaceholder}
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <InputField
                        label={content.emailLabel}
                        name="email"
                        type="email"
                        placeholder={content.emailPlaceholder}
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />

                      <InputField
                        label={content.phoneLabel}
                        name="phone"
                        type="tel"
                        placeholder={content.phonePlaceholder}
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />

                      <InputField
                        label={content.aadharLabel}
                        name="aadharNumber"
                        placeholder={content.aadharPlaceholder}
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        required
                      />

                      <SelectField
                        label={content.roleLabel}
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder={content.rolePlaceholder}
                        options={roles}
                        required
                      />

                      <InputField
                        label={content.organizationLabel}
                        name="organizationName"
                        placeholder={content.organizationPlaceholder}
                        value={formData.organizationName}
                        onChange={handleChange}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <SelectField
                          label={content.stateLabel}
                          name="locationState"
                          value={formData.locationState}
                          onChange={(e) => {
                            const newState = e.target.value
                            setFormData(prev => ({
                              ...prev,
                              locationState: newState,
                              locationDistrict: ''
                            }))
                          }}
                          placeholder={content.statePlaceholder}
                          options={stateOptions.map((s) => ({ value: s, label: s }))}
                          required
                        />
                        {indianStateDistricts[formData.locationState] ? (
                          <SelectField
                            label={content.districtLabel}
                            name="locationDistrict"
                            value={formData.locationDistrict}
                            onChange={handleChange}
                            placeholder="Select District"
                            options={indianStateDistricts[formData.locationState].map((d) => ({ value: d, label: d }))}
                            required
                          />
                        ) : (
                          <InputField
                            label={content.districtLabel}
                            name="locationDistrict"
                            placeholder={content.districtPlaceholder}
                            value={formData.locationDistrict}
                            onChange={handleChange}
                            required
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary flex items-center justify-center disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          content.submitButton
                        )}
                      </button>
                      <p className="text-sm text-center text-gray-600">
                        {content.switchPrompt}{' '}
                        <button
                          type="button"
                          className="text-primary-600 font-semibold hover:underline"
                          onClick={() => {
                            handleClose()
                            onSwitchToSignIn()
                          }}
                        >
                          {content.switchButton}
                        </button>
                      </p>
                    </div>
                  </>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required }) => (
  <label className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
    <span>
      {label}{required && <span className="text-red-500"> *</span>}
    </span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
    />
  </label>
)

const SelectField = ({ label, name, value, onChange, placeholder, options, required }) => (
  <label className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
    <span>
      {label}{required && <span className="text-red-500"> *</span>}
    </span>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </label>
)

export default SignUpModal
