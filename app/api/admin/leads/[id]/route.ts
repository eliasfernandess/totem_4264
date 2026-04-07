import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    // Primeiro verifica se o lead existe
    const { data: lead, error: erroGet } = await supabase
      .from('leads')
      .select('id')
      .eq('id', params.id)
      .single()

    if (erroGet || !lead) {
      return NextResponse.json({ error: `Lead não encontrado: ${erroGet?.message}` }, { status: 404 })
    }

    // Deleta respostas e premios relacionados manualmente (por segurança)
    await supabase.from('respostas_usuario').delete().eq('lead_id', params.id)
    await supabase.from('premios_usuario').delete().eq('lead_id', params.id)

    // Deleta o lead
    const { error, count } = await supabase
      .from('leads')
      .delete({ count: 'exact' })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: `Erro Supabase: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, deletados: count })
  } catch (e) {
    return NextResponse.json({ error: `Exceção: ${String(e)}` }, { status: 500 })
  }
}
