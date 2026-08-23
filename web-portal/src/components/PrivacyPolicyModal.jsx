import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Lock, Database, Users, Eye, FileText } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage()

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: December 6, 2025',
      sections: [
        {
          icon: Shield,
          title: 'Information We Collect',
          content: 'We collect information that you provide directly to us, including name, email address, phone number, and business details. We also automatically collect device information, usage data, and blockchain transaction records to ensure transparency and traceability in the herbal supply chain.'
        },
        {
          icon: Lock,
          title: 'How We Use Your Information',
          content: 'Your information is used to provide and improve our services, verify product authenticity, maintain blockchain records, communicate with you about your account, and comply with legal obligations. We never sell your personal information to third parties.'
        },
        {
          icon: Database,
          title: 'Data Storage and Security',
          content: 'We implement industry-standard security measures to protect your data. Information is stored on secure servers with encryption both in transit and at rest. Blockchain data is immutable and distributed across our secure network.'
        },
        {
          icon: Users,
          title: 'Information Sharing',
          content: 'We share information only with your consent, with service providers who assist our operations, when required by law, or to protect our rights. Supply chain participants may access relevant product traceability data as part of our transparency mission.'
        },
        {
          icon: Eye,
          title: 'Your Privacy Rights',
          content: 'You have the right to access, correct, or delete your personal information. You can opt-out of marketing communications, request data portability, and object to certain data processing activities. Contact us to exercise these rights.'
        },
        {
          icon: FileText,
          title: 'Policy Updates',
          content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services constitutes acceptance of these changes.'
        }
      ],
      contact: {
        title: 'Contact Us',
        text: 'If you have questions about this Privacy Policy, please contact us at:',
        email: 'herbal.trace1@gmail.com'
      }
    },
    hi: {
      title: 'गोपनीयता नीति',
      lastUpdated: 'अंतिम अपडेट: 6 दिसंबर, 2025',
      sections: [
        {
          icon: Shield,
          title: 'हम जो जानकारी एकत्र करते हैं',
          content: 'हम वह जानकारी एकत्र करते हैं जो आप सीधे हमें प्रदान करते हैं, जिसमें नाम, ईमेल पता, फोन नंबर और व्यवसाय विवरण शामिल हैं। हम स्वचालित रूप से डिवाइस जानकारी, उपयोग डेटा और ब्लॉकचेन लेनदेन रिकॉर्ड भी एकत्र करते हैं।'
        },
        {
          icon: Lock,
          title: 'हम आपकी जानकारी का उपयोग कैसे करते हैं',
          content: 'आपकी जानकारी का उपयोग हमारी सेवाओं को प्रदान और सुधारने, उत्पाद की प्रामाणिकता सत्यापित करने, ब्लॉकचेन रिकॉर्ड बनाए रखने और कानूनी दायित्वों का पालन करने के लिए किया जाता है।'
        },
        {
          icon: Database,
          title: 'डेटा संग्रहण और सुरक्षा',
          content: 'हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक सुरक्षा उपायों को लागू करते हैं। जानकारी को एन्क्रिप्शन के साथ सुरक्षित सर्वर पर संग्रहीत किया जाता है।'
        },
        {
          icon: Users,
          title: 'जानकारी साझा करना',
          content: 'हम केवल आपकी सहमति से, सेवा प्रदाताओं के साथ, कानून द्वारा आवश्यक होने पर, या हमारे अधिकारों की रक्षा के लिए जानकारी साझा करते हैं।'
        },
        {
          icon: Eye,
          title: 'आपके गोपनीयता अधिकार',
          content: 'आपको अपनी व्यक्तिगत जानकारी तक पहुंचने, सही करने या हटाने का अधिकार है। आप मार्केटिंग संचार से ऑप्ट-आउट कर सकते हैं और डेटा पोर्टेबिलिटी का अनुरोध कर सकते हैं।'
        },
        {
          icon: FileText,
          title: 'नीति अपडेट',
          content: 'हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। हम किसी भी महत्वपूर्ण परिवर्तन की सूचना इस पृष्ठ पर नई नीति पोस्ट करके देंगे।'
        }
      ],
      contact: {
        title: 'हमसे संपर्क करें',
        text: 'यदि आपके इस गोपनीयता नीति के बारे में प्रश्न हैं, तो कृपया हमसे संपर्क करें:',
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
                  <Shield className="h-6 w-6 text-primary-600" />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{data.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{data.lastUpdated}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Close privacy policy"
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

export default PrivacyPolicyModal
