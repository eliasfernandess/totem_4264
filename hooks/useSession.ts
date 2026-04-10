import { useSessionStore } from '@/store/sessionStore'

export function useSession() {
  const store = useSessionStore()
  return {
    sessaoId: store.sessaoId,
    quizCompleto: store.quizCompleto,
    premioSorteado: store.premioSorteado,
    etapa: store.etapa,
    acertos: store.acertos,
    totalPerguntas: store.totalPerguntas,
    iniciarSessao: store.iniciarSessao,
    setQuizCompleto: store.setQuizCompleto,
    setPremioSorteado: store.setPremioSorteado,
    setEtapa: store.setEtapa,
    resetSession: store.resetSession,
  }
}
