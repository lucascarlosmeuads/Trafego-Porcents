
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { formatCurrencyInput, parseCurrencyToNumber, validateCurrencyValue } from '@/utils/currencyUtils'

interface CurrencyInputProps {
  value?: number | null
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
  error?: string
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  disabled = false,
  required = false,
  className = "",
  id,
  error
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [localError, setLocalError] = useState<string | undefined>()

  useEffect(() => {
    if (value !== null && value !== undefined && value > 0) {
      setDisplayValue(formatCurrencyInput((value * 100).toString()))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatCurrencyInput(inputValue)
    const numericValue = parseCurrencyToNumber(formattedValue)
    
    setDisplayValue(formattedValue)
    
    // Validação
    if (formattedValue && numericValue > 0) {
      const validation = validateCurrencyValue(numericValue)
      if (!validation.isValid) {
        setLocalError(validation.error)
        return
      } else {
        setLocalError(undefined)
      }
    } else {
      setLocalError(undefined)
    }
    
    onChange(numericValue)
  }

  const displayError = error || localError

  return (
    <div className="space-y-1">
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${className} ${displayError ? 'border-red-500' : ''}`}
      />
      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
    </div>
  )
}
