/**
 * instalacion.test.js
 *
 * Cuándo invitar a instalar la PWA.
 *
 * Lo que de verdad se cuida acá es iOS: `beforeinstallprompt` es de Chrome y
 * Safari no lo dispara nunca, así que `canInstall` siempre es false en iPhone.
 * Sin el caso aparte, los usuarios de iPhone nunca verían la invitación — y en
 * El Salvador eso es una parte real del público.
 */
import { describe, it, expect } from 'vitest'
import { esIOS, puedeInvitarAInstalar } from '../lib/instalacion'

const nav = (userAgent, maxTouchPoints = 0) => ({ userAgent, maxTouchPoints })

describe('esIOS', () => {
  it('reconoce iPhone y iPad', () => {
    expect(esIOS(nav('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'))).toBe(true)
    expect(esIOS(nav('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'))).toBe(true)
  })

  it('reconoce el iPad moderno, que se hace pasar por Mac', () => {
    // iPadOS 13+ manda un user agent de Macintosh. Lo que lo delata es el táctil.
    expect(esIOS(nav('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5))).toBe(true)
  })

  it('no confunde un Mac de verdad', () => {
    expect(esIOS(nav('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0))).toBe(false)
  })

  it('no confunde Android ni Windows', () => {
    expect(esIOS(nav('Mozilla/5.0 (Linux; Android 14; Pixel 8)'))).toBe(false)
    expect(esIOS(nav('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'))).toBe(false)
  })

  it('sin navigator no revienta', () => {
    expect(esIOS(null)).toBe(false)
  })
})

describe('puedeInvitarAInstalar', () => {
  it('sí cuando el navegador lo ofrece', () => {
    expect(puedeInvitarAInstalar({ canInstall: true, isInstalled: false, ios: false })).toBe(true)
  })

  it('sí en iOS aunque el navegador no lo ofrezca — se explica el gesto', () => {
    expect(puedeInvitarAInstalar({ canInstall: false, isInstalled: false, ios: true })).toBe(true)
  })

  it('NO si ya está instalada, ni siquiera en iOS', () => {
    expect(puedeInvitarAInstalar({ canInstall: true, isInstalled: true, ios: false })).toBe(false)
    expect(puedeInvitarAInstalar({ canInstall: false, isInstalled: true, ios: true })).toBe(false)
  })

  it('NO en escritorio o Firefox móvil: no hay nada que pedir', () => {
    // Mostrar una pantalla que pide algo imposible es peor que no mostrarla.
    expect(puedeInvitarAInstalar({ canInstall: false, isInstalled: false, ios: false })).toBe(false)
  })
})
