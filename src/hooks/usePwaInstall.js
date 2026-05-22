import { useEffect, useState } from 'react'

let deferredPrompt = null
let installed = false
const listeners = new Set()

function getStandaloneState() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator?.standalone === true
  )
}

function getSnapshot() {
  installed = getStandaloneState() || installed
  return {
    canInstall: Boolean(deferredPrompt) && !installed,
    isInstalled: installed,
  }
}

function notify() {
  const snapshot = getSnapshot()
  listeners.forEach((listener) => listener(snapshot))
}

if (typeof window !== 'undefined') {
  installed = getStandaloneState()

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    installed = false
    notify()
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    installed = true
    notify()
  })
}

export function usePwaInstall() {
  const [state, setState] = useState(getSnapshot)

  useEffect(() => {
    listeners.add(setState)
    setState(getSnapshot())
    return () => listeners.delete(setState)
  }, [])

  const install = async () => {
    if (!deferredPrompt || installed) return false

    const promptEvent = deferredPrompt
    deferredPrompt = null
    notify()

    await promptEvent.prompt()
    const choice = await promptEvent.userChoice

    if (choice?.outcome === 'accepted') {
      installed = true
    }

    notify()
    return choice?.outcome === 'accepted'
  }

  return { ...state, install }
}
