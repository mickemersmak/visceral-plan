const {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_MODEL,
  getGeminiKey,
  getOpenAIKey,
  providerFailureDetail,
  requestGeminiJSON,
  requestOpenAIJSON
} = require("./_ai-providers");

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Only POST is allowed." });
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

    const schema = fridgeScanSchema();
    const prompt = buildPrompt(goal, foods, profile, feedback, images.length);
    const failures = [];
    const openAI = await requestOpenAIJSON({
      apiKey: getOpenAIKey(),
      model: process.env.OPENAI_FRIDGE_MODEL || DEFAULT_OPENAI_MODEL,
      prompt,
      images,
      detail,
      schemaName: "fridge_scan_quality_v2",
      schema
    });
    if (openAI.ok) {
      sendFridgeScan(res, openAI.value, foods, detail, images.length, openAI.provider);
      return;
    }
    failures.push(openAI);

    const gemini = await requestGeminiJSON({
      apiKey: getGeminiKey(),
      model: process.env.GEMINI_FRIDGE_MODEL || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      prompt,
      images,
      schema
    });
    if (gemini.ok) {
      sendFridgeScan(res, gemini.value, foods, detail, images.length, gemini.provider);
      return;
    }
    failures.push(gemini);

    res.status(openAI.status || gemini.status || 503).json({
      message: "Ingen AI-provider kunde analysera kylskåpsbilderna.",
      detail: providerFailureDetail(failures),
      fallback: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Kylskåpsscannen kunde inte analyseras.",
      detail: error && error.message ? error.message : "Unknown error"
    });
  }
};

function sendFridgeScan(res, parsed, foods, detail, imageCount, source) {
    const allowed = new Set(foods.map((food) => food.id));

    res.status(200).json({
      source,
      suggestions: normalizeSuggestions(parsed.suggestions, allowed),
      uncertain: normalizeUncertain(parsed.uncertain, allowed),
      quality: normalizeQuality(parsed.quality, detail),
      mealIdea: normalizeMealIdea(parsed.mealIdea, allowed),
      shopping: normalizeShopping(parsed.shopping),
      detail,
      imageCount,
      note: String(parsed.note || "Kontrollera råvarorna innan du lägger till dem.").slice(0, 220)
    });
}

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

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}
