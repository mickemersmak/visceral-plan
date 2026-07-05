const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.5";

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Only POST is allowed." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const message = String(body.message || "").trim().slice(0, 1200);
    const context = sanitizeContext(body.context || {});
    const history = Array.isArray(body.history) ? body.history.slice(-8).map(sanitizeHistoryItem).filter(Boolean) : [];
    const image = typeof body.image === "string" && body.image.startsWith("data:image/") ? body.image : "";

    if (!message) {
      res.status(400).json({ message: "Skriv en fråga till köks-AI." });
      return;
    }

    if (image && image.length > 6_500_000) {
      res.status(413).json({ message: "Bilden är för stor. Ta en ny bild närmare kylskåpet." });
      return;
    }

    const apiKey = normalizeApiKey(process.env.OPENAI_API_KEY);
    if (!apiKey) {
      res.status(200).json(localKitchenReply(message, context, "local"));
      return;
    }

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_KITCHEN_MODEL || process.env.OPENAI_FRIDGE_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildKitchenPrompt(message, context, history)
              },
              ...(image ? [{
                type: "input_image",
                image_url: image,
                detail: "low"
              }] : [])
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "kitchen_coach_reply",
            strict: true,
            schema: kitchenReplySchema()
          }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(200).json(localKitchenReply(message, context, "fallback", data.error && data.error.message));
      return;
    }

    res.status(200).json(normalizeKitchenReply(parseModelJSON(data), context, "openai"));
  } catch (error) {
    res.status(500).json({
      message: "Köks-AI kunde inte svara just nu.",
      detail: error && error.message ? error.message : "Unknown error"
    });
  }
};

function buildKitchenPrompt(message, context, history) {
  return [
    "Du är Köks-AI i Visceral Plan: en svensk premiumcoach för kylskåp, måltider, bukfett och mättnad.",
    "Resonera praktiskt men svara kort. Använd metriska mått: gram, kcal, minuter.",
    "Du får inte diagnostisera, lova snabb fettförlust eller ge medicinska råd. Vid medicinsk oro: hänvisa till vårdgivare.",
    "Prioritera protein, fiber, grön volym, rimlig energi, låg sockerlast och hållbara byten.",
    "Om bild finns: använd den som stöd men var ärlig med osäkerhet.",
    "Använd scanQuality och feedback för att inte överdriva osäkra bildfynd. Låt bekräftade fynd väga tyngre.",
    "Fyll shoppingPlan med konkreta inköp i gram, prioritet och varför. nextBestQuestion ska vara en tydlig nästa fråga.",
    "Välj add/remove endast från allowedFoodIds.",
    "Svara alltid med JSON enligt schema.",
    "",
    `Användarfråga: ${message}`,
    "",
    "Kontext:",
    JSON.stringify(context),
    "",
    "Senaste samtal:",
    JSON.stringify(history)
  ].join("\n");
}

function kitchenReplySchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      reply: { type: "string" },
      mealName: { type: "string" },
      reasoning: { type: "string" },
      steps: {
        type: "array",
        maxItems: 5,
        items: { type: "string" }
      },
      add: {
        type: "array",
        maxItems: 6,
        items: { type: "string" }
      },
      remove: {
        type: "array",
        maxItems: 4,
        items: { type: "string" }
      },
      shopping: {
        type: "array",
        maxItems: 6,
        items: { type: "string" }
      },
      questions: {
        type: "array",
        maxItems: 3,
        items: { type: "string" }
      },
      shoppingPlan: {
        type: "array",
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            item: { type: "string" },
            grams: { type: "number" },
            why: { type: "string" },
            priority: { type: "string" }
          },
          required: ["item", "grams", "why", "priority"]
        }
      },
      nextBestQuestion: { type: "string" },
      caution: { type: "string" }
    },
    required: ["reply", "mealName", "reasoning", "steps", "add", "remove", "shopping", "questions", "shoppingPlan", "nextBestQuestion", "caution"]
  };
}

function sanitizeContext(context) {
  const allowedFoodIds = Array.isArray(context.allowedFoodIds) ? context.allowedFoodIds.map(String).slice(0, 120) : [];
  const selectedFoods = Array.isArray(context.selectedFoods) ? context.selectedFoods.slice(0, 50).map(sanitizeFood).filter(Boolean) : [];
  const scanFoods = Array.isArray(context.scanFoods) ? context.scanFoods.slice(0, 12).map(sanitizeFood).filter(Boolean) : [];
  const mealItems = Array.isArray(context.mealItems) ? context.mealItems.slice(0, 10).map(sanitizeMealItem).filter(Boolean) : [];
  const shoppingList = Array.isArray(context.shoppingList)
    ? context.shoppingList.map((item) => String(item || "").trim()).filter(Boolean).map((item) => item.slice(0, 90)).slice(-30)
    : [];
  return {
    goal: String(context.goal || "fatloss").slice(0, 40),
    goalLabel: String(context.goalLabel || "Bukfett och mättnad").slice(0, 80),
    profile: {
      sex: String(context.profile && context.profile.sex || "unspecified").slice(0, 20),
      age: numberOrNull(context.profile && context.profile.age),
      height: numberOrNull(context.profile && context.profile.height),
      weight: numberOrNull(context.profile && context.profile.weight),
      waist: numberOrNull(context.profile && context.profile.waist),
      targetWaist: numberOrNull(context.profile && context.profile.targetWaist),
      level: String(context.profile && context.profile.level || "").slice(0, 40)
    },
    meal: {
      kcal: numberOrNull(context.meal && context.meal.kcal),
      protein: numberOrNull(context.meal && context.meal.protein),
      carbs: numberOrNull(context.meal && context.meal.carbs),
      fat: numberOrNull(context.meal && context.meal.fat),
      fiber: numberOrNull(context.meal && context.meal.fiber),
      proteinTarget: numberOrNull(context.meal && context.meal.proteinTarget),
      vegGrams: numberOrNull(context.meal && context.meal.vegGrams),
      verdict: String(context.meal && context.meal.verdict || "").slice(0, 160)
    },
    mealItems,
    selectedFoods,
    scanFoods,
    scanQuality: context.scanQuality && typeof context.scanQuality === "object" ? {
      score: numberOrNull(context.scanQuality.score),
      shouldRetake: Boolean(context.scanQuality.shouldRetake),
      advice: String(context.scanQuality.advice || "").slice(0, 160)
    } : null,
    feedback: Array.isArray(context.feedback) ? context.feedback.slice(-20).map((item) => ({
      id: String(item.id || "").slice(0, 60),
      verdict: String(item.verdict || "").slice(0, 20),
      source: String(item.source || "").slice(0, 30)
    })).filter((item) => item.id && item.verdict) : [],
    shoppingList,
    allowedFoodIds
  };
}

function sanitizeFood(food) {
  if (!food || !food.id) return null;
  return {
    id: String(food.id).slice(0, 60),
    name: String(food.name || food.id).slice(0, 90),
    role: String(food.role || "").slice(0, 40),
    kcal: numberOrNull(food.kcal),
    protein: numberOrNull(food.protein),
    fiber: numberOrNull(food.fiber),
    confidence: numberOrNull(food.confidence),
    reason: String(food.reason || "").slice(0, 160),
    visualEvidence: String(food.visualEvidence || "").slice(0, 160),
    confirmed: Boolean(food.confirmed)
  };
}

function sanitizeMealItem(item) {
  if (!item || !item.id) return null;
  return {
    id: String(item.id).slice(0, 60),
    name: String(item.name || item.id).slice(0, 90),
    grams: numberOrNull(item.grams),
    role: String(item.role || "").slice(0, 40),
    suggested: Boolean(item.suggested)
  };
}

function sanitizeHistoryItem(item) {
  const role = item && item.role === "user" ? "user" : item && item.role === "assistant" ? "assistant" : "";
  const content = String(item && (item.text || item.content) || "").trim().slice(0, 900);
  return role && content ? { role, content } : null;
}

function normalizeKitchenReply(reply, context, source, fallbackDetail = "") {
  const allowed = new Set(context.allowedFoodIds || []);
  const cleanIds = (ids, limit) => Array.isArray(ids)
    ? ids.map(String).filter((id) => allowed.has(id)).slice(0, limit)
    : [];
  const cleanList = (items, limit) => Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean).map((item) => item.slice(0, 140)).slice(0, limit)
    : [];

  return {
    source,
    reply: String(reply && reply.reply || "Jag kan hjälpa dig bygga en bättre måltid av det du har.").slice(0, 900),
    mealName: String(reply && reply.mealName || "Smart kylskåpsmåltid").slice(0, 90),
    reasoning: String(reply && reply.reasoning || "Jag väger protein, fiber, grön volym och energitäthet mot ditt mål.").slice(0, 500),
    steps: cleanList(reply && reply.steps, 5),
    add: cleanIds(reply && reply.add, 6),
    remove: cleanIds(reply && reply.remove, 4),
    shopping: cleanList(reply && reply.shopping, 6),
    questions: cleanList(reply && reply.questions, 3),
    shoppingPlan: normalizeShoppingPlan(reply && reply.shoppingPlan),
    nextBestQuestion: String(reply && reply.nextBestQuestion || "").slice(0, 160),
    caution: String(reply && reply.caution || fallbackDetail || "").slice(0, 220)
  };
}

function localKitchenReply(message, context, source = "local", detail = "") {
  const text = message.toLowerCase();
  const selected = context.selectedFoods || [];
  const meal = context.meal || {};
  const allowed = new Set(context.allowedFoodIds || []);
  const has = (id) => selected.some((food) => food.id === id);
  const pick = (ids) => ids.filter((id) => allowed.has(id) && !has(id)).slice(0, 4);
  const add = [];
  const shopping = [];
  const steps = [];

  if (!meal.protein || meal.protein < (meal.proteinTarget || 35) - 5 || text.includes("protein")) {
    add.push(...pick(["chicken", "kvarg", "egg", "tofu", "lentils"]));
    steps.push("Säkra protein först: välj 150-200 g proteinråvara eller 250 g kvarg.");
  }
  if (!meal.vegGrams || meal.vegGrams < 250 || text.includes("grön") || text.includes("fiber")) {
    add.push(...pick(["broccoli", "frozen-veg", "cabbage", "spinach"]));
    steps.push("Bygg volym med 250-350 g grönsaker innan extra fett eller snacks.");
  }
  if (text.includes("träning") || context.goal === "training") {
    add.push(...pick(["potato", "banana", "brownrice", "oats"]));
    steps.push("Efter träning: lägg till 150-250 g potatis/ris eller 1 banan för återhämtning.");
  }
  if (text.includes("snabb") || text.includes("lunch")) {
    shopping.push("Frysta wokgrönsaker", "Kvarg naturell", "Ägg", "Tonfisk eller tofu");
    steps.push("Gör det snabbt: stek/fräs basen 8-10 min och toppa med protein samt 10-15 g fettkälla.");
  }
  if (text.includes("inköp") || text.includes("handla") || text.includes("shopping")) {
    shopping.push("Frysta wokgrönsaker", "Kvarg naturell", "Ägg", "Tonfisk eller tofu", "Bär eller äpplen");
    steps.push("För tre dagar: köp en grön volymbas, två proteinbaser och en enkel frukt/bär-komplettering.");
  }
  if (!steps.length) {
    steps.push("Behåll den valda basen, men kontrollera protein, grön volym och fettmängd i den ordningen.");
  }

  const uniqueAdd = Array.from(new Set(add)).slice(0, 5);
  const uniqueShopping = Array.from(new Set(shopping)).slice(0, 5);
  const reply = meal.kcal
    ? `Jag skulle göra måltiden skarpare genom att först säkra protein och grön volym. Din nuvarande byggare ligger runt ${Math.round(meal.kcal)} kcal, ${Math.round(meal.protein || 0)} g protein och ${Math.round(meal.fiber || 0)} g fiber.`
    : "Jag kan resonera utifrån kylskåpet, men välj eller scanna några råvaror först så blir förslagen mer precisa.";

  return normalizeKitchenReply({
    reply,
    mealName: context.goal === "training" ? "Återhämtningsskål från kylskåpet" : "Mättande midjetallrik",
    reasoning: "Lokal coachlogik prioriterar protein, fiber, grönsaker och kontrollerad energitäthet. Med OpenAI-nyckel blir svaret mer fritt resonerande.",
    steps,
    add: uniqueAdd,
    remove: [],
    shopping: uniqueShopping,
    shoppingPlan: uniqueShopping.map((item, index) => ({
      item,
      grams: index === 0 ? 400 : 250,
      why: index === 0 ? "Ger snabb grön volym och fiber." : "Kompletterar protein eller mättnad.",
      priority: index < 2 ? "hög" : "medium"
    })),
    nextBestQuestion: "Vill du att jag gör en 3-dagars plan från samma råvaror?",
    questions: ["Vill du ha den som frukost, lunchlåda eller middag?", "Ska den vara vegetarisk?", "Hur mycket tid har du?"],
    caution: detail ? `AI-fallback: ${detail}` : ""
  }, context, source, detail);
}

function normalizeShoppingPlan(items) {
  return Array.isArray(items)
    ? items.map((item) => ({
      item: String(item && item.item || "").trim().slice(0, 90),
      grams: numberOrNull(item && item.grams) || 0,
      why: String(item && item.why || "").trim().slice(0, 140),
      priority: String(item && item.priority || "medium").trim().slice(0, 30)
    })).filter((item) => item.item).slice(0, 5)
    : [];
}

function parseModelJSON(data) {
  if (typeof data.output_text === "string") return JSON.parse(data.output_text);
  const text = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.output_text || "")
    .find(Boolean);
  if (!text) return {};
  return JSON.parse(text);
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeApiKey(value) {
  const key = String(value || "").trim().replace(/^["']|["']$/g, "");
  return key.startsWith("sk-") ? key : "";
}

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}
