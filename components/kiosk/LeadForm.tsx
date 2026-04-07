'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { leadSchema, type LeadInput } from '@/lib/validations/lead'
import { mascaraCPF, mascaraTelefone } from '@/lib/utils/masks'
import { useSessionStore } from '@/store/sessionStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LeadForm() {
  const router = useRouter()
  const setLead = useSessionStore((s) => s.setLead)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { aceita_marketing: false },
  })

  const aceitaMarketing = watch('aceita_marketing')

  const onSubmit = async (data: LeadInput) => {
    setServerError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Erro ao cadastrar. Tente novamente.')
        return
      }

      setLead(json.id, data.nome)
      router.push('/quiz')
    } catch {
      setServerError('Erro de conexão. Verifique sua internet.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-lg mx-auto">
      <Input
        label="Nome completo"
        placeholder="Digite seu nome"
        error={errors.nome?.message}
        {...register('nome')}
      />

      <Input
        label="CPF"
        placeholder="000.000.000-00"
        inputMode="numeric"
        error={errors.cpf?.message}
        {...register('cpf', {
          onChange: (e) => {
            e.target.value = mascaraCPF(e.target.value)
            setValue('cpf', e.target.value)
          },
        })}
      />

      <Input
        label="Telefone"
        placeholder="(00) 00000-0000"
        inputMode="numeric"
        error={errors.telefone?.message}
        {...register('telefone', {
          onChange: (e) => {
            e.target.value = mascaraTelefone(e.target.value)
            setValue('telefone', e.target.value)
          },
        })}
      />

      <div
        className="flex items-start gap-4 cursor-pointer group"
        onClick={() => setValue('aceita_marketing', !aceitaMarketing, { shouldValidate: true })}
      >
        <div
          className={`mt-1 w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            aceitaMarketing
              ? 'bg-primary border-primary'
              : 'border-gray-300 group-hover:border-primary'
          }`}
        >
          {aceitaMarketing && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <input type="checkbox" className="sr-only" {...register('aceita_marketing')} />
        <span className="text-base text-gray-700 leading-relaxed select-none">
          Concordo com o uso dos meus dados para comunicações e aceito os termos de uso conforme a LGPD.
        </span>
      </div>
      {errors.aceita_marketing && (
        <p className="text-red-600 text-base font-medium -mt-4">
          {errors.aceita_marketing.message}
        </p>
      )}

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-base">
          {serverError}
        </div>
      )}

      <Button type="submit" fullWidth loading={isSubmitting} size="xl">
        Participar agora
      </Button>
    </form>
  )
}
