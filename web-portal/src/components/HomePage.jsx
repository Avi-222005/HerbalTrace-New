
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShieldCheck, QrCode, ListChecks, Sprout, Tractor, Scissors, Factory, Truck, Pill, CheckCircle, Download, Users, MapPin, Globe, Sparkles, Activity } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import farmerImage from '../assets/1st.png'
import consumerImage from '../assets/2nd.png'
import securityImage from '../assets/3rd.png'
import womenImage from '../assets/women.png'


const HomePage = ({ onOpenSignUp = () => {} }) => {
  const { language } = useLanguage()
  const [isSliderVisible, setIsSliderVisible] = useState(true)
  

  const contentMap = {
    en: {
      
      sections: [
        {
          type: 'hero',
          title: 'From Farm to Consumer',
          titleHighlight: 'Complete Transparency',
          description:
            'Track every step of your herbal product journey with blockchain-verified traceability, GPS authentication, and tamper-proof QR codes',
          attribution: '',
          image: null,
          imageAlt: ''
        },
        {
          type: 'slide',
          eyebrow: 'Farm-to-Ledger',
          title: 'Hello,',
          titleHighlight: 'Welcome to HerbalTrace!!',
          description:
            'Track herbal medicines from collection to final product. Scan a QR to view their verified journey, secured with blockchain for full transparency.',
          attribution: '',
          image: farmerImage,
          imageAlt: 'Farmer collecting medicinal herbs in the field'
        },
        {
          type: 'slide',
          eyebrow: 'Consumer Verification',
          title: 'One scan reveals the complete product journey.',
          description:
            'Customers access origin photos, lab results, and checkpoint data instantly through QR verification.',
          attribution: '',
          image: consumerImage,
          imageAlt: 'Customer scanning a QR code on a herbal product'
        },
        {
          type: 'slide',
          eyebrow: 'Security Protocol',
          title: 'Encrypted signatures protect every product code.',
          description:
            'Dynamic blockchain seals and real-time monitoring prevent tampering and ensure authenticity.',
          attribution: '',
          image: securityImage,
          imageAlt: 'Secure verification and quality control process'
        }
      ],
      whyChoose: {
        heading: 'Why choose Herbal Trace?',
        subheading: 'Tamper-proof assurance for every herbal batch.',
        items: [
          {
            title: 'Copy-proof smart seals',
            description: 'Dynamic encryption and blockchain signatures prevent cloning.',
            icon: ShieldCheck
          },
          {
            title: 'Instant product transparency',
            description: 'Customers see origin, lab scores, and compliance history with one scan.',
            icon: QrCode
          },
          {
            title: 'End-to-end audit trail',
            description: 'Every hand-off logs to the ledger for regulators, labs, and brand teams.',
            icon: ListChecks
          }
        ]
      },
      process: {
        headerTitle: 'Our Solutions',
        headerDescription: 'Follow your herbal products through every stage of their lifecycle. Our comprehensive tracking system ensures complete transparency from seed to final product.',
        stageLabel: 'Stage',
        stages: [
          {
            id: 1,
            icon: Sprout,
            title: 'Seed & Cultivation',
            description: 'Track from organic seed sourcing, soil preparation, planting date, and growing conditions',
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
            description: 'Monitor watering schedules, organic fertilizers, pest control methods, and growth milestones',
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
            description: 'Record optimal harvest time, harvesting methods, quality assessment, and batch numbers',
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
            description: 'Track drying, extraction, purification, quality testing, and packaging processes',
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
            description: 'Monitor storage conditions, transportation, quality checks, and delivery tracking',
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
            description: 'Verify authenticity, check expiry dates, usage instructions, and health certifications',
            details: [
              'Final quality verification',
              'Packaging and labeling',
              'Expiry date assignment',
              'Health certification approval'
            ],
            color: 'text-pink-600',
            bgColor: 'bg-pink-100'
          }
        ]
      },
      downloadApp: 'Download the App',
      joinNetwork: 'Join the Network',
      wisdomQuote: '"Wisdom grows where she works"'
    },
    hi: {
      
      sections: [
        {
          type: 'hero',
          title: 'खेत से उपभोक्ता तक',
          titleHighlight: 'पूर्ण पारदर्शिता',
          description:
            'ब्लॉकचेन-सत्यापित ट्रेसबिलिटी, GPS प्रमाणीकरण और छेड़छाड़-रोधी QR कोड के साथ अपने हर्बल उत्पाद की यात्रा के हर चरण को ट्रैक करें',
          attribution: '',
          image: null,
          imageAlt: ''
        },
        {
          type: 'slide',
          eyebrow: 'खेत से लेजर तक',
          title: 'ब्लॉकचेन-समर्थित पारदर्शिता जिस पर आप भरोसा कर सकते हैं।',
          description:
            'हर जड़ी-बूटी को हर चरण पर ट्रैक, सत्यापित और प्रामाणिकृत किया जाता है—यह सुनिश्चित करते हुए कि आपकी आयुर्वेदिक उत्पादें शुद्ध, सुगम्य और वास्तव में उनके स्टेटेड मूल से हैं।',
          attribution: 'प्रमाणित जड़ी-बूटी संग्राहक',
          image: farmerImage,
          imageAlt: 'जड़ी-बूटियाँ इकट्ठा करती हुई किसान'
        },
        {
          type: 'slide',
          eyebrow: 'उपभोक्ता सत्यापन',
          title: 'एक स्कैन से पूरी उत्पाद यात्रा का पता चलता है।',
          description:
            'ग्राहक क्यूआर सत्यापन के माध्यम से तुरंत मूल तस्वीरें, लैब परिणाम और चेकपॉइंट डेटा एक्सेस करते हैं।',
          attribution: 'वेलनेस स्टोर स्वामी',
          image: consumerImage,
          imageAlt: 'उत्पाद पर क्यूआर कोड स्कैन करता ग्राहक'
        },
        {
          type: 'slide',
          eyebrow: 'सुरक्षा प्रोटोकॉल',
          title: 'एन्क्रिप्टेड हस्ताक्षर हर उत्पाद कोड की सुरक्षा करते हैं।',
          description:
            'डायनेमिक ब्लॉकचेन सील और रियल-टाइम मॉनिटरिंग छेड़छाड़ को रोकते हैं और प्रामाणिकता सुनिश्चित करते हैं।',
          attribution: 'हर्बल ट्रेस सुरक्षा टीम',
          image: securityImage,
          imageAlt: 'सुरक्षित सत्यापन और गुणवत्ता नियंत्रण प्रक्रिया'
        }
      ],
      whyChoose: {
        heading: 'हर्बल ट्रेस क्यों चुनें?',
        subheading: 'हर हर्बल बैच के लिए छेड़छाड़-रोधी भरोसा।',
        items: [
          {
            title: 'कॉपी-प्रूफ स्मार्ट सील',
            description: 'डायनेमिक एन्क्रिप्शन और ब्लॉकचेन सिग्नेचर नकली को रोकते हैं।',
            icon: ShieldCheck
          },
          {
            title: 'तुरंत उत्पाद पारदर्शिता',
            description: 'एक स्कैन से उत्पत्ति, लैब स्कोर और अनुपालन इतिहास दिखता है।',
            icon: QrCode
          },
          {
            title: 'एंड-टू-एंड ऑडिट ट्रेल',
            description: 'हर हस्तांतरण लेजर में दर्ज होता है जिससे नियामक, लैब और ब्रांड टीम को सहूलियत मिलती है।',
            icon: ListChecks
          }
        ]
      },
      process: {
        headerTitle: 'जड़ी-बूटी की पूरी यात्रा का ट्रैक',
        headerDescription: 'अपने हर्बल उत्पादों की जीवनचक्र के हर चरण को देखें। हमारी व्यापक ट्रैकिंग प्रणाली बीज से अंतिम उत्पाद तक पूरी पारदर्शिता सुनिश्चित करती है।',
        stageLabel: 'चरण',
        stages: [
          {
            id: 1,
            icon: Sprout,
            title: 'बीज और खेती',
            description: 'जैविक बीज स्रोत, मिट्टी की तैयारी, रोपण तिथि और बढ़ने की स्थितियों को ट्रैक करें',
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
            description: 'पानी देने के कार्यक्रम, जैविक उर्वरक, कीट नियंत्रण और वृद्धि मील के पत्थर की निगरानी करें',
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
            description: 'उपयुक्त कटाई समय, विधियाँ, गुणवत्ता आकलन और बैच नंबर दर्ज करें',
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
            description: 'सुखाने, निष्कर्षण, शुद्धिकरण, गुणवत्ता परीक्षण और पैकेजिंग प्रक्रियाओं को ट्रैक करें',
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
            description: 'भंडारण स्थितियों, परिवहन, गुणवत्ता जांच और डिलीवरी ट्रैकिंग की निगरानी करें',
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
            description: 'प्रामाणिकता सत्यापित करें, समाप्ति तिथि, उपयोग निर्देश और स्वास्थ्य प्रमाणपत्र जांचें',
            details: [
              'अंतिम गुणवत्ता सत्यापन',
              'पैकेजिंग और लेबलिंग',
              'समाप्ति तिथि निर्धारण',
              'स्वास्थ्य प्रमाणन स्वीकृति'
            ],
            color: 'text-pink-600',
            bgColor: 'bg-pink-100'
          }
        ]
      },
      downloadApp: 'ऐप डाउनलोड करें',
      joinNetwork: 'नेटवर्क से जुड़ें',
      wisdomQuote: '"जहाँ वो काम करती है, वहाँ ज्ञान बढ़ता है"'
    }
  }

  const content = contentMap[language] || contentMap.en
  const [activeIndex, setActiveIndex] = useState(0)
  const sections = content.sections
  const whyChoose = content.whyChoose
  const process = content.process

  useEffect(() => {
    setActiveIndex(0)
  }, [language])

  // Auto-slide effect - infinite loop every 5 seconds
  useEffect(() => {
    const autoSlideInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sections.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(autoSlideInterval)
  }, [sections.length])

  useEffect(() => {
    const handleScroll = () => {
      const whyChooseSection = document.querySelector('[data-section="why-choose"]')
      if (whyChooseSection) {
        const rect = whyChooseSection.getBoundingClientRect()
        const isVisible = rect.top <= window.innerHeight * 0.3
        setIsSliderVisible(!isVisible)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + sections.length) % sections.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % sections.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Green Gradient Background - Now includes 4 slides */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-green-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <button
          type="button"
          onClick={handlePrev}
          className={`hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-custom-strong text-gray-600 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 z-10 transition-opacity duration-300 ${
            isSliderVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Previous story"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-custom-strong text-gray-600 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 z-10 transition-opacity duration-300 ${
            isSliderVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Next story"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col justify-center min-h-[65vh]">
          <AnimatePresence mode="wait" initial={false}>
            {sections[activeIndex].type === 'hero' ? (
              /* Hero Slide - Full Screen Centered with Left Slide Animation */
              <motion.div
                key={`hero-${language}-${activeIndex}`}
                className="text-center max-w-5xl mx-auto py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 whitespace-pre-line"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                  {sections[activeIndex].title}
                </motion.h1>
                <motion.h2 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-amber-200 leading-tight mb-8"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                >
                  {sections[activeIndex].titleHighlight}
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12"
                  initial={{ opacity: 0, x: -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  {sections[activeIndex].description}
                </motion.p>
                
                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
                >
                  <motion.a
                    href="https://store8.gofile.io/download/web/08f5f051-f3e5-42f1-aa3f-60f3f4b56629/app-release.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-amber-200 hover:bg-amber-300 text-gray-800 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-5 w-5" />
                    <span>{content.downloadApp}</span>
                  </motion.a>
                  <motion.button
                    onClick={onOpenSignUp}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users className="h-5 w-5" />
                    <span>{content.joinNetwork}</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              /* Regular Slide with Image */
              <>
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold uppercase tracking-wider">
                    {content.pageBadge}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mt-6 mb-4">
                    {content.pageTitle}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                    {content.pageSubtitle}
                  </p>
                </motion.div>

                <motion.section
                  key={`slide-${language}-${activeIndex}`}
                  className="grid gap-10 md:grid-cols-2 md:gap-14 items-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div>
                    {/* Check if this slide has titleHighlight (Hello, Welcome to HerbalTrace slide) */}
                    {sections[activeIndex].titleHighlight ? (
                      <div className="mt-4">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-amber-200" style={{ lineHeight: '1.1' }}>
                          {sections[activeIndex].title}
                        </h2>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2" style={{ lineHeight: '1.15' }}>
                          {sections[activeIndex].titleHighlight}
                        </h2>
                      </div>
                    ) : (
                      <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white whitespace-pre-line" style={{ lineHeight: '1.15' }}>
                        {sections[activeIndex].title}
                      </h2>
                    )}
                    <p className="mt-6 text-white/90 leading-relaxed text-lg md:text-xl">
                      {sections[activeIndex].description}
                    </p>

                    <div className="mt-6 text-sm font-semibold text-white/70">
                      {sections[activeIndex].attribution}
                    </div>
                  </div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 backdrop-blur-sm p-2">
                      <img
                        src={sections[activeIndex].image}
                        alt={sections[activeIndex].imageAlt}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
                    </div>
                  </motion.div>
                </motion.section>
              </>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center space-x-4 md:hidden">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-custom-light text-gray-600 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Previous story"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-custom-light text-gray-600 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Next story"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center space-x-3">
            {sections.map((section, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-3 w-3 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  activeIndex === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Wave Separator */}
      <div className="relative -mt-1">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
      </div>

      {/* Rest of the page content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {whyChoose && (
          <motion.section
            data-section="why-choose"
            className="mt-24 rounded-3xl bg-white shadow-custom-light border border-gray-100 px-6 py-14 sm:px-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {whyChoose.heading}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {whyChoose.subheading}
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {whyChoose.items.map((item) => {
                const Icon = item.icon || ShieldCheck
                return (
                  <motion.div
                    key={item.title}
                    className="h-full rounded-2xl border border-gray-100 bg-gradient-to-br from-primary-50/40 via-white to-white p-6 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-600 shadow-custom-light">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>
        )}
      </div>

      {/* Women Wisdom Section - Full Width Banner */}
      <motion.section
        className="mt-24 relative overflow-hidden w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
          <img
            src={womenImage}
            alt="Women working in herbal fields"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white text-center px-4"
              style={{ 
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                lineHeight: '1.2'
              }}
            >
              {content.wisdomQuote}
            </motion.h2>
          </div>
        </div>
      </motion.section>

      
      {process && (
        <motion.section
          className="w-full py-16 bg-gray-100"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {process.headerTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {process.headerDescription}
              </p>
            </div>

            <div className="space-y-12">
              {process.stages.map((stage, index) => (
                <ProcessStage 
                  key={stage.id} 
                  stage={stage} 
                  index={index} 
                  stageLabel={process.stageLabel}
                  isLast={index === process.stages.length - 1}
                />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* What Makes Us Different Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.section
          className="mt-24 py-16 bg-gray-50 rounded-3xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-8">
            <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'hi' ? 'हमें क्या अलग बनाता है?' : 'What Makes Us Different?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {language === 'hi' 
                ? 'अद्वितीय तकनीकी समाधान और नवाचार जो हमें बाजार में अग्रणी बनाते हैं।'
                : 'Unique technological solutions and innovations that set us apart in the market.'
              }
            </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Blockchain Technology */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-custom-light border border-gray-100 hover:shadow-custom-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'hi' ? 'ब्लॉकचेन सुरक्षा' : 'Blockchain Security'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'hi' 
                  ? 'अपरिवर्तनीय रिकॉर्ड और स्मार्ट कॉन्ट्रैक्ट जो डेटा की अखंडता सुनिश्चित करते हैं।'
                  : 'Immutable records and smart contracts that ensure data integrity and prevent tampering.'
                }
              </p>
            </motion.div>

            {/* Real-time Tracking */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-custom-light border border-gray-100 hover:shadow-custom-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'hi' ? 'रियल-टाइम ट्रैकिंग' : 'Real-time Tracking'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'hi' 
                  ? 'IoT सेंसर और GPS के साथ तुरंत उत्पाद स्थिति और गुणवत्ता की निगरानी।'
                  : 'Instant product location and quality monitoring with IoT sensors and GPS integration.'
                }
              </p>
            </motion.div>

            {/* AI-Powered Analytics */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-custom-light border border-gray-100 hover:shadow-custom-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <ListChecks className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'hi' ? 'AI-संचालित विश्लेषण' : 'AI-Powered Analytics'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'hi' 
                  ? 'मशीन लर्निंग एल्गोरिदम जो गुणवत्ता पैटर्न की पहचान और भविष्यवाणी करते हैं।'
                  : 'Machine learning algorithms that identify patterns and predict quality outcomes.'
                }
              </p>
            </motion.div>

            {/* Mobile-First Design */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-custom-light border border-gray-100 hover:shadow-custom-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Sprout className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'hi' ? 'मोबाइल-फर्स्ट डिज़ाइन' : 'Mobile-First Design'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'hi' 
                  ? 'किसानों और उपभोक्ताओं के लिए सरल, सुलभ मोबाइल इंटरफेस।'
                  : 'Simple, accessible mobile interface designed for farmers and consumers.'
                }
              </p>
            </motion.div>

            {/* Global Compliance */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-custom-light border border-gray-100 hover:shadow-custom-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'hi' ? 'वैश्विक अनुपालन' : 'Global Compliance'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'hi' 
                  ? 'अंतरराष्ट्रीय खाद्य सुरक्षा और गुणवत्ता मानकों का पूर्ण पालन।'
                  : 'Full compliance with international food safety and quality standards.'
                }
              </p>
            </motion.div>

            {/* 24/7 Support */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-custom-light border border-gray-100 hover:shadow-custom-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Pill className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'hi' ? '24/7 सहायता' : '24/7 Support'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'hi' 
                  ? 'निरंतर तकनीकी सहायता और ग्राहक सेवा सभी हितधारकों के लिए।'
                  : 'Continuous technical support and customer service for all stakeholders.'
                }
              </p>
            </motion.div>
          </div>
          </div>
        </motion.section>
        </div>
      
      {/* Join Network Modal */}
      
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
      transition={{ duration: 0.4, delay: index * 0.05 }}
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
                    transition={{ delay: detailIndex * 0.05 + 0.1, duration: 0.3 }}
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

export default HomePage