
import React from 'react'
import { Input } from '@/components/ui/input'
import { formatCurrencyInput, parseCurrency } from '@/utils/currencyUtils'

interface CurrencyInputProps {
  value: string
  onChange: (value: string, numericValue: number) => void
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

export function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = "R$ 0,00",
  className,
  required = false,
  disabled = false
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCurrencyInput(inputValue)
    const numericValue = parseCurrency(formatted)
    
    onChange(formatted, numericValue)
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
        R$
      </span>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`pl-10 ${className}`}
        required={required}
        disabled={disabled}
      />
    </div>
  )
}
