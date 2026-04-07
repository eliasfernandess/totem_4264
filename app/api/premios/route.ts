import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const acertos = parseInt(searchParams.get('acertos') ?? '0')
    const total = parseInt(searchParams.get('total') ?? '0')

    // Calcula o percentual de acerto do cliente (0 se não informado)
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0

    const supabase = createServiceClient()

    let query = supabase
      .from('premios')
      .select('id, nome, descricao, estoque, ativo, percentual_acerto')
      .eq('ativo', true)
      .gt('estoque', 0)
      .lte('percentual_acerto', percentual) // apenas prêmios que o cliente é elegível

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
