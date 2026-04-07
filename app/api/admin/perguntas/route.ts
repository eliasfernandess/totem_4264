import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { perguntaAdminSchema } from '@/lib/validations/quiz'

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('perguntas')
      .select('id, pergunta, ativa, ordem, respostas(id, texto, correta)')
      .order('ordem', { ascending: true, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar perguntas.' }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = perguntaAdminSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { respostas, ...perguntaData } = parsed.data
    const supabase = createServiceClient()

    const { data: pergunta, error: erroPergunta } = await supabase
      .from('perguntas')
      .insert(perguntaData)
      .select('id')
      .single()

    if (erroPergunta || !pergunta) {
      return NextResponse.json({ error: 'Erro ao criar pergunta.' }, { status: 500 })
    }

    const respostasComId = respostas.map((r) => ({ ...r, pergunta_id: pergunta.id }))

    const { error: erroRespostas } = await supabase
      .from('respostas')
      .insert(respostasComId)

    if (erroRespostas) {
      return NextResponse.json({ error: 'Erro ao criar respostas.' }, { status: 500 })
    }

    return NextResponse.json({ id: pergunta.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
