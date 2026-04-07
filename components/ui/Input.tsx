'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-lg font-semibold text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full min-h-16 px-5 py-4 text-lg rounded-2xl border-2 transition-all duration-300',
              'bg-white text-secondary placeholder-gray-400',
              'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-200 hover:border-primary/50',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-red-600 text-base font-medium">{error}</p>}
        {hint && !error && <p className="text-gray-500 text-sm">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
