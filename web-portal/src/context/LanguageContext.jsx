import React, { createContext, useContext, useState, useMemo } from 'react'

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {}
})

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const value = useMemo(() => ({ language, setLanguage }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
