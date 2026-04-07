import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { gerarCSV } from '@/lib/utils/csv'

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('leads')
      .select('id, nome, cpf, telefone, aceita_marketing, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar leads.' }, { status: 500 })
    }

    const csv = gerarCSV(data ?? [])
    const nomeArquivo = `leads-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
