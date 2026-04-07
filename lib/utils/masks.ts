export function mascaraTelefone(valor: string): string {
  const cleaned = valor.replace(/\D/g, '')
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return cleaned
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export function mascaraCPF(valor: string): string {
  const cleaned = valor.replace(/\D/g, '')
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

export function removerMascara(valor: string): string {
  return valor.replace(/\D/g, '')
}
