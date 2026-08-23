import React from 'react'
import { motion } from 'framer-motion'
import { Award, Users, Shield, Leaf, TrendingUp, CheckCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import farmerImage from '../assets/farmer.png'
import customerImage from '../assets/customer.png'
import labImage from '../assets/lab.png'
import manufacturerImage from '../assets/manufacturer.png'

const OfferingPage = () => {
  const { language } = useLanguage()

  const contentMap = {
    en: {
      branding: {
        
        subtitle: 'Building Trust Through Transparency',
        description: 'Our brand represents the highest standards in herbal product traceability, ensuring authenticity and quality from farm to consumer.',
        features: [
          {
            icon: Shield,
            title: 'Trust & Transparency',
            description: 'Complete visibility into every step of the herbal supply chain'
          },
          {
            icon: Award,
            title: 'Quality Assurance',
            description: 'Rigorous testing and certification at every stage'
          },
          {
            icon: Leaf,
            title: 'Sustainable Practices',
            description: 'Environmentally conscious cultivation and processing methods'
          }
        ]
      },
      farmers: {
        title: 'For Farmers',
        subtitle: 'Empowering Herbal Cultivation',
        description: 'Join our network of certified farmers and benefit from our comprehensive support system.',
        benefits: [
          'Premium pricing for certified organic herbs',
          'Technical support and training programs',
          'Direct market access without intermediaries',
          'Blockchain-verified harvest documentation',
          'Weather and soil monitoring tools',
          'Sustainable farming practice guidance'
        ]
      },
      consumers: {
        title: 'Consumer Benefits',
        subtitle: 'Authentic Herbal Products',
        description: 'Experience the confidence of knowing exactly where your herbal products come from.',
        benefits: [
          'Instant QR code verification of product authenticity',
          'Complete traceability from farm to shelf',
          'Lab-verified quality and purity reports',
          'Direct connection to source farmers',
          'Guaranteed organic and sustainable sourcing',
          'Real-time freshness and expiry tracking'
        ]
      },
      laboratory: {
        title: 'Laboratory Services',
        subtitle: 'Scientific Quality Validation',
        description: 'Our certified laboratories ensure every product meets the highest quality standards.',
        services: [
          'Comprehensive herbal compound analysis',
          'Contamination and purity testing',
          'Potency and efficacy verification',
          'Heavy metal and pesticide screening',
          'Microbiological safety testing',
          'Certificate of analysis documentation'
        ]
      },
      manufacturer: {
        title: 'For Manufacturers',
        subtitle: 'Streamlined Production Process',
        description: 'Integrate seamlessly with our traceability system for enhanced product credibility.',
        advantages: [
          'Automated compliance documentation',
          'Real-time supply chain visibility',
          'Quality control integration',
          'Brand protection through authentication',
          'Reduced regulatory compliance costs',
          'Enhanced consumer trust and loyalty'
        ]
      }
    },
    hi: {
      branding: {
        title: 'हर्बल ट्रेस ब्रांडिंग',
        subtitle: 'पारदर्शिता के माध्यम से विश्वास निर्माण',
        description: 'हमारा ब्रांड हर्बल उत्पाद ट्रैसेबिलिटी में उच्चतम मानकों का प्रतिनिधित्व करता है, खेत से उपभोक्ता तक प्रामाणिकता और गुणवत्ता सुनिश्चित करता है।',
        features: [
          {
            icon: Shield,
            title: 'विश्वास और पारदर्शिता',
            description: 'हर्बल सप्लाई चेन के हर चरण में पूर्ण दृश्यता'
          },
          {
            icon: Award,
            title: 'गुणवत्ता आश्वासन',
            description: 'हर चरण में कठोर परीक्षण और प्रमाणन'
          },
          {
            icon: Leaf,
            title: 'टिकाऊ प्रथाएं',
            description: 'पर्यावरण सचेत खेती और प्रसंस्करण विधियां'
          }
        ]
      },
      farmers: {
        title: 'किसानों के लिए',
        subtitle: 'हर्बल खेती को सशक्त बनाना',
        description: 'हमारे प्रमाणित किसानों के नेटवर्क में शामिल हों और हमारी व्यापक सहायता प्रणाली का लाभ उठाएं।',
        benefits: [
          'प्रमाणित जैविक जड़ी-बूटियों के लिए प्रीमियम मूल्य',
          'तकनीकी सहायता और प्रशिक्षण कार्यक्रम',
          'बिचौलियों के बिना प्रत्यक्ष बाजार पहुंच',
          'ब्लॉकचेन-सत्यापित फसल दस्तावेज़ीकरण',
          'मौसम और मिट्टी निगरानी उपकरण',
          'टिकाऊ खेती अभ्यास मार्गदर्शन'
        ]
      },
      consumers: {
        title: 'उपभोक्ता लाभ',
        subtitle: 'प्रामाणिक हर्बल उत्पाद',
        description: 'यह जानने का विश्वास अनुभव करें कि आपके हर्बल उत्पाद वास्तव में कहां से आते हैं।',
        benefits: [
          'उत्पाद प्रामाणिकता का तुरंत QR कोड सत्यापन',
          'खेत से शेल्फ तक पूर्ण ट्रैसेबिलिटी',
          'लैब-सत्यापित गुणवत्ता और शुद्धता रिपोर्ट',
          'स्रोत किसानों से प्रत्यक्ष संपर्क',
          'गारंटीशुदा जैविक और टिकाऊ सोर्सिंग',
          'रियल-टाइम ताजगी और समाप्ति ट्रैकिंग'
        ]
      },
      laboratory: {
        title: 'प्रयोगशाला सेवाएं',
        subtitle: 'वैज्ञानिक गुणवत्ता सत्यापन',
        description: 'हमारी प्रमाणित प्रयोगशालाएं सुनिश्चित करती हैं कि हर उत्पाद उच्चतम गुणवत्ता मानकों को पूरा करे।',
        services: [
          'व्यापक हर्बल यौगिक विश्लेषण',
          'संदूषण और शुद्धता परीक्षण',
          'शक्ति और प्रभावकारिता सत्यापन',
          'भारी धातु और कीटनाशक स्क्रीनिंग',
          'माइक्रोबायोलॉजिकल सुरक्षा परीक्षण',
          'विश्लेषण प्रमाणपत्र दस्तावेज़ीकरण'
        ]
      },
      manufacturer: {
        title: 'निर्माताओं के लिए',
        subtitle: 'सुव्यवस्थित उत्पादन प्रक्रिया',
        description: 'बेहतर उत्पाद विश्वसनीयता के लिए हमारी ट्रैसेबिलिटी सिस्टम के साथ निर्बाध रूप से एकीकृत करें।',
        advantages: [
          'स्वचालित अनुपालन दस्तावेज़ीकरण',
          'रियल-टाइम सप्लाई चेन दृश्यता',
          'गुणवत्ता नियंत्रण एकीकरण',
          'प्रमाणीकरण के माध्यम से ब्रांड सुरक्षा',
          'कम नियामक अनुपालन लागत',
          'बेहतर उपभोक्ता विश्वास और वफादारी'
        ]
      }
    }
  }

  const content = contentMap[language] || contentMap.en

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Branding Section */}
        <BrandingSection content={content.branding} />
        
        {/* Farmers Section */}
        <FarmersSection content={content.farmers} />
        
        {/* Consumer Benefits Section */}
        <ConsumerSection content={content.consumers} />
        
        {/* Laboratory Section */}
        <LaboratorySection content={content.laboratory} />
        
        {/* Manufacturer Section */}
        <ManufacturerSection content={content.manufacturer} />
      </div>
    </div>
  )
}

// Branding Section Component
const BrandingSection = ({ content }) => (
  <motion.section
    className="mb-20"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        {content.title}
      </h1>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-gray-900">
        {content.subtitle}
      </h1>
      <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
        {content.description}
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {content.features.map((feature, index) => (
        <motion.div
          key={feature.title}
          className="card p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <feature.icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
          <p className="text-gray-600 leading-relaxed">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  </motion.section>
)

// Farmers Section Component
const FarmersSection = ({ content }) => (
  <motion.section
    className="mb-20"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {content.title}
        </h2>
        <h3 className="text-xl text-primary-600 font-semibold mb-6">
          {content.subtitle}
        </h3>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {content.description}
        </p>
        <div className="space-y-4">
          {content.benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              className="flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="w-full h-96 rounded-3xl overflow-hidden shadow-custom-medium">
          <img
            src={farmerImage}
            alt="Farmer in herbal field"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  </motion.section>
)

// Consumer Section Component
const ConsumerSection = ({ content }) => (
  <motion.section
    className="mb-20"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="relative lg:order-1">
        <div className="w-full h-96 rounded-3xl overflow-hidden shadow-custom-medium">
          <img
            src={customerImage}
            alt="Customer verifying product"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="lg:order-2">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {content.title}
        </h2>
        <h3 className="text-xl text-primary-600 font-semibold mb-6">
          {content.subtitle}
        </h3>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {content.description}
        </p>
        <div className="space-y-4">
          {content.benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              className="flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
)

// Laboratory Section Component
const LaboratorySection = ({ content }) => (
  <motion.section
    className="mb-20"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {content.title}
        </h2>
        <h3 className="text-xl text-primary-600 font-semibold mb-6">
          {content.subtitle}
        </h3>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {content.description}
        </p>
        <div className="space-y-4">
          {content.services.map((service, index) => (
            <motion.div
              key={service}
              className="flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{service}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="w-full h-96 rounded-3xl overflow-hidden shadow-custom-medium">
          <img
            src={labImage}
            alt="Laboratory testing herbal products"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  </motion.section>
)

// Manufacturer Section Component
const ManufacturerSection = ({ content }) => (
  <motion.section
    className="mb-20"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="relative lg:order-1">
        <div className="w-full h-96 rounded-3xl overflow-hidden shadow-custom-medium">
          <img
            src={manufacturerImage}
            alt="Manufacturing facility"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="lg:order-2">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {content.title}
        </h2>
        <h3 className="text-xl text-primary-600 font-semibold mb-6">
          {content.subtitle}
        </h3>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {content.description}
        </p>
        <div className="space-y-4">
          {content.advantages.map((advantage, index) => (
            <motion.div
              key={advantage}
              className="flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{advantage}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
)

export default OfferingPage