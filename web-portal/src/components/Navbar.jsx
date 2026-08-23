import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Menu, X, ChevronDown, Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import logo from '../assets/logo.png'

const Navbar = ({ onOpenSignUp = () => {}, onOpenSignIn = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { language, setLanguage } = useLanguage()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const navContent = language === 'hi'
    ? {
        brand: 'हर्बलट्रेस',
        navLinks: [
          { path: '/', label: 'मुख्य पृष्ठ' },
          { path: '/offerings', label: 'सेवाएं' },
          { path: '/about', label: 'हमारे बारे में' },
          { path: '/contact', label: 'संपर्क' }
        ],
        signIn: 'लॉग इन',
        signUp: 'साइन अप',
        languageToggle: 'English'
      }
    : {
        brand: 'HerbalTrace',
        navLinks: [
          { path: '/', label: 'Home' },
          { path: '/offerings', label: 'Offerings' },
          { path: '/about', label: 'About Us' },
          { path: '/contact', label: 'Contact' }
        ],
        signIn: 'Sign In',
        signUp: 'Sign Up',
        languageToggle: 'हिन्दी'
      }
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-custom-light border-b border-gray-100' 
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img src={logo} alt="Herbal Trace Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            </motion.div>
            <span className="text-2xl md:text-3xl font-bold text-primary-700">
              {navContent.brand}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navContent.navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : 'text-black hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 border border-dotted border-gray-400 hover:border-primary-600 rounded-lg transition-colors flex items-center gap-1.5"
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSignIn}
              className="px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
            >
              {navContent.signIn}
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-custom-light hover:shadow-custom-medium"
              onClick={onOpenSignUp}
            >
              {navContent.signUp}
            </motion.button>
          </div>

          {/* Mobile Language Toggle + Menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-2 text-gray-600 hover:text-primary-600 border border-dotted border-gray-400 hover:border-primary-600 rounded-lg transition-colors"
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <Globe className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-custom-light"
          >
            <div className="px-4 py-6 space-y-4">
              {navContent.navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-black hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navContent.navLinks.length * 0.1 + 0.1 }}
                className="pt-4 border-t border-gray-200"
              >
                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onOpenSignIn()
                    }}
                  >
                    {navContent.signIn}
                  </button>
                  <button
                    type="button"
                    className="w-full btn-primary text-center"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onOpenSignUp()
                    }}
                  >
                    {navContent.signUp}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
