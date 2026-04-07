import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Premio, SessionState } from '@/types'

interface SessionStore extends SessionState {
  setLead: (leadId: string, nome: string) => void
  setQuizCompleto: () => void
  setPremioSorteado: (premio: Premio) => void
  setEtapa: (etapa: SessionState['etapa']) => void
  resetSession: () => void
}

const initialState: SessionState = {
  leadId: null,
  nome: null,
  quizCompleto: false,
  premioSorteado: null,
  etapa: 'inicio',
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialState,

      setLead: (leadId, nome) =>
        set({ leadId, nome, etapa: 'quiz' }),

      setQuizCompleto: () =>
        set({ quizCompleto: true, etapa: 'roleta' }),

      setPremioSorteado: (premio) =>
        set({ premioSorteado: premio, etapa: 'fim' }),

      setEtapa: (etapa) => set({ etapa }),

      resetSession: () => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('totem-session')
        }
        set(initialState)
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      },
    }),
    {
      name: 'totem-session',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
    }
  )
)
