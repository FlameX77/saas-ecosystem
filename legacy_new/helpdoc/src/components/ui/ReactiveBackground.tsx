"use client"
import { useEffect, useRef } from 'react'

export default function ReactiveBackground() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const orbsRef = useRef([
    { x: 200, y: 200, baseX: 200, baseY: 200 },
    { x: typeof window !== 'undefined' ? window.innerWidth - 200 : 800, y: typeof window !== 'undefined' ? window.innerHeight - 200 : 600, baseX: typeof window !== 'undefined' ? window.innerWidth - 200 : 800, baseY: typeof window !== 'undefined' ? window.innerHeight - 200 : 600 },
    { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400, baseX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, baseY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400 },
  ])
  const orbEls = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    let raf: number
    const animate = () => {
      const t = Date.now() / 1000
      const orbs = orbsRef.current
      const mouse = mouseRef.current

      // Autonomous drift
      orbs[0].baseX = 200 + Math.sin(t * 0.3) * 150
      orbs[0].baseY = 200 + Math.cos(t * 0.2) * 100
      orbs[1].baseX = (window.innerWidth - 200) + Math.sin(t * 0.25 + 2) * 120
      orbs[1].baseY = (window.innerHeight - 200) + Math.cos(t * 0.35 + 1) * 100
      orbs[2].baseX = window.innerWidth / 2 + Math.sin(t * 0.4 + 4) * 200
      orbs[2].baseY = window.innerHeight / 2 + Math.cos(t * 0.3 + 3) * 150

      // Lerp toward mouse
      const lerp = 0.04
      for (const orb of orbs) {
        orb.x += (orb.baseX + (mouse.x - window.innerWidth / 2) * 0.05 - orb.x) * lerp
        orb.y += (orb.baseY + (mouse.y - window.innerHeight / 2) * 0.05 - orb.y) * lerp
      }

      orbEls.current.forEach((el, i) => {
        if (el) {
          el.style.transform = `translate(${orbs[i].x - (i === 0 ? 350 : i === 1 ? 250 : 150)}px, ${orbs[i].y - (i === 0 ? 350 : i === 1 ? 250 : 150)}px)`
        }
      })

      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Dot grid */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.04,
        }}
      />

      {/* Gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div
          ref={el => { orbEls.current[0] = el }}
          style={{
            position: 'absolute', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,173,160,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
        <div
          ref={el => { orbEls.current[1] = el }}
          style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,173,160,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
        <div
          ref={el => { orbEls.current[2] = el }}
          style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
      </div>
    </>
  )
}
