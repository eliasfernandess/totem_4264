'use client'

// Orbs flutuantes + estrelas piscando — background animado do totem
export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Orb principal — teal grande */}
      <div className="animate-float1 absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
      {/* Orb menor — teal médio */}
      <div className="animate-float2 absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-primary/8 blur-2xl" />
      {/* Orb verde */}
      <div className="animate-float3 absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[#7DB61C]/8 blur-2xl" />
      {/* Orb roxo/accent */}
      <div className="animate-float2 absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#49479D]/10 blur-3xl" style={{ animationDelay: '3s' }} />
      {/* Orb central leve */}
      <div className="animate-float1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/4 blur-3xl" style={{ animationDelay: '5s' }} />

      {/* Estrelas piscando */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-star-twinkle"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {/* Linhas de grade sutis */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,174,157,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,174,157,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}

const STARS = [
  { x: '10%',  y: '15%',  size: '3px', delay: '0s',    duration: '2.1s' },
  { x: '25%',  y: '8%',   size: '2px', delay: '0.5s',  duration: '3.2s' },
  { x: '40%',  y: '20%',  size: '4px', delay: '1s',    duration: '2.5s' },
  { x: '60%',  y: '5%',   size: '2px', delay: '1.5s',  duration: '1.8s' },
  { x: '75%',  y: '12%',  size: '3px', delay: '0.8s',  duration: '2.8s' },
  { x: '88%',  y: '25%',  size: '2px', delay: '2s',    duration: '3.5s' },
  { x: '5%',   y: '40%',  size: '2px', delay: '1.2s',  duration: '2.2s' },
  { x: '92%',  y: '50%',  size: '3px', delay: '0.3s',  duration: '2.9s' },
  { x: '15%',  y: '70%',  size: '2px', delay: '1.8s',  duration: '3.1s' },
  { x: '50%',  y: '80%',  size: '4px', delay: '0.6s',  duration: '2.4s' },
  { x: '80%',  y: '75%',  size: '2px', delay: '2.2s',  duration: '1.9s' },
  { x: '35%',  y: '90%',  size: '3px', delay: '1.4s',  duration: '2.7s' },
  { x: '70%',  y: '60%',  size: '2px', delay: '0.9s',  duration: '3.3s' },
  { x: '20%',  y: '50%',  size: '2px', delay: '1.6s',  duration: '2.0s' },
  { x: '55%',  y: '45%',  size: '3px', delay: '2.4s',  duration: '2.6s' },
]
