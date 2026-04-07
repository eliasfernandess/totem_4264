import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { perguntaAdminSchema } from '@/lib/validations/quiz'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    const { error: erroPergunta } = await supabase
      .from('perguntas')
      .update(perguntaData)
      .eq('id', params.id)

    if (erroPergunta) {
      return NextResponse.json({ error: 'Erro ao atualizar pergunta.' }, { status: 500 })
    }

    // Recriar respostas
    await supabase.from('respostas').delete().eq('pergunta_id', params.id)

    const respostasComId = respostas.map((r) => ({ ...r, pergunta_id: params.id }))
    const { error: erroRespostas } = await supabase.from('respostas').insert(respostasComId)

    if (erroRespostas) {
      return NextResponse.json({ error: 'Erro ao atualizar respostas.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('perguntas')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Erro ao excluir pergunta.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
