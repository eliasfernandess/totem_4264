import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const premioUpdateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  descricao: z.string().max(500).optional().nullable(),
  estoque: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = premioUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('premios')
      .update(parsed.data)
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar prêmio.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
