import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    // Retorna todos os prêmios disponíveis (com estoque e ativos)
    // O filtro por score do cliente é feito no momento do SORTEIO, não aqui
    const { data, error } = await supabase
      .from('premios')
      .select('id, nome, descricao, estoque, ativo, percentual_acerto')
      .eq('ativo', true)
      .gt('estoque', 0)
      .order('percentual_acerto', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
