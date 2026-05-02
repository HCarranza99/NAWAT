import '@testing-library/jest-dom'

// Mock Web Speech API
globalThis.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: () => [],
  speaking: false,
  pending: false,
  paused: false,
  onvoiceschanged: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

globalThis.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: '',
  rate: 1,
  pitch: 1,
  volume: 1,
}))

// Mock Audio
globalThis.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  volume: 1,
}))
