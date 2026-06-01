import { useSyncExternalStore } from 'react'

let deferredPrompt = null
let installed = false
const listeners = new Set()
let snapshot = {
  canInstall: false,
  isInstalled: false,
}

function getStandaloneState() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator?.standalone === true
  )
}

function readSnapshot() {
  installed = getStandaloneState() || installed
  return {
    canInstall: Boolean(deferredPrompt) && !installed,
    isInstalled: installed,
  }
}

function refreshSnapshot() {
  const nextSnapshot = readSnapshot()
  if (
    nextSnapshot.canInstall !== snapshot.canInstall ||
    nextSnapshot.isInstalled !== snapshot.isInstalled
  ) {
    snapshot = nextSnapshot
  }
  return snapshot
}

function getSnapshot() {
  return snapshot
}

function notify() {
  refreshSnapshot()
  listeners.forEach((listener) => listener(snapshot))
}

if (typeof window !== 'undefined') {
  installed = getStandaloneState()
  refreshSnapshot()

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
  const state = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot,
    getSnapshot
  )

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
