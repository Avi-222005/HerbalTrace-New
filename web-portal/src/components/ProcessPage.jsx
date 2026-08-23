import React from 'react'
import { motion } from 'framer-motion'
import { Sprout, Tractor, Scissors, Factory, Truck, Pill, CheckCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const ProcessPage = () => {
  const { language } = useLanguage()

  const contentMap = {
    en: {
      headerTitle: 'Complete Herb Journey Tracking',
      headerDescription:
        'Follow your herbal products through every stage of their lifecycle. Our comprehensive tracking system ensures complete transparency from seed to final product.',
      stageLabel: 'Stage',
      stages: [
        {
          id: 1,
          icon: Sprout,
          title: 'Seed & Cultivation',
          description:
            'Track from organic seed sourcing, soil preparation, planting date, and growing conditions',
          details: [
            'Certified organic seed verification',
            'Soil quality testing and preparation',
            'Climate monitoring and irrigation',
            'Organic fertilizer application tracking'
          ],
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          id: 2,
          icon: Tractor,
          title: 'Farm Management',
          description:
            'Monitor watering schedules, organic fertilizers, pest control methods, and growth milestones',
          details: [
            'Daily water and nutrient monitoring',
            'Natural pest control documentation',
            'Growth milestone tracking',
            'Weather impact assessment'
          ],
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          id: 3,
          icon: Scissors,
          title: 'Harvesting',
          description:
            'Record optimal harvest time, harvesting methods, quality assessment, and batch numbers',
          details: [
            'Optimal maturity determination',
            'Hand-harvesting techniques',
            'Initial quality assessment',
            'Batch numbering and documentation'
          ],
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        },
        {
          id: 4,
          icon: Factory,
          title: 'Processing',
          description:
            'Track drying, extraction, purification, quality testing, and packaging processes',
          details: [
            'Traditional drying methods',
            'Extraction and purification',
            'Quality control testing',
            'Clean room processing'
          ],
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          id: 5,
          icon: Truck,
          title: 'Distribution',
          description:
            'Monitor storage conditions, transportation, quality checks, and delivery tracking',
          details: [
            'Temperature-controlled storage',
            'Transportation monitoring',
            'Quality preservation checks',
            'Real-time delivery tracking'
          ],
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100'
        },
        {
          id: 6,
          icon: Pill,
          title: 'Final Product',
          description:
            'Verify authenticity, check expiry dates, usage instructions, and health certifications',
          details: [
            'Final quality verification',
            'Packaging and labeling',
            'Expiry date assignment',
            'Health certification approval'
          ],
          color: 'text-pink-600',
          bgColor: 'bg-pink-100'
        }
      ],
      benefitsTitle: 'Why Our Process Matters',
      benefitsDescription:
        'Every step is documented, verified, and secured using blockchain technology to ensure the highest quality and safety standards.',
      benefits: [
        {
          title: '100% Transparency',
          description: 'Complete visibility into every step of the herbal supply chain'
        },
        {
          title: 'Quality Assured',
          description: 'Multiple quality checks and certifications at each stage'
        },
        {
          title: 'Blockchain Secured',
          description: 'Immutable records that cannot be tampered with or falsified'
        }
      ]
    },
    hi: {
      headerTitle: 'जड़ी-बूटी की पूरी यात्रा का ट्रैक',
      headerDescription:
        'अपने हर्बल उत्पादों की जीवनचक्र के हर चरण को देखें। हमारी व्यापक ट्रैकिंग प्रणाली बीज से अंतिम उत्पाद तक पूरी पारदर्शिता सुनिश्चित करती है।',
      stageLabel: 'चरण',
      stages: [
        {
          id: 1,
          icon: Sprout,
          title: 'बीज और खेती',
          description:
            'जैविक बीज स्रोत, मिट्टी की तैयारी, रोपण तिथि और बढ़ने की स्थितियों को ट्रैक करें',
          details: [
            'प्रमाणित जैविक बीज सत्यापन',
            'मिट्टी की गुणवत्ता परीक्षण और तैयारी',
            'जलवायु निगरानी और सिंचाई',
            'जैविक उर्वरक उपयोग का ट्रैकिंग'
          ],
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          id: 2,
          icon: Tractor,
          title: 'फार्म प्रबंधन',
          description:
            'पानी देने के कार्यक्रम, जैविक उर्वरक, कीट नियंत्रण और वृद्धि मील के पत्थर की निगरानी करें',
          details: [
            'दैनिक पानी और पोषक तत्वों की निगरानी',
            'प्राकृतिक कीट नियंत्रण दस्तावेज़ीकरण',
            'वृद्धि मील के पत्थर का ट्रैक',
            'मौसम के प्रभाव का आकलन'
          ],
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          id: 3,
          icon: Scissors,
          title: 'कटाई',
          description:
            'उपयुक्त कटाई समय, विधियाँ, गुणवत्ता आकलन और बैच नंबर दर्ज करें',
          details: [
            'अनुकूल परिपक्वता का निर्धारण',
            'हाथ से कटाई की तकनीकें',
            'प्रारंभिक गुणवत्ता मूल्यांकन',
            'बैच नंबरिंग और दस्तावेज़ीकरण'
          ],
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        },
        {
          id: 4,
          icon: Factory,
          title: 'प्रसंस्करण',
          description:
            'सुखाने, निष्कर्षण, शुद्धिकरण, गुणवत्ता परीक्षण और पैकेजिंग प्रक्रियाओं को ट्रैक करें',
          details: [
            'पारंपरिक सुखाने की विधियाँ',
            'निष्कर्षण और शुद्धिकरण',
            'गुणवत्ता नियंत्रण परीक्षण',
            'क्लीन रूम प्रसंस्करण'
          ],
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          id: 5,
          icon: Truck,
          title: 'वितरण',
          description:
            'भंडारण स्थितियों, परिवहन, गुणवत्ता जांच और डिलीवरी ट्रैकिंग की निगरानी करें',
          details: [
            'तापमान नियंत्रित भंडारण',
            'परिवहन निगरानी',
            'गुणवत्ता संरक्षण जांच',
            'रियल-टाइम डिलीवरी ट्रैकिंग'
          ],
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100'
        },
        {
          id: 6,
          icon: Pill,
          title: 'अंतिम उत्पाद',
          description:
            'प्रामाणिकता सत्यापित करें, समाप्ति तिथि, उपयोग निर्देश और स्वास्थ्य प्रमाणपत्र जांचें',
          details: [
            'अंतिम गुणवत्ता सत्यापन',
            'पैकेजिंग और लेबलिंग',
            'समाप्ति तिथि निर्धारण',
            'स्वास्थ्य प्रमाणन स्वीकृति'
          ],
          color: 'text-pink-600',
          bgColor: 'bg-pink-100'
        }
      ],
      benefitsTitle: 'हमारी प्रक्रिया क्यों महत्वपूर्ण है',
      benefitsDescription:
        'हर चरण को दस्तावेज़ित, सत्यापित और ब्लॉकचेन तकनीक से सुरक्षित किया जाता है ताकि सर्वोच्च गुणवत्ता और सुरक्षा मानक सुनिश्चित हों।',
      benefits: [
        {
          title: '100% पारदर्शिता',
          description: 'हर्बल सप्लाई चेन के हर चरण में पूर्ण दृश्यता'
        },
        {
          title: 'गुणवत्ता सुनिश्चित',
          description: 'प्रत्येक चरण में अनेक गुणवत्ता जांच और प्रमाणन'
        },
        {
          title: 'ब्लॉकचेन सुरक्षा',
          description: 'अपरिवर्तनीय रिकॉर्ड जिन्हें बदला या नकली नहीं किया जा सकता'
        }
      ]
    }
  }

  const content = contentMap[language] || contentMap.en

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
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {content.headerDescription}
          </p>
        </motion.div>

        {/* Process Timeline */}
        <div className="space-y-12">
          {content.stages.map((stage, index) => (
            <ProcessStage 
              key={stage.id} 
              stage={stage} 
              index={index} 
              stageLabel={content.stageLabel}
              isLast={index === content.stages.length - 1}
            />
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="card p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {content.benefitsTitle}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {content.benefitsDescription}
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {content.benefits.map((benefit, index) => (
                <BenefitCard
                  key={benefit.title}
                  title={benefit.title}
                  description={benefit.description}
                  delay={index * 0.2}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Process Stage Component
const ProcessStage = ({ stage, index, isLast, stageLabel }) => {
  const isEven = index % 2 === 0

  return (
    <motion.div
      className={`flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col gap-8 md:gap-12`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      {/* Content */}
      <div className="flex-1 space-y-6">
        <div className="card p-8">
          <div className="flex items-start space-x-4">
            <div className={`w-16 h-16 ${stage.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <stage.icon className={`h-8 w-8 ${stage.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="inline-block bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {stageLabel} {stage.id}
                </span>
                <h3 className="text-2xl font-bold text-gray-900">{stage.title}</h3>
              </div>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {stage.description}
              </p>
              
              <div className="space-y-3">
                {stage.details.map((detail, detailIndex) => (
                  <motion.div
                    key={detailIndex}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: detailIndex * 0.1 + 0.3 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{detail}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Element */}
      <div className="flex-shrink-0 relative">
        <motion.div
          className={`w-32 h-32 ${stage.bgColor} rounded-full flex items-center justify-center relative`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <stage.icon className={`h-16 w-16 ${stage.color}`} />
          
          {/* Connection Line */}
          {!isLast && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-200 mt-2" />
          )}
        </motion.div>
        
        {/* Stage Number */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {stage.id}
        </div>
      </div>
    </motion.div>
  )
}

// Benefit Card Component
const BenefitCard = ({ title, description, delay }) => (
  <motion.div
    className="p-6"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
  >
    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
      <CheckCircle className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
)

export default ProcessPage