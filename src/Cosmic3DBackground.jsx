import { useEffect, useRef } from 'react'

export function Cosmic3DBackground() {
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

    // 1. 3D Stars Setup
    const STAR_COUNT = 220
    const stars = []
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 2400,
        z: Math.random() * 1800 + 80,
        size: Math.random() * 2.2 + 1,
        color: ['#fff4e0', '#ffd166', '#fbcfe8', '#c4b5fd', '#ffffff', '#fed7aa'][i % 6],
        twinkleSpeed: Math.random() * 0.03 + 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // 2. 3D Polyhedra Definitions
    // A. Base Octahedron (6 vertices, 8 faces)
    const octaVertices = [
      [0, -1, 0], [1, 0, 0], [0, 0, 1],
      [-1, 0, 0], [0, 0, -1], [0, 1, 0],
    ]
    const octaFaces = [
      [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
      [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4],
    ]

    // B. Base Icosahedron (12 vertices, 20 faces) - Sparkling 3D Gemstone
    const PHI = (1 + Math.sqrt(5)) / 2
    const NORM = Math.sqrt(1 + PHI * PHI)
    const p1 = 1 / NORM
    const p2 = PHI / NORM

    const icoVertices = [
      [-p1, p2, 0], [p1, p2, 0], [-p1, -p2, 0], [p1, -p2, 0],
      [0, -p1, p2], [0, p1, p2], [0, -p1, -p2], [0, p1, -p2],
      [p2, 0, -p1], [p2, 0, p1], [-p2, 0, -p1], [-p2, 0, p1],
    ]
    const icoFaces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ]

    // 3. Floating 3D Crystals
    const crystals = [
      // 3D Icosahedron Rose Quartz (Large left)
      { type: 'ico', x: -340, y: -210, z: 620, size: 68, rx: 0.2, ry: 0.3, rz: 0.1, drx: 0.007, dry: 0.011, drz: 0.005, color: [244, 114, 182] },
      // 3D Icosahedron Champagne Topaz (Right upper)
      { type: 'ico', x: 390, y: -160, z: 750, size: 75, rx: 0.6, ry: 0.2, rz: 0.4, drx: -0.005, dry: 0.009, drz: 0.007, color: [251, 191, 36] },
      // 3D Octahedron Amethyst Crystal (Bottom left)
      { type: 'octa', x: -360, y: 320, z: 900, size: 70, rx: 0.1, ry: 0.8, rz: 0.2, drx: 0.008, dry: -0.006, drz: 0.004, color: [192, 132, 252] },
      // 3D Octahedron Celestial Diamond (Bottom right)
      { type: 'octa', x: 350, y: 390, z: 720, size: 62, rx: 0.7, ry: 0.4, rz: 0.3, drx: -0.006, dry: 0.01, drz: -0.005, color: [253, 224, 71] },
      // 3D Icosahedron Soft Morganite (Center upper)
      { type: 'ico', x: -40, y: -440, z: 1050, size: 88, rx: 0.3, ry: 0.6, rz: 0.5, drx: 0.004, dry: 0.006, drz: 0.003, color: [249, 168, 212] },
      // 3D Octahedron Emerald Crystal (Far depth)
      { type: 'octa', x: 260, y: 120, z: 1250, size: 95, rx: 0.4, ry: 0.5, rz: 0.6, drx: 0.003, dry: -0.005, drz: 0.004, color: [52, 211, 153] },
    ]

    // 4. 3D Orbital Rings with Starlight Beads
    const ringOrbits = [
      { radius: 250, tiltX: 1.15, tiltY: 0.35, rotZ: 0, rotSpeed: 0.0028, color: 'rgba(232, 199, 157, 0.26)', beads: 9 },
      { radius: 380, tiltX: 0.75, tiltY: -0.65, rotZ: 0.5, rotSpeed: -0.0018, color: 'rgba(244, 114, 182, 0.18)', beads: 14 },
    ]

    // 5. Parallax Camera & Interactive Touch Coordinates
    let targetAngleX = 0
    let targetAngleY = 0
    let camAngleX = 0
    let camAngleY = 0
    let scrollOffset = 0
    let touchImpulseX = 0
    let touchImpulseY = 0

    const onPointerMove = e => {
      targetAngleX = (e.clientX / width - 0.5) * 0.42
      targetAngleY = (e.clientY / height - 0.5) * 0.32
      touchImpulseX += (e.movementX || 0) * 0.0003
      touchImpulseY += (e.movementY || 0) * 0.0003
    }

    const onScroll = () => {
      scrollOffset = window.scrollY || document.documentElement.scrollTop
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    const onOrientation = e => {
      if (e.gamma !== null && e.beta !== null) {
        targetAngleX = Math.max(-0.5, Math.min(0.5, (e.gamma / 45) * 0.42))
        targetAngleY = Math.max(-0.4, Math.min(0.4, ((e.beta - 40) / 45) * 0.32))
      }
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onOrientation, { passive: true })
    }

    const fov = 780
    let animId = null

    // 3D vector rotation helper
    function rotate3D(x, y, z, rx, ry, rz) {
      const cosX = Math.cos(rx), sinX = Math.sin(rx)
      const y1 = y * cosX - z * sinX
      const z1 = z * cosX + y * sinX

      const cosY = Math.cos(ry), sinY = Math.sin(ry)
      const x2 = x * cosY + z1 * sinY
      const z2 = z1 * cosY - x * sinY

      const cosZ = Math.cos(rz), sinZ = Math.sin(rz)
      const x3 = x2 * cosZ - y1 * sinZ
      const y3 = y1 * cosZ + x2 * sinZ

      return [x3, y3, z2]
    }

    // Directional light vector in world space (upper-left-front)
    const LIGHT_DIR = [0.45, -0.65, 0.61]
    const lightLen = Math.hypot(LIGHT_DIR[0], LIGHT_DIR[1], LIGHT_DIR[2])
    const L = [LIGHT_DIR[0] / lightLen, LIGHT_DIR[1] / lightLen, LIGHT_DIR[2] / lightLen]

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Smooth camera interpolation + impulse decay
      touchImpulseX *= 0.92
      touchImpulseY *= 0.92
      camAngleX += (targetAngleX + touchImpulseX - camAngleX) * 0.05
      camAngleY += (targetAngleY + touchImpulseY - camAngleY) * 0.05

      const cx = width / 2
      const cy = height / 2
      const now = performance.now()

      // Scroll influences camera altitude
      const scrollYCam = (scrollOffset * 0.25) % 1800

      // A. Draw 3D Cosmic Nebula Atmosphere
      const grad1 = ctx.createRadialGradient(
        cx + camAngleX * 260,
        cy * 0.72 - (scrollOffset * 0.08) % 450,
        50,
        cx,
        cy,
        Math.max(width, height) * 0.85
      )
      grad1.addColorStop(0, 'rgba(92, 33, 148, 0.28)') // Deep royal cosmic purple
      grad1.addColorStop(0.42, 'rgba(190, 24, 93, 0.13)') // Aurora rose
      grad1.addColorStop(0.78, 'rgba(13, 148, 136, 0.07)') // Emerald veil
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, width, height)

      // B. Draw 3D Parametric Cosmic Aurora Ribbon
      ctx.save()
      const ribbonSteps = 32
      const ribbonPoints = []
      const ribbonTime = now * 0.0006

      for (let s = 0; s <= ribbonSteps; s++) {
        const u = s / ribbonSteps
        const rx = (u - 0.5) * 1600
        const ry = Math.sin(u * 4.2 + ribbonTime) * 180 + Math.cos(ribbonTime * 0.7) * 70
        const rz = 850 + Math.cos(u * 5.1 + ribbonTime * 0.9) * 320

        const [tx, ty, tz] = rotate3D(rx, ry - scrollYCam * 0.35, rz, camAngleY * 0.4, camAngleX * 0.4, 0)
        if (tz > 80) {
          const sc = fov / (fov + tz)
          ribbonPoints.push({
            x: cx + tx * sc,
            y: cy + ty * sc,
            scale: sc,
            alpha: Math.sin(u * Math.PI) * 0.16 * sc,
          })
        }
      }

      if (ribbonPoints.length > 2) {
        ctx.beginPath()
        ctx.moveTo(ribbonPoints[0].x, ribbonPoints[0].y)
        for (let s = 1; s < ribbonPoints.length - 1; s++) {
          const xc = (ribbonPoints[s].x + ribbonPoints[s + 1].x) / 2
          const yc = (ribbonPoints[s].y + ribbonPoints[s + 1].y) / 2
          ctx.quadraticCurveTo(ribbonPoints[s].x, ribbonPoints[s].y, xc, yc)
        }
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.14)'
        ctx.lineWidth = 14
        ctx.lineCap = 'round'
        ctx.stroke()

        // Inner glowing core
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.22)'
        ctx.lineWidth = 2.5
        ctx.stroke()
      }
      ctx.restore()

      // C. Render 3D Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        let sz = s.z - (now * 0.016) % 1700
        if (sz <= 30) sz += 1700

        const [rx, ry, rz] = rotate3D(s.x, s.y - scrollYCam * 0.5, sz, camAngleY, camAngleX, 0)
        if (rz <= 50) continue

        const scale = fov / (fov + rz)
        const px = cx + rx * scale
        const py = cy + ry * scale

        if (px < -60 || px > width + 60 || py < -60 || py > height + 60) continue

        const twinkle = Math.sin(now * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65
        const starAlpha = Math.max(0, Math.min(1, scale * 1.7 * twinkle))

        ctx.save()
        ctx.globalAlpha = starAlpha
        ctx.fillStyle = s.color

        const renderRadius = Math.max(0.7, s.size * scale * 1.85)

        if (scale > 0.88) {
          ctx.shadowColor = s.color
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(px, py, renderRadius, 0, Math.PI * 2)
          ctx.fill()

          // 4-point sparkle cross
          ctx.strokeStyle = s.color
          ctx.lineWidth = 1
          ctx.beginPath()
          const flare = renderRadius * 3.8
          ctx.moveTo(px - flare, py)
          ctx.lineTo(px + flare, py)
          ctx.moveTo(px, py - flare)
          ctx.lineTo(px, py + flare)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(px, py, renderRadius, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // D. Render 3D Orbital Rings with Glowing Beads
      for (const ring of ringOrbits) {
        ring.rotZ += ring.rotSpeed

        ctx.save()
        ctx.translate(cx + camAngleX * 85, cy + camAngleY * 85)
        ctx.strokeStyle = ring.color
        ctx.lineWidth = 1.2
        ctx.beginPath()

        const steps = 72
        for (let j = 0; j <= steps; j++) {
          const theta = (j / steps) * Math.PI * 2
          const [rx, ry] = rotate3D(
            Math.cos(theta) * ring.radius,
            Math.sin(theta) * ring.radius,
            0,
            ring.tiltX + camAngleY * 0.5,
            ring.tiltY + camAngleX * 0.5,
            ring.rotZ
          )
          if (j === 0) ctx.moveTo(rx, ry)
          else ctx.lineTo(rx, ry)
        }
        ctx.stroke()

        // Orbiting glowing beads along the ring
        for (let b = 0; b < ring.beads; b++) {
          const beadTheta = ((b / ring.beads) * Math.PI * 2) + ring.rotZ
          const [bx, by, bz] = rotate3D(
            Math.cos(beadTheta) * ring.radius,
            Math.sin(beadTheta) * ring.radius,
            0,
            ring.tiltX + camAngleY * 0.5,
            ring.tiltY + camAngleX * 0.5,
            ring.rotZ
          )

          const beadAlpha = Math.max(0.18, (bz + ring.radius) / (ring.radius * 2))
          ctx.globalAlpha = beadAlpha
          ctx.fillStyle = '#fff0d4'
          ctx.shadowColor = '#ffd166'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(bx, by, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // E. Render 3D Floating Crystals (Polyhedra with specular lighting)
      for (const c of crystals) {
        c.rx += c.drx + touchImpulseY * 0.05
        c.ry += c.dry + touchImpulseX * 0.05
        c.rz += c.drz

        const crystalY = c.y - (scrollOffset * 0.2) % 1400
        const [cx3d, cy3d, cz3d] = rotate3D(c.x, crystalY, c.z, camAngleY * 0.6, camAngleX * 0.6, 0)

        if (cz3d <= 100) continue
        const cScale = fov / (fov + cz3d)
        const screenCX = cx + cx3d * cScale
        const screenCY = cy + cy3d * cScale

        const baseVertices = c.type === 'ico' ? icoVertices : octaVertices
        const baseFaces = c.type === 'ico' ? icoFaces : octaFaces

        // Transform vertices into 3D world/screen coords
        const transformed = baseVertices.map(v => {
          const [vx, vy, vz] = rotate3D(
            v[0] * c.size,
            v[1] * c.size,
            v[2] * c.size,
            c.rx,
            c.ry,
            c.rz
          )
          return {
            x3d: vx,
            y3d: vy,
            z3d: vz,
            sx: screenCX + vx * cScale,
            sy: screenCY + vy * cScale,
          }
        })

        // Sort faces by depth (Painter's algorithm)
        const sortedFaces = baseFaces.map(face => {
          const v0 = transformed[face[0]]
          const v1 = transformed[face[1]]
          const v2 = transformed[face[2]]

          const avgZ = (v0.z3d + v1.z3d + v2.z3d) / 3

          // Normal vector in 3D
          const ax = v1.x3d - v0.x3d, ay = v1.y3d - v0.y3d, az = v1.z3d - v0.z3d
          const bx = v2.x3d - v0.x3d, by = v2.y3d - v0.y3d, bz = v2.z3d - v0.z3d
          let nx = ay * bz - az * by
          let ny = az * bx - ax * bz
          let nz = ax * by - ay * bx
          const nlen = Math.hypot(nx, ny, nz) || 1
          nx /= nlen; ny /= nlen; nz /= nlen

          // Ensure normal points outward from center
          const cxFace = (v0.x3d + v1.x3d + v2.x3d) / 3
          const cyFace = (v0.y3d + v1.y3d + v2.y3d) / 3
          const czFace = (v0.z3d + v1.z3d + v2.z3d) / 3
          if (nx * cxFace + ny * cyFace + nz * czFace < 0) {
            nx = -nx; ny = -ny; nz = -nz
          }

          // Backface culling: front facing if normal points towards screen (nz > 0)
          const isFront = nz > -0.05

          // Lighting calculations: Diffuse + Blinn-Phong Specular
          const dot = nx * L[0] + ny * L[1] + nz * L[2]
          const diffuse = Math.max(0.18, (dot + 1) * 0.45)

          // Specular glint
          const hx = L[0], hy = L[1], hz = L[2] + 1
          const hlen = Math.hypot(hx, hy, hz) || 1
          const spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hlen), 18)

          return { v0, v1, v2, avgZ, isFront, diffuse, spec }
        }).sort((a, b) => a.avgZ - b.avgZ)

        // Draw crystal faces
        const [r, g, b] = c.color
        const alpha = Math.min(0.68, cScale * 1.25)

        for (const { v0, v1, v2, isFront, diffuse, spec } of sortedFaces) {
          if (!isFront) continue

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(v0.sx, v0.sy)
          ctx.lineTo(v1.sx, v1.sy)
          ctx.lineTo(v2.sx, v2.sy)
          ctx.closePath()

          // Color with diffuse lighting and specular sheen
          const facetGrad = ctx.createLinearGradient(v0.sx, v0.sy, v2.sx, v2.sy)
          const redVal = Math.min(255, Math.floor(r * diffuse + spec * 180))
          const greenVal = Math.min(255, Math.floor(g * diffuse + spec * 180))
          const blueVal = Math.min(255, Math.floor(b * diffuse + spec * 180))

          facetGrad.addColorStop(0, `rgba(${Math.min(255, redVal + 40)}, ${Math.min(255, greenVal + 40)}, ${Math.min(255, blueVal + 40)}, ${alpha * 1.2})`)
          facetGrad.addColorStop(1, `rgba(${redVal}, ${greenVal}, ${blueVal}, ${alpha * 0.55})`)

          ctx.fillStyle = facetGrad
          ctx.fill()

          // Crystal glowing facet edges
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.85, alpha * 0.8 + spec * 0.5)})`
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.restore()
        }

        // Center crystal diamond twinkle
        ctx.save()
        ctx.globalAlpha = Math.min(0.85, cScale * 1.6)
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = `rgb(${c.color.join(',')})`
        ctx.shadowBlur = 16
        ctx.beginPath()
        ctx.arc(screenCX, screenCY, 2.8 * cScale, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', onOrientation)
      }
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="cosmic-3d-canvas"
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
