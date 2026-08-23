import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { contactService } from '../services/api'
import { validateInput } from '../utils/security'
import { useLanguage } from '../context/LanguageContext'

const ContactPage = () => {
  const { language } = useLanguage()

  const contentMap = {
    en: {
      headerTitle: 'Get in Touch',
      headerDescription:
        'Ready to implement herbal traceability for your business? Contact our team of experts to learn more about our solutions.',
      contactInfoTitle: 'Contact Information',
      contactInfoIntro:
        "We'd love to hear from you. Whether you're a farmer looking to join our network, a business interested in our technology, or a consumer with questions, we're here to help.",
      contactMethods: [
        { icon: Mail, title: 'Email Us', detail: 'herbal.trace1@gmail.com', description: 'Send us an email anytime' },
        { icon: Phone, title: 'Call Us', detail: '+91 6203 585 026', description: 'Monday to Friday, 9 AM to 6 PM IST' },
        { icon: MapPin, title: 'Visit Us', detail: 'Knowledge Park 2, Greater Noida, Uttar Pradesh', description: 'Our headquarters' }
      ],
      officeHoursTitle: 'Office Hours',
      officeHours: [
        { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
        { day: 'Saturday', time: '10:00 AM - 4:00 PM' },
        { day: 'Sunday', time: 'Closed' }
      ],
      formTitle: 'Send us a Message',
      formFields: {
        nameLabel: 'Your Name',
        namePlaceholder: 'Arjun Patel',
        emailLabel: 'Email Address',
        emailPlaceholder: 'arjun@example.com',
        companyLabel: 'Company Name',
        companyPlaceholder: 'Your Company (optional)',
        messageLabel: 'Message',
        messagePlaceholder: 'Tell us about your needs and how we can help...'
      },
      submitButton: 'Send Message',
      submitLoading: 'Sending...',
      submitErrorTitle: 'Submission Error',
      validation: {
        name: 'Please enter a valid name (2-50 characters, letters only)',
        email: 'Please enter a valid email address',
        message: 'Please enter a valid message (10-1000 characters)'
      },
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Common questions about our herbal traceability solutions',
      faqItems: [
        {
          question: 'How does the tracking system work?',
          answer: 'Our system uses blockchain technology to create an immutable record of every step in the herbal supply chain, from cultivation to final product.'
        },
        {
          question: 'Is the data secure and private?',
          answer: 'Yes, we use advanced encryption and blockchain security to ensure all data is protected while maintaining transparency for consumers.'
        },
        {
          question: 'How can farmers join the network?',
          answer: 'Farmers can apply through our partner program. We provide training and support to help implement our tracking systems.'
        },
        {
          question: 'What types of herbs do you track?',
          answer: 'We track all types of medicinal and culinary herbs, from common varieties like turmeric and ginseng to rare traditional herbs.'
        }
      ],
      success: {
        title: 'Message Sent!',
        body: "Thank you for contacting us. We've received your message and will get back to you within 24 hours.",
        button: 'Send Another Message'
      }
    },
    hi: {
      headerTitle: 'हमसे संपर्क करें',
      headerDescription:
        'क्या आप अपने व्यवसाय के लिए हर्बल ट्रैसेबिलिटी लागू करने के लिए तैयार हैं? हमारे समाधानों के बारे में अधिक जानने के लिए हमारी विशेषज्ञ टीम से संपर्क करें।',
      contactInfoTitle: 'संपर्क जानकारी',
      contactInfoIntro:
        'हम आपसे सुनना पसंद करेंगे। चाहे आप हमारे नेटवर्क से जुड़ना चाहने वाले किसान हों, हमारी तकनीक में रुचि रखने वाले व्यवसाय हों या सवालों वाले उपभोक्ता, हम मदद के लिए यहाँ हैं।',
      contactMethods: [
        { icon: Mail, title: 'हमें ईमेल करें', detail: 'herbal.trace1@gmail.com', description: 'किसी भी समय हमें ईमेल भेजें' },
        { icon: Phone, title: 'हमें कॉल करें', detail: '+91 6203 585 026', description: 'सोमवार से शुक्रवार, सुबह 9 बजे से शाम 6 बजे (IST)' },
        { icon: MapPin, title: 'हमसे मिलें', detail: 'नॉलेज पार्क 2, ग्रेटर नोएडा, उत्तर प्रदेश', description: 'हमारा मुख्यालय' }
      ],
      officeHoursTitle: 'कार्यालय समय',
      officeHours: [
        { day: 'सोमवार - शुक्रवार', time: '09:00 पूर्वाह्न - 06:00 अपराह्न' },
        { day: 'शनिवार', time: '10:00 पूर्वाह्न - 04:00 अपराह्न' },
        { day: 'रविवार', time: 'बंद' }
      ],
      formTitle: 'हमें संदेश भेजें',
      formFields: {
        nameLabel: 'आपका नाम',
        namePlaceholder: 'राहुल शर्मा',
        emailLabel: 'ईमेल पता',
        emailPlaceholder: 'rahul@example.com',
        companyLabel: 'कंपनी का नाम',
        companyPlaceholder: 'आपकी कंपनी (वैकल्पिक)',
        messageLabel: 'संदेश',
        messagePlaceholder: 'अपनी आवश्यकताओं के बारे में बताएं और हम कैसे सहायता कर सकते हैं...'
      },
      submitButton: 'संदेश भेजें',
      submitLoading: 'भेजा जा रहा है...',
      submitErrorTitle: 'सबमिशन त्रुटि',
      validation: {
        name: 'कृपया मान्य नाम दर्ज करें (2-50 अक्षर, केवल अक्षर)',
        email: 'कृपया मान्य ईमेल पता दर्ज करें',
        message: 'कृपया मान्य संदेश दर्ज करें (10-1000 अक्षर)'
      },
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
      faqSubtitle: 'हमारे हर्बल ट्रैसेबिलिटी समाधानों से जुड़े सामान्य प्रश्न',
      faqItems: [
        {
          question: 'ट्रैकिंग सिस्टम कैसे काम करता है?',
          answer: 'हमारी प्रणाली ब्लॉकचेन तकनीक का उपयोग करती है ताकि हर्बल सप्लाई चेन के हर चरण का अपरिवर्तनीय रिकॉर्ड बनाया जा सके, खेती से लेकर अंतिम उत्पाद तक।'
        },
        {
          question: 'क्या डेटा सुरक्षित और निजी है?',
          answer: 'हाँ, हम उन्नत एन्क्रिप्शन और ब्लॉकचेन सुरक्षा का उपयोग करते हैं ताकि सभी डेटा सुरक्षित रहे और पारदर्शिता बनी रहे।'
        },
        {
          question: 'किसान नेटवर्क में कैसे शामिल हो सकते हैं?',
          answer: 'किसान हमारे पार्टनर प्रोग्राम के माध्यम से आवेदन कर सकते हैं। हम ट्रैकिंग प्रणालियों को लागू करने में प्रशिक्षण और सहायता प्रदान करते हैं।'
        },
        {
          question: 'आप किन जड़ी-बूटियों को ट्रैक करते हैं?',
          answer: 'हम सभी प्रकार की औषधीय और मसालेदार जड़ी-बूटियों को ट्रैक करते हैं, सामान्य किस्मों से लेकर दुर्लभ पारंपरिक जड़ी-बूटियों तक।'
        }
      ],
      success: {
        title: 'संदेश भेजा गया!',
        body: 'हमसे संपर्क करने के लिए धन्यवाद। हमें आपका संदेश मिल गया है और हम 24 घंटों के भीतर उत्तर देंगे।',
        button: 'एक और संदेश भेजें'
      }
    }
  }

  const content = contentMap[language] || contentMap.en

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateInput.name(formData.name)) {
      newErrors.name = content.validation.name
    }

    if (!validateInput.email(formData.email)) {
      newErrors.email = content.validation.email
    }

    if (!validateInput.message(formData.message)) {
      newErrors.message = content.validation.message
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      await contactService.submitContactForm(formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', company: '', message: '' })
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return <ContactSuccess content={content.success} onReset={() => setSubmitted(false)} />
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.headerTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.headerDescription}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">{content.contactInfoTitle}</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {content.contactInfoIntro}
              </p>

              <div className="space-y-6">
                {content.contactMethods.map((method) => (
                  <ContactMethod
                    key={method.title}
                    icon={method.icon}
                    title={method.title}
                    detail={method.detail}
                    description={method.description}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 1000 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80, damping: 20 }}
          >
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">{content.formTitle}</h2>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <FormField
                  label={content.formFields.nameLabel}
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                  placeholder={content.formFields.namePlaceholder}
                />

                <FormField
                  label={content.formFields.emailLabel}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                  placeholder={content.formFields.emailPlaceholder}
                />

                <FormField
                  label={content.formFields.companyLabel}
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  error={errors.company}
                  placeholder={content.formFields.companyPlaceholder}
                />

                <FormField
                  label={content.formFields.messageLabel}
                  name="message"
                  type="textarea"
                  value={formData.message}
                  onChange={handleInputChange}
                  error={errors.message}
                  required
                  placeholder={content.formFields.messagePlaceholder}
                  rows={5}
                />

                {errors.submit && (
                  <motion.div
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">{content.submitErrorTitle}</h4>
                      <p className="text-red-700 text-sm">{errors.submit}</p>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span>{loading ? content.submitLoading : content.submitButton}</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.faqTitle}</h2>
            <p className="text-xl text-gray-600">{content.faqSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {content.faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Helper Components
const ContactMethod = ({ icon: Icon, title, detail, description }) => (
  <motion.div
    className="flex items-start space-x-4"
    whileHover={{ x: 5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-900 mb-1">{detail}</p>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </motion.div>
)

const FormField = ({ label, name, type, value, onChange, error, required, placeholder, rows }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`input-field resize-none ${error ? 'border-red-300 focus:border-red-500' : ''}`}
      />
    ) : (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${error ? 'border-red-300 focus:border-red-500' : ''}`}
      />
    )}
    {error && (
      <motion.p
        className="mt-1 text-sm text-red-600 flex items-center space-x-1"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
      >
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </motion.p>
    )}
  </div>
)

const FAQItem = ({ question, answer }) => (
  <motion.div
    className="card p-6"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-3">{question}</h3>
    <p className="text-gray-600 leading-relaxed">{answer}</p>
  </motion.div>
)

const ContactSuccess = ({ content, onReset }) => (
  <div className="min-h-screen pt-20 bg-gray-50 flex items-center">
    <div className="max-w-md mx-auto px-4">
      <motion.div
        className="card p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="h-8 w-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">{content.body}</p>
        
        <button
          onClick={onReset}
          className="btn-primary"
        >
          {content.button}
        </button>
      </motion.div>
    </div>
  </div>
)

export default ContactPage