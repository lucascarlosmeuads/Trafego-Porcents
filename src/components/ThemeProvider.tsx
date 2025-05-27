
import React, { createContext, useContext, useEffect } from "react"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: "dark"
}

const initialState: ThemeProviderState = {
  theme: "dark",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement
    console.log('Setting dark mode permanently')
    
    // Remove all theme classes and set dark mode
    root.classList.remove("light", "dark")
    root.classList.add("dark")
  }, [])

  const value = {
    theme: "dark" as const,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
