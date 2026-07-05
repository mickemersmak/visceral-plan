const OPENAI_URL = "https://api.openai.com/v1/responses";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

const DEFAULT_OPENAI_MODEL = "gpt-5.5";
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

async function requestOpenAIJSON({ apiKey, model, prompt, images = [], detail = "high", schemaName, schema }) {
  if (!apiKey) {
    return { ok: false, provider: "openai", status: 0, message: "OPENAI_API_KEY saknas." };
  }

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
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
            name: schemaName,
            strict: true,
            schema
          }
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        provider: "openai",
        status: response.status,
        message: data.error && data.error.message ? data.error.message : "OpenAI error"
      };
    }

    return { ok: true, provider: "openai", value: parseProviderJSON(data) };
  } catch (error) {
    return {
      ok: false,
      provider: "openai",
      status: 0,
      message: error && error.message ? error.message : "OpenAI request failed"
    };
  }
}

async function requestGeminiJSON({ apiKey, model, prompt, images = [], schema }) {
  if (!apiKey) {
    return { ok: false, provider: "gemini", status: 0, message: "GEMINI_API_KEY saknas." };
  }

  try {
    const imageParts = images.map(dataUrlToGeminiImage);
    const input = imageParts.length
      ? [{ type: "text", text: prompt }, ...imageParts]
      : prompt;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema
        },
        generation_config: {
          thinking_level: "minimal"
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        provider: "gemini",
        status: response.status,
        message: data.error && data.error.message ? data.error.message : "Gemini error"
      };
    }

    return { ok: true, provider: "gemini", value: parseProviderJSON(data) };
  } catch (error) {
    return {
      ok: false,
      provider: "gemini",
      status: 0,
      message: error && error.message ? error.message : "Gemini request failed"
    };
  }
}

function dataUrlToGeminiImage(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Gemini kräver bild som base64 data-URL.");
  return {
    type: "image",
    data: match[2],
    mime_type: match[1]
  };
}

function parseProviderJSON(data) {
  const text = findOutputText(data);
  if (!text) return {};
  return JSON.parse(extractJSON(text));
}

function findOutputText(data) {
  if (!data || typeof data !== "object") return "";
  if (typeof data.output_text === "string") return data.output_text;
  if (typeof data.text === "string") return data.text;

  const openAIText = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.output_text || "")
    .find(Boolean);
  if (openAIText) return openAIText;

  const geminiText = (data.candidates || [])
    .flatMap((candidate) => candidate.content && candidate.content.parts || [])
    .map((part) => part.text || "")
    .find(Boolean);
  if (geminiText) return geminiText;

  const outputText = (data.output || [])
    .map((item) => item.text || item.output_text || "")
    .find(Boolean);
  return outputText || "";
}

function extractJSON(text) {
  const clean = String(text || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  if (clean.startsWith("{") || clean.startsWith("[")) return clean;

  const objectStart = clean.indexOf("{");
  const objectEnd = clean.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) return clean.slice(objectStart, objectEnd + 1);

  const arrayStart = clean.indexOf("[");
  const arrayEnd = clean.lastIndexOf("]");
  if (arrayStart >= 0 && arrayEnd > arrayStart) return clean.slice(arrayStart, arrayEnd + 1);

  return clean;
}

function normalizeOpenAIKey(value) {
  let key = String(value || "").trim().replace(/^export\s+/i, "");
  if (/^OPENAI_API_KEY\s*=/.test(key)) key = key.slice(key.indexOf("=") + 1).trim();
  key = key.replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "").trim();
  return key.startsWith("sk-") ? key : "";
}

function normalizeGeminiKey(value) {
  let key = String(value || "").trim().replace(/^export\s+/i, "");
  if (/^(GEMINI_API_KEY|GOOGLE_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY)\s*=/.test(key)) {
    key = key.slice(key.indexOf("=") + 1).trim();
  }
  return key.replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "").trim();
}

function getOpenAIKey(env = process.env) {
  return normalizeOpenAIKey(env.OPENAI_API_KEY);
}

function getGeminiKey(env = process.env) {
  return normalizeGeminiKey(env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY);
}

function providerFailureDetail(failures) {
  return failures
    .filter(Boolean)
    .map((failure) => `${failure.provider}: ${failure.message}`)
    .join(" | ");
}

module.exports = {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_MODEL,
  getGeminiKey,
  getOpenAIKey,
  providerFailureDetail,
  requestGeminiJSON,
  requestOpenAIJSON
};
