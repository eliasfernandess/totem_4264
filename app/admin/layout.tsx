import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Totem Interativo',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="admin-layout bg-gray-100"
      style={{ userSelect: 'text', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}
    >
      {children}
    </div>
  )
}
