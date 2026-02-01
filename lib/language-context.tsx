'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ar' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isArabic: boolean
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar')

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('refereeshub-language')
    if (saved === 'ar' || saved === 'en') {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('refereeshub-language', lang)
  }

  const toggleLanguage = () => {
    handleSetLanguage(language === 'ar' ? 'en' : 'ar')
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        isArabic: language === 'ar',
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Translation helper for common strings
export const translations = {
  ar: {
    laws: 'قوانين اللعبة',
    quizzes: 'الاختبارات',
    videos: 'مكتبة الفيديو',
    notes: 'ملاحظات المباريات',
    search: 'البحث',
    back: 'العودة',
    expandAll: 'توسيع الكل',
    collapseAll: 'طي الكل',
    articles: 'مواد',
    law: 'القانون',
    previousLaw: 'القانون السابق',
    nextLaw: 'القانون التالي',
    switchToEnglish: 'English',
    switchToArabic: 'العربية',
  },
  en: {
    laws: 'Laws of the Game',
    quizzes: 'Quizzes',
    videos: 'Video Library',
    notes: 'Match Notes',
    search: 'Search',
    back: 'Back',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    articles: 'articles',
    law: 'Law',
    previousLaw: 'Previous Law',
    nextLaw: 'Next Law',
    switchToEnglish: 'English',
    switchToArabic: 'العربية',
  },
}

export function useTranslation() {
  const { language } = useLanguage()
  return translations[language]
}
