import { useEffect, useRef } from 'react'

export function ShootingStars() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener('resize', onResize)

    // 3D Perspective settings
    const fov = 500
    const meteors = []
    const stardust = []

    function spawn3DMeteor(customOrigin = null, isSuperBolide = false) {
      if (document.hidden) return

      // 3D coordinates relative to center
      const startZ = isSuperBolide ? 650 : Math.random() * 400 + 350
      const startX = customOrigin
        ? (customOrigin.x - width / 2) / (fov / (fov + startZ))
        : (Math.random() - 0.5) * (width * 1.6)
      const startY = customOrigin
        ? (customOrigin.y - height / 2) / (fov / (fov + startZ)) - 100
        : -(height * 0.8) - Math.random() * 200

      // Velocity vectors with strong 3D depth towards viewer (vz < 0)
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35
      const speed = isSuperBolide ? (Math.random() * 6 + 18) : (Math.random() * 7 + 13)

      meteors.push({
        x: startX,
        y: startY,
        z: startZ,
        vx: -Math.cos(angle) * speed * 1.2,
        vy: Math.sin(angle) * speed * 1.1,
        vz: -(speed * 0.9), // rushes towards camera
        length: isSuperBolide ? (Math.random() * 140 + 130) : (Math.random() * 85 + 65),
        life: 1,
        decay: isSuperBolide ? 0.009 : (Math.random() * 0.016 + 0.012),
        color: isSuperBolide
          ? '#fed7aa'
          : Math.random() > 0.45
            ? '#fde047'
            : '#f472b6',
        isSuper: isSuperBolide,
        trailNodes: [],
      })
    }

    let nextSpawnTime = Date.now() + 1200
    let animId

    // Interactive Trigger from custom events
    const onMeteorTrigger = e => {
      const isSuper = e?.detail?.super || false
      const count = isSuper ? 6 : 3
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawn3DMeteor(null, isSuper && i === 0), i * 160)
      }
    }
    window.addEventListener('trigger-meteor-shower-3d', onMeteorTrigger)

    let previous = performance.now()

    function render(now) {
      const delta = Math.min((now - previous) / 16.67, 2.2)
      previous = now

      ctx.clearRect(0, 0, width, height)

      const time = Date.now()
      if (time > nextSpawnTime) {
        const isSuper = Math.random() > 0.82
        spawn3DMeteor(null, isSuper)
        if (Math.random() > 0.6) {
          setTimeout(() => spawn3DMeteor(), 200)
        }
        nextSpawnTime = time + Math.random() * 3200 + 2000
      }

      const cx = width / 2
      const cy = height / 2

      // 1. Render and update 3D Stardust dropped from meteors
      for (let i = stardust.length - 1; i >= 0; i--) {
        const d = stardust[i]
        d.x += d.vx * delta
        d.y += d.vy * delta
        d.z += d.vz * delta
        d.life -= d.decay * delta

        if (d.life <= 0 || d.z <= -fov + 10) {
          stardust.splice(i, 1)
          continue
        }

        const scale = fov / (fov + d.z)
        const sx = cx + d.x * scale
        const sy = cy + d.y * scale

        if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue

        ctx.save()
        ctx.globalAlpha = Math.max(0, d.life * 0.8)
        ctx.fillStyle = d.color
        ctx.shadowColor = d.color
        ctx.shadowBlur = 6 * scale
        ctx.beginPath()
        ctx.arc(sx, sy, Math.max(0.6, d.size * scale), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 2. Render and update 3D Meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.x += m.vx * delta
        m.y += m.vy * delta
        m.z += m.vz * delta
        m.life -= m.decay * delta

        // Add stardust droplets in 3D
        if (Math.random() > 0.35 && stardust.length < 90) {
          stardust.push({
            x: m.x + (Math.random() - 0.5) * 15,
            y: m.y + (Math.random() - 0.5) * 15,
            z: m.z,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            vz: Math.random() * 1.5,
            size: Math.random() * 2.5 + 1.2,
            color: m.color,
            life: 1,
            decay: Math.random() * 0.035 + 0.02,
          })
        }

        // Store past nodes for smooth perspective tail
        m.trailNodes.unshift({ x: m.x, y: m.y, z: m.z })
        if (m.trailNodes.length > 12) m.trailNodes.pop()

        if (m.life <= 0 || m.z <= -fov + 20 || m.y > height * 1.4) {
          // Terminal sparkle burst
          if (m.isSuper) {
            for (let s = 0; s < 14; s++) {
              stardust.push({
                x: m.x,
                y: m.y,
                z: m.z,
                vx: (Math.random() - 0.5) * 4.5,
                vy: (Math.random() - 0.5) * 4.5,
                vz: (Math.random() - 0.5) * 4.5,
                size: Math.random() * 3 + 1.5,
                color: '#ffffff',
                life: 1,
                decay: 0.04,
              })
            }
          }
          meteors.splice(i, 1)
          continue
        }

        const headScale = fov / (fov + m.z)
        const hx = cx + m.x * headScale
        const hy = cy + m.y * headScale

        if (m.trailNodes.length > 1) {
          const tailNode = m.trailNodes[m.trailNodes.length - 1]
          const tailScale = fov / (fov + tailNode.z)
          const tx = cx + tailNode.x * tailScale
          const ty = cy + tailNode.y * tailScale

          const grad = ctx.createLinearGradient(hx, hy, tx, ty)
          grad.addColorStop(0, '#ffffff')
          grad.addColorStop(0.25, m.color)
          grad.addColorStop(1, 'transparent')

          ctx.save()
          ctx.globalAlpha = Math.max(0, m.life)
          ctx.strokeStyle = grad
          ctx.lineWidth = Math.max(1.2, (m.isSuper ? 4.2 : 2.5) * headScale)
          ctx.beginPath()
          ctx.moveTo(hx, hy)
          ctx.lineTo(tx, ty)
          ctx.stroke()

          // 3D Specular Head Glow
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = m.color
          ctx.shadowBlur = (m.isSuper ? 24 : 14) * headScale
          ctx.beginPath()
          ctx.arc(hx, hy, Math.max(1.2, (m.isSuper ? 4.2 : 2.4) * headScale), 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('trigger-meteor-shower-3d', onMeteorTrigger)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="shooting-stars-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
