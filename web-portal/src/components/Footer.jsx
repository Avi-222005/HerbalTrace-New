import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import CookieSettingsModal from './CookieSettingsModal'
import PrivacyPolicyModal from './PrivacyPolicyModal'
import TermsOfUseModal from './TermsOfUseModal'

const Footer = () => {
  const { language } = useLanguage()
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  const contentMap = {
    en: {
      brandLine: '\u00A9 2025 Herbal Trace. All rights reserved.',
      powerLine: 'Powered by blockchain technology for maximum transparency and security.',
      downloadApp: 'Download Our Mobile App',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms-of-use' },
        { label: 'Cookie Settings', href: '#' }
      ],
      badges: [
        { color: 'bg-green-500', label: 'Blockchain Secured' },
        { color: 'bg-blue-500', label: 'ISO 27001 Certified' },
        { color: 'bg-purple-500', label: 'GDPR Compliant' }
      ]
    },
    hi: {
      brandLine: '\u00A9 2025 हर्बल ट्रेस. सर्वाधिकार सुरक्षित.',
      powerLine: 'अधिकतम पारदर्शिता और सुरक्षा के लिए ब्लॉकचेन तकनीक द्वारा संचालित।',
      downloadApp: 'हमारा मोबाइल ऐप डाउनलोड करें',
      links: [
        { label: 'गोपनीयता नीति', href: '/privacy-policy' },
        { label: 'नियम और शर्तें', href: '/terms-of-use' },
        { label: 'कुकी सेटिंग्स', href: '#' }
      ],
      badges: [
        { color: 'bg-green-500', label: 'ब्लॉकचेन सुरक्षित' },
        { color: 'bg-blue-500', label: 'ISO 27001 प्रमाणित' },
        { color: 'bg-purple-500', label: 'GDPR अनुरूप' }
      ]
    }
  }

  const content = contentMap[language] || contentMap.en

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom Bar */}
        <motion.div
          className="border-t border-gray-800 pt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col items-center space-y-6 text-center">
            <div>
              <p className="text-gray-400">
                {content.brandLine}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {content.powerLine}
              </p>
            </div>

            {/* Links Section */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
              {content.links.map((link, index) => (
                <React.Fragment key={link.label}>
                  {index > 0 && <span className="w-1 h-1 rounded-full bg-gray-700" />}
                  {link.label === 'Cookie Settings' || link.label === 'कुकी सेटिंग्स' ? (
                    <button
                      onClick={() => setIsCookieModalOpen(true)}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : link.label === 'Privacy Policy' || link.label === 'गोपनीयता नीति' ? (
                    <button
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : link.label === 'Terms & Conditions' || link.label === 'नियम और शर्तें' ? (
                    <button
                      onClick={() => setIsTermsModalOpen(true)}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : link.href.startsWith('/') ? (
                    <Link to={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile App Download Button */}
            <motion.div
              className="mt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="https://store8.gofile.io/download/web/08f5f051-f3e5-42f1-aa3f-60f3f4b56629/app-release.apk" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5" />
                <span>{content.downloadApp}</span>
              </a>
            </motion.div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              {content.badges.map((badge) => (
                <span key={badge.label} className="flex items-center space-x-2">
                  <span className={`w-2 h-2 ${badge.color} rounded-full animate-pulse`}></span>
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Modals */}
      <CookieSettingsModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <TermsOfUseModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </footer>
  )
}

export default Footer