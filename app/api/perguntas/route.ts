import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    // Busca todas as perguntas ativas
    const { data: perguntas, error: errPerguntas } = await supabase
      .from('perguntas')
      .select('id, pergunta, ativa, ordem')
      .eq('ativa', true)

    if (errPerguntas) {
      console.error('[perguntas] erro:', errPerguntas)
      return NextResponse.json({ error: errPerguntas.message }, { status: 500 })
    }

    if (!perguntas || perguntas.length === 0) {
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' },
      })
    }

    // Busca todas as respostas das perguntas ativas
    const ids = perguntas.map((p) => p.id)
    const { data: respostas, error: errRespostas } = await supabase
      .from('respostas')
      .select('id, pergunta_id, texto, correta')
      .in('pergunta_id', ids)

    if (errRespostas) {
      console.error('[respostas] erro:', errRespostas)
      return NextResponse.json({ error: errRespostas.message }, { status: 500 })
    }

    // Junta perguntas + respostas, filtra as que têm ao menos 1 resposta
    const resultado = perguntas
      .map((p) => ({
        ...p,
        respostas: (respostas ?? []).filter((r) => r.pergunta_id === p.id),
      }))
      .filter((p) => p.respostas.length > 0)

    // Embaralha aleatoriamente a cada chamada
    const embaralhadas = resultado.sort(() => Math.random() - 0.5)

    return NextResponse.json(embaralhadas, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (e) {
    console.error('[perguntas] exception:', e)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
