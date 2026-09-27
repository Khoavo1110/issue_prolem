import { motion } from 'framer-motion'

export function CandleSmoke() {
  const candles = [
    { x: 172, y: 75, delay: 0 },
    { x: 220, y: 60, delay: 0.1 },
    { x: 268, y: 75, delay: 0.18 },
  ]

  return (
    <div className="candle-smoke-layer" aria-hidden="true">
      {candles.map((c, i) => (
        <motion.div
          key={i}
          className="smoke-wisp"
          style={{ left: `${(c.x / 440) * 100}%`, top: `${(c.y / 420) * 100}%` }}
          initial={{ opacity: 0, scale: 0.4, y: 0, x: 0 }}
          animate={{
            opacity: [0, 0.75, 0.45, 0],
            scale: [0.5, 1.4, 2.2, 3],
            y: [0, -35, -75, -110],
            x: [0, (i - 1) * 12 + 6, (i - 1) * 20 - 4, (i - 1) * 30 + 8],
          }}
          transition={{
            duration: 2.4,
            delay: c.delay,
            ease: 'easeOut',
          }}
        >
          <svg viewBox="0 0 40 60" width="40" height="60" fill="none">
            <path
              d="M20 50 C12 38, 28 25, 18 12 C14 5, 24 2, 20 0"
              stroke="rgba(240, 220, 200, 0.6)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="blur(2px)"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
