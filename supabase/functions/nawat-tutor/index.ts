/**
 * Edge Function: nawat-tutor
 * ──────────────────────────────────────────────────────────────────────────
 * Proxy seguro entre la app (cliente) y la API de Claude. La API key vive SOLO
 * aquí (secret de Supabase `ANTHROPIC_API_KEY`), nunca en el bundle del cliente.
 *
 * Rol: tutor conversacional de náhuat pipil + explicación de gramática/morfología,
 * ANCLADO al corpus. El cliente envía el vocabulario de la lección actual como
 * `context`; el modelo solo explica ESE material y admite cuando algo no está.
 * Náhuat mal inventado es peor que no responder (ver memoria del proyecto).
 *
 * Contrato (POST JSON):
 *   {
 *     "messages": [{ "role": "user"|"assistant", "content": "..." }, ...],
 *     "context": {
 *       "lessonTitle": "Los sonidos del Náhuat",
 *       "items": [
 *         { "nahuat_word": "Kwawit", "spanish_translation": "árbol/leña",
 *           "pronunciation": "kwa-wit", "example_sentence": "...",
 *           "example_translation": "..." }
 *       ]
 *     }
 *   }
 * Respuesta: { "reply": "texto del tutor" }  |  { "error": "..." }
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1024;

// El estudio es una PWA de acceso público: permitimos el origen del cliente.
// (Si se restringe el dominio más adelante, fijar aquí el origin exacto.)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/** Formatea el vocabulario de la lección como bloque de contexto verificable. */
function buildContextBlock(context: any): string {
  const items = Array.isArray(context?.items) ? context.items : [];
  if (items.length === 0) {
    return "(No hay vocabulario de lección disponible en este momento.)";
  }
  const lines = items.map((it: any) => {
    const parts = [
      `- náhuat: "${it?.nahuat_word ?? "?"}"`,
      `español: "${it?.spanish_translation ?? "?"}"`,
    ];
    if (it?.pronunciation) parts.push(`pronunciación: /${it.pronunciation}/`);
    if (it?.example_sentence) {
      parts.push(`ejemplo: "${it.example_sentence}"` +
        (it?.example_translation ? ` = "${it.example_translation}"` : ""));
    }
    return parts.join("  |  ");
  });
  const title = context?.lessonTitle ? `Lección: ${context.lessonTitle}\n` : "";
  return title + lines.join("\n");
}

function buildSystemPrompt(context: any): string {
  return [
    "Eres un tutor amable de náhuat pipil (la lengua náhuat de El Salvador) dentro de una app educativa.",
    "Tu trabajo: ayudar a un estudiante a entender el vocabulario y la gramática de su lección actual, y responder sus dudas.",
    "",
    "REGLAS ESTRICTAS (obligatorias):",
    "1. Explica ÚNICAMENTE el náhuat que aparece en el CONTEXTO de abajo. Es tu única fuente de verdad.",
    "2. NUNCA inventes palabras, traducciones ni conjugaciones en náhuat. Si te preguntan por algo que no está en el contexto, dilo con claridad: «Eso no está en esta lección, así que no puedo confirmarlo». Un dato inventado hace daño.",
    "3. Escribe tus explicaciones en español. El náhuat solo aparece citado tal cual está en el contexto.",
    "4. Si el estudiante escribe algo en náhuat, corrígelo solo comparándolo con el contexto; no propongas formas nuevas como si fueran correctas.",
    "5. Sé breve, cálido y claro. Da ejemplos del propio contexto. No uses tecnicismos sin explicarlos.",
    "6. Para gramática/morfología, apóyate en las palabras del contexto (p. ej. prefijos como ni-, ti-, nu-) solo si están presentes; si no, admítelo.",
    "",
    "CONTEXTO (vocabulario verificado de la lección actual):",
    buildContextBlock(context),
  ].join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json({ error: "Falta ANTHROPIC_API_KEY en el servidor" }, 500);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  if (messages.length === 0) {
    return json({ error: "Se requiere al menos un mensaje" }, 400);
  }

  // Sanitiza: solo role + content de texto, para no reenviar campos arbitrarios.
  const safeMessages = messages
    .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
    .map((m: any) => ({ role: m.role, content: m.content }));

  if (safeMessages.length === 0 || safeMessages[0].role !== "user") {
    return json({ error: "El primer mensaje debe ser del usuario" }, 400);
  }

  try {
    const resp = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // Respuestas ágiles de tutor: sin cadena de pensamiento (se puede activar
        // `thinking: { type: "adaptive" }` si se quiere razonamiento gramatical más profundo).
        thinking: { type: "disabled" },
        system: buildSystemPrompt(payload?.context),
        messages: safeMessages,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error("[nawat-tutor] Anthropic error", resp.status, detail);
      return json({ error: "El tutor no está disponible ahora mismo." }, 502);
    }

    const data = await resp.json();

    if (data?.stop_reason === "refusal") {
      return json({ reply: "No puedo ayudar con eso. Preguntemos algo de la lección." });
    }

    const reply = Array.isArray(data?.content)
      ? data.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("").trim()
      : "";

    return json({ reply: reply || "No tengo una respuesta para eso ahora." });
  } catch (e) {
    console.error("[nawat-tutor] fallo de red", e);
    return json({ error: "Error de conexión con el tutor." }, 502);
  }
});
