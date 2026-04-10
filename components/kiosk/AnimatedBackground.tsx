'use client'

// Background animado do totem — partículas, orbs neon, anéis pulsantes
export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>

      {/* ── Orbs neon vibrantes ──────────────────────────────────── */}
      <div className="animate-float1 absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,174,157,0.35) 0%, rgba(0,174,157,0.05) 70%)' }} />
      <div className="animate-float2 absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(73,71,157,0.4) 0%, rgba(73,71,157,0.05) 70%)' }} />
      <div className="animate-float3 absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(125,182,28,0.3) 0%, transparent 70%)' }} />
      <div className="animate-float2 absolute bottom-1/4 -right-20 w-72 h-72 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(201,210,0,0.25) 0%, transparent 70%)', animationDelay: '4s' }} />
      <div className="animate-float1 absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full blur-3xl"
        style={{ transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(0,174,157,0.08) 0%, transparent 60%)', animationDelay: '6s' }} />

      {/* ── Partículas coloridas flutuando para cima ──────────────── */}
      {PARTICLES.map((p, i) => (
        <div key={i}
          className="absolute animate-float-up"
          style={{
            left: p.x,
            bottom: `-${p.size}`,
            width: p.size,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '3px' : '4px',
            background: p.color,
            boxShadow: `0 0 ${p.glow}px ${p.color}`,
            transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: 0.9,
          }}
        />
      ))}

      {/* ── Estrelas / pontos piscando ────────────────────────────── */}
      {STARS.map((s, i) => (
        <div key={i}
          className="absolute rounded-full animate-star-twinkle"
          style={{
            left: s.x, top: s.y,
            width: s.size, height: s.size,
            background: s.color,
            boxShadow: `0 0 6px ${s.color}`,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {/* ── Padrão de pontos sutil ────────────────────────────────── */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,174,157,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />
    </div>
  )
}

// Partículas: mix de circles, diamonds, squares em cores neon
const PARTICLES = [
  { x: '5%',   size: '10px', shape: 'circle',  color: '#00AE9D', glow: 8,  duration: '9s',  delay: '0s'   },
  { x: '12%',  size: '6px',  shape: 'diamond', color: '#7DB61C', glow: 6,  duration: '12s', delay: '1.5s' },
  { x: '20%',  size: '8px',  shape: 'circle',  color: '#49479D', glow: 8,  duration: '8s',  delay: '3s'   },
  { x: '28%',  size: '12px', shape: 'square',  color: '#C9D200', glow: 10, duration: '11s', delay: '0.8s' },
  { x: '36%',  size: '7px',  shape: 'diamond', color: '#00AE9D', glow: 6,  duration: '14s', delay: '2.2s' },
  { x: '44%',  size: '9px',  shape: 'circle',  color: '#7DB61C', glow: 8,  duration: '10s', delay: '4s'   },
  { x: '52%',  size: '5px',  shape: 'square',  color: '#49479D', glow: 5,  duration: '13s', delay: '1s'   },
  { x: '60%',  size: '11px', shape: 'diamond', color: '#00AE9D', glow: 10, duration: '9s',  delay: '3.5s' },
  { x: '68%',  size: '6px',  shape: 'circle',  color: '#C9D200', glow: 6,  duration: '11s', delay: '2s'   },
  { x: '76%',  size: '8px',  shape: 'square',  color: '#7DB61C', glow: 7,  duration: '8s',  delay: '0.5s' },
  { x: '84%',  size: '10px', shape: 'diamond', color: '#49479D', glow: 9,  duration: '12s', delay: '2.8s' },
  { x: '91%',  size: '7px',  shape: 'circle',  color: '#00AE9D', glow: 7,  duration: '10s', delay: '1.8s' },
  { x: '8%',   size: '5px',  shape: 'square',  color: '#C9D200', glow: 5,  duration: '15s', delay: '5s'   },
  { x: '33%',  size: '9px',  shape: 'circle',  color: '#49479D', glow: 8,  duration: '7s',  delay: '3.8s' },
  { x: '57%',  size: '6px',  shape: 'diamond', color: '#7DB61C', glow: 6,  duration: '13s', delay: '4.5s' },
  { x: '72%',  size: '12px', shape: 'circle',  color: '#00AE9D', glow: 10, duration: '9s',  delay: '6s'   },
  { x: '88%',  size: '7px',  shape: 'square',  color: '#C9D200', glow: 7,  duration: '11s', delay: '2.5s' },
  { x: '16%',  size: '10px', shape: 'diamond', color: '#7DB61C', glow: 9,  duration: '10s', delay: '7s'   },
  { x: '48%',  size: '5px',  shape: 'circle',  color: '#49479D', glow: 5,  duration: '14s', delay: '1.2s' },
  { x: '96%',  size: '8px',  shape: 'diamond', color: '#00AE9D', glow: 7,  duration: '8s',  delay: '3.2s' },
]

const STARS = [
  { x: '7%',   y: '10%', size: '4px', color: '#00AE9D', delay: '0s',    duration: '2.1s' },
  { x: '22%',  y: '5%',  size: '3px', color: '#7DB61C', delay: '0.7s',  duration: '3.0s' },
  { x: '38%',  y: '14%', size: '5px', color: '#C9D200', delay: '1.4s',  duration: '2.4s' },
  { x: '55%',  y: '7%',  size: '3px', color: '#00AE9D', delay: '0.3s',  duration: '1.9s' },
  { x: '70%',  y: '18%', size: '4px', color: '#49479D', delay: '1.9s',  duration: '2.7s' },
  { x: '85%',  y: '9%',  size: '3px', color: '#7DB61C', delay: '0.9s',  duration: '3.3s' },
  { x: '3%',   y: '35%', size: '3px', color: '#C9D200', delay: '2.2s',  duration: '2.0s' },
  { x: '94%',  y: '42%', size: '4px', color: '#00AE9D', delay: '0.5s',  duration: '2.8s' },
  { x: '18%',  y: '65%', size: '3px', color: '#49479D', delay: '1.6s',  duration: '3.1s' },
  { x: '47%',  y: '78%', size: '5px', color: '#7DB61C', delay: '0.4s',  duration: '2.3s' },
  { x: '78%',  y: '72%', size: '3px', color: '#C9D200', delay: '2.8s',  duration: '1.8s' },
  { x: '63%',  y: '88%', size: '4px', color: '#00AE9D', delay: '1.1s',  duration: '2.6s' },
  { x: '32%',  y: '92%', size: '3px', color: '#49479D', delay: '3.2s',  duration: '2.9s' },
  { x: '90%',  y: '82%', size: '4px', color: '#7DB61C', delay: '1.7s',  duration: '2.2s' },
  { x: '50%',  y: '50%', size: '3px', color: '#C9D200', delay: '2.5s',  duration: '3.4s' },
]
