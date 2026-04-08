'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TRANSLATIONS, UILanguage, TranslationKey } from './translations'

interface UILanguageContextValue {
  uiLang: UILanguage
  setUILang: (lang: UILanguage) => void
  t: (key: TranslationKey) => string
  dir: 'ltr' | 'rtl'
}

const UILanguageContext = createContext<UILanguageContextValue>({
  uiLang: 'en',
  setUILang: () => {},
  t: (key) => key,
  dir: 'ltr',
})

export function UILanguageProvider({ children }: { children: ReactNode }) {
  const [uiLang, setUILangState] = useState<UILanguage>('en')

  useEffect(() => {
    const stored = localStorage.getItem('scribeai-ui-lang') as UILanguage | null
    if (stored === 'ar' || stored === 'en') {
      setUILangState(stored)
    }
  }, [])

  const setUILang = (lang: UILanguage) => {
    setUILangState(lang)
    localStorage.setItem('scribeai-ui-lang', lang)
  }

  const dir = uiLang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = uiLang
  }, [dir, uiLang])

  const t = (key: TranslationKey): string => TRANSLATIONS[uiLang][key] ?? TRANSLATIONS.en[key]

  return (
    <UILanguageContext.Provider value={{ uiLang, setUILang, t, dir }}>
      {children}
    </UILanguageContext.Provider>
  )
}

export function useUILanguage() {
  return useContext(UILanguageContext)
}
