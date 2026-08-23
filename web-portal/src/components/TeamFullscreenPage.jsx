import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code, Smartphone, PenTool, Lightbulb, Monitor, Palette, ChevronLeft, ChevronRight, Quote, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Import team member photos
import kunalPhoto from '../assets/kunal.jpeg'
import manasPhoto from '../assets/manas.jpeg'
import avinashPhoto from '../assets/avinash.jpeg'
import shreyaPhoto from '../assets/shreya.jpeg'
import mukulPhoto from '../assets/mukul.jpeg'
import tanviPhoto from '../assets/tanvi.jpeg'

const TeamFullscreenPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

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
      role: 'Research Writer',
      title: 'Research & Content Development',
      photo: shreyaPhoto,
      testimonial: 'Bridging traditional herbal wisdom with modern technology through comprehensive research and compelling content. I ensure our platform truly reflects the authentic needs of the herbal industry.',
      color: 'orange',
      icon: PenTool
    },
    {
      name: 'Tanvi Gupta',
      role: 'UI/UX Designer',
      title: 'Design & Business Strategy',
      photo: tanviPhoto,
      testimonial: 'Designing experiences that are both beautiful and highly functional. My focus is on creating user-centric designs that make herbal traceability accessible and engaging for all stakeholders.',
      color: 'pink',
      icon: Palette
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
    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [])

  const getColorClasses = (color) => {
    const colors = {
      blue: { 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        text: 'text-blue-600', 
        badge: 'bg-blue-50',
        gradient: 'from-blue-500 to-blue-700'
      },
      green: { 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        text: 'text-green-600', 
        badge: 'bg-green-50',
        gradient: 'from-green-500 to-green-700'
      },
      purple: { 
        bg: 'bg-purple-50', 
        border: 'border-purple-200', 
        text: 'text-purple-600', 
        badge: 'bg-purple-50',
        gradient: 'from-purple-500 to-purple-700'
      },
      orange: { 
        bg: 'bg-orange-50', 
        border: 'border-orange-200', 
        text: 'text-orange-600', 
        badge: 'bg-orange-50',
        gradient: 'from-orange-500 to-orange-700'
      },
      pink: { 
        bg: 'bg-pink-50', 
        border: 'border-pink-200', 
        text: 'text-pink-600', 
        badge: 'bg-pink-50',
        gradient: 'from-pink-500 to-pink-700'
      },
      teal: { 
        bg: 'bg-teal-50', 
        border: 'border-teal-200', 
        text: 'text-teal-600', 
        badge: 'bg-teal-50',
        gradient: 'from-teal-500 to-teal-700'
      }
    }
    return colors[color] || colors.blue
  }

  const handleBackClick = () => {
    navigate('/about')
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        prevSlide()
      } else if (event.key === 'ArrowRight') {
        nextSlide()
      } else if (event.key === 'Escape') {
        handleBackClick()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Header with Back Button */}
      <motion.div
        className="absolute top-6 left-6 right-6 flex justify-between items-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={handleBackClick}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to About</span>
        </button>
        
        <button
          onClick={handleBackClick}
          className="text-white/80 hover:text-white transition-colors duration-300 bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Meet Our Team
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto">
              The passionate individuals revolutionizing herbal traceability
            </p>
          </motion.div>

          {/* Team Member Showcase */}
          <motion.div
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.6 }}
                className="p-8 md:p-16"
              >
                {(() => {
                  const member = teamMembers[currentSlide]
                  const colors = getColorClasses(member.color)
                  const Icon = member.icon
                  
                  return (
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      {/* Image Section */}
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-3xl transform rotate-3 opacity-30`}></div>
                        <div className="relative">
                          <img
                            src={member.photo}
                            alt={`${member.name} - ${member.role}`}
                            className="w-full h-96 md:h-[500px] object-cover rounded-3xl shadow-2xl"
                          />
                          <div className={`absolute top-6 right-6 w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-xl border-4 border-white/30`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="space-y-8 text-white">
                        <div className="relative">
                          <Quote className="absolute -top-4 -left-4 h-12 w-12 text-white/20" />
                          <blockquote className="text-xl md:text-2xl leading-relaxed italic pl-8 text-white/90">
                            "{member.testimonial}"
                          </blockquote>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-3xl md:text-4xl font-bold text-white">
                              {member.name}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                              <span className={`inline-flex text-sm font-semibold bg-gradient-to-r ${colors.gradient} text-white px-4 py-2 rounded-full`}>
                                {member.role}
                              </span>
                              <p className="text-lg text-white/80 font-medium">
                                {member.title}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 text-white border border-white/20"
              aria-label="Previous team member"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 text-white border border-white/20"
              aria-label="Next team member"
            >
              <ChevronRight className="h-7 w-7" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {teamMembers.map((member, index) => {
                const colors = getColorClasses(member.color)
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? `w-12 h-4 bg-gradient-to-r ${colors.gradient}`
                        : 'w-4 h-4 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`View ${member.name}`}
                  />
                )
              })}
            </div>

            {/* Team Member Navigation */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-4 max-w-4xl overflow-x-auto pb-4">
                {teamMembers.map((member, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white/20 backdrop-blur-sm border border-white/30'
                        : 'bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <div className="text-white font-medium text-sm">{member.name.split(' ')[0]}</div>
                        <div className="text-white/60 text-xs">{member.role}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Footer Instructions */}
          <motion.div
            className="text-center mt-8 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <p className="text-sm">Use arrow keys to navigate • Press ESC to exit</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TeamFullscreenPage