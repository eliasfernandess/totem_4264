import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Totem Interativo',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout min-h-screen bg-gray-100 overflow-auto" style={{ userSelect: 'text' }}>
      {children}
    </div>
  )
}
