'use client'

import { useInactivityReset } from '@/hooks/useInactivityReset'

interface InactivityResetProps {
  timeoutMs?: number
}

export function InactivityReset({ timeoutMs = 60_000 }: InactivityResetProps) {
  useInactivityReset(timeoutMs)
  return null
}
