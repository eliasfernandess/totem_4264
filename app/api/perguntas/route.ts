import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    // Buscar perguntas ativas
    const { data: perguntas, error: errPerguntas } = await supabase
      .from('perguntas')
      .select('id, pergunta, ativa, ordem')
      .eq('ativa', true)

    if (errPerguntas) {
      console.error('[perguntas] erro:', errPerguntas)
      return NextResponse.json({ error: errPerguntas.message }, { status: 500 })
    }

    if (!perguntas || perguntas.length === 0) {
      return NextResponse.json([])
    }

    // Buscar respostas para cada pergunta
    const ids = perguntas.map((p) => p.id)
    const { data: respostas, error: errRespostas } = await supabase
      .from('respostas')
      .select('id, pergunta_id, texto, correta')
      .in('pergunta_id', ids)

    if (errRespostas) {
      console.error('[respostas] erro:', errRespostas)
      return NextResponse.json({ error: errRespostas.message }, { status: 500 })
    }

    // Montar o objeto completo
    const resultado = perguntas.map((p) => ({
      ...p,
      respostas: (respostas ?? []).filter((r) => r.pergunta_id === p.id),
    }))

    // Embaralhar
    const embaralhadas = resultado.sort(() => Math.random() - 0.5)

    return NextResponse.json(embaralhadas)
  } catch (e) {
    console.error('[perguntas] exception:', e)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
