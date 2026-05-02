// Web Audio API — no external files needed, works offline (PWA)
let ctx = null

const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

const tone = (freq, startTime, duration, gain = 0.28, type = 'sine') => {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.connect(g)
  g.connect(ac.destination)
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, startTime)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

export const playCorrect = () => {
  try {
    const ac = getCtx()
    const t = ac.currentTime
    tone(523.25, t, 0.12)           // C5
    tone(659.25, t + 0.08, 0.14)   // E5
    tone(783.99, t + 0.16, 0.18)   // G5
  } catch {
    // Ignore error
  }
}

export const playWrong = () => {
  try {
    const ac = getCtx()
    const t = ac.currentTime
    tone(311.13, t, 0.18, 0.22, 'sawtooth')       // Eb4
    tone(220.00, t + 0.15, 0.22, 0.18, 'sawtooth') // A3
  } catch {
    // Ignore error
  }
}

export const playComplete = () => {
  try {
    const ac = getCtx()
    const t = ac.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => tone(freq, t + i * 0.1, 0.22))
  } catch {
    // Ignore error
  }
}
