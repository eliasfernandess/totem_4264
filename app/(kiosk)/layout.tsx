import { FullscreenGuard } from '@/components/kiosk/FullscreenGuard'

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FullscreenGuard />
      {children}
    </>
  )
}
