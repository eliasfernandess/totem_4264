import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const premioSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(100),
  descricao: z.string().max(500).optional().nullable(),
  estoque: z.number().int().min(0, 'Estoque não pode ser negativo'),
  ativo: z.boolean().default(true),
  percentual_acerto: z.number().int().min(0).max(100).default(0),
})

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('premios')
      .select('id, nome, descricao, estoque, ativo, percentual_acerto')
      .order('percentual_acerto', { ascending: false })
      .order('nome')

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar prêmios.' }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = premioSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('premios')
      .insert(parsed.data)
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao criar prêmio.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
