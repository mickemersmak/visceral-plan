const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.5";

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Only POST is allowed." });
    return;
  }

  const apiKey = normalizeApiKey(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    res.status(503).json({
      message: "OPENAI_API_KEY saknas eller är ogiltig. Frontend använder lokal fallback.",
      fallback: true
    });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const images = sanitizeImages(body.images, body.image);
    const foods = Array.isArray(body.foods) ? body.foods.slice(0, 90) : [];
    const goal = typeof body.goal === "string" ? body.goal : "fatloss";
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const feedback = Array.isArray(body.feedback) ? body.feedback.slice(-20) : [];
    const detail = sanitizeDetail(body.detail);

    if (!images.length) {
      res.status(400).json({ message: "Minst en bild måste skickas som data-URL." });
      return;
    }

    if (images.some((item) => item.length > 6_500_000) || images.join("").length > 16_000_000) {
      res.status(413).json({ message: "Bildserien är för stor. Ta färre eller närmare bilder." });
      return;
    }

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_FRIDGE_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildPrompt(goal, foods, profile, feedback, images.length)
              },
              ...images.map((imageUrl) => ({
                type: "input_image",
                image_url: imageUrl,
                detail
              }))
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "fridge_scan_quality_v2",
            strict: true,
            schema: fridgeScanSchema()
          }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({
        message: "Vision-analysen misslyckades.",
        detail: data.error && data.error.message ? data.error.message : "OpenAI error"
      });
      return;
    }

    const parsed = parseModelJSON(data);
    const allowed = new Set(foods.map((food) => food.id));

    res.status(200).json({
      source: "openai",
      suggestions: normalizeSuggestions(parsed.suggestions, allowed),
      uncertain: normalizeUncertain(parsed.uncertain, allowed),
      quality: normalizeQuality(parsed.quality, detail),
      mealIdea: normalizeMealIdea(parsed.mealIdea, allowed),
      shopping: normalizeShopping(parsed.shopping),
      detail,
      imageCount: images.length,
      note: String(parsed.note || "Kontrollera råvarorna innan du lägger till dem.").slice(0, 220)
    });
  } catch (error) {
    res.status(500).json({
      message: "Kylskåpsscannen kunde inte analyseras.",
      detail: error && error.message ? error.message : "Unknown error"
    });
  }
};

function sanitizeImages(images, fallbackImage) {
  const candidates = Array.isArray(images) ? images : [];
  return Array.from(new Set([...candidates, fallbackImage]
    .filter((item) => typeof item === "string" && item.startsWith("data:image/"))))
    .slice(0, 4);
}

function fridgeScanSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestions: {
        type: "array",
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            reason: { type: "string" },
            visualEvidence: { type: "string" },
            needsConfirmation: { type: "boolean" }
          },
          required: ["id", "confidence", "reason", "visualEvidence", "needsConfirmation"]
        }
      },
      uncertain: {
        type: "array",
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            question: { type: "string" },
            alternatives: {
              type: "array",
              maxItems: 3,
              items: { type: "string" }
            },
            reason: { type: "string" }
          },
          required: ["id", "confidence", "question", "alternatives", "reason"]
        }
      },
      quality: {
        type: "object",
        additionalProperties: false,
        properties: {
          score: { type: "number", minimum: 0, maximum: 1 },
          lighting: { type: "string" },
          framing: { type: "string" },
          occlusion: { type: "string" },
          shouldRetake: { type: "boolean" },
          advice: { type: "string" }
        },
        required: ["score", "lighting", "framing", "occlusion", "shouldRetake", "advice"]
      },
      mealIdea: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          text: { type: "string" },
          addIds: {
            type: "array",
            maxItems: 5,
            items: { type: "string" }
          }
        },
        required: ["title", "text", "addIds"]
      },
      shopping: {
        type: "array",
        maxItems: 6,
        items: { type: "string" }
      },
      note: { type: "string" }
    },
    required: ["suggestions", "uncertain", "quality", "mealIdea", "shopping", "note"]
  };
}

function buildPrompt(goal, foods, profile, feedback, imageCount) {
  const catalog = foods.map((food) => `${food.id}: ${food.name} (${food.role}${food.category ? `, ${food.category}` : ""})`).join("\n");
  return [
    "Du är en svensk premiumscanner för kylskåp, måltider och bukfettsfokus.",
    "Du kan få flera bilder från samma kylskåp, till exempel olika hyllor eller dörrfack.",
    "Slå ihop fynd från alla bilder, men duplicera inte samma råvara.",
    "Identifiera bara råvaror som syns tydligt eller rimligt i bilderna. Hitta aldrig på id.",
    "Dela upp säkra fynd i suggestions och osäkra fynd i uncertain.",
    "Sätt needsConfirmation=true när råvaran delvis skyms, bara syns på förpackning, är lik flera alternativ eller confidence < 0.72.",
    "Ge visualEvidence som beskriver exakt vad du ser: färg, form, förpackning, hylla, dörrfack, placering eller vilken bild i serien.",
    "Bedöm bildkvalitet över hela serien: ljus, inramning, skymda objekt och om användaren bör ta om någon bild.",
    "Föreslå en enkel mealIdea och shoppingrad som kompletterar mot målet.",
    "Använd alltid metriska mått och svenska råvarunamn i text.",
    `Antal bilder i serien: ${imageCount}.`,
    `Måltidsmål: ${goal}.`,
    `Profil: ${JSON.stringify({
      sex: profile.sex || "unspecified",
      weight: profile.weight || null,
      waist: profile.waist || null
    })}.`,
    `Tidigare feedback från användaren: ${JSON.stringify(feedback)}.`,
    "Råvaru-id:",
    catalog
  ].join("\n");
}

function parseModelJSON(data) {
  if (typeof data.output_text === "string") return JSON.parse(data.output_text);
  const text = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.output_text || "")
    .find(Boolean);
  if (!text) return { suggestions: [], uncertain: [], note: "" };
  return JSON.parse(text);
}

function normalizeSuggestions(items, allowed) {
  return Array.isArray(items)
    ? items
      .filter((item) => allowed.has(item.id))
      .map((item) => ({
        id: item.id,
        confidence: clampNumber(item.confidence, 0.35, 0.98),
        reason: String(item.reason || "Identifierad i bilden.").slice(0, 140),
        visualEvidence: String(item.visualEvidence || "Syns i kylskåpsbilden.").slice(0, 140),
        needsConfirmation: Boolean(item.needsConfirmation) || Number(item.confidence) < 0.72
      }))
      .slice(0, 10)
    : [];
}

function normalizeUncertain(items, allowed) {
  return Array.isArray(items)
    ? items
      .filter((item) => allowed.has(item.id))
      .map((item) => ({
        id: item.id,
        confidence: clampNumber(item.confidence, 0.2, 0.72),
        question: String(item.question || "Stämmer detta?").slice(0, 140),
        alternatives: Array.isArray(item.alternatives)
          ? item.alternatives.map(String).filter((id) => allowed.has(id)).slice(0, 3)
          : [],
        reason: String(item.reason || "Osäkert fynd i bilden.").slice(0, 140)
      }))
      .slice(0, 5)
    : [];
}

function normalizeQuality(value, detail) {
  const quality = value && typeof value === "object" ? value : {};
  return {
    score: clampNumber(quality.score, 0.45, 0.98),
    lighting: String(quality.lighting || "Ej bedömt.").slice(0, 80),
    framing: String(quality.framing || "Ej bedömt.").slice(0, 80),
    occlusion: String(quality.occlusion || "Ej bedömt.").slice(0, 80),
    shouldRetake: Boolean(quality.shouldRetake),
    advice: String(quality.advice || "Ta en rak bild med öppen kylskåpsdörr och bra ljus.").slice(0, 160),
    detailUsed: detail
  };
}

function normalizeMealIdea(value, allowed) {
  const idea = value && typeof value === "object" ? value : {};
  return {
    title: String(idea.title || "Smart kylskåpsmåltid").slice(0, 90),
    text: String(idea.text || "Lägg till råvarorna i byggaren och låt Köks-AI skruva gram och balans.").slice(0, 180),
    addIds: Array.isArray(idea.addIds)
      ? idea.addIds.map(String).filter((id) => allowed.has(id)).slice(0, 5)
      : []
  };
}

function normalizeShopping(items) {
  return Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean).map((item) => item.slice(0, 90)).slice(0, 6)
    : [];
}

function sanitizeDetail(value) {
  return ["low", "high", "original", "auto"].includes(value) ? value : "high";
}

function normalizeApiKey(value) {
  const key = String(value || "").trim().replace(/^["']|["']$/g, "");
  return key.startsWith("sk-") ? key : "";
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}
