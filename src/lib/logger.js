export function logError(scope, err) {
  if (import.meta.env.DEV) console.error(`[${scope}]`, err)
  // TODO: integrar Sentry/PostHog en producción
}
