import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { leadSchema } from '@/lib/validations/lead'
import { removerMascara } from '@/lib/utils/masks'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data
    const cpfLimpo = removerMascara(data.cpf)
    const telefoneLimpo = removerMascara(data.telefone)

    const supabase = createServiceClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        nome: data.nome.trim(),
        cpf: cpfLimpo,
        telefone: telefoneLimpo,
        aceita_marketing: data.aceita_marketing,
      })
      .select('id, nome')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'CPF já cadastrado. Você já participou!' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Erro ao cadastrar.' }, { status: 500 })
    }

    return NextResponse.json(lead, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
