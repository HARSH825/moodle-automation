'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
  attribute?: 'class'
}

export function ThemeProvider({ children, attribute = 'class' }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute={attribute} defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
