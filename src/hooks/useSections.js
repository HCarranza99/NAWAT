import { useSyncExternalStore, useEffect } from 'react'
import {
  getSections,
  subscribeSections,
  ensureGeneratedSections,
  isGeneratedSettled,
} from '../data/sections/registry'

/**
 * Devuelve la lista de secciones y dispara la carga diferida del vocabulario
 * generado. Vuelve a renderizar automáticamente cuando lo generado llega.
 */
export function useSections() {
  const sections = useSyncExternalStore(subscribeSections, getSections, getSections)
  useEffect(() => { ensureGeneratedSections() }, [])
  return sections
}

/**
 * Igual que useSections pero también expone si el intento de carga de lo generado
 * ya se resolvió (con éxito o fallo). `ready` evita loaders infinitos: si la carga
 * falla, la app continúa con el núcleo artesanal.
 */
export function useSectionsReady() {
  const sections = useSyncExternalStore(subscribeSections, getSections, getSections)
  const ready = useSyncExternalStore(subscribeSections, isGeneratedSettled, isGeneratedSettled)
  useEffect(() => { ensureGeneratedSections() }, [])
  return { sections, ready }
}
