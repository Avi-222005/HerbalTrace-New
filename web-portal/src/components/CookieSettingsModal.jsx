import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const CookieSettingsModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage()

  const content = {
    en: {
      title: 'Cookie Settings',
      description: 'We use cookies to enhance your browsing experience and analyze our traffic.',
      essential: 'Accept Essential',
      rejectAll: 'Reject All'
    },
    hi: {
      title: 'कुकी सेटिंग्स',
      description: 'हम आपके ब्राउज़िंग अनुभव को बेहतर बनाने और अपने ट्रैफ़िक का विश्लेषण करने के लिए कुकीज़ का उपयोग करते हैं।',
      essential: 'आवश्यक स्वीकार करें',
      rejectAll: 'सभी अस्वीकार करें'
    }
  }

  const data = content[language] || content.en

  const handleAcceptEssential = () => {
    const preferences = { necessary: true }
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    onClose()
  }

  const handleRejectAll = () => {
    const preferences = { necessary: false }
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-custom-strong p-6">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Cookie className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{data.title}</h2>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {data.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleAcceptEssential}
                  className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-md"
                >
                  {data.essential}
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  {data.rejectAll}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CookieSettingsModal
