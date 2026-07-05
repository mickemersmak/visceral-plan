const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.5";

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Only POST is allowed." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      message: "OPENAI_API_KEY saknas. Frontend använder lokal fallback.",
      fallback: true
    });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const image = typeof body.image === "string" ? body.image : "";
    const foods = Array.isArray(body.foods) ? body.foods.slice(0, 80) : [];
    const goal = typeof body.goal === "string" ? body.goal : "fatloss";

    if (!image.startsWith("data:image/")) {
      res.status(400).json({ message: "Bilden måste skickas som data-URL." });
      return;
    }

    if (image.length > 6_500_000) {
      res.status(413).json({ message: "Bilden är för stor. Ta en ny bild närmare kylskåpet." });
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
                text: buildPrompt(goal, foods)
              },
              {
                type: "input_image",
                image_url: image,
                detail: "low"
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "fridge_scan",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                suggestions: {
                  type: "array",
                  maxItems: 8,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: { type: "string" },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                      reason: { type: "string" }
                    },
                    required: ["id", "confidence", "reason"]
                  }
                },
                note: { type: "string" }
              },
              required: ["suggestions", "note"]
            }
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
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
        .filter((item) => allowed.has(item.id))
        .map((item) => ({
          id: item.id,
          confidence: clampNumber(item.confidence, 0.35, 0.98),
          reason: String(item.reason || "Identifierad i bilden.").slice(0, 120)
        }))
        .slice(0, 8)
      : [];

    res.status(200).json({
      source: "openai",
      suggestions,
      note: String(parsed.note || "Kontrollera råvarorna innan du lägger till dem.").slice(0, 180)
    });
  } catch (error) {
    res.status(500).json({
      message: "Kylskåpsscannen kunde inte analyseras.",
      detail: error && error.message ? error.message : "Unknown error"
    });
  }
};

function buildPrompt(goal, foods) {
  const catalog = foods.map((food) => `${food.id}: ${food.name} (${food.role})`).join("\n");
  return [
    "Du är en svensk nutrition- och kylskåpsscanner för en app mot bukfett.",
    "Analysera bilden och föreslå bara råvaror som tydligt eller rimligt verkar finnas i kylskåpet.",
    "Välj endast id från listan. Hitta inte på nya id.",
    "Om en råvara är osäker, ge lägre confidence och en kort anledning.",
    `Måltidsmål: ${goal}.`,
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
  if (!text) return { suggestions: [], note: "" };
  return JSON.parse(text);
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
