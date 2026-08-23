import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Shield, CheckCircle, AlertCircle, Users, RefreshCw, Mail } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const TermsOfUsePage = () => {
  const { language } = useLanguage()

  const content = {
    en: {
      title: 'Terms of Use',
      intro: 'Welcome to Herbal Trace. By using our website and services, you agree to the following simple and clear terms. Please read them carefully.',
      
      sections: [
        {
          icon: FileText,
          title: '1. Purpose of This Website',
          content: 'This platform helps users trace the journey of Ayurvedic herbs from the point of collection to the final product.',
          subtitle: 'You can use the website to:',
          list: [
            'Verify the authenticity of herbal products',
            'Check blockchain-backed traceability records',
            'Access geo-tagged harvest information',
            'Learn more about herbal sourcing and quality checks'
          ],
          footer: 'Our goal is to provide transparency, trust, and clarity in the herbal supply chain.'
        },
        {
          icon: CheckCircle,
          title: '2. Using Our Services',
          content: 'By using our website, you agree to:',
          list: [
            'Use the platform only for lawful, ethical purposes',
            'Not misuse the traceability data or attempt to alter records',
            'Not try to hack, disrupt, or damage the system',
            'Provide correct information when creating an account (if required)'
          ],
          note: 'You may view, scan, or check product information, but you may not copy or republish our content without permission.'
        },
        {
          icon: Shield,
          title: '3. Accuracy of Information',
          content: 'We work hard to keep all information accurate and up-to-date. However:',
          list: [
            'Some data comes from farmers, collectors, and manufacturers',
            'Blockchain records cannot be changed once created',
            'Minor variations may occur depending on the supply chain'
          ],
          highlight: 'We do not guarantee 100% accuracy but aim for the highest transparency possible.'
        },
        {
          icon: AlertCircle,
          title: '4. Our Responsibility',
          content: 'We provide this platform as a tool for traceability and transparency.',
          subtitle: 'We are not responsible for:',
          list: [
            'Misuse of data by third parties',
            'False information submitted by external stakeholders',
            'Any loss resulting from reliance on displayed information'
          ],
          highlight: 'We do promise to maintain a secure and trustworthy system.'
        },
        {
          icon: Users,
          title: '5. Your Responsibility',
          content: 'When using our website, you must:',
          list: [
            'Respect the platform and other users',
            'Use the data only for personal or professional verification',
            'Not use the platform for illegal or harmful activities'
          ]
        },
        {
          icon: RefreshCw,
          title: '6. Changes to the Platform',
          content: 'We may update:',
          list: [
            'Features',
            'Design',
            'Traceability methods',
            'Terms of Use'
          ],
          note: 'Any changes will be posted on this page.'
        }
      ],
      
      contact: {
        title: '7. Contact Us',
        content: 'If you have questions, concerns, or need support, contact:',
        email: 'herbal.trace1@gmail.com'
      },
      
      acceptance: {
        title: 'Acceptance of Terms',
        content: 'By accessing and using Herbal Trace, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.'
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
            <FileText className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {data.title}
          </h1>
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

              {section.subtitle && (
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {section.subtitle}
                </h3>
              )}

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

              {section.footer && (
                <p className="text-gray-700 text-lg mt-4 leading-relaxed">
                  {section.footer}
                </p>
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
          </motion.section>

          {/* Acceptance Section */}
          <motion.section
            className="card p-8 border-2 border-primary-200 bg-primary-50"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {data.acceptance.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {data.acceptance.content}
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
            Thank you for choosing Herbal Trace for your herbal product traceability needs.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default TermsOfUsePage
