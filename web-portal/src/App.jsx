import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import TrackingPage from './components/TrackingPage'
import ProcessPage from './components/ProcessPage'
import OfferingPage from './components/OfferingPage'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import TermsOfUsePage from './components/TermsOfUsePage'
import Footer from './components/Footer'
import SignUpModal from './components/SignUpModal'
import SignInModal from './components/SignInModal'
import FarmerLandingPage from './components/farmer/FarmerLandingPage'
import LaboratoryLandingPage from './components/laboratory/LaboratoryLandingPage'
import RegulatorLandingPage from './components/regulator/RegulatorLandingPage'
import ManufacturerLandingPage from './components/manufacturer/ManufacturerLandingPage'
import AdminLandingPage from './components/admin/AdminLandingPage'
import ConsumerLandingPage from './components/consumer/ConsumerLandingPage'
import ProductJourneyPage from './components/consumer/ProductJourneyPage'
import ScrollToTop from './components/common/ScrollToTop'
import Chatbot from './components/common/Chatbot'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  const handleOpenSignUp = () => {
    setIsSignInOpen(false)
    setIsSignUpOpen(true)
  }

  const handleOpenSignIn = () => {
    setIsSignUpOpen(false)
    setIsSignInOpen(true)
  }

  const handleCloseModals = () => {
    setIsSignUpOpen(false)
    setIsSignInOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Protected dashboard routes */}
        <Route path="/farmer" element={
          <ProtectedRoute allowedRoles={['Farmer']}>
            <FarmerLandingPage />
          </ProtectedRoute>
        } />
        <Route path="/laboratory" element={
          <ProtectedRoute allowedRoles={['Lab']}>
            <LaboratoryLandingPage />
          </ProtectedRoute>
        } />
        <Route path="/regulator" element={
          <ProtectedRoute allowedRoles={['Regulator']}>
            <RegulatorLandingPage />
          </ProtectedRoute>
        } />
        <Route path="/manufacturer" element={
          <ProtectedRoute allowedRoles={['Manufacturer']}>
            <ManufacturerLandingPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLandingPage />
          </ProtectedRoute>
        } />
        <Route path="/consumer" element={
          <ProtectedRoute allowedRoles={['Consumer']}>
            <ConsumerLandingPage />
          </ProtectedRoute>
        } />
        <Route path="/product-journey/:productId" element={<ProductJourneyPage />} />
        <Route path="/verify/:productId" element={<ProductJourneyPage />} />
        <Route path="/verify/:qrCode" element={<ProductJourneyPage />} />
        
        {/* Regular routes with navbar/footer */}
        <Route path="/*" element={
          <>
            <Navbar onOpenSignUp={handleOpenSignUp} onOpenSignIn={handleOpenSignIn} />
            <ScrollToTop />
            <main>
              <Routes>
                <Route path="/" element={<HomePage onOpenSignUp={handleOpenSignUp} />} />
                <Route path="/track" element={<TrackingPage />} />
                <Route path="/process" element={<ProcessPage />} />
                <Route path="/offerings" element={<OfferingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-use" element={<TermsOfUsePage />} />
              </Routes>
            </main>
            <Footer />
            <SignUpModal isOpen={isSignUpOpen} onClose={handleCloseModals} onSwitchToSignIn={handleOpenSignIn} />
            <SignInModal isOpen={isSignInOpen} onClose={handleCloseModals} onSwitchToSignUp={handleOpenSignUp} />
          </>
        } />
      </Routes>
      
      {/* Global Chatbot - appears on all pages */}
      <Chatbot />
    </div>
  )
}

export default App