import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Database, Users, Eye, FileText, Mail, Calendar } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const PrivacyPolicyPage = () => {
  const { language } = useLanguage()

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: December 6, 2025',
      intro: 'Welcome to Herbal Trace ("we", "our", "us"). We are committed to protecting your privacy and ensuring transparency in how your information is collected and used. This Privacy Policy explains what data we collect, how we use it, and the rights you have regarding your information.',
      
      sections: [
        {
          icon: Users,
          title: '1. Information We Collect',
          subsections: [
            {
              subtitle: 'a) Personal Information',
              content: 'We may collect certain personal details when you interact with our platform, such as:',
              list: [
                'Name',
                'Email address',
                'Phone number',
                'Organization or business details',
                'Login credentials (encrypted)'
              ]
            },
            {
              subtitle: 'b) Usage Data',
              content: 'We automatically collect information about how you access and use the platform, including:',
              list: [
                'IP address',
                'Browser type and version',
                'Device information',
                'Pages visited, time spent, and interactions'
              ]
            },
            {
              subtitle: 'c) Traceability Data',
              content: 'For our blockchain-based herbal tracking system, we collect:',
              list: [
                'Geo-tagged harvest locations',
                'Batch IDs and timestamps',
                'Sensor and environmental metadata',
                'Processing, testing, and supply chain events'
              ],
              note: 'Note: Once written to blockchain, certain data becomes immutable.'
            }
          ]
        },
        {
          icon: Database,
          title: '2. How We Use Your Information',
          content: 'We use collected data to:',
          list: [
            'Provide and operate our herbal traceability services',
            'Verify product authenticity',
            'Improve platform performance and user experience',
            'Maintain security and prevent fraud',
            'Communicate updates, alerts, or support information',
            'Generate anonymized analytics for internal research'
          ],
          highlight: 'We never sell your personal information.'
        },
        {
          icon: Lock,
          title: '3. How We Store and Protect Data',
          list: [
            'Sensitive information is encrypted in transit and at rest.',
            'Immutable supply chain events are stored on blockchain networks.',
            'Access to personal data is strictly limited to authorized personnel.',
            'Regular audits and security checks are performed.'
          ]
        },
        {
          icon: Shield,
          title: '4. Sharing of Information',
          content: 'We may share data only under these circumstances:',
          list: [
            'With trusted third-party service providers (hosting, analytics, APIs)',
            'When required by law or regulatory authorities',
            'With manufacturers or supply chain partners, only for traceability',
            'With your consent'
          ],
          highlight: 'We do not share your personal information for marketing purposes.'
        },
        {
          icon: Eye,
          title: '5. Cookies & Tracking Technologies',
          content: 'We use cookies and similar technologies to:',
          list: [
            'Improve website functionality',
            'Save user preferences',
            'Analyze usage patterns'
          ],
          note: 'You can disable cookies in your browser, but some features may not work properly.'
        },
        {
          icon: FileText,
          title: '6. Your Rights',
          content: 'Depending on your region, you may have the right to:',
          list: [
            'Access your stored data',
            'Request correction or deletion',
            'Limit or object to processing',
            'Export your data',
            'Withdraw consent at any time'
          ]
        }
      ],
      
      contact: {
        title: 'Contact Us',
        content: 'To request data access, correction, or deletion, or if you have questions about this Privacy Policy, contact us at:',
        email: 'herbal.trace1@gmail.com',
        note: 'We will respond to your request within 30 days.'
      },
      
      changes: {
        title: 'Changes to This Policy',
        content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.'
      }
    }
  }

  const data = content[language] || content.en

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {data.title}
          </h1>
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="h-5 w-5 mr-2" />
            <p className="text-lg">{data.lastUpdated}</p>
          </div>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {data.intro}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-12">
          {data.sections.map((section, index) => (
            <motion.section
              key={section.title}
              className="card p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {section.title}
                </h2>
              </div>

              {section.content && (
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  {section.content}
                </p>
              )}

              {section.subsections ? (
                <div className="space-y-6">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="pl-4 border-l-4 border-primary-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {subsection.subtitle}
                      </h3>
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {subsection.content}
                      </p>
                      <ul className="space-y-2">
                        {subsection.list.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-primary-600 mr-2">•</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                      {subsection.note && (
                        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                          <p className="text-sm text-yellow-800 font-medium">
                            {subsection.note}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {section.list && (
                    <ul className="space-y-3 mb-4">
                      {section.list.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="text-primary-600 mr-3 text-xl">•</span>
                          <span className="text-gray-700 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {section.note && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-sm text-blue-800">
                        {section.note}
                      </p>
                    </div>
                  )}
                  
                  {section.highlight && (
                    <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                      <p className="text-lg text-green-900 font-semibold">
                        {section.highlight}
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.section>
          ))}

          {/* Contact Section */}
          <motion.section
            className="card p-8 bg-gradient-to-br from-primary-50 to-green-50"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {data.contact.title}
              </h2>
            </div>
            
            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
              {data.contact.content}
            </p>
            
            <a 
              href={`mailto:${data.contact.email}`}
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold text-lg"
            >
              <Mail className="h-5 w-5" />
              <span>{data.contact.email}</span>
            </a>
            
            <div className="mt-4 p-4 bg-white/60 rounded-lg">
              <p className="text-sm text-gray-700">
                {data.contact.note}
              </p>
            </div>
          </motion.section>

          {/* Changes Section */}
          <motion.section
            className="card p-8 border-2 border-primary-200"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {data.changes.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {data.changes.content}
            </p>
          </motion.section>
        </div>

        {/* Footer Note */}
        <motion.div
          className="text-center mt-12 pt-8 border-t border-gray-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600">
            By using Herbal Trace, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
