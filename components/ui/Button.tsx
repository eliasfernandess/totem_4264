'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 active:scale-95 select-none'

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-hover focus:ring-primary/40 disabled:bg-primary/50',
    secondary:
      'bg-secondary text-white hover:bg-secondary/80 focus:ring-secondary/40 disabled:bg-secondary/50',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/40',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
  }

  const sizes = {
    sm: 'min-h-10 px-4 py-2 text-sm',
    md: 'min-h-12 px-6 py-3 text-base',
    lg: 'min-h-16 px-8 py-4 text-lg',
    xl: 'min-h-20 px-10 py-5 text-xl',
  }

  return (
    <button
      className={twMerge(
        clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Aguarde...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
