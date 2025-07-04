
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { logger } from '@/utils/logger'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  } catch (error) {
    logger.error('Erro ao formatar moeda', { value, error })
    return `R$ ${value.toFixed(2)}`
  }
}

// Funções utilitárias para validação
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isAdminEmail(email: string): boolean {
  return email.includes('@admin') || email === 'lucas@admin.com'
}

export function isGestorEmail(email: string): boolean {
  return email.includes('@trafegoporcents.com')
}

// Função para sanitizar strings
export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

// Função para truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Função para delay (útil para testes e UI)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
