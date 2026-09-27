import { useCallback, useEffect, useRef, useState } from 'react'

const BEAT = 60 / 116
const TICK = BEAT / 4
const MASTER_VOLUME = 0.58
const FADE_SECONDS = 0.18
const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12)

// A soft music-box arrangement of Happy Birthday, followed by a playful interlude.
const phrases = [
  [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2]],
  [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2]],
  [[67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1]],
  [[77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2]],
]
const melody = new Map()
let melodyTick = 0
phrases.flat().forEach(([note, beats]) => {
  melody.set(melodyTick, { note, beats })
  melodyTick += beats * 4
})
const chords = [
  [48, 60, 64, 67], [43, 59, 62, 67], [43, 59, 62, 67], [48, 60, 64, 67],
  [48, 60, 64, 67], [53, 60, 65, 69], [43, 59, 62, 67], [48, 60, 64, 67],
  [53, 60, 65, 69], [48, 60, 64, 67], [43, 59, 62, 67], [48, 60, 64, 67],
]
const LOOP_TICKS = chords.length * 12

function tone(engine, hz, when, duration, volume, type = 'sine') {
  const { ctx, master, voices } = engine
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(hz, when)
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.009)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  oscillator.connect(gain).connect(master)
  voices.add(oscillator)
  oscillator.onended = () => {
    oscillator.disconnect()
    gain.disconnect()
    voices.delete(oscillator)
  }
  oscillator.start(when)
  oscillator.stop(when + duration + 0.03)
}

function bell(engine, note, when, duration = 0.6, volume = 0.09) {
  const hz = frequency(note)
  tone(engine, hz, when, duration, volume, 'triangle')
  tone(engine, hz * 2, when, duration * 0.58, volume * 0.18)
}

function fadeTo(engine, volume, duration = FADE_SECONDS) {
  const now = engine.ctx.currentTime
  const parameter = engine.master.gain
  if (typeof parameter.cancelAndHoldAtTime === 'function') {
    parameter.cancelAndHoldAtTime(now)
  } else {
    const current = parameter.value
    parameter.cancelScheduledValues(now)
    parameter.setValueAtTime(current, now)
  }
  parameter.linearRampToValueAtTime(volume, now + duration)
}

function clearVoices(engine) {
  engine.voices.forEach((oscillator) => {
    try { oscillator.stop() } catch { /* The voice may have already ended. */ }
  })
  engine.voices.clear()
}

function clearTimers(engine) {
  window.clearInterval(engine.timer)
  window.clearTimeout(engine.pauseTimer)
  engine.timer = null
  engine.pauseTimer = null
}

function pause(engine, immediate = false) {
  clearTimers(engine)
  if (engine.ctx.state === 'closed') return
  fadeTo(engine, 0, immediate ? 0.015 : FADE_SECONDS)
  const suspend = () => {
    engine.pauseTimer = null
    clearVoices(engine)
    if (engine.ctx.state !== 'closed') engine.ctx.suspend().catch(() => {})
  }
  // Hidden tabs throttle timers: suspend immediately to protect the battery.
  if (immediate) suspend()
  else engine.pauseTimer = window.setTimeout(suspend, FADE_SECONDS * 1000 + 30)
}

function schedule(engine) {
  if (engine.ctx.state !== 'running') return
  const now = engine.ctx.currentTime
  // A busy frame must never cause a burst of overdue notes.
  if (engine.next < now - 0.08) engine.next = now + 0.025
  while (engine.next < now + 0.13) {
    const tick = engine.step % LOOP_TICKS
    const chord = chords[Math.floor(tick / 12)]
    const beat = tick % 12
    const note = melody.get(tick)
    if (note) bell(engine, note.note, engine.next, Math.min(note.beats * BEAT * 0.92, 0.95))

    if (beat === 0) {
      tone(engine, frequency(chord[0]), engine.next, BEAT * 1.35, 0.075)
    }
    if (beat === 4 || beat === 8) {
      chord.slice(1).forEach((midi, index) => {
        tone(engine, frequency(midi), engine.next + index * 0.014, 0.24, 0.021)
      })
      // A quiet wooden tick gives the waltz its bounce without harsh percussion.
      tone(engine, beat === 4 ? 1060 : 1320, engine.next, 0.025, 0.008)
    }
    if (tick >= melodyTick && tick % 2 === 0) {
      const index = Math.floor(beat / 2) % 3
      bell(engine, chord[index + 1] + 12, engine.next, 0.32, 0.043)
    }
    engine.step += 1
    engine.next += TICK
  }
}

export function useBirthdayMusic() {
  const [playing, setPlaying] = useState(false)
  const engineRef = useRef(null)
  const wantedRef = useRef(false)
  const generationRef = useRef(0)
  const mountedRef = useRef(true)

  const stop = useCallback(() => {
    wantedRef.current = false
    generationRef.current += 1
    if (engineRef.current) pause(engineRef.current)
    if (mountedRef.current) setPlaying(false)
  }, [])

  const start = useCallback(async () => {
    if (!mountedRef.current || document.hidden) return false
    let engine = engineRef.current
    if (wantedRef.current && engine?.timer && engine.ctx.state === 'running') return true
    wantedRef.current = true
    const generation = ++generationRef.current

    try {
      if (!engine || engine.ctx.state === 'closed') {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) {
          wantedRef.current = false
          return false
        }
        const ctx = new AudioContext({ latencyHint: 'playback' })
        const master = ctx.createGain()
        master.gain.value = 0
        master.connect(ctx.destination)
        engine = { ctx, master, voices: new Set(), timer: null, pauseTimer: null, step: 0, next: 0 }
        // Store before awaiting resume: rapid taps must share the same context.
        engineRef.current = engine
      }
      clearTimers(engine)
      // Called directly by the gift/music button so Safari receives the gesture.
      await engine.ctx.resume()
      if (!mountedRef.current || engineRef.current !== engine || generation !== generationRef.current || !wantedRef.current || document.hidden) {
        if (engineRef.current === engine && (!wantedRef.current || document.hidden)) pause(engine, true)
        return false
      }
      if (engine.ctx.state !== 'running') {
        wantedRef.current = false
        setPlaying(false)
        return false
      }
      engine.next = engine.ctx.currentTime + 0.035
      fadeTo(engine, MASTER_VOLUME, 0.35)
      schedule(engine)
      engine.timer = window.setInterval(() => schedule(engine), 50)
      setPlaying(true)
      return true
    } catch {
      if (mountedRef.current && generation === generationRef.current) {
        wantedRef.current = false
        if (engine) pause(engine, true)
        setPlaying(false)
      }
      return false
    }
  }, [])

  const toggle = useCallback(() => {
    if (wantedRef.current) stop()
    else void start()
  }, [start, stop])

  const playChime = useCallback(() => {
    const engine = engineRef.current
    if (!wantedRef.current || !engine || document.hidden || engine.ctx.state !== 'running') return
    const now = engine.ctx.currentTime
    ;[72, 76, 79, 84].forEach((note, index) => {
      bell(engine, note, now + index * 0.075, 0.7, 0.068)
    })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const hide = () => {
      generationRef.current += 1
      if (engineRef.current) pause(engineRef.current, true)
      setPlaying(false)
    }
    const show = () => {
      if (wantedRef.current && !document.hidden) void start()
    }
    const visibilityChange = () => document.hidden ? hide() : show()
    document.addEventListener('visibilitychange', visibilityChange)
    window.addEventListener('pagehide', hide)
    window.addEventListener('pageshow', show)
    return () => {
      mountedRef.current = false
      wantedRef.current = false
      generationRef.current += 1
      document.removeEventListener('visibilitychange', visibilityChange)
      window.removeEventListener('pagehide', hide)
      window.removeEventListener('pageshow', show)
      const engine = engineRef.current
      engineRef.current = null
      if (engine) {
        clearTimers(engine)
        clearVoices(engine)
        engine.master.disconnect()
        if (engine.ctx.state !== 'closed') engine.ctx.close().catch(() => {})
      }
    }
  }, [start])

  return { playing, start, stop, toggle, playChime }
}
