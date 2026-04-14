'use client'

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>

      {/* Orbs — apenas 3, blur menor */}
      <div className="animate-float1 absolute -top-32 -right-32 w-96 h-96 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(0,174,157,0.22) 0%, transparent 70%)' }} />
      <div className="animate-float2 absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(73,71,157,0.22) 0%, transparent 70%)' }} />
      <div className="animate-float3 absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-xl"
        style={{ background: 'radial-gradient(circle, rgba(125,182,28,0.18) 0%, transparent 70%)' }} />

      {/* Partículas — 10 leves */}
      {PARTICLES.map((p, i) => (
        <div key={i}
          className="absolute animate-float-up"
          style={{
            left: p.x, bottom: `-${p.size}`,
            width: p.size, height: p.size,
            borderRadius: p.circle ? '50%' : '3px',
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            transform: p.circle ? undefined : 'rotate(45deg)',
            animationDuration: p.dur,
            animationDelay: p.delay,
            opacity: 0.8,
          }}
        />
      ))}

      {/* Estrelas — 8 pontos */}
      {STARS.map((s, i) => (
        <div key={i}
          className="absolute rounded-full animate-star-twinkle"
          style={{
            left: s.x, top: s.y,
            width: s.size, height: s.size,
            background: s.color,
            boxShadow: `0 0 5px ${s.color}`,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
    </div>
  )
}

const PARTICLES = [
  { x: '5%',  size: '8px',  circle: true,  color: '#00AE9D', dur: '9s',  delay: '0s'   },
  { x: '18%', size: '6px',  circle: false, color: '#7DB61C', dur: '12s', delay: '1.5s' },
  { x: '32%', size: '9px',  circle: true,  color: '#49479D', dur: '8s',  delay: '3s'   },
  { x: '47%', size: '5px',  circle: false, color: '#C9D200', dur: '11s', delay: '0.8s' },
  { x: '61%', size: '7px',  circle: true,  color: '#00AE9D', dur: '14s', delay: '2.2s' },
  { x: '74%', size: '10px', circle: false, color: '#7DB61C', dur: '10s', delay: '4s'   },
  { x: '85%', size: '6px',  circle: true,  color: '#49479D', dur: '9s',  delay: '1s'   },
  { x: '93%', size: '8px',  circle: false, color: '#00AE9D', dur: '13s', delay: '3.5s' },
  { x: '25%', size: '5px',  circle: true,  color: '#C9D200', dur: '11s', delay: '5s'   },
  { x: '55%', size: '7px',  circle: false, color: '#7DB61C', dur: '8s',  delay: '2s'   },
]

const STARS = [
  { x: '8%',  y: '12%', size: '3px', color: '#00AE9D', delay: '0s',   dur: '2.2s' },
  { x: '28%', y: '6%',  size: '4px', color: '#7DB61C', delay: '0.8s', dur: '3.0s' },
  { x: '52%', y: '9%',  size: '3px', color: '#C9D200', delay: '1.5s', dur: '2.4s' },
  { x: '76%', y: '15%', size: '4px', color: '#49479D', delay: '0.4s', dur: '1.9s' },
  { x: '4%',  y: '60%', size: '3px', color: '#00AE9D', delay: '2.0s', dur: '2.7s' },
  { x: '94%', y: '45%', size: '3px', color: '#7DB61C', delay: '1.1s', dur: '3.2s' },
  { x: '42%', y: '85%', size: '4px', color: '#C9D200', delay: '0.6s', dur: '2.5s' },
  { x: '80%', y: '78%', size: '3px', color: '#49479D', delay: '1.7s', dur: '2.1s' },
]
