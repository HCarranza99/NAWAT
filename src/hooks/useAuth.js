/**
 * useAuth.js
 *
 * Hook que:
 * 1. Observa cambios de sesión de Supabase Auth en tiempo real.
 * 2. Al detectar login: carga el progreso de la nube y hace merge
 *    (gana quien tenga más XP).
 * 3. Si el postest ya estaba completado → salta directo a modo 'free'.
 * 4. Al detectar logout: limpia el authUserId del store.
 * 5. Expone { user, isLoggedIn, isLoading } para usar en componentes.
 */

import { useEffect, useState } from 'react'
import useGameStore, { PHASES, DEMO_MODE } from '../store/useGameStore'
import {
  onAuthStateChange,
  loadProgressFromCloud,
  saveProgressToCloud,
} from '../services/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(!DEMO_MODE)

  const setAuthUser = useGameStore((s) => s.setAuthUser)
  const mergeCloudProgress = useGameStore((s) => s.mergeCloudProgress)
  const goFree = useGameStore((s) => s.goFree)

  useEffect(() => {
    if (DEMO_MODE) return
    let cancelled = false
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (cancelled) return
      setUser(authUser)

      if (authUser) {
        // ── Usuario inició sesión ──────────────────────────────
        setAuthUser(authUser.id)

        // Cargar progreso de la nube
        const cloudProgress = await loadProgressFromCloud(authUser.id)
        if (cancelled) return

        if (cloudProgress) {
          const snapshotBeforeMerge = useGameStore.getState()
          const localXP = snapshotBeforeMerge.xp ?? 0

          // Hacer merge: la lógica de "gana más XP" vive en el store
          mergeCloudProgress(cloudProgress)
          
          const snapshotAfterMerge = useGameStore.getState()

          if (snapshotAfterMerge.posttestCompletedAt || snapshotAfterMerge.studyPhase === PHASES.FREE) {
            goFree()
          }

          // Si la nube tenía menos XP que local, subir el progreso local a la nube
          if (localXP >= (cloudProgress.xp ?? 0)) {
            await saveProgressToCloud(useGameStore.getState())
          }
        } else {
          // No hay perfil en la nube todavía → subir el progreso local
          await saveProgressToCloud(useGameStore.getState())
        }
      } else {
        // ── Usuario cerró sesión ───────────────────────────────
        setAuthUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    isLoggedIn: user !== null,
    isLoading,
  }
}
