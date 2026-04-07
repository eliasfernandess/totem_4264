import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const sorteioSchema = z.object({
  lead_id: z.string().uuid(),
  premio_id: z.string().uuid().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = sorteioSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const { lead_id, premio_id } = parsed.data
    const supabase = createServiceClient()

    // Buscar prêmios disponíveis
    const { data: premiosDisponiveis, error: erroPremios } = await supabase
      .from('premios')
      .select('id, nome, descricao, estoque, ativo')
      .eq('ativo', true)
      .gt('estoque', 0)

    if (erroPremios || !premiosDisponiveis || premiosDisponiveis.length === 0) {
      return NextResponse.json({ error: 'Nenhum prêmio disponível.' }, { status: 404 })
    }

    // Selecionar o prêmio (específico ou aleatório)
    let premio = premio_id
      ? premiosDisponiveis.find((p) => p.id === premio_id)
      : premiosDisponiveis[Math.floor(Math.random() * premiosDisponiveis.length)]

    if (!premio) {
      premio = premiosDisponiveis[Math.floor(Math.random() * premiosDisponiveis.length)]
    }

    // Registrar prêmio do usuário
    const { error: erroInsert } = await supabase
      .from('premios_usuario')
      .insert({ lead_id, premio_id: premio.id })

    if (erroInsert) {
      return NextResponse.json({ error: 'Erro ao registrar prêmio.' }, { status: 500 })
    }

    // Decrementar estoque (trigger desativa se chegar a 0)
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
