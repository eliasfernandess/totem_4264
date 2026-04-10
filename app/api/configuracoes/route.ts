import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) {
      // Retorna configuração padrão se não existir
      return NextResponse.json({
        id: 1,
        sistema_ativo: true,
        dia_inteiro: true,
        horario_inicio: '08:00',
        horario_fim: '18:00',
        updated_at: new Date().toISOString(),
      }, {
        headers: { 'Cache-Control': 'no-store, no-cache', 'Pragma': 'no-cache' },
      })
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, no-cache', 'Pragma': 'no-cache' },
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
