import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { birthday } from './content'

export function Celebration() {
  const canvas = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const element = canvas.current
    if (!element) return
    const context = element.getContext('2d')
    if (!context) return

    const width = element.clientWidth
    const height = element.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    element.width = width * dpr
    element.height = height * dpr
    context.scale(dpr, dpr)

    const particles = []
    const lanterns = []
    const confetti = []
    const sparks = []

    const fireworkColors = [
      ['#ffbe0b', '#fb5607', '#ff006e'], // sunset flame
      ['#ff70a6', '#ff9770', '#ffd670'], // pastel peach
      ['#c77dff', '#9d4edd', '#e0aaff'], // cosmic violet
      ['#ffd166', '#06d6a0', '#118ab2'], // festival glow
      ['#f72585', '#b5179e', '#7209b7'], // electric rose
    ]

    const confettiPalette = [
      '#ffd700', // pure gold
      '#f472b6', // rose pink
      '#e8c79d', // champagne
      '#38bdf8', // celestial blue
      '#c084fc', // lilac
      '#ffffff', // diamond glint
    ]

    const lanternMessages = [
      birthday.shortName,
      'Rực rỡ ✦',
      'Bình yên ♡',
      'Hạnh phúc',
      'Yêu thương',
      'Tuổi mới vui vẻ',
    ]

    const fov = 650

    // Initialize initial lanterns with true 3D coordinates
    for (let i = 0; i < 11; i++) {
      lanterns.push({
        x: (Math.random() - 0.5) * (width * 0.9),
        y: height / 2 + Math.random() * 350 + i * 80,
        z: Math.random() * 500 + 80,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.7),
        vz: (Math.random() - 0.5) * 0.2,
        rotY: Math.random() * Math.PI * 2,
        rotSpeedY: (Math.random() - 0.5) * 0.012 + 0.006,
        size: Math.random() * 12 + 24,
        swaySpeed: Math.random() * 0.02 + 0.015,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.25 + 0.75,
        text: lanternMessages[i % lanternMessages.length],
      })
    }

    // Spawn 3D Confetti
    function spawnConfetti(count = 70) {
      for (let i = 0; i < count; i++) {
        confetti.push({
          x: (Math.random() - 0.5) * width,
          y: -height * 0.2 - Math.random() * 100,
          z: Math.random() * 450 + 50,
          vx: (Math.random() - 0.5) * 2.2,
          vy: Math.random() * 1.8 + 1.2,
          vz: (Math.random() - 0.5) * 0.8,
          rx: Math.random() * Math.PI * 2,
          ry: Math.random() * Math.PI * 2,
          rz: Math.random() * Math.PI * 2,
          drx: (Math.random() - 0.5) * 0.08,
          dry: (Math.random() - 0.5) * 0.08,
          drz: (Math.random() - 0.5) * 0.06,
          width: Math.random() * 8 + 6,
          height: Math.random() * 12 + 8,
          color: confettiPalette[Math.floor(Math.random() * confettiPalette.length)],
          life: 1,
          decay: Math.random() * 0.003 + 0.0018,
        })
      }
    }

    // 3D Spherical Firework
    function createFirework(cx, cy, isHeart = false) {
      const palette = fireworkColors[Math.floor(Math.random() * fireworkColors.length)]
      const count = isHeart ? 68 : 56

      for (let i = 0; i < count; i++) {
        let vx, vy, vz
        if (isHeart) {
          const t = (i / count) * Math.PI * 2
          const hx = 16 * Math.pow(Math.sin(t), 3)
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
          const factor = (Math.random() * 0.35 + 0.85) * 0.2
          vx = hx * factor
          vy = hy * factor
          vz = (Math.random() - 0.5) * 1.5
        } else {
          // Spherical distribution in 3D
          const u = Math.random()
          const v = Math.random()
          const theta = u * 2.0 * Math.PI
          const phi = Math.acos(2.0 * v - 1.0)
          const speed = Math.random() * 3.2 + 1.4

          vx = Math.sin(phi) * Math.cos(theta) * speed
          vy = Math.sin(phi) * Math.sin(theta) * speed
          vz = Math.cos(phi) * speed
        }

        particles.push({
          x: cx,
          y: cy,
          z: 200,
          vx,
          vy,
          vz,
          life: 1,
          decay: Math.random() * 0.012 + 0.008,
          color: palette[i % palette.length],
          size: Math.random() * 2.5 + 1.2,
          gravity: 0.038,
        })
      }

      // Center sparkle burst
      for (let s = 0; s < 14; s++) {
        const a = Math.random() * Math.PI * 2
        const sp = Math.random() * 4.8 + 2.2
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.032,
          color: '#ffffff',
          size: Math.random() * 2.2 + 1,
        })
      }
    }

    let frame
    let previous = performance.now()
    const began = previous
    let bursts = 0
    let confettiSpawned = false

    const render = now => {
      if (document.hidden) {
        context.clearRect(0, 0, width, height)
        return
      }

      const delta = Math.min((now - previous) / 16.67, 2)
      previous = now
      const elapsed = now - began

      // Spawn initial confetti shower at reveal
      if (!confettiSpawned && elapsed > 200) {
        spawnConfetti(80)
        confettiSpawned = true
      }

      // Trigger multi-stage fireworks
      if (bursts < 12 && elapsed > bursts * 500) {
        const x = width * (0.2 + ((bursts * 33) % 60) / 100)
        const y = height * (0.12 + ((bursts * 23) % 36) / 100)
        const isHeart = bursts % 3 === 1
        createFirework(x, y, isHeart)
        if (bursts % 4 === 0) spawnConfetti(35)
        bursts++
      }

      context.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2

      // 1. Draw and update 3D Sky Lanterns
      for (let i = 0; i < lanterns.length; i++) {
        const l = lanterns[i]
        l.y += l.vy * delta
        l.x += (l.vx + Math.sin(now * l.swaySpeed + l.swayOffset) * 0.35) * delta
        l.z += l.vz * delta
        l.rotY += l.rotSpeedY * delta

        if (l.y < -height * 0.6) {
          l.y = height * 0.6 + 60
          l.x = (Math.random() - 0.5) * (width * 0.85)
          l.z = Math.random() * 450 + 100
        }

        const scale = fov / (fov + l.z)
        const sx = cx + l.x * scale
        const sy = cy + l.y * scale

        if (sx < -80 || sx > width + 80 || sy < -100 || sy > height + 100) continue

        context.save()
        context.translate(sx, sy)

        const lw = l.size * 0.85 * scale
        const lh = l.size * 1.25 * scale

        // Lantern Outer Glow
        const glow = context.createRadialGradient(0, 0, 2, 0, 0, lw * 2.2)
        glow.addColorStop(0, 'rgba(255, 183, 77, 0.45)')
        glow.addColorStop(0.5, 'rgba(255, 112, 67, 0.16)')
        glow.addColorStop(1, 'rgba(255, 112, 67, 0)')
        context.fillStyle = glow
        context.beginPath()
        context.arc(0, 0, lw * 2.2, 0, Math.PI * 2)
        context.fill()

        // 3D Faceted Lantern Body with Rotation
        const angle = l.rotY
        const cosAngle = Math.cos(angle)
        const sinAngle = Math.sin(angle)

        // Shading with 3D angle
        const bodyGrad = context.createLinearGradient(-lw / 2, -lh / 2, lw / 2, lh / 2)
        const lightShift = cosAngle * 0.2
        bodyGrad.addColorStop(0, `rgb(${Math.floor(255 + lightShift * 20)}, 224, 130)`)
        bodyGrad.addColorStop(0.5, '#ffb74d')
        bodyGrad.addColorStop(1, '#f57c00')

        context.fillStyle = bodyGrad
        context.shadowColor = '#ff9800'
        context.shadowBlur = 12 * scale

        context.beginPath()
        context.moveTo(-lw * 0.4, -lh * 0.5)
        context.quadraticCurveTo(0, -lh * 0.56, lw * 0.4, -lh * 0.5)
        context.quadraticCurveTo(lw * 0.55, 0, lw * 0.35, lh * 0.5)
        context.quadraticCurveTo(0, lh * 0.56, -lw * 0.35, lh * 0.5)
        context.quadraticCurveTo(-lw * 0.55, 0, -lw * 0.4, -lh * 0.5)
        context.closePath()
        context.fill()

        // 3D Vertical Bamboo Rib lines
        context.strokeStyle = 'rgba(180, 83, 9, 0.35)'
        context.lineWidth = 1 * scale
        context.beginPath()
        const ribOffset = sinAngle * lw * 0.25
        context.moveTo(ribOffset, -lh * 0.52)
        context.lineTo(ribOffset * 0.8, lh * 0.52)
        context.stroke()

        // Flame inner core
        context.fillStyle = '#fffde7'
        context.shadowColor = '#ffffff'
        context.shadowBlur = 9 * scale
        context.beginPath()
        context.ellipse(0, lh * 0.16, lw * 0.22, lh * 0.16, 0, 0, Math.PI * 2)
        context.fill()

        // Lantern Wish Text
        if (l.text && l.size * scale > 18) {
          context.shadowBlur = 0
          context.fillStyle = 'rgba(74, 30, 0, 0.8)'
          context.font = `bold ${Math.max(8, Math.round(9 * scale))}px "DM Sans", sans-serif`
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(l.text, 0, -lh * 0.05)
        }

        context.restore()
      }

      // 2. Draw and update 3D Fluttering Metallic Confetti
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i]
        c.x += c.vx * delta
        c.y += c.vy * delta
        c.z += c.vz * delta
        c.rx += c.drx * delta
        c.ry += c.dry * delta
        c.rz += c.drz * delta
        c.life -= c.decay * delta

        if (c.life <= 0 || c.y > height * 0.7) {
          confetti.splice(i, 1)
          continue
        }

        const scale = fov / (fov + c.z)
        const sx = cx + c.x * scale
        const sy = cy + c.y * scale

        if (sx < -20 || sx > width + 20) continue

        context.save()
        context.translate(sx, sy)
        context.rotate(c.rz)

        // 3D scale compression as it tumbles along X and Y axes
        const scaleX = Math.cos(c.ry)
        const scaleY = Math.cos(c.rx)

        context.scale(scaleX, scaleY)
        context.globalAlpha = Math.max(0, c.life)
        context.fillStyle = c.color
        context.shadowColor = c.color
        context.shadowBlur = 4 * scale

        const cw = c.width * scale
        const ch = c.height * scale
        context.fillRect(-cw / 2, -ch / 2, cw, ch)

        // Specular glint when face catches angle
        if (Math.abs(scaleX) < 0.25 || Math.abs(scaleY) < 0.25) {
          context.fillStyle = '#ffffff'
          context.fillRect(-cw / 2, -ch / 2, cw, ch)
        }

        context.restore()
      }

      // 3. Draw and update 3D Fireworks Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * delta
        p.y += p.vy * delta
        p.z += p.vz * delta
        p.vy += p.gravity * delta
        p.vx *= 0.985
        p.vy *= 0.985
        p.vz *= 0.985
        p.life -= p.decay * delta

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        const scale = fov / (fov + p.z)
        const px = cx + (p.x - cx) * scale
        const py = cy + (p.y - cy) * scale

        context.save()
        context.globalAlpha = Math.max(0, p.life)
        context.fillStyle = p.color
        context.shadowColor = p.color
        context.shadowBlur = 8 * scale

        context.beginPath()
        context.arc(px, py, Math.max(0.8, p.size * scale), 0, Math.PI * 2)
        context.fill()
        context.restore()
      }

      // 4. Draw Center Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx * delta
        s.y += s.vy * delta
        s.life -= s.decay * delta

        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }

        context.save()
        context.globalAlpha = s.life
        context.fillStyle = s.color
        context.shadowColor = '#ffffff'
        context.shadowBlur = 6
        context.beginPath()
        context.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        context.fill()
        context.restore()
      }

      if (elapsed < 16000 || lanterns.length > 0 || confetti.length > 0) {
        frame = requestAnimationFrame(render)
      } else {
        context.clearRect(0, 0, width, height)
      }
    }

    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [reduce])

  return (
    <canvas
      ref={canvas}
      className="celebration-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}

