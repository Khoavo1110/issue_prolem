import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { birthday } from './content'

export function SecretTicket({ onReveal }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const distance = useRef(0)
  const previous = useRef(null)
  const revealedRef = useRef(false)
  const [revealed, setRevealed] = useState(false)

  const reveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setRevealed(true)
    onReveal?.()
    window.dispatchEvent(new CustomEvent('trigger-butterflies-3d', { detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 } }))
  }, [onReveal])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || revealed) return
    const paint = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
      gradient.addColorStop(0, '#f4dfb8')
      gradient.addColorStop(.48, '#cda57b')
      gradient.addColorStop(1, '#f6e5c7')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.strokeStyle = 'rgba(255,255,255,.38)'
      ctx.lineWidth = 1
      for (let x = -rect.height; x < rect.width + rect.height; x += 19) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + rect.height, rect.height)
        ctx.stroke()
      }
      ctx.fillStyle = '#674d3c'
      ctx.textAlign = 'center'
      ctx.font = '600 11px "DM Sans", sans-serif'
      ctx.fillText('✦  MỘT ĐIỀU BÍ MẬT  ✦', rect.width / 2, rect.height / 2 - 26)
      ctx.fillText('DÀNH CHO HẠNH', rect.width / 2, rect.height / 2 - 5)
      ctx.font = 'italic 15px "Playfair Display", Georgia, serif'
      ctx.fillText('Cào lớp ánh vàng', rect.width / 2, rect.height / 2 + 25)
    }
    paint()
    const observer = new ResizeObserver(paint)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [revealed])

  const point = event => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }
  const scratch = event => {
    if (!drawing.current || revealedRef.current) return
    const current = point(event)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const last = previous.current || current
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 42
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(current.x, current.y)
    ctx.stroke()
    distance.current += Math.hypot(current.x - last.x, current.y - last.y)
    previous.current = current
    if (distance.current > event.currentTarget.clientWidth * 2.1) reveal()
  }

  return <div className={`secret-ticket ${revealed ? 'secret-ticket-open' : ''}`} data-testid="secret-ticket">
    <div className="secret-ticket-top"><span>CHỈ DÀNH CHO EM</span><Sparkles size={17} strokeWidth={1.2} /></div>
    <div className="secret-ticket-stage">
      <div className="secret-ticket-message" aria-live="polite"><span aria-hidden="true">♡</span><p>{birthday.secretNote}</p></div>
      {!revealed && <canvas ref={canvasRef} className="secret-ticket-cover" aria-label="Cào để mở lời nhắn bí mật" onPointerDown={event => { if (event.pointerType === 'mouse' && event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); drawing.current = true; previous.current = point(event); scratch(event) }} onPointerMove={scratch} onPointerUp={() => { drawing.current = false; previous.current = null }} onPointerCancel={() => { drawing.current = false; previous.current = null }} />}
    </div>
    <div className="secret-ticket-bottom"><span>{revealed ? 'BÍ MẬT ĐÃ ĐƯỢC MỞ ✦' : 'MỘT CHÚT MAY MẮN ĐANG Ở BÊN TRONG'}</span>{!revealed && <button type="button" onClick={reveal}>Mở ngay</button>}</div>
  </div>
}
