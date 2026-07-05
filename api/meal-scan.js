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
    const image = typeof body.image === "string" ? body.image : "";
    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const goal = typeof body.goal === "string" ? body.goal : "fatloss";
    const detail = sanitizeDetail(body.detail);

    if (!image.startsWith("data:image/")) {
      res.status(400).json({ message: "Matbilden måste skickas som data-URL." });
      return;
    }

    if (image.length > 6_500_000) {
      res.status(413).json({ message: "Bilden är för stor. Ta en ny bild närmare tallriken." });
      return;
    }

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MEAL_MODEL || process.env.OPENAI_FRIDGE_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildPrompt(goal, profile)
              },
              {
                type: "input_image",
                image_url: image,
                detail
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "meal_nutrition_scan_v1",
            strict: true,
            schema: mealScanSchema()
          }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({
        message: "Matbilden kunde inte analyseras.",
        detail: data.error && data.error.message ? data.error.message : "OpenAI error"
      });
      return;
    }

    res.status(200).json(normalizeMealScan(parseModelJSON(data), "openai", detail));
  } catch (error) {
    res.status(500).json({
      message: "Matbilden kunde inte analyseras.",
      detail: error && error.message ? error.message : "Unknown error"
    });
  }
};

function mealScanSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      dishName: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      portionQuality: {
        type: "object",
        additionalProperties: false,
        properties: {
          score: { type: "number", minimum: 0, maximum: 1 },
          visibleReference: { type: "string" },
          shouldRetake: { type: "boolean" },
          advice: { type: "string" }
        },
        required: ["score", "visibleReference", "shouldRetake", "advice"]
      },
      totals: macroSchema(),
      items: {
        type: "array",
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            grams: { type: "number", minimum: 0 },
            kcal: { type: "number", minimum: 0 },
            protein: { type: "number", minimum: 0 },
            carbs: { type: "number", minimum: 0 },
            fat: { type: "number", minimum: 0 },
            fiber: { type: "number", minimum: 0 },
            confidence: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["name", "grams", "kcal", "protein", "carbs", "fat", "fiber", "confidence"]
        }
      },
      verdict: {
        type: "object",
        additionalProperties: false,
        properties: {
          level: { type: "string" },
          title: { type: "string" },
          text: { type: "string" },
          actions: {
            type: "array",
            maxItems: 4,
            items: { type: "string" }
          }
        },
        required: ["level", "title", "text", "actions"]
      },
      notes: {
        type: "array",
        maxItems: 4,
        items: { type: "string" }
      },
      caution: { type: "string" }
    },
    required: ["dishName", "confidence", "portionQuality", "totals", "items", "verdict", "notes", "caution"]
  };
}

function macroSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      grams: { type: "number", minimum: 0 },
      kcal: { type: "number", minimum: 0 },
      protein: { type: "number", minimum: 0 },
      carbs: { type: "number", minimum: 0 },
      fat: { type: "number", minimum: 0 },
      fiber: { type: "number", minimum: 0 },
      sugar: { type: "number", minimum: 0 }
    },
    required: ["grams", "kcal", "protein", "carbs", "fat", "fiber", "sugar"]
  };
}

function buildPrompt(goal, profile) {
  return [
    "Du är Matfoto-AI i Visceral Plan: en svensk premiumcoach för portionsuppskattning, näringsvärde och bukfettsvänliga måltider.",
    "Uppskatta bara det som syns i bilden. Var tydlig med osäkerhet, särskilt när portion, olja, sås eller djup inte syns.",
    "Returnera en realistisk näringsuppskattning, inte exakta labbvärden.",
    "Använd alltid metriska mått: gram, kcal och makron i gram.",
    "Ge totals för hela tallriken/måltiden och items för synliga komponenter.",
    "Värdera måltiden mot bukfettsmålet: protein, fiber, grön volym, sockerlast och energitäthet.",
    "Ge actions som gör måltiden bättre utan skam eller extrema råd.",
    "Ingen diagnos, behandling eller medicinskt löfte.",
    `Måltidsmål: ${goal}.`,
    `Profil: ${JSON.stringify({
      sex: profile.sex || "unspecified",
      age: profile.age || null,
      weight: profile.weight || null,
      waist: profile.waist || null
    })}.`
  ].join("\n");
}

function normalizeMealScan(value, source, detail) {
  const scan = value && typeof value === "object" ? value : {};
  const totals = normalizeMacros(scan.totals);
  return {
    source,
    dishName: String(scan.dishName || "Fotad måltid").slice(0, 90),
    confidence: clampNumber(scan.confidence, 0.25, 0.98),
    portionQuality: normalizePortionQuality(scan.portionQuality, detail),
    totals,
    items: Array.isArray(scan.items)
      ? scan.items.map(normalizeMealItem).filter((item) => item.name).slice(0, 8)
      : [],
    verdict: normalizeVerdict(scan.verdict, totals),
    notes: Array.isArray(scan.notes)
      ? scan.notes.map((item) => String(item || "").trim()).filter(Boolean).map((item) => item.slice(0, 140)).slice(0, 4)
      : [],
    caution: String(scan.caution || "Näringsvärdet är en AI-uppskattning från bild, inte en exakt vägning.").slice(0, 220)
  };
}

function normalizeMealItem(item) {
  return {
    name: String(item && item.name || "").trim().slice(0, 90),
    grams: roundNumber(item && item.grams),
    kcal: roundNumber(item && item.kcal),
    protein: roundNumber(item && item.protein),
    carbs: roundNumber(item && item.carbs),
    fat: roundNumber(item && item.fat),
    fiber: roundNumber(item && item.fiber),
    confidence: clampNumber(item && item.confidence, 0.25, 0.98)
  };
}

function normalizeMacros(value) {
  const macros = value && typeof value === "object" ? value : {};
  return {
    grams: roundNumber(macros.grams),
    kcal: roundNumber(macros.kcal),
    protein: roundNumber(macros.protein),
    carbs: roundNumber(macros.carbs),
    fat: roundNumber(macros.fat),
    fiber: roundNumber(macros.fiber),
    sugar: roundNumber(macros.sugar)
  };
}

function normalizePortionQuality(value, detail) {
  const quality = value && typeof value === "object" ? value : {};
  return {
    score: clampNumber(quality.score, 0.25, 0.98),
    visibleReference: String(quality.visibleReference || "Ingen tydlig referens för exakt portionsstorlek.").slice(0, 120),
    shouldRetake: Boolean(quality.shouldRetake),
    advice: String(quality.advice || "Ta bilden rakt ovanifrån med hela tallriken och gärna bestick eller hand som storleksreferens.").slice(0, 180),
    detailUsed: detail
  };
}

function normalizeVerdict(value, totals) {
  const verdict = value && typeof value === "object" ? value : {};
  const level = ["strong", "tune", "watch"].includes(verdict.level) ? verdict.level : totals.protein >= 30 && totals.fiber >= 8 ? "strong" : "tune";
  return {
    level,
    title: String(verdict.title || (level === "strong" ? "Bra bukfettsmåltid" : "Går att skruva bättre")).slice(0, 90),
    text: String(verdict.text || "AI väger protein, fiber, grön volym och energitäthet.").slice(0, 240),
    actions: Array.isArray(verdict.actions)
      ? verdict.actions.map((item) => String(item || "").trim()).filter(Boolean).map((item) => item.slice(0, 140)).slice(0, 4)
      : []
  };
}

function parseModelJSON(data) {
  if (typeof data.output_text === "string") return JSON.parse(data.output_text);
  const text = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.output_text || "")
    .find(Boolean);
  return text ? JSON.parse(text) : {};
}

function sanitizeDetail(value) {
  return ["low", "high", "original", "auto"].includes(value) ? value : "high";
}

function normalizeApiKey(value) {
  let key = String(value || "").trim().replace(/^export\s+/i, "");
  if (/^OPENAI_API_KEY\s*=/.test(key)) key = key.slice(key.indexOf("=") + 1).trim();
  key = key.replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "").trim();
  return key.startsWith("sk-") ? key : "";
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function roundNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : 0;
}

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}
