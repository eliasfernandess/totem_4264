import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Premio, SessionState } from '@/types'

interface SessionStore extends SessionState {
  iniciarSessao: (sessaoId: string) => void
  setQuizCompleto: (acertos: number, totalPerguntas: number) => void
  setPremioSorteado: (premio: Premio) => void
  setEtapa: (etapa: SessionState['etapa']) => void
  resetSession: () => void
}

const initialState: SessionState = {
  sessaoId: null,
  quizCompleto: false,
  premioSorteado: null,
  etapa: 'inicio',
  acertos: 0,
  totalPerguntas: 0,
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialState,

      iniciarSessao: (sessaoId) =>
        set({ sessaoId, etapa: 'quiz' }),

      setQuizCompleto: (acertos, totalPerguntas) =>
        set({ quizCompleto: true, etapa: 'roleta', acertos, totalPerguntas }),

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
