import { useSessionStore } from '@/store/sessionStore'

export function useSession() {
  const store = useSessionStore()
  return {
    leadId: store.leadId,
    nome: store.nome,
    quizCompleto: store.quizCompleto,
    premioSorteado: store.premioSorteado,
    etapa: store.etapa,
    setLead: store.setLead,
    setQuizCompleto: store.setQuizCompleto,
    setPremioSorteado: store.setPremioSorteado,
    setEtapa: store.setEtapa,
    resetSession: store.resetSession,
  }
}
