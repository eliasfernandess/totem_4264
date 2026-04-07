'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { clsx } from 'clsx'

const links = [
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/quiz', label: 'Quiz' },
  { href: '/admin/premios', label: 'Prêmios' },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <nav className="bg-secondary text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="font-bold text-lg">Totem Admin</span>
      </div>

      <div className="flex gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              pathname === link.href
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-white/10'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
      >
        Sair
      </button>
    </nav>
  )
}
