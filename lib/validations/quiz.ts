import { z } from 'zod'

export const respostaUsuarioSchema = z.object({
  lead_id: z.string().uuid('ID do lead inválido'),
  pergunta_id: z.string().uuid('ID da pergunta inválido'),
  resposta_id: z.string().uuid('ID da resposta inválido'),
})

export type RespostaUsuarioInput = z.infer<typeof respostaUsuarioSchema>

export const perguntaAdminSchema = z.object({
  pergunta: z.string().min(5, 'Pergunta muito curta').max(500, 'Pergunta muito longa'),
  ativa: z.boolean().default(true),
  ordem: z.number().int().optional().nullable(),
  respostas: z
    .array(
      z.object({
        texto: z.string().min(1, 'Resposta não pode ser vazia'),
        correta: z.boolean(),
      })
    )
    .min(2, 'Deve ter pelo menos 2 respostas')
    .refine(
      (respostas) => respostas.some((r) => r.correta),
      'Deve haver pelo menos uma resposta correta'
    ),
})

export type PerguntaAdminInput = z.infer<typeof perguntaAdminSchema>
