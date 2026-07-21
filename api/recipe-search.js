const THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1";
const DEFAULT_THEMEALDB_KEY = "1";

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ message: "Only GET and POST are allowed." });
    return;
  }

  try {
    const body = req.method === "POST"
      ? (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}))
      : {};
    const query = cleanText(req.method === "GET" ? req.query && req.query.q : body.query, 80);
    const limit = clampNumber(Number(req.method === "GET" ? req.query && req.query.limit : body.limit) || 8, 1, 12);

    if (!query) {
      res.status(400).json({ message: "Skriv vad du vill söka efter, till exempel kyckling, lax eller vegetarisk." });
      return;
    }

    const search = await searchTheMealDB(query, limit);
    res.status(200).json({
      source: "themealdb",
      sourceLabel: "TheMealDB",
      query,
      count: search.recipes.length,
      note: search.note,
      recipes: search.recipes
    });
  } catch (error) {
    res.status(500).json({
      message: "Receptsökningen kunde inte slutföras.",
      detail: error && error.message ? error.message : "Unknown error"
    });
  }
};

async function searchTheMealDB(query, limit) {
  const apiKey = cleanApiKey(process.env.THEMEALDB_API_KEY) || DEFAULT_THEMEALDB_KEY;
  const base = `${THEMEALDB_BASE_URL}/${encodeURIComponent(apiKey)}`;
  const terms = resolveSearchTerms(query);
  const mealsById = new Map();

  for (const term of terms.nameTerms) {
    const data = await fetchJSON(`${base}/search.php?s=${encodeURIComponent(term)}`);
    for (const meal of Array.isArray(data.meals) ? data.meals : []) {
      if (meal && meal.idMeal) mealsById.set(meal.idMeal, meal);
      if (mealsById.size >= limit) break;
    }
    if (mealsById.size >= limit) break;
  }

  for (const ingredient of terms.ingredientTerms) {
    if (mealsById.size >= limit) break;
    const data = await fetchJSON(`${base}/filter.php?i=${encodeURIComponent(ingredient.replace(/\s+/g, "_"))}`);
    const hits = Array.isArray(data.meals) ? data.meals.slice(0, limit) : [];
    for (const hit of hits) {
      if (!hit || !hit.idMeal || mealsById.has(hit.idMeal)) continue;
      const details = await fetchJSON(`${base}/lookup.php?i=${encodeURIComponent(hit.idMeal)}`);
      const [meal] = Array.isArray(details.meals) ? details.meals : [];
      if (meal && meal.idMeal) mealsById.set(meal.idMeal, meal);
      if (mealsById.size >= limit) break;
    }
  }

  for (const category of terms.categoryTerms) {
    if (mealsById.size >= limit) break;
    const data = await fetchJSON(`${base}/filter.php?c=${encodeURIComponent(category)}`);
    const hits = Array.isArray(data.meals) ? data.meals.slice(0, limit) : [];
    for (const hit of hits) {
      if (!hit || !hit.idMeal || mealsById.has(hit.idMeal)) continue;
      const details = await fetchJSON(`${base}/lookup.php?i=${encodeURIComponent(hit.idMeal)}`);
      const [meal] = Array.isArray(details.meals) ? details.meals : [];
      if (meal && meal.idMeal) mealsById.set(meal.idMeal, meal);
      if (mealsById.size >= limit) break;
    }
  }

  const recipes = Array.from(mealsById.values())
    .map(normalizeMeal)
    .filter(Boolean)
    .slice(0, limit);

  return {
    recipes,
    note: recipes.length
      ? "Riktiga recept hämtade via TheMealDB. Bilder, titel och källinstruktioner visas med länk till ursprungskällan."
      : "Inga externa recept hittades. Testa ett bredare ord som kyckling, salmon, beef, vegetarian eller soup."
  };
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8500);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data && data.message ? data.message : `TheMealDB svarade ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeMeal(meal) {
  const ingredients = extractIngredients(meal);
  const instructions = splitInstructions(meal.strInstructions);
  const tags = String(meal.strTags || "")
    .split(",")
    .map((item) => cleanText(item, 28))
    .filter(Boolean)
    .slice(0, 6);
  const title = cleanText(meal.strMeal, 100);
  if (!title || !ingredients.length) return null;

  const providerUrl = `https://www.themealdb.com/meal/${encodeURIComponent(meal.idMeal)}`;
  return {
    id: `themealdb-${meal.idMeal}`,
    externalId: String(meal.idMeal || ""),
    title,
    source: "themealdb",
    sourceLabel: "TheMealDB",
    sourceUrl: cleanUrl(meal.strSource) || providerUrl,
    providerUrl,
    image: cleanUrl(meal.strMealThumb),
    youtube: cleanUrl(meal.strYoutube),
    category: cleanText(meal.strCategory, 36),
    area: cleanText(meal.strArea, 36),
    tags,
    minutes: estimateMinutes(meal, instructions),
    difficulty: estimateDifficulty(ingredients, instructions),
    ingredients,
    instructions,
    attribution: "Receptdata och bild via TheMealDB. Öppna källan för originalreceptet."
  };
}

function extractIngredients(meal) {
  const items = [];
  for (let index = 1; index <= 20; index += 1) {
    const name = cleanText(meal[`strIngredient${index}`], 70);
    if (!name) continue;
    const measure = cleanText(meal[`strMeasure${index}`], 55);
    const grams = estimateGrams(name, measure);
    items.push({
      name,
      measure,
      grams,
      gramsConfidence: metricConfidence(measure),
      original: measure ? `${measure} ${name}` : name
    });
  }
  return items.slice(0, 14);
}

function splitInstructions(value) {
  const text = cleanText(value, 2400)
    .replace(/\r/g, "\n")
    .replace(/\s+\./g, ".")
    .trim();
  if (!text) return [];

  const byLine = text
    .split(/\n+/)
    .map((line) => cleanText(line.replace(/^\d+[.)-]\s*/, ""), 260))
    .filter((line) => line.length > 18);
  const lines = byLine.length >= 3
    ? byLine
    : text.split(/(?<=[.!?])\s+/).map((line) => cleanText(line, 260)).filter((line) => line.length > 18);
  return lines.slice(0, 8);
}

function resolveSearchTerms(query) {
  const normalized = normalizeText(query);
  const aliases = {
    agg: { name: "egg", ingredient: "egg" },
    biff: { name: "beef", ingredient: "beef" },
    fisk: { name: "fish", ingredient: "fish" },
    kyckling: { name: "chicken", ingredient: "chicken" },
    kycklingfile: { name: "chicken", ingredient: "chicken breast" },
    lax: { name: "salmon", ingredient: "salmon" },
    linser: { name: "lentils", ingredient: "lentils" },
    notfars: { name: "beef", ingredient: "beef" },
    pasta: { name: "pasta", ingredient: "pasta" },
    rakor: { name: "shrimp", ingredient: "shrimp" },
    ris: { name: "rice", ingredient: "rice" },
    soppa: { name: "soup", category: "Starter" },
    torsk: { name: "cod", ingredient: "cod" },
    tonfisk: { name: "tuna", ingredient: "tuna" },
    vegetariskt: { name: "vegetarian", category: "Vegetarian" },
    vegetarisk: { name: "vegetarian", category: "Vegetarian" },
    vego: { name: "vegetarian", category: "Vegetarian" }
  };
  const alias = aliases[normalized] || {};
  const nameTerms = uniqueList([query, alias.name].filter(Boolean));
  const ingredientTerms = uniqueList([alias.ingredient, query].filter(Boolean));
  const categoryTerms = uniqueList([alias.category].filter(Boolean));
  return { nameTerms, ingredientTerms, categoryTerms };
}

function estimateGrams(name, measure) {
  const normalizedMeasure = normalizeMeasure(measure);
  const normalizedName = normalizeText(name);
  const parsed = parseMeasuredGrams(normalizedMeasure);
  if (parsed) return clampNumber(Math.round(parsed / 5) * 5, 3, 900);

  if (/salt|pepper|spice|cumin|paprika|oregano|basil|thyme|chilli|chili|cinnamon/.test(normalizedName)) return 2;
  if (/garlic|ginger/.test(normalizedName)) return 8;
  if (/oil|butter|honey|syrup|sugar|cream|mayonnaise|mayo/.test(normalizedName)) return 15;
  if (/lemon|lime/.test(normalizedName)) return 40;
  if (/egg/.test(normalizedName)) return 55;
  if (/chicken|beef|pork|salmon|cod|fish|tuna|turkey|tofu|tempeh|shrimp|prawn/.test(normalizedName)) return 150;
  if (/rice|pasta|potato|noodle|quinoa|bread|oat/.test(normalizedName)) return 160;
  if (/bean|lentil|chickpea/.test(normalizedName)) return 170;
  if (/broccoli|spinach|cabbage|lettuce|tomato|pepper|onion|carrot|mushroom|zucchini|cauliflower/.test(normalizedName)) return 160;
  if (/apple|banana|orange|berries|strawberry|blueberry|pear|grape/.test(normalizedName)) return 130;
  return 80;
}

function parseMeasuredGrams(measure) {
  if (!measure) return 0;
  const number = parseMeasureNumber(measure);
  if (!number) return 0;

  if (/\bkg\b|kilogram/.test(measure)) return number * 1000;
  if (/\bg\b|gram/.test(measure)) return number;
  if (/\bl\b|litre|liter/.test(measure) && !/\bml\b/.test(measure)) return number * 1000;
  if (/\bml\b|millilitre|milliliter/.test(measure)) return number;
  if (/\blb\b|pound/.test(measure)) return number * 454;
  if (/\boz\b|ounce/.test(measure)) return number * 28.35;
  if (/cup/.test(measure)) return number * 120;
  if (/tablespoon|tbsp/.test(measure)) return number * 15;
  if (/teaspoon|tsp/.test(measure)) return number * 5;
  if (/clove/.test(measure)) return number * 5;
  if (/slice/.test(measure)) return number * 35;
  if (/can|tin/.test(measure)) return number * 160;
  if (/bunch/.test(measure)) return number * 80;
  if (/handful/.test(measure)) return number * 30;
  return 0;
}

function parseMeasureNumber(value) {
  const clean = String(value || "")
    .replace(/½/g, " 1/2")
    .replace(/¼/g, " 1/4")
    .replace(/¾/g, " 3/4")
    .replace(/⅓/g, " 1/3")
    .replace(/⅔/g, " 2/3");
  const mixed = clean.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Math.max(1, Number(mixed[3]));
  const fraction = clean.match(/(\d+)\/(\d+)/);
  if (fraction) return Number(fraction[1]) / Math.max(1, Number(fraction[2]));
  const decimal = clean.match(/\d+(?:[.,]\d+)?/);
  return decimal ? Number(decimal[0].replace(",", ".")) : 0;
}

function metricConfidence(measure) {
  const normalized = normalizeMeasure(measure);
  if (/\b(g|kg|ml|l)\b|gram|liter|litre/.test(normalized)) return "hög";
  if (/cup|tbsp|tablespoon|tsp|teaspoon|oz|lb|slice|can|tin/.test(normalized)) return "omräknad";
  return "uppskattad";
}

function estimateMinutes(meal, instructions) {
  const category = normalizeText(meal.strCategory);
  let minutes = 18 + Math.min(24, instructions.length * 4);
  if (/breakfast|starter|side/.test(category)) minutes -= 8;
  if (/dessert/.test(category)) minutes += 12;
  if (/beef|lamb|pork/.test(category)) minutes += 6;
  return clampNumber(Math.round(minutes / 5) * 5, 10, 75);
}

function estimateDifficulty(ingredients, instructions) {
  const steps = instructions.length;
  if (ingredients.length >= 10 || steps >= 7) return "Avancerad";
  if (ingredients.length >= 7 || steps >= 4) return "Medel";
  return "Lätt";
}

function normalizeMeasure(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) ? url.slice(0, 500) : "";
}

function cleanApiKey(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "").slice(0, 80);
}

function uniqueList(items) {
  return Array.from(new Set(items.map((item) => cleanText(item, 80)).filter(Boolean))).slice(0, 4);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}
