import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight, Check, Heart, Menu, RotateCcw, Volume2, VolumeX, Wind, X } from 'lucide-react'
import { birthday } from './content'
import { useBirthdayMusic } from './useBirthdayMusic'
import { Celebration } from './Celebration'
import { MagicSparkles } from './MagicSparkles'
import { ShootingStars } from './ShootingStars'
import { CandleSmoke } from './CandleSmoke'
import { IntroGiftBox } from './IntroGiftBox'
import { Cosmic3DBackground } from './Cosmic3DBackground'
import { SecretTicket } from './SecretTicket'

const ease = [0.22, 1, 0.36, 1]
const chapters = [['home', 'Dành riêng cho em'], ['universe', 'Một vũ trụ nhỏ'], ['reasons', '10 điều đáng quý'], ['notes', 'Những lời nhắn'], ['letter', 'Bức thư của anh'], ['finale', 'Điều ước của em']]

function Reveal({ children, className = '', delay = 0 }) {
  const reduce = useReducedMotion()
  return <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, delay, ease }}>{children}</motion.div>
}

function Stars({ count = 20 }) {
  return <div className="stars" aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} style={{ '--x': `${(i * 73 + 17) % 100}%`, '--y': `${(i * 41 + 9) % 100}%`, '--delay': `${i % 7 * -.8}s`, '--size': i % 5 === 0 ? '3px' : '2px' }} />)}</div>
}

function Cake3DHelix() {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId
    const count = 18
    const beads = []
    for (let i = 0; i < count; i++) {
      beads.push({
        phase: (i / count) * Math.PI * 2,
        speed: 0.0016,
        radiusX: 185,
        radiusY: 42,
        radiusZ: 95,
        color: ['#fde047', '#f472b6', '#fed7aa', '#c084fc', '#ffffff'][i % 5],
        size: Math.random() * 2 + 2,
      })
    }
    const render = now => {
      ctx.clearRect(0, 0, 440, 420)
      const cx = 220, cy = 255
      for (const b of beads) {
        const theta = now * b.speed + b.phase
        const x = cx + Math.cos(theta) * b.radiusX
        const z = Math.sin(theta) * b.radiusZ
        const y = cy + Math.sin(theta) * b.radiusY + (z / b.radiusZ) * 16
        const scale = (z + 140) / 235
        const alpha = Math.max(0.18, (z + 95) / 190)

        ctx.save()
        ctx.globalAlpha = Math.min(0.95, alpha)
        ctx.fillStyle = b.color
        ctx.shadowColor = b.color
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(x, y, Math.max(1, b.size * scale), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      animId = requestAnimationFrame(render)
    }
    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={420}
      className="cake-3d-helix-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  )
}

function WishingVortex3D() {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = (canvas.width = 440)
    const h = (canvas.height = 420)
    let animId
    const particles = []
    for (let i = 0; i < 48; i++) {
      particles.push({
        angle: (i / 48) * Math.PI * 6,
        y: 380 - i * 8,
        speed: 0.08,
        radius: 16 + i * 2.6,
        color: ['#ffd166', '#f472b6', '#fff0d4', '#e0aaff'][i % 4],
        size: Math.random() * 2.5 + 2,
      })
    }
    const render = () => {
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      for (const p of particles) {
        p.angle += p.speed
        p.y -= 4
        if (p.y < 0) p.y = 400
        const x = cx + Math.cos(p.angle) * p.radius
        const z = Math.sin(p.angle) * p.radius
        const scale = (z + 180) / 280
        const alpha = Math.max(0.1, Math.min(1, (p.y / 380) * scale))

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, p.y, p.size * scale, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      animId = requestAnimationFrame(render)
    }
    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="wishing-vortex-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
}

function Cake({ extinguished = false }) {
  const id = useId().replace(/:/g, '')
  return <div className={`cake-art ${extinguished ? 'candles-out' : ''}`} role="img" aria-label={extinguished ? 'Những ngọn nến đã tắt. Điều ước đã được gửi đi.' : 'Chiếc bánh kem với ba ngọn nến đang sáng'}>
    <div className="cake-aura" /><span className="cake-star cake-star-one">✦</span><span className="cake-star cake-star-two">✧</span>
    {!extinguished && <Cake3DHelix />}
    {extinguished && <CandleSmoke />}
    <svg viewBox="0 0 440 420" fill="none" aria-hidden="true"><defs>
      <linearGradient id={`${id}body`} x1="98" y1="230" x2="355" y2="280" gradientUnits="userSpaceOnUse"><stop stopColor="#e8cda8" /><stop offset=".4" stopColor="#fff0d4" /><stop offset="1" stopColor="#b78c68" /></linearGradient>
      <linearGradient id={`${id}pink`} x1="128" y1="150" x2="328" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#b97670" /><stop offset=".45" stopColor="#e5aca0" /><stop offset="1" stopColor="#955c58" /></linearGradient>
      <linearGradient id={`${id}plate`} x1="62" y1="340" x2="371" y2="346" gradientUnits="userSpaceOnUse"><stop stopColor="#8c7760" /><stop offset=".5" stopColor="#eed8b5" /><stop offset="1" stopColor="#78634c" /></linearGradient>
      <linearGradient id={`${id}candle`}><stop stopColor="#ac7b48" /><stop offset=".5" stopColor="#f9dc94" /><stop offset="1" stopColor="#c08a4d" /></linearGradient>
      <radialGradient id={`${id}glow`}><stop stopColor="#ffe2a3" stopOpacity=".4" /><stop offset="1" stopColor="#f7bc69" stopOpacity="0" /></radialGradient>
    </defs><ellipse cx="220" cy="365" rx="135" ry="16" fill="#03090b" opacity=".25" />
      <path d="M69 332h302v10c0 17-68 30-151 30S69 359 69 342v-10Z" fill={`url(#${id}plate)`} /><ellipse cx="220" cy="332" rx="151" ry="29" fill="#d7bf9a" /><ellipse cx="220" cy="328" rx="139" ry="25" fill="#efddba" />
      <path d="M106 239h228v73c0 21-51 38-114 38s-114-17-114-38v-73Z" fill={`url(#${id}body)`} /><ellipse cx="220" cy="239" rx="114" ry="34" fill="#f7e6c8" />
      <path d="M106 239c0 16 21 23 26 24v20c0 14 15 14 15 0v-13l29 5v20c0 15 16 15 16 0v-18l49 1v30c0 15 16 15 16 0v-32l31-5v17c0 12 15 12 15 0v-23c16-5 31-15 31-26-24 23-65 28-114 28s-88-8-114-28Z" fill="#fff0d6" />
      <path d="M133 166h174v65c0 17-39 31-87 31s-87-14-87-31v-65Z" fill={`url(#${id}pink)`} /><ellipse cx="220" cy="166" rx="87" ry="28" fill="#f0c5b2" /><ellipse cx="220" cy="163" rx="78" ry="22" fill="#fae0c8" />
      <path d="M133 168c0 13 12 19 22 23v14c0 11 12 11 12 0v-10l29 5v17c0 10 12 10 12 0v-16h28v24c0 11 12 11 12 0v-25l29-4v11c0 11 12 11 12 0v-15c11-5 18-12 18-24-18 19-55 25-87 25s-70-7-87-25Z" fill="#f8d6bd" />
      {[154, 184, 220, 256, 287].map((x, i) => <circle key={x} cx={x} cy={318 + (i % 2 ? 2 : -2)} r="3.2" fill="#b68b59" />)}
      {[172, 220, 268].map((x, i) => <g key={x}><rect x={x - 4} y={i === 1 ? 96 : 110} width="8" height={i === 1 ? 64 : 50} rx="2" fill={`url(#${id}candle)`} /><path d={`M${x} ${i === 1 ? 96 : 110}v-7`} stroke="#6e4835" strokeWidth="2" /><g className="flame" style={{ '--delay': `${i * -.23}s`, transformOrigin: `${x}px ${i === 1 ? 88 : 102}px` }}><circle cx={x} cy={i === 1 ? 79 : 93} r="40" fill={`url(#${id}glow)`} /><path d={`M${x} ${i === 1 ? 62 : 76}c-2 8-8 13-7 21 1 10 13 10 14 0 1-7-5-13-7-21Z`} fill="#ffd78d" /><ellipse cx={x} cy={i === 1 ? 84 : 98} rx="3" ry="6" fill="#fff4cf" /></g></g>)}
    </svg><span className="cake-orbit-note">chiếc bánh sinh nhật cho Hạnh</span>
  </div>
}

function Intro({ onOpen }) {
  const button = useRef(null)
  const reduce = useReducedMotion()
  const [opening, setOpening] = useState(false)
  useEffect(() => { button.current?.focus({ preventScroll: true }) }, [])

  const handleOpen = () => {
    if (opening) return
    setOpening(true)
    setTimeout(() => {
      onOpen()
    }, 380)
  }

  return <motion.div className="intro" role="dialog" aria-modal="true" aria-labelledby="intro-title" exit={{ opacity: 0, y: reduce ? 0 : -30 }} transition={{ duration: 0.65, ease }}><Stars count={22} /><div className="intro-frame" /><motion.div className="intro-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}><span className="eyebrow">MỘT MÓN QUÀ NHỎ · MỘT NGÀY THẬT LỚN</span><IntroGiftBox isOpen={opening} onTrigger={handleOpen} /><h1 id="intro-title">Hôm nay là<br /><em>ngày của Hạnh.</em></h1><p>Anh làm món quà nhỏ này<br />để chúc mừng sinh nhật em.</p><button ref={button} className="button button-gold" data-testid="open-gift" onClick={handleOpen}>Mở món quà <ArrowRight size={18} /></button><span className="intro-sound"><Volume2 size={13} /> Có nhạc vui. Có vài điều bí mật.</span></motion.div><span className="intro-signature">Từ một người anh luôn cổ vũ {birthday.name}</span></motion.div>
}

function Hero({ onChime }) {
  const [surprise, setSurprise] = useState(-1)
  const messages = ['Một chiếc bánh, một nghìn lời chúc cho em.', 'Hôm nay em được quyền vui thật nhiều nhé.', 'Và thêm một chút phép màu chỉ dành cho Hạnh.']
  const cakeRef = useRef(null)
  const delight = () => {
    setSurprise(current => (current + 1) % messages.length)
    onChime()
    window.dispatchEvent(new CustomEvent('trigger-supernova-3d', { detail: { x: window.innerWidth / 2, y: window.innerHeight * .55 } }))
  }
  const tilt = event => {
    if (event.pointerType === 'touch' || !cakeRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    cakeRef.current.style.setProperty('--cake-ry', `${((event.clientX - rect.left) / rect.width - .5) * 22}deg`)
    cakeRef.current.style.setProperty('--cake-rx', `${(.5 - (event.clientY - rect.top) / rect.height) * 14}deg`)
  }
  return <section className="hero chapter" id="home" data-chapter="0"><Stars /><div className="hero-lines" aria-hidden="true" /><header className="masthead page-width"><a href="#home" className="monogram" aria-label="Về đầu trang">h<span>✦</span></a><span>MỘT NGÀY DÀNH RIÊNG CHO EM</span><Heart size={17} strokeWidth={1.2} /></header><div className="hero-layout page-width"><Reveal className="hero-copy"><span className="eyebrow hero-kicker">CHÚC MỪNG SINH NHẬT</span><h1 className="hero-title" id="main-title" tabIndex={-1}><span>{birthday.name.replace(birthday.shortName, '').trim()}</span><em>{birthday.shortName}<i>.</i></em></h1><p>Chúc em tuổi mới thật nhiều niềm vui<br />và những điều tốt lành.</p><span className="hero-dedication">gửi em một ngày sinh nhật thật đáng nhớ ✦</span></Reveal><Reveal className="hero-visual" delay={0.12}><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><button ref={cakeRef} type="button" className="hero-cake-button" data-testid="hero-cake" onClick={delight} onPointerMove={tilt} onPointerLeave={event => { event.currentTarget.style.setProperty('--cake-ry', '0deg'); event.currentTarget.style.setProperty('--cake-rx', '0deg') }} aria-label="Chạm vào bánh sinh nhật để nhận lời chúc bất ngờ"><Cake /></button><span className="hero-caption"><span>✦</span> {surprise < 0 ? 'Chạm chiếc bánh để nhận lời chúc bất ngờ.' : messages[surprise]}</span></Reveal></div><a href="#universe" className="scroll-cue"><span>CHUYẾN ĐI BẮT ĐẦU Ở ĐÂY</span><ArrowDown size={16} /></a></section>
}

const wishes = [['Niềm vui', 'Mong em có những ngày vui đến mức quên cả nhìn điện thoại.'], ['Bình yên', 'Mong em được thở thật nhẹ, ngủ thật ngon và luôn thấy lòng mình yên.'], ['May mắn', 'Mong em gặp nhiều người tốt, nhiều cơ hội hay và luôn tin vào mình.']]

function Universe({ onChime }) {
  const [wish, setWish] = useState(0)
  const [touched, setTouched] = useState(false)
  const [visited, setVisited] = useState([])
  const discover = i => {
    setWish(i)
    setTouched(true)
    onChime()
    setVisited(current => current.includes(i) ? current : [...current, i])
    if (visited.length === 2 && !visited.includes(i)) window.dispatchEvent(new CustomEvent('trigger-supernova-3d', { detail: { x: window.innerWidth * .7, y: window.innerHeight * .45 } }))
  }
  return <section className="universe chapter" id="universe" data-chapter="1"><div className="page-width universe-layout"><Reveal className="section-heading"><span className="eyebrow">01 / NHỮNG ĐIỀU ĐẸP ĐẼ</span><h2>Cả vũ trụ này<br /><em>đứng về phía em.</em></h2><p>Anh đã gửi ba điều ước lên những vì sao.<br />Chạm cả ba để mở một điều anh giấu.</p></Reveal><div className="wish-experience"><motion.div className="moon-stage" whileHover={{ rotateX: 6, rotateY: -8, scale: 1.03 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}><div className="moon-orbit" /><div className="moon-orbit moon-orbit-outer" /><svg className="moon-illustration" viewBox="0 0 300 300" fill="none" aria-hidden="true"><defs><linearGradient id="moonGold" x1="48" y1="45" x2="239" y2="247" gradientUnits="userSpaceOnUse"><stop stopColor="#f6ddaf" /><stop offset="1" stopColor="#bf9364" /></linearGradient></defs><path d="M213 46C151 50 109 94 109 150s40 95 95 104C120 285 48 228 48 151 48 76 112 30 177 38c13 1 25 4 36 8Z" fill="url(#moonGold)" /><path d="M136 184c-12-15-16-44-9-68l16 19c13-5 26-5 40 0l15-19c8 24 7 55-7 71" fill="#f4ead8" /><ellipse cx="164" cy="188" rx="36" ry="38" fill="#f4ead8" /><path d="M190 207c34-7 44 21 26 26-13 4-24-7-33-7" stroke="#e8d7bd" strokeWidth="12" strokeLinecap="round" /><path d="m140 158 9 4 8-4m17 0 9 4 8-4" stroke="#9b8474" strokeWidth="2" strokeLinecap="round" /><path d="M133 170h-12m14 7-10 3m65-10h13m-15 7 11 3" stroke="#bdac97" strokeWidth="1.5" strokeLinecap="round" /><circle cx="89" cy="145" r="10" fill="#b28b5d" opacity=".2" /><circle cx="100" cy="201" r="17" fill="#b28b5d" opacity=".16" /></svg>{wishes.map(([label], i) => <button key={label} className={`wish-star wish-star-${i} ${wish === i && touched ? 'wish-selected' : ''} ${visited.includes(i) ? 'wish-visited' : ''}`} onClick={() => discover(i)} aria-label={`Ngôi sao ${label}`} aria-pressed={wish === i && touched}><span aria-hidden="true">✦</span><small>{label}</small></button>)}<span className="moon-caption">cả mặt trăng cũng đến chung vui</span></motion.div><div className="wish-message" aria-live="polite"><span className="tiny-star">✧</span><AnimatePresence mode="wait" initial={false}><motion.p key={wish} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>{wishes[wish][1]}</motion.p></AnimatePresence><div className="wish-progress" aria-label={`Đã chạm ${visited.length} trên 3 ngôi sao`}>{wishes.map((_, i) => <i key={i} className={visited.includes(i) ? 'lit' : ''} />)}</div>{visited.length === 3 && <motion.div className="constellation-secret" initial={{ opacity: 0, y: 14, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }}><span>✦ BÍ MẬT CỦA BA VÌ SAO ✦</span><strong>Dù đi đâu, anh vẫn mong em tự tin và gặp nhiều điều tốt đẹp.</strong></motion.div>}</div></div></div></section>
}

function useCarousel(count) {
  const track = useRef(null)
  const frame = useRef(null)
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const read = () => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const element = track.current
      if (!element) return
      const center = element.getBoundingClientRect().left + element.clientWidth / 2
      let nearest = 0
      let distance = Infinity
      Array.from(element.children).forEach((card, i) => { const rect = card.getBoundingClientRect(); const delta = Math.abs(rect.left + rect.width / 2 - center); if (delta < distance) { distance = delta; nearest = i } })
      setActive(nearest)
    })
  }
  const go = index => {
    const element = track.current
    if (!element) return
    const card = element.children[Math.max(0, Math.min(count - 1, index))]
    const cardRect = card.getBoundingClientRect()
    const trackRect = element.getBoundingClientRect()
    element.scrollTo({ left: element.scrollLeft + cardRect.left - trackRect.left - (element.clientWidth - cardRect.width) / 2, behavior: reduce ? 'instant' : 'smooth' })
  }
  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current) }, [])
  return { track, active, read, go }
}

function Reasons() {
  const carousel = useCarousel(birthday.reasons.length)
  return <section className="reasons chapter" id="reasons" data-chapter="2"><Reveal className="section-heading page-width"><span className="eyebrow">02 / MỘT DANH SÁCH CHƯA ĐẦY ĐỦ</span><h2>Mười điều đáng quý.<br /><em>Anh kể em nghe nhé.</em></h2><p>Mỗi điều đều đáng nhắc tới trong ngày sinh nhật em.</p></Reveal><div className="reason-track" ref={carousel.track} onScroll={carousel.read} tabIndex={0} role="region" aria-label="Mười điều đáng quý ở em. Vuốt ngang để xem tiếp." onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); carousel.go(carousel.active + (event.key === 'ArrowRight' ? 1 : -1)) } }}>{birthday.reasons.map(([number, title, description], i) => <article key={number} data-testid="reason-card" className={`reason-card reason-tone-${i % 3} ${carousel.active === i ? 'reason-current' : ''}`} aria-label={`Điều ${number}: ${title}`}><div className="card-3d-hologram-sheen" /><div className="reason-card-top"><span>MỘT ĐIỀU ĐÁNG QUÝ</span><Heart size={17} strokeWidth={1.1} /></div><span className="reason-number" aria-hidden="true">{number}</span><div className="reason-card-copy"><h3>{title}</h3><p>{description}</p></div><span className="reason-flower" aria-hidden="true">✳</span></article>)}</div><div className="carousel-controls page-width"><button className="circle-button" onClick={() => carousel.go(carousel.active - 1)} disabled={carousel.active === 0} aria-label="Điều trước"><ArrowLeft size={18} /></button><span className="carousel-count"><b>{String(carousel.active + 1).padStart(2, '0')}</b><i />10</span><button className="circle-button" data-testid="reason-next" onClick={() => carousel.go(carousel.active + 1)} disabled={carousel.active === 9} aria-label="Điều tiếp theo"><ArrowRight size={18} /></button></div><span className="swipe-hint">vuốt ngang, còn nhiều điều hay →</span></section>
}

function Note({ note, index, onChime }) {
  const [flipped, setFlipped] = useState(false)
  return <button data-testid="memory-card" className={`note-card note-${index} ${flipped ? 'note-flipped' : ''}`} aria-pressed={flipped} aria-label={flipped ? `${note.back} Chạm để gấp thiệp.` : `${note.front}. Chạm để đọc.`} onClick={() => { setFlipped(!flipped); if (!flipped) onChime() }}><span className="note-inner"><span className="note-face note-front" aria-hidden={flipped}><div className="card-3d-hologram-sheen" /><span className="note-top">LƯU LẠI CHO MỘT NGÀY / 0{index + 1}</span><span className="note-drawing" aria-hidden="true">{['☀', '✧', '☾'][index]}</span><strong>{note.front}</strong><span className="note-bottom">CÓ MỘT ĐIỀU Ở MẶT SAU <RotateCcw size={14} /></span></span><span className="note-face note-back" aria-hidden={!flipped}><div className="card-3d-hologram-sheen" /><span className="note-top">GỬI {birthday.shortName.toUpperCase()}, CỐ LÊN NHÉ.</span><Heart className="note-heart" size={36} strokeWidth={1} /><strong>{note.back}</strong><span className="note-bottom">CẤT VÀO TÚI NHÉ <Check size={15} /></span></span></span></button>
}

function Notes({ onChime }) {
  return <section className="notes chapter" id="notes" data-chapter="3"><div className="page-width"><Reveal className="section-heading"><span className="eyebrow">03 / BỎ TÚI VÀI LỜI ĐỘNG VIÊN</span><h2>Ba mảnh giấy nhỏ.<br /><em>Đúng lúc em cần.</em></h2><p>Chạm để mở. Vuốt để xem tấm tiếp theo.</p></Reveal></div><div className="notes-track">{birthday.notes.map((note, i) => <Note key={note.front} note={note} index={i} onChime={onChime} />)}</div><div className="notes-secret-wrap page-width"><div className="notes-secret-heading"><span>VÀ CÒN MỘT ĐIỀU NỮA...</span><p>Một tấm thiệp chỉ mở ra dưới ngón tay em.</p></div><SecretTicket onReveal={onChime} /></div><p className="notes-postscript">P.S. Anh còn giấu một bức thư ở bên dưới.</p></section>
}

function Letter({ onChime }) {
  const [open, setOpen] = useState(false)
  const paper = useRef(null)
  return <section className="letter chapter" id="letter" data-chapter="4"><div className="page-width letter-layout"><Reveal className="section-heading"><span className="eyebrow">04 / TỪ ANH, GỬI ĐẾN EM</span><h2>Một lời chúc nhỏ,<br /><em>anh gửi đến em.</em></h2><p>Ở đây không có gì vội.<br />Em cứ đọc từ từ thôi.</p><span className="letter-ornament" aria-hidden="true">✦</span></Reveal><div className="letter-container"><AnimatePresence mode="wait" initial={false}>{!open ? <motion.button data-testid="open-letter" className="envelope card-3d-hologram-sheen" key="envelope" onClick={() => { setOpen(true); onChime(); if (typeof window !== 'undefined') { window.dispatchEvent(new CustomEvent('trigger-butterflies-3d', { detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 } })); window.dispatchEvent(new CustomEvent('trigger-meteor-shower-3d', { detail: { super: false } })) } }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} aria-label="Mở bức thư anh gửi Hạnh"><span className="envelope-inscription">Gửi {birthday.shortName},</span><span className="envelope-fold" /><span className="wax-seal">h<span>♡</span></span><span className="envelope-label">CHẠM ĐỂ MỞ THƯ <ArrowRight size={15} /></span></motion.button> : <motion.div data-testid="letter-paper" className="letter-paper" ref={paper} key="paper" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }} onAnimationComplete={() => paper.current?.focus({ preventScroll: true })} tabIndex={-1}><div className="paper-header"><span>MẤY DÒNG NHÂN NGÀY SINH NHẬT</span><Heart size={16} strokeWidth={1.2} /></div>{birthday.letter.map((paragraph, i) => <p key={i} className={i === 0 ? 'salutation' : ''}>{paragraph}</p>)}<div className="signature"><span>Chúc em luôn vui,</span><strong>{birthday.from}</strong></div><button className="text-button close-letter" onClick={() => setOpen(false)}>Gấp thư lại <ArrowDown size={14} className="arrow-up" /></button></motion.div>}</AnimatePresence></div></div></section>
}

function Finale({ onChime }) {
  const [stage, setStage] = useState('ready')
  const [holding, setHolding] = useState(false)
  const [count, setCount] = useState(3)
  const [wishText, setWishText] = useState('')
  const holdTimer = useRef(null)
  const complete = useCallback(() => { clearTimeout(holdTimer.current); holdTimer.current = null; setHolding(false); setStage(current => current === 'ready' ? 'blown' : current) }, [])
  const cancelHold = useCallback(() => { clearTimeout(holdTimer.current); holdTimer.current = null; setHolding(false) }, [])
  const startHold = event => { if (stage !== 'ready' || (event.pointerType === 'mouse' && event.button !== 0)) return; event.currentTarget.setPointerCapture(event.pointerId); setHolding(true); holdTimer.current = setTimeout(complete, 1400) }
  useEffect(() => { const cancelWhenHidden = () => { if (document.hidden) cancelHold() }; document.addEventListener('visibilitychange', cancelWhenHidden); return () => { clearTimeout(holdTimer.current); document.removeEventListener('visibilitychange', cancelWhenHidden) } }, [cancelHold])
  useEffect(() => {
    if (stage === 'blown') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger-supernova-3d', { detail: { x: window.innerWidth / 2, y: window.innerHeight * 0.4 } }))
        window.dispatchEvent(new CustomEvent('trigger-meteor-shower-3d', { detail: { super: true } }))
      }
      const timer = setTimeout(() => { setCount(3); setStage('counting') }, 650); 
      return () => clearTimeout(timer)
    }
    if (stage === 'counting') {
      const timer = setTimeout(() => {
        if (count > 1) setCount(count - 1);
        else {
          setStage('revealed');
          onChime();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('trigger-meteor-shower-3d', { detail: { super: true } }))
            window.dispatchEvent(new CustomEvent('trigger-butterflies-3d', { detail: { x: window.innerWidth / 2, y: window.innerHeight * 0.3 } }))
          }
        }
      }, 720);
      return () => clearTimeout(timer)
    }
  }, [stage, count, onChime])
  return <section className={`finale chapter finale-${stage}`} data-testid="finale" data-stage={stage} id="finale" data-chapter="5">
    <Stars count={24} />{stage === 'revealed' && <Celebration />}
    <div className="page-width finale-inner"><AnimatePresence mode="wait">
      {(stage === 'ready' || stage === 'blown') && <motion.div key="wish" className="finale-wish" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
        <span className="eyebrow">05 / ĐẾN LƯỢT ĐIỀU ƯỚC CỦA EM</span>
        <h2>Một ngọn nến.<br /><em>Một điều ước.</em></h2>
        <p>Nghĩ đến điều em mong nhất.<br />Rồi thổi nến đón tuổi mới nhé.</p>
        <label className="wish-input-label" htmlFor="birthday-wish">Viết điều ước của em <span>(có thể để trống)</span></label>
        <input id="birthday-wish" className="wish-input" data-testid="wish-input" value={wishText} onChange={event => setWishText(event.target.value)} maxLength={80} placeholder="Mình ước rằng..." autoComplete="off" disabled={stage !== 'ready'} />
        <div className="finale-cake"><Cake extinguished={stage === 'blown'} />{stage === 'blown' && <WishingVortex3D />}</div>
        <button className={`button hold-button ${holding ? 'is-holding' : ''}`} data-testid="blow-candles" onPointerDown={startHold} onPointerUp={cancelHold} onPointerCancel={cancelHold} onLostPointerCapture={cancelHold} onBlur={cancelHold} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); complete() } }} disabled={stage !== 'ready'}><span className="hold-fill" /><Wind size={19} /><span>{stage === 'blown' ? 'Điều ước đang bay lên…' : holding ? 'Thêm một chút nữa…' : 'Giữ để thổi nến'}</span></button>
        <button className="tap-alternative" onClick={complete} disabled={stage !== 'ready'}>hoặc chạm vào đây để gửi điều ước</button>
      </motion.div>}
      {stage === 'counting' && <motion.div key="countdown" className="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><span className="eyebrow">VŨ TRỤ ĐANG CHUẨN BỊ ĐIỀU BẤT NGỜ</span><AnimatePresence mode="wait"><motion.strong key={count} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.25 }}>{count}</motion.strong></AnimatePresence><span>cho người đặc biệt nhất hôm nay</span></motion.div>}
      {stage === 'revealed' && <motion.div key="celebration" className="finale-message" data-testid="finale-message" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}><span className="eyebrow"><Check size={13} /> ĐIỀU ƯỚC ĐÃ ĐƯỢC GỬI ĐẾN VŨ TRỤ</span><span className="finale-emblem" aria-hidden="true">✳</span><h2>{birthday.shortName} ơi,<br />hãy luôn<br /><em>rực rỡ.</em></h2><p>Chúc em một tuổi mới khỏe mạnh, nhiều niềm vui, nhiều cơ hội và luôn vững tin vào chính mình.</p>{wishText.trim() && <motion.div className="wish-keepsake" initial={{ opacity: 0, y: 30, rotateX: -18 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: .4, duration: .8 }}><span>✦ ĐIỀU ƯỚC CỦA EM ✦</span><strong>“{wishText.trim()}”</strong><small>đã bay vào vũ trụ tối nay</small></motion.div>}<span className="birthday-signoff">Chúc mừng sinh nhật, {birthday.name} ✦</span><button className="text-button" onClick={() => { setStage('ready'); setCount(3) }}>Ước thêm lần nữa <RotateCcw size={14} /></button></motion.div>}
    </AnimatePresence></div>
  </section>
}

function JourneyDock({ active, music }) {
  const [expanded, setExpanded] = useState(false)
  const trigger = useRef(null)
  return <div className="journey-controls" onKeyDown={event => { if (event.key === 'Escape') { setExpanded(false); trigger.current?.focus() } }}><AnimatePresence>{expanded && <motion.nav className="chapter-menu" id="chapter-menu" aria-label="Các phần của món quà" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}><span>CHUYẾN ĐI CỦA HẠNH</span>{chapters.map(([id, label], i) => <a key={id} href={`#${id}`} aria-current={active === i ? 'location' : undefined} onClick={() => setExpanded(false)}><small>0{i + 1}</small>{label}{active === i && <span>✦</span>}</a>)}</motion.nav>}</AnimatePresence><div className="journey-dock"><button ref={trigger} className="chapter-trigger" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Đóng mục lục' : 'Mở mục lục'} aria-expanded={expanded} aria-controls="chapter-menu">{expanded ? <X size={17} /> : <Menu size={17} />}<span><b>0{active + 1}</b><i>/ 06</i></span><span className="dock-chapter-name">{chapters[active][1]}</span></button><div className="dock-divider" /><button className={`music-toggle ${music.playing ? 'playing' : ''}`} data-testid="music-toggle" onClick={music.toggle} aria-label={music.playing ? 'Tắt nhạc' : 'Bật nhạc'} aria-pressed={music.playing}>{music.playing ? <Volume2 size={17} /> : <VolumeX size={17} />}<span className="equalizer" aria-hidden="true"><i /><i /><i /></span></button></div></div>
}

export default function BirthdayExperience() {
  const [opened, setOpened] = useState(false)
  const [active, setActive] = useState(0)
  const music = useBirthdayMusic()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 35, restDelta: 0.001 })
  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden'
    if (opened) {
      document.title = 'Hôm nay là ngày của Hạnh ✦'
    }
    return () => { document.body.style.overflow = '' }
  }, [opened])
  useEffect(() => {
    if (!opened) return
    const sections = document.querySelectorAll('.chapter')
    const activity = new IntersectionObserver(entries => entries.forEach(entry => { entry.target.dataset.active = entry.isIntersecting ? 'true' : 'false' }), { rootMargin: '100px 0px' })
    const chapter = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(Number(entry.target.dataset.chapter)) }), { rootMargin: '-25% 0px -65%' })
    sections.forEach(section => { activity.observe(section); chapter.observe(section) })
    const visibility = () => { document.documentElement.dataset.hidden = document.hidden ? 'true' : 'false' }
    document.addEventListener('visibilitychange', visibility)
    return () => { activity.disconnect(); chapter.disconnect(); document.removeEventListener('visibilitychange', visibility) }
  }, [opened])
  const onChime = useCallback(() => music.playChime?.(), [music.playChime])
  return <MotionConfig reducedMotion="user"><Cosmic3DBackground /><MagicSparkles /><ShootingStars /><motion.div className="reading-progress" style={{ scaleX }} /><AnimatePresence onExitComplete={() => document.getElementById('main-title')?.focus({ preventScroll: true })}>{!opened && <Intro onOpen={() => { window.scrollTo(0, 0); setOpened(true); music.start() }} />}</AnimatePresence><div className="site-shell" data-running={opened} inert={!opened ? '' : undefined} aria-hidden={!opened ? true : undefined}><main><Hero onChime={onChime} /><Universe onChime={onChime} /><Reasons /><Notes onChime={onChime} /><Letter onChime={onChime} /><Finale onChime={onChime} /></main><footer className="footer"><span className="footer-monogram">h ✦</span><p>Chúc Hạnh một tuổi mới<br /><em>nhiều niềm vui và may mắn.</em></p><a href="#home">DÀNH RIÊNG CHO {birthday.name.toUpperCase()} <ArrowDown size={14} className="arrow-up" /></a></footer>{opened && <JourneyDock active={active} music={music} />}</div></MotionConfig>
}
