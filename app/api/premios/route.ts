import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('premios')
      .select('id, nome, descricao, estoque, ativo')

    console.error('[premios] data:', JSON.stringify(data))
    console.error('[premios] error:', JSON.stringify(error))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filtra em JS para evitar problema de tipo no .eq()
    const disponiveis = (data ?? []).filter(
      (p) => p.ativo === true && p.estoque > 0
    )

    return NextResponse.json(disponiveis)
  } catch (e) {
    console.error('[premios] exception:', e)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
