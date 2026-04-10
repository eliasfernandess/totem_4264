import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const configSchema = z.object({
  sistema_ativo: z.boolean(),
  dia_inteiro: z.boolean(),
  horario_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
  horario_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
})

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single()

    const headers = { 'Cache-Control': 'no-store, no-cache', 'Pragma': 'no-cache' }
    if (error || !data) {
      return NextResponse.json({
        id: 1, sistema_ativo: true, dia_inteiro: true,
        horario_inicio: '08:00', horario_fim: '18:00',
      }, { headers })
    }
    return NextResponse.json(data, { headers })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = configSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('configuracoes')
      .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() })

    if (error) return NextResponse.json({ error: 'Erro ao salvar.' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
