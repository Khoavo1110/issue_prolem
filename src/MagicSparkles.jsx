import { useEffect, useRef } from 'react'

export function MagicSparkles() {
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

    const particles = []
    const shockwaves = []
    const butterflies = []
    const fov = 450

    // 1. 3D Luminous Fireflies Swarm (Đom đóm thần tiên trong không gian 3D)
    const FIREFLY_COUNT = 18
    const fireflies = []
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 40,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.5,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        baseSize: Math.random() * 2.8 + 2.2,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        color: ['#fde047', '#f472b6', '#fed7aa', '#e9d5ff', '#ffffff'][i % 5],
      })
    }

    // 2. 3D Morphing Constellation System (Chòm sao 3D biến hình)
    const CONSTELLATION_NODES = 26
    const constellation = []
    let constellationActive = false
    let constellationTimer = null
    let constellationAngleY = 0
    let constellationCenter = { x: width / 2, y: height / 2 }

    for (let i = 0; i < CONSTELLATION_NODES; i++) {
      const t = (i / CONSTELLATION_NODES) * Math.PI * 2
      // Parametric 3D Heart coordinates
      const hx = 16 * Math.pow(Math.sin(t), 3) * 4
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 4
      const hz = Math.sin(t * 2) * 28

      constellation.push({
        curX: (Math.random() - 0.5) * width,
        curY: (Math.random() - 0.5) * height,
        curZ: Math.random() * 300,
        targetX: hx,
        targetY: hy,
        targetZ: hz,
        baseSize: Math.random() * 2.5 + 2.2,
        color: i % 2 === 0 ? '#ffd166' : '#f472b6',
      })
    }

    const palette = [
      '#ffd166', // warm gold
      '#f9bec7', // soft pink
      '#fcd5ce', // champagne rose
      '#e0c3fc', // gentle lavender
      '#ffffff', // diamond glint
      '#fb7185', // rose quartz
    ]

    // 3D Rose Petal Draw Helper
    function draw3DPetal(ctx, x, y, size, rx, ry, rz, color, alpha) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rz)
      ctx.scale(Math.cos(ry), Math.cos(rx))
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

      const w = size * 1.2
      const h = size * 1.8

      const petalGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
      petalGrad.addColorStop(0, '#fbcfe8')
      petalGrad.addColorStop(0.5, color)
      petalGrad.addColorStop(1, '#db2777')

      ctx.fillStyle = petalGrad
      ctx.shadowColor = color
      ctx.shadowBlur = 6

      ctx.beginPath()
      ctx.moveTo(0, -h / 2)
      ctx.bezierCurveTo(w * 0.8, -h * 0.3, w * 0.7, h * 0.4, 0, h / 2)
      ctx.bezierCurveTo(-w * 0.7, h * 0.4, -w * 0.8, -h * 0.3, 0, -h / 2)
      ctx.fill()

      if (Math.abs(Math.cos(ry)) < 0.3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()
    }

    // 3D Crystal Heart Draw Helper
    function draw3DHeart(ctx, x, y, size, rx, ry, rz, color, alpha) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rz)
      ctx.scale(Math.cos(ry), Math.cos(rx))
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 8

      ctx.beginPath()
      const d = size * 0.75
      ctx.moveTo(0, d * 0.3)
      ctx.bezierCurveTo(-d, -d * 0.6, -d * 1.3, d * 0.3, 0, d * 1.2)
      ctx.bezierCurveTo(d * 1.3, d * 0.3, d, -d * 0.6, 0, d * 0.3)
      ctx.fill()

      if (Math.abs(Math.cos(rx)) < 0.25 || Math.abs(Math.cos(ry)) < 0.25) {
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      }
      ctx.restore()
    }

    // 3D Diamond Star Sparkle
    function draw3DStar(ctx, x, y, size, rx, ry, rz, color, alpha) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rz)
      ctx.scale(Math.cos(ry), Math.cos(rx))
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 9

      ctx.beginPath()
      const r = size
      ctx.moveTo(0, -r)
      ctx.quadraticCurveTo(0, 0, r, 0)
      ctx.quadraticCurveTo(0, 0, 0, r)
      ctx.quadraticCurveTo(0, 0, -r, 0)
      ctx.quadraticCurveTo(0, 0, 0, -r)
      ctx.fill()
      ctx.restore()
    }

    // 3D Glowing Butterfly Draw Helper
    function draw3DButterfly(ctx, b, delta) {
      b.wingAngle += b.wingSpeed * delta
      const wingFold = Math.sin(b.wingAngle)

      const scale = fov / (fov + b.z)
      const sx = b.x
      const sy = b.y
      const size = b.size * scale

      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(b.rotZ)
      ctx.globalAlpha = Math.max(0, Math.min(1, b.life))

      // Glowing body
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = b.color
      ctx.shadowBlur = 10 * scale
      ctx.beginPath()
      ctx.ellipse(0, 0, size * 0.15, size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Left wing (3D perspective flap)
      ctx.save()
      ctx.scale(wingFold, 1)
      ctx.fillStyle = b.color
      ctx.beginPath()
      ctx.ellipse(-size * 0.6, -size * 0.2, size * 0.6, size * 0.45, -0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      // Right wing (3D perspective flap)
      ctx.save()
      ctx.scale(-wingFold, 1)
      ctx.fillStyle = b.color
      ctx.beginPath()
      ctx.ellipse(-size * 0.6, -size * 0.2, size * 0.6, size * 0.45, -0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      ctx.restore()
    }

    function addBurst(x, y, count = 18, shapeType = null) {
      shockwaves.push({
        x,
        y,
        radius: 5,
        maxRadius: Math.random() * 60 + 55,
        alpha: 0.85,
        color: '#fbcfe8',
      })

      for (let i = 0; i < count; i++) {
        if (particles.length > 150) particles.shift()
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
        const speed = Math.random() * 4.8 + 2.0
        const shapeRand = Math.random()

        particles.push({
          x,
          y,
          z: Math.random() * 160 + 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          vz: (Math.random() - 0.5) * 3,
          rx: Math.random() * Math.PI * 2,
          ry: Math.random() * Math.PI * 2,
          rz: Math.random() * Math.PI * 2,
          drx: (Math.random() - 0.5) * 0.14,
          dry: (Math.random() - 0.5) * 0.14,
          drz: (Math.random() - 0.5) * 0.09,
          size: Math.random() * 6.5 + 4,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          gravity: 0.045,
          shape: shapeType || (shapeRand > 0.6 ? 'petal' : shapeRand > 0.25 ? 'heart' : 'star'),
        })
      }
    }

    function addTrail(x, y) {
      if (particles.length > 150) particles.shift()
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        z: Math.random() * 100 + 30,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.4,
        vz: (Math.random() - 0.5) * 1,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        drx: 0.05,
        dry: 0.05,
        drz: 0.04,
        size: Math.random() * 3.5 + 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.9,
        decay: 0.024,
        gravity: 0.02,
        shape: Math.random() > 0.5 ? 'star' : 'heart',
      })
    }

    function spawn3DButterflies(originX, originY, count = 8) {
      for (let i = 0; i < count; i++) {
        butterflies.push({
          x: originX,
          y: originY,
          z: Math.random() * 200 + 50,
          vx: (Math.random() - 0.5) * 3,
          vy: -(Math.random() * 3 + 2.5),
          vz: (Math.random() - 0.5) * 1.5,
          rotZ: (Math.random() - 0.5) * 0.6,
          wingAngle: Math.random() * Math.PI * 2,
          wingSpeed: Math.random() * 0.25 + 0.18,
          size: Math.random() * 12 + 16,
          color: ['#f472b6', '#fed7aa', '#c084fc', '#67e8f9'][i % 4],
          life: 1,
          decay: Math.random() * 0.008 + 0.005,
        })
      }
    }

    function activateConstellation(x, y) {
      constellationCenter = { x, y }
      constellationActive = true
      if (constellationTimer) clearTimeout(constellationTimer)
      constellationTimer = setTimeout(() => {
        constellationActive = false
      }, 5500)
    }

    // Custom Event Listeners for Surprise Moments
    const onSupernova = e => {
      const x = e?.detail?.x ?? width / 2
      const y = e?.detail?.y ?? height / 2
      addBurst(x, y, 48)
      activateConstellation(x, y)
    }

    const onButterflies = e => {
      const x = e?.detail?.x ?? width / 2
      const y = e?.detail?.y ?? height / 2
      spawn3DButterflies(x, y, 10)
      addBurst(x, y, 20, 'heart')
    }

    window.addEventListener('trigger-supernova-3d', onSupernova)
    window.addEventListener('trigger-butterflies-3d', onButterflies)

    let pointerX = width / 2
    let pointerY = height / 2
    let lastX = 0
    let lastY = 0

    const onPointerMove = e => {
      pointerX = e.clientX
      pointerY = e.clientY
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY)
      if (dist > 8) {
        addTrail(e.clientX, e.clientY)
        lastX = e.clientX
        lastY = e.clientY
      }
    }

    const onTouchMove = e => {
      if (!e.touches || e.touches.length === 0) return
      const t = e.touches[0]
      pointerX = t.clientX
      pointerY = t.clientY
      const dist = Math.hypot(t.clientX - lastX, t.clientY - lastY)
      if (dist > 7) {
        addTrail(t.clientX, t.clientY)
        lastX = t.clientX
        lastY = t.clientY
      }
    }

    const onPointerDown = e => {
      pointerX = e.clientX
      pointerY = e.clientY
      lastX = e.clientX
      lastY = e.clientY
      addBurst(e.clientX, e.clientY, 18)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    let animId = null
    let previousTime = performance.now()

    function renderLoop(currentTime) {
      if (document.hidden) {
        animId = requestAnimationFrame(renderLoop)
        return
      }

      const delta = Math.min((currentTime - previousTime) / 16.67, 2.2)
      previousTime = currentTime

      ctx.clearRect(0, 0, width, height)

      // 1. Render 3D Luminous Fireflies Swarm
      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i]

        const dx = pointerX - f.x
        const dy = pointerY - f.y
        const distToPointer = Math.hypot(dx, dy)
        if (distToPointer < 180 && distToPointer > 10) {
          f.vx += (dx / distToPointer) * 0.12 * delta
          f.vy += (dy / distToPointer) * 0.12 * delta
        }

        if (Math.random() < 0.015) {
          f.targetX = Math.random() * width
          f.targetY = Math.random() * height
        }
        f.vx += (f.targetX - f.x) * 0.0003 * delta
        f.vy += (f.targetY - f.y) * 0.0003 * delta
        f.vz += (Math.random() - 0.5) * 0.08 * delta

        f.vx *= 0.98
        f.vy *= 0.98
        f.vz *= 0.98

        f.x += f.vx * delta
        f.y += f.vy * delta
        f.z += f.vz * delta

        if (f.z < 20) f.z = 20
        if (f.z > 500) f.z = 500
        if (f.x < -40) f.x = width + 40
        if (f.x > width + 40) f.x = -40
        if (f.y < -40) f.y = height + 40
        if (f.y > height + 40) f.y = -40

        const scale = fov / (fov + f.z)
        const px = f.x
        const py = f.y

        const pulse = Math.sin(currentTime * f.pulseSpeed * 0.05 + f.pulsePhase) * 0.35 + 0.65
        const currentSize = f.baseSize * scale * (0.85 + pulse * 0.3)
        const alpha = Math.min(0.9, scale * 1.3 * pulse)

        ctx.save()
        const haloGrad = ctx.createRadialGradient(px, py, 1, px, py, currentSize * 4.5)
        haloGrad.addColorStop(0, `rgba(255, 230, 150, ${alpha * 0.8})`)
        haloGrad.addColorStop(0.4, `rgba(244, 114, 182, ${alpha * 0.3})`)
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = haloGrad
        ctx.beginPath()
        ctx.arc(px, py, currentSize * 4.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = f.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(px, py, currentSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 2. Render 3D Morphing Constellation
      if (constellationActive) {
        constellationAngleY += 0.02 * delta
        const cosA = Math.cos(constellationAngleY)
        const sinA = Math.sin(constellationAngleY)

        ctx.save()
        for (let i = 0; i < constellation.length; i++) {
          const n = constellation[i]

          // Rotate 3D target coordinates around Y-axis
          const rotX = n.targetX * cosA - n.targetZ * sinA
          const rotZ = n.targetX * sinA + n.targetZ * cosA
          const rotY = n.targetY

          // Smooth interpolation towards target
          n.curX += (rotX - n.curX) * 0.08 * delta
          n.curY += (rotY - n.curY) * 0.08 * delta
          n.curZ += (rotZ - n.curZ) * 0.08 * delta

          const scale = fov / (fov + n.curZ + 150)
          const sx = constellationCenter.x + n.curX * scale
          const sy = constellationCenter.y + n.curY * scale

          // Connect adjacent stars with starlight filament
          if (i > 0) {
            const prev = constellation[i - 1]
            const prevScale = fov / (fov + prev.curZ + 150)
            const px = constellationCenter.x + prev.curX * prevScale
            const py = constellationCenter.y + prev.curY * prevScale

            ctx.strokeStyle = 'rgba(255, 230, 180, 0.35)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(sx, sy)
            ctx.stroke()
          }

          // Star node
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = n.color
          ctx.shadowBlur = 12 * scale
          ctx.beginPath()
          ctx.arc(sx, sy, Math.max(1.2, n.baseSize * scale), 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // 3. Render 3D Expanding Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i]
        sw.radius += 2.5 * delta
        sw.alpha -= 0.03 * delta

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = sw.alpha
        ctx.strokeStyle = sw.color
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.55, -0.2, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      // 4. Render 3D Butterflies
      for (let i = butterflies.length - 1; i >= 0; i--) {
        const b = butterflies[i]
        b.x += b.vx * delta
        b.y += b.vy * delta
        b.z += b.vz * delta
        b.life -= b.decay * delta

        if (b.life <= 0 || b.y < -80) {
          butterflies.splice(i, 1)
          continue
        }

        draw3DButterfly(ctx, b, delta)
      }

      // 5. Render 3D Particles (Petals, Hearts, Stars)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * delta
        p.y += p.vy * delta
        p.z += p.vz * delta
        p.vy += p.gravity * delta
        p.vx *= 0.98
        p.vy *= 0.98
        p.vz *= 0.98

        p.rx += p.drx * delta
        p.ry += p.dry * delta
        p.rz += p.drz * delta
        p.alpha -= p.decay * delta

        if (p.alpha <= 0 || p.y > height + 60) {
          particles.splice(i, 1)
          continue
        }

        const scale = fov / (fov + p.z)
        const renderSize = p.size * scale

        if (p.shape === 'petal') {
          draw3DPetal(ctx, p.x, p.y, renderSize, p.rx, p.ry, p.rz, p.color, p.alpha)
        } else if (p.shape === 'heart') {
          draw3DHeart(ctx, p.x, p.y, renderSize, p.rx, p.ry, p.rz, p.color, p.alpha)
        } else {
          draw3DStar(ctx, p.x, p.y, renderSize, p.rx, p.ry, p.rz, p.color, p.alpha)
        }
      }

      animId = requestAnimationFrame(renderLoop)
    }

    animId = requestAnimationFrame(renderLoop)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('trigger-supernova-3d', onSupernova)
      window.removeEventListener('trigger-butterflies-3d', onButterflies)
      if (constellationTimer) clearTimeout(constellationTimer)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="magic-sparkles-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
