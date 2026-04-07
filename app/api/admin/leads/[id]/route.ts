import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    // Deleta dependências primeiro
    await supabase.from('respostas_usuario').delete().eq('lead_id', params.id)
    await supabase.from('premios_usuario').delete().eq('lead_id', params.id)

    // Deleta o lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
