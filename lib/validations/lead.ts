import { z } from 'zod'
import { validarCPF } from '@/lib/utils/cpf'

export const leadSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .refine((cpf) => validarCPF(cpf.replace(/\D/g, '')), 'CPF inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .refine(
      (tel) => tel.replace(/\D/g, '').length >= 10,
      'Telefone inválido'
    ),
  aceita_marketing: z.boolean().refine((v) => v === true, {
    message: 'É necessário aceitar os termos para participar',
  }),
})

export type LeadInput = z.infer<typeof leadSchema>
