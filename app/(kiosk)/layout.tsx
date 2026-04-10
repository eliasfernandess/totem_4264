import { FullscreenGuard } from '@/components/kiosk/FullscreenGuard'
import { HorarioGuard } from '@/components/kiosk/HorarioGuard'

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FullscreenGuard />
      <HorarioGuard />
      {children}
    </>
  )
}
