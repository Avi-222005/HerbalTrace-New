import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, CheckCircle, Shield, AlertCircle, Users, RefreshCw } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const TermsOfUseModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage()

  const content = {
    en: {
      title: 'Terms of Use',
      lastUpdated: 'Last Updated: December 6, 2025',
      sections: [
        {
          icon: FileText,
          title: 'Acceptance of Terms',
          content: 'By accessing and using Herbal Trace services, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services. These terms apply to all users, including farmers, manufacturers, laboratories, regulators, and consumers.'
        },
        {
          icon: CheckCircle,
          title: 'Service Description',
          content: 'Herbal Trace provides a blockchain-based platform for tracking and verifying the authenticity of herbal products throughout the supply chain. Our services include product registration, quality certification, supply chain tracking, and consumer verification tools.'
        },
        {
          icon: Shield,
          title: 'User Responsibilities',
          content: 'Users must provide accurate information, maintain account security, comply with all applicable laws, and use the platform only for lawful purposes. You are responsible for all activities under your account and must notify us immediately of any unauthorized access.'
        },
        {
          icon: AlertCircle,
          title: 'Prohibited Activities',
          content: 'Users may not misuse the platform, provide false information, attempt to manipulate blockchain records, interfere with security features, or engage in any fraudulent activities. Violations may result in account suspension or termination.'
        },
        {
          icon: Users,
          title: 'Intellectual Property',
          content: 'All content, trademarks, and intellectual property on our platform are owned by Herbal Trace or our licensors. You may not copy, modify, distribute, or create derivative works without our explicit written permission.'
        },
        {
          icon: RefreshCw,
          title: 'Modifications and Termination',
          content: 'We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance. We may suspend or terminate accounts that violate these terms. Upon termination, your right to use the services ceases immediately.'
        }
      ],
      contact: {
        title: 'Questions?',
        text: 'For questions about these Terms of Use, contact us at:',
        email: 'herbal.trace1@gmail.com'
      }
    },
    hi: {
      title: 'उपयोग की शर्तें',
      lastUpdated: 'अंतिम अपडेट: 6 दिसंबर, 2025',
      sections: [
        {
          icon: FileText,
          title: 'शर्तों की स्वीकृति',
          content: 'हर्बल ट्रेस सेवाओं तक पहुंच और उपयोग करके, आप इन उपयोग की शर्तों से बंधे होने के लिए सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवाओं का उपयोग न करें।'
        },
        {
          icon: CheckCircle,
          title: 'सेवा विवरण',
          content: 'हर्बल ट्रेस आपूर्ति श्रृंखला में हर्बल उत्पादों की प्रामाणिकता को ट्रैक करने और सत्यापित करने के लिए एक ब्लॉकचेन-आधारित प्लेटफ़ॉर्म प्रदान करता है।'
        },
        {
          icon: Shield,
          title: 'उपयोगकर्ता जिम्मेदारियां',
          content: 'उपयोगकर्ताओं को सटीक जानकारी प्रदान करनी चाहिए, खाता सुरक्षा बनाए रखनी चाहिए, सभी लागू कानूनों का पालन करना चाहिए, और प्लेटफ़ॉर्म का उपयोग केवल वैध उद्देश्यों के लिए करना चाहिए।'
        },
        {
          icon: AlertCircle,
          title: 'निषिद्ध गतिविधियां',
          content: 'उपयोगकर्ता प्लेटफ़ॉर्म का दुरुपयोग नहीं कर सकते, झूठी जानकारी प्रदान नहीं कर सकते, ब्लॉकचेन रिकॉर्ड में हेरफेर करने का प्रयास नहीं कर सकते। उल्लंघन के परिणामस्वरूप खाता निलंबन हो सकता है।'
        },
        {
          icon: Users,
          title: 'बौद्धिक संपदा',
          content: 'हमारे प्लेटफ़ॉर्म पर सभी सामग्री, ट्रेडमार्क और बौद्धिक संपदा हर्बल ट्रेस या हमारे लाइसेंसधारकों के स्वामित्व में हैं।'
        },
        {
          icon: RefreshCw,
          title: 'संशोधन और समाप्ति',
          content: 'हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं। परिवर्तनों के बाद निरंतर उपयोग स्वीकृति का गठन करता है।'
        }
      ],
      contact: {
        title: 'संपर्क',
        text: 'इन उपयोग की शर्तों के बारे में प्रश्नों के लिए, हमसे संपर्क करें:',
        email: 'herbal.trace1@gmail.com'
      }
    }
  }

  const data = content[language] || content.en

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
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-custom-strong">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-primary-600" />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{data.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{data.lastUpdated}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Close terms of use"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-6">
                  {data.sections.map((section, index) => (
                    <motion.div
                      key={index}
                      className="card p-5 border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <section.icon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {section.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Contact Section */}
                  <div className="bg-primary-50 p-5 rounded-2xl border border-primary-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {data.contact.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {data.contact.text}
                    </p>
                    <a
                      href={`mailto:${data.contact.email}`}
                      className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                      {data.contact.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 rounded-b-3xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full btn-primary text-center"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TermsOfUseModal
