import { useState } from 'react'
import { motion } from 'framer-motion'

export function IntroGiftBox({ isOpen, onTrigger }) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 14, y: -18 })

  const handlePointerMove = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({
      x: 14 - py * 18,
      y: -18 + px * 22,
    })
  }

  const handlePointerLeave = () => {
    setHovered(false)
    setTilt({ x: 14, y: -18 })
  }

  const handleClick = () => {
    if (!isOpen) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger-supernova-3d', { detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 } }))
        window.dispatchEvent(new CustomEvent('trigger-meteor-shower-3d', { detail: { super: true } }))
      }
      onTrigger()
    }
  }

  return (
    <div
      className={`gift-box-container ${isOpen ? 'box-opening' : ''} ${hovered ? 'box-hovered' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      role="button"
      tabIndex={0}
      aria-label="Mở hộp quà ma thuật"
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="gift-halo" />
      <div className="gift-sparks">
        <span className="spark spark-1">✦</span>
        <span className="spark spark-2">✧</span>
        <span className="spark spark-3">✦</span>
        <span className="spark spark-4">✧</span>
      </div>

      <motion.div
        className="gift-box-3d-wrap"
        animate={{
          rotateX: isOpen ? 10 : tilt.x,
          rotateY: isOpen ? -10 : tilt.y,
          scale: isOpen ? 1.05 : hovered ? 1.08 : 1,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        {/* Nắp hộp quà 3D */}
        <motion.div
          className="gift-lid-3d"
          animate={
            isOpen
              ? { y: -72, z: 45, rotateX: -36, opacity: 0 }
              : { y: 0, z: 0, rotateX: 0, opacity: 1 }
          }
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lid-face lid-top">
            <div className="lid-ribbon-cross-h" />
            <div className="lid-ribbon-cross-v" />
            {/* Nơ ruy băng 3D */}
            <div className="gift-bow">
              <span className="bow-loop bow-left" />
              <span className="bow-loop bow-right" />
              <span className="bow-center">✦</span>
            </div>
          </div>
          <div className="lid-face lid-front" />
          <div className="lid-face lid-right" />
        </motion.div>

        {/* Thần vật ma thuật bay lên từ trong hộp khi mở */}
        {isOpen && (
          <motion.div
            className="gift-surprise-jewel"
            initial={{ opacity: 0, scale: 0.2, y: 10, rotateY: 0 }}
            animate={{
              opacity: [0, 1, 1],
              scale: [0.2, 1.4, 1.2],
              y: -58,
              rotateY: 360,
            }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="jewel-heart">♡</div>
            <div className="jewel-light-burst" />
          </motion.div>
        )}

        {/* Thân hộp quà 3D */}
        <div className="gift-base-3d">
          <div className="box-face box-front">
            <div className="base-monogram">H</div>
            <div className="base-ribbon-v" />
          </div>
          <div className="box-face box-right">
            <div className="base-ribbon-v" />
          </div>
          <div className="box-face box-top-inner">
            <div className="inner-glow" />
          </div>
        </div>
      </motion.div>

      <span className="gift-caption">chạm vào hộp quà để mở</span>
    </div>
  )
}

