import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('premios')
      .select('id, nome, descricao, estoque, ativo')
      .eq('ativo', true)
      .gt('estoque', 0)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
