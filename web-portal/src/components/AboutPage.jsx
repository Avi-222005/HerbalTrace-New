import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Award, Target, Leaf, TrendingUp, Shield, Globe, Heart, Code, Smartphone, PenTool, Lightbulb, Monitor, Palette, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

// Import team member photos
import kunalPhoto from '../assets/kunal.jpeg'
import manasPhoto from '../assets/manas.jpeg'
import avinashPhoto from '../assets/avinash.jpeg'
import shreyaPhoto from '../assets/shreya.jpeg'
import mukulPhoto from '../assets/mukul.jpeg'
import tanviPhoto from '../assets/tanvi.jpeg'

// Import other images
import farmerImage from '../assets/farmer.png'
import labImage from '../assets/lab.png'
import logoImage from '../assets/logo.png'

const AboutPage = () => {
  const { language } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Team members data for testimonial slider
  const teamMembers = [
    {
      name: 'Kunal Kumar Dubey',
      role: 'Team Leader',
      title: 'Blockchain Architect & Application Development',
      photo: kunalPhoto,
      testimonial: 'Leading the vision of complete supply chain transparency through innovative blockchain architecture. My passion lies in bridging traditional herbal knowledge with cutting-edge technology to create solutions that benefit farmers and consumers alike.',
      color: 'blue',
      icon: Code
    },
    {
      name: 'Manas Sharma',
      role: 'Frontend Developer',
      title: 'User Interface Development',
      photo: manasPhoto,
      testimonial: 'Creating intuitive interfaces that make complex blockchain technology accessible to everyone. I believe that great design should make powerful technology feel effortless and natural for all users.',
      color: 'green',
      icon: Monitor
    },
    {
      name: 'Avinash Verma',
      role: 'Mobile Developer',
      title: 'Mobile Application Development',
      photo: avinashPhoto,
      testimonial: 'Developing mobile solutions that bring herbal traceability directly to farmers\' hands. My goal is to bridge the digital divide and empower rural communities with technology that works everywhere.',
      color: 'purple',
      icon: Smartphone
    },
    {
      name: 'Shreya Srivastav',
      role: 'UI/UX Designer',
      title: 'Design & Visual Experience',
      photo: shreyaPhoto,
      testimonial: 'Crafting beautiful and intuitive designs that make herbal traceability accessible to everyone. I focus on creating visual experiences that blend modern aesthetics with traditional herbal wisdom.',
      color: 'orange',
      icon: Palette
    },
    {
      name: 'Tanvi Gupta',
      role: 'App Developer',
      title: 'Mobile Application Development (Flutter)',
      photo: tanviPhoto,
      testimonial: 'Building cross-platform mobile applications using Flutter to bring herbal traceability to users everywhere. My focus is on creating seamless, performant apps that work beautifully on any device.',
      color: 'pink',
      icon: Smartphone
    },
    {
      name: 'Mukul Prasad',
      role: 'Frontend Developer',
      title: 'Frontend Development & Optimization',
      photo: mukulPhoto,
      testimonial: 'Implementing innovative features and optimizing user interactions to ensure seamless experiences across all devices. I\'m passionate about creating responsive and engaging interfaces.',
      color: 'teal',
      icon: Lightbulb
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teamMembers.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + teamMembers.length) % teamMembers.length)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-50' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-50' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-50' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-50' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', badge: 'bg-pink-50' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', badge: 'bg-teal-50' }
    }
    return colors[color] || colors.blue
  }

  const contentMap = {
    en: {
      headerTitle: 'About us',
      headerDescription:
        'Revolutionizing the herbal industry through blockchain-powered traceability, ensuring complete transparency from seed to final product.',
      missionTitle: 'Our Mission',
      missionParagraphs: [
        'Herbal Trace was founded with a simple yet powerful mission: to bring complete transparency and trust to the herbal supply chain. We believe that consumers have the right to know exactly where their herbal products come from and how they are produced.',
        'Through cutting-edge blockchain technology and comprehensive tracking systems, we ensure that every step of the herbal product journey is documented, verified, and accessible to consumers.'
      ],
      
      
      cardTitle: 'From Farm to Consumer',
      cardDescription: 'Every product tells a story of quality, care, and traditional wisdom.',
      statsHeading: 'Our Impact by the Numbers',
      stats: [
        { number: '10,000+', label: 'Products Tracked', icon: TrendingUp },
        { number: '500+', label: 'Verified Farms', icon: Users },
        { number: '50+', label: 'Herb Varieties', icon: Leaf },
        { number: '99.9%', label: 'Accuracy Rate', icon: Target }
      ],
      valuesHeading: 'Our Values',
      valuesSubtitle: 'The principles that guide everything we do',
      values: [
        {
          icon: Shield,
          title: 'Trust & Transparency',
          description: 'Building trust through complete supply chain transparency and verifiable data.'
        },
        {
          icon: Leaf,
          title: 'Sustainability',
          description: 'Promoting sustainable farming practices and environmental responsibility.'
        },
        {
          icon: Heart,
          title: 'Health & Wellness',
          description: 'Ensuring the highest quality herbal products for better health outcomes.'
        },
        {
          icon: Globe,
          title: 'Global Impact',
          description: 'Creating positive impact on communities and ecosystems worldwide.'
        }
      ],
      teamHeading: 'Meet Our Team',
      teamParagraphs: [
        'Our diverse team combines expertise in blockchain technology, agricultural science, and traditional herbal medicine. Together, we work to ensure that ancient herbal wisdom meets modern technological innovation.',
        'From farmers and herbalists to software engineers and data scientists, every member of our team is passionate about creating a more transparent and trustworthy herbal industry.'
      ],
      teamStats: [
        { value: '25+', label: 'Team Members' },
        { value: '15+', label: 'Countries' }
      ],
      teamCardTitle: 'Global Collaboration',
      teamCardDescription: 'Working together to revolutionize herbal traceability worldwide.',
      visionHeading: 'Our Vision for the Future',
      visionDescription:
        'We envision a world where every herbal product comes with a complete, verifiable history. Where consumers can make informed choices based on transparent information, and where sustainable farming practices are rewarded and recognized.',
      visionItems: [
        { title: 'Global Network', description: 'Connecting farms and consumers worldwide', icon: Globe },
        { title: 'Enhanced Security', description: 'Advanced blockchain protection for all data', icon: Shield },
        { title: 'Better Health', description: 'Improving global health through quality herbs', icon: Heart }
      ]
    },
    hi: {
      headerTitle: 'हर्बल ट्रेस के बारे में',
      headerDescription:
        'ब्लॉकचेन आधारित ट्रैसेबिलिटी के माध्यम से हर्बल उद्योग में क्रांति, बीज से अंतिम उत्पाद तक पूरी पारदर्शिता सुनिश्चित करना।',
      missionTitle: 'हमारा मिशन',
      missionParagraphs: [
        'हर्बल ट्रेस की स्थापना एक सरल लेकिन शक्तिशाली मिशन के साथ हुई: हर्बल आपूर्ति श्रृंखला में पूर्ण पारदर्शिता और विश्वास लाना। हम मानते हैं कि उपभोक्ताओं को यह जानने का अधिकार है कि उनके हर्बल उत्पाद कहाँ से आते हैं और कैसे तैयार होते हैं।',
        'उन्नत ब्लॉकचेन तकनीक और व्यापक ट्रैकिंग प्रणालियों के माध्यम से हम सुनिश्चित करते हैं कि हर्बल उत्पाद की यात्रा का हर चरण दस्तावेज़ित, सत्यापित और उपभोक्ताओं के लिए उपलब्ध हो।'
      ],
      awardTitle: 'पुरस्कार विजेता तकनीक',
      awardDescription: 'सप्लाई चेन पारदर्शिता में नवाचार के लिए मान्यता प्राप्त',
      cardTitle: 'खेत से उपभोक्ता तक',
      cardDescription: 'हर उत्पाद गुणवत्ता, देखभाल और पारंपरिक ज्ञान की कहानी कहता है।',
      statsHeading: 'आँकड़ों में हमारा प्रभाव',
      stats: [
        { number: '10,000+', label: 'ट्रैक किए गए उत्पाद', icon: TrendingUp },
        { number: '500+', label: 'सत्यापित फार्म', icon: Users },
        { number: '50+', label: 'जड़ी-बूटी की किस्में', icon: Leaf },
        { number: '99.9%', label: 'सटीकता दर', icon: Target }
      ],
      valuesHeading: 'हमारे मूल्य',
      valuesSubtitle: 'वो सिद्धांत जो हमारे हर कदम को दिशा देते हैं',
      values: [
        {
          icon: Shield,
          title: 'विश्वास और पारदर्शिता',
          description: 'पूरी सप्लाई चेन की पारदर्शिता और सत्यापन योग्य डेटा के माध्यम से विश्वास का निर्माण।'
        },
        {
          icon: Leaf,
          title: 'स्थिरता',
          description: 'सतत खेती प्रथाओं और पर्यावरणीय जिम्मेदारी को बढ़ावा देना।'
        },
        {
          icon: Heart,
          title: 'स्वास्थ्य और कल्याण',
          description: 'बेहतर स्वास्थ्य परिणामों के लिए सर्वोत्तम गुणवत्ता वाले हर्बल उत्पाद सुनिश्चित करना।'
        },
        {
          icon: Globe,
          title: 'वैश्विक प्रभाव',
          description: 'दुनिया भर में समुदायों और पारिस्थितिक तंत्रों पर सकारात्मक प्रभाव बनाना।'
        }
      ],
      teamHeading: 'हमारी टीम से मिलें',
      teamParagraphs: [
        'हमारी विविध टीम ब्लॉकचेन तकनीक, कृषि विज्ञान और पारंपरिक हर्बल चिकित्सा में विशेषज्ञता को जोड़ती है। मिलकर हम यह सुनिश्चित करते हैं कि प्राचीन हर्बल ज्ञान आधुनिक तकनीकी नवाचार से मिले।',
        'किसानों और हर्बल विशेषज्ञों से लेकर सॉफ्टवेयर इंजीनियरों और डेटा वैज्ञानिकों तक, हमारी टीम का हर सदस्य अधिक पारदर्शी और विश्वसनीय हर्बल उद्योग बनाने के लिए समर्पित है।'
      ],
      teamStats: [
        { value: '25+', label: 'टीम सदस्य' },
        { value: '15+', label: 'देश' }
      ],
      teamCardTitle: 'वैश्विक सहयोग',
      teamCardDescription: 'विश्व स्तर पर हर्बल ट्रैसेबिलिटी में बदलाव लाने के लिए साथ काम कर रहे हैं।',
      visionHeading: 'भविष्य के लिए हमारा दृष्टिकोण',
      visionDescription:
        'हम ऐसा विश्व देखते हैं जहाँ हर हर्बल उत्पाद के साथ एक पूर्ण, सत्यापित इतिहास हो। जहाँ उपभोक्ता पारदर्शी जानकारी के आधार पर निर्णय लें और जहाँ सतत खेती को सम्मान और पहचान मिले।',
      visionItems: [
        { title: 'वैश्विक नेटवर्क', description: 'दुनिया भर के फार्म और उपभोक्ताओं को जोड़ना', icon: Globe },
        { title: 'बेहतर सुरक्षा', description: 'सभी डेटा के लिए उन्नत ब्लॉकचेन सुरक्षा', icon: Shield },
        { title: 'बेहतर स्वास्थ्य', description: 'गुणवत्ता युक्त जड़ी-बूटियों से वैश्विक स्वास्थ्य में सुधार', icon: Heart }
      ]
    }
  }

  const content = contentMap[language] || contentMap.en

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section with Background */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%%3E%%3Cg fill="none" fill-rule="evenodd"%%3E%%3Cg fill="%23ffffff" fill-opacity="0.4"%%3E%%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-white backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto overflow-hidden">
                <img src={logoImage} alt="HerbalTrace Logo" className="h-16 w-16 object-contain" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {content.headerTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              {content.headerDescription}
            </p>
          </motion.div>
        </div>
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Mission Section with Image Grid */}
        <motion.div
          className="mb-20 -mt-16 relative z-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="card p-8 md:p-12 shadow-custom-strong">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{content.missionTitle}</h2>
              {content.missionParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto mb-6"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Image Grid */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <motion.div
                className="relative group overflow-hidden rounded-2xl shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={farmerImage}
                  alt="Farmer in herbal field"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">From the Farm</h3>
                    <p className="text-white/90">Connecting directly with verified herbal farmers</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="relative group overflow-hidden rounded-2xl shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={labImage}
                  alt="Laboratory testing herbal products"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">To Quality Assurance</h3>
                    <p className="text-white/90">Rigorous testing ensuring product excellence</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Key Features Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-gradient-to-br from-green-50 to-primary-50 p-6 rounded-xl border border-green-100">
                <Shield className="h-10 w-10 text-primary-600 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">100% Transparent</h4>
                <p className="text-sm text-gray-600">Complete visibility at every step</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-primary-50 p-6 rounded-xl border border-blue-100">
                <Target className="h-10 w-10 text-blue-600 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Verified Quality</h4>
                <p className="text-sm text-gray-600">Certified and tested products</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-primary-50 p-6 rounded-xl border border-purple-100">
                <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Growing Network</h4>
                <p className="text-sm text-gray-600">Expanding across regions</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.valuesHeading}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.valuesSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.values.map((value, index) => (
              <motion.div
                key={index}
                className="card p-6 text-center hover:shadow-custom-medium transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Testimonial Slider */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet the passionate individuals behind Herbal Trace who are revolutionizing the herbal industry through innovative technology and dedication to transparency.
            </p>
          </div>

          {/* Testimonial Slider */}
          <div className="relative mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white shadow-2xl">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-12"
              >
                {(() => {
                  const member = teamMembers[currentSlide]
                  const colors = getColorClasses(member.color)
                  const Icon = member.icon
                  
                  return (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      {/* Image Section */}
                      <div className="relative">
                        <div className={`absolute inset-0 ${colors.bg} rounded-2xl transform rotate-3`}></div>
                        <div className="relative">
                          <img
                            src={member.photo}
                            alt={`${member.name} - ${member.role}`}
                            className="w-full h-80 object-cover object-top rounded-2xl shadow-lg"
                          />
                          <div className={`absolute top-4 right-4 w-12 h-12 ${colors.bg} ${colors.border} border-2 rounded-full flex items-center justify-center shadow-lg`}>
                            <Icon className={`h-6 w-6 ${colors.text}`} />
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="space-y-6">
                        <div className="relative">
                          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-gray-200" />
                          <blockquote className="text-lg text-gray-700 leading-relaxed italic pl-6">
                            "{member.testimonial}"
                          </blockquote>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                            <span className={`text-sm ${colors.text} ${colors.badge} px-3 py-1 rounded-full font-medium`}>
                              {member.role}
                            </span>
                          </div>
                          <p className={`text-lg font-medium ${colors.text}`}>
                            {member.title}
                          </p>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {teamMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-primary-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">6</div>
              <div className="text-gray-600">Team Members</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">5+</div>
              <div className="text-gray-600">Specializations</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Dedication</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Innovation</div>
            </div>
          </div>
        </motion.div>

        {/* Future Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-primary-50 to-green-50 border-primary-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{content.visionHeading}</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              {content.visionDescription}
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {content.visionItems.map((item) => (
                <div key={item.title} className="p-6">
                  <item.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage