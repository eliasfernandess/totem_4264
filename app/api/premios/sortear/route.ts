import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const sorteioSchema = z.object({
  lead_id: z.string().uuid(),
  acertos: z.number().int().min(0).optional().default(0),
  total_perguntas: z.number().int().min(0).optional().default(0),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = sorteioSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const { lead_id, acertos, total_perguntas } = parsed.data
    const supabase = createServiceClient()

    // Calcula percentual de acerto do cliente
    const percentual = total_perguntas > 0
      ? Math.round((acertos / total_perguntas) * 100)
      : 0

    // Busca prêmios disponíveis para o nível de acerto do cliente
    const { data: premiosElegiveis, error: erroPremios } = await supabase
      .from('premios')
      .select('id, nome, descricao, estoque, ativo, percentual_acerto')
      .eq('ativo', true)
      .gt('estoque', 0)
      .lte('percentual_acerto', percentual)

    if (erroPremios) {
      return NextResponse.json({ error: 'Erro ao buscar prêmios.' }, { status: 500 })
    }

    // Fallback: se nenhum prêmio elegível, pega o de menor percentual
    let premiosDisponiveis = premiosElegiveis ?? []
    if (premiosDisponiveis.length === 0) {
      const { data: fallback } = await supabase
        .from('premios')
        .select('id, nome, descricao, estoque, ativo, percentual_acerto')
        .eq('ativo', true)
        .gt('estoque', 0)
        .order('percentual_acerto', { ascending: true })
        .limit(1)

      if (!fallback || fallback.length === 0) {
        return NextResponse.json({ error: 'Nenhum prêmio disponível.' }, { status: 404 })
      }
      premiosDisponiveis = fallback
    }

    // Sorteia aleatoriamente entre os prêmios elegíveis
    const premio = premiosDisponiveis[Math.floor(Math.random() * premiosDisponiveis.length)]

    // Registra o prêmio do usuário
    const { error: erroInsert } = await supabase
      .from('premios_usuario')
      .insert({ lead_id, premio_id: premio.id })

    if (erroInsert) {
      return NextResponse.json({ error: 'Erro ao registrar prêmio.' }, { status: 500 })
    }

    // Decrementa estoque (trigger desativa se chegar a 0)
    const { error: erroUpdate } = await supabase
      .from('premios')
      .update({ estoque: premio.estoque - 1 })
      .eq('id', premio.id)

    if (erroUpdate) {
      return NextResponse.json({ error: 'Erro ao atualizar estoque.' }, { status: 500 })
    }

    return NextResponse.json({ premio }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
