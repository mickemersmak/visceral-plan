const SLV_BASE_URL = "https://dataportal.livsmedelsverket.se/livsmedel/api/v1";
const SLV_SOURCE_LABEL = "Livsmedelsverkets Livsmedelsdatabas";
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;
const FOOD_CACHE_MS = 6 * 60 * 60 * 1000;

let foodListCache = {
  expiresAt: 0,
  foods: [],
  apiInfo: null,
  note: ""
};

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
    const limit = clampNumber(Number(req.method === "GET" ? req.query && req.query.limit : body.limit) || DEFAULT_LIMIT, 1, MAX_LIMIT);

    if (!query) {
      res.status(400).json({ message: "Skriv ett svenskt livsmedel, till exempel kyckling, kvarg, potatis eller blåbär." });
      return;
    }

    const catalog = await loadFoodCatalog();
    const matches = findFoodMatches(query, catalog.foods, limit);
    const source = catalog.foods.length ? "slv" : "local-fallback";
    const results = await hydrateFoodMatches(matches, source);

    res.status(200).json({
      source,
      sourceLabel: source === "slv" ? SLV_SOURCE_LABEL : "Lokal fallback",
      query,
      count: results.length,
      apiInfo: normalizeApiInfo(catalog.apiInfo),
      note: results.length
        ? catalog.note || attributionText()
        : `Inga svenska livsmedel hittades för "${query}". Testa ett bredare ord som mjölk, kyckling, lax eller potatis.`,
      attribution: attributionText(),
      results
    });
  } catch (error) {
    res.status(500).json({
      message: "Livsmedelssökningen kunde inte slutföras.",
      detail: error && error.message ? error.message : "Unknown error"
    });
  }
};

async function loadFoodCatalog() {
  const now = Date.now();
  if (foodListCache.expiresAt > now) return foodListCache;

  const apiInfo = await fetchApiInfo().catch((error) => ({
    apiName: "LivsmedelData.API",
    apiStatus: "unknown",
    error: error && error.message ? error.message : "api-info unavailable"
  }));
  const list = await fetchFoodList().catch(() => []);
  const foods = Array.isArray(list) ? list.map(normalizeFoodListItem).filter(Boolean) : [];
  const apiReachable = apiInfo && apiInfo.apiStatus && apiInfo.apiStatus !== "unknown" && !apiInfo.error;
  const note = foods.length
    ? attributionText()
    : apiReachable
      ? "Livsmedelsverkets API-info svarar, men list-endpointen gav inga poster just nu. Appen visar lokal fallback tills API-listan levererar data."
      : "Livsmedelsverkets API kunde inte nås från denna miljö. Appen visar lokal fallback tills datakällan svarar.";

  foodListCache = {
    expiresAt: now + FOOD_CACHE_MS,
    foods,
    apiInfo,
    note
  };
  return foodListCache;
}

async function fetchApiInfo() {
  return fetchJSON(`${SLV_BASE_URL}/api-info`);
}

async function fetchFoodList() {
  const data = await fetchJSON(`${SLV_BASE_URL}/livsmedel?offset=0&limit=3000&sprak=1`);
  return Array.isArray(data.livsmedel) ? data.livsmedel : [];
}

async function fetchNutrients(number) {
  if (!Number.isFinite(Number(number))) return [];
  return fetchJSON(`${SLV_BASE_URL}/livsmedel/${encodeURIComponent(number)}/naringsvarden?sprak=1`)
    .catch(() => []);
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data && data.title ? data.title : `Livsmedelsverket svarade ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeFoodListItem(item) {
  if (!item || !item.namn || !item.nummer) return null;
  return {
    number: Number(item.nummer),
    name: cleanText(item.namn, 120),
    type: cleanText(item.livsmedelsTyp, 40),
    typeId: Number(item.livsmedelsTypId) || null,
    version: cleanText(item.version, 40),
    project: cleanText(item.projekt, 100),
    analysis: cleanText(item.analys, 180),
    cookingMethod: cleanText(item.tillagningsmetod, 60),
    scientificName: cleanText(item.vetenskapligtNamn, 80),
    normalized: normalizeText(item.namn)
  };
}

function findFoodMatches(query, foods, limit) {
  const normalizedQuery = normalizeText(query);
  const aliases = resolveFoodAliases(normalizedQuery);
  const sourceFoods = foods.length ? foods : fallbackFoods();
  return sourceFoods
    .map((food) => ({
      ...food,
      score: scoreFoodMatch(food, query, normalizedQuery, aliases)
    }))
    .filter((food) => food.score > 0)
    .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name), "sv"))
    .slice(0, limit);
}

async function hydrateFoodMatches(matches, source) {
  const hydrated = [];
  for (const match of matches) {
    const rawNutrients = source === "slv" ? await fetchNutrients(match.number) : [];
    const nutrients = source === "slv"
      ? normalizeNutrients(rawNutrients)
      : match.nutrients;
    hydrated.push({
      number: match.number,
      name: match.name,
      type: match.type,
      typeId: match.typeId || null,
      version: match.version || "",
      project: match.project || "",
      analysis: match.analysis || "",
      cookingMethod: match.cookingMethod || "",
      scientificName: match.scientificName || "",
      score: Math.round(match.score),
      source,
      sourceLabel: source === "slv" ? SLV_SOURCE_LABEL : "Lokal fallback",
      sourceUrl: source === "slv"
        ? `https://dataportal.livsmedelsverket.se/livsmedel/swagger/index.html`
        : "",
      matchedPantryId: match.matchedPantryId || "",
      matchedPantryName: match.matchedPantryName || "",
      nutrients,
      nutrientBasis: source === "slv" ? "per 100 g ätbar del enligt källan" : "per 100 g från appens lokala råvarubank",
      rawNutrients: source === "slv" ? summarizeRawNutrients(rawNutrients) : []
    });
  }
  return hydrated;
}

function normalizeNutrients(values) {
  const items = (Array.isArray(values) ? values : []).map((nutrient) => ({
    nutrient,
    text: normalizeText(`${nutrient.euroFIRkod || ""} ${nutrient.forkortning || ""} ${nutrient.namn || ""}`),
    unit: normalizeText(nutrient.enhet || "")
  }));
  const find = (predicate) => {
    const item = items.find(predicate);
    return item ? roundNumber(item.nutrient.varde) : null;
  };
  const findText = (...patterns) => find((item) => patterns.some((pattern) => item.text.includes(pattern)));

  return {
    kcal: find((item) => item.unit === "kcal" || item.text.includes("energikcal")),
    protein: findText("prot", "protein"),
    carbs: findText("chocdf", "kolhydrat"),
    fat: findText("fat", "fett"),
    fiber: findText("fibt", "fiber"),
    sugar: findText("sugar", "sockerarter", "mono"),
    salt: findText("salt", "natriumklorid", "nacl")
  };
}

function summarizeRawNutrients(values) {
  return (Array.isArray(values) ? values : [])
    .map((item) => ({
      name: cleanText(item.namn, 70),
      code: cleanText(item.euroFIRkod || item.forkortning, 20),
      value: roundNumber(item.varde),
      unit: cleanText(item.enhet, 12),
      basis: Number(item.viktGram) || 100,
      method: cleanText(item.metodtyp || item.vardetyp || item.ursprung, 80)
    }))
    .filter((item) => item.name && Number.isFinite(item.value))
    .slice(0, 12);
}

function scoreFoodMatch(food, rawQuery, normalizedQuery, aliases) {
  const normalizedName = food.normalized || normalizeText(food.name);
  const normalizedRaw = normalizeText(rawQuery);
  const terms = Array.from(new Set([normalizedQuery, normalizedRaw, ...aliases].filter(Boolean)));
  let best = 0;
  for (const term of terms) {
    if (!term) continue;
    if (normalizedName === term) best = Math.max(best, 120);
    if (normalizedName.startsWith(term)) best = Math.max(best, 96);
    if (normalizedName.includes(term)) best = Math.max(best, 78);
    if (term.includes(normalizedName) && normalizedName.length > 4) best = Math.max(best, 70);
    const overlap = tokenOverlap(normalizedName, term);
    if (overlap) best = Math.max(best, 42 + overlap * 16);
  }
  if (best > 0 && food.matchedPantryName) best += 8;
  if (best > 0 && /rå|naturell|kokt|fil[eé]|utan/i.test(food.name)) best += 4;
  return best;
}

function tokenOverlap(name, query) {
  const nameTokens = tokenize(name);
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return 0;
  const hits = queryTokens.filter((token) => nameTokens.some((nameToken) => nameToken.includes(token) || token.includes(nameToken)));
  return hits.length / queryTokens.length;
}

function tokenize(value) {
  return String(value || "")
    .split(/[^a-z0-9åäö]+/i)
    .map(normalizeText)
    .filter((token) => token.length > 2);
}

function resolveFoodAliases(normalizedQuery) {
  const aliases = {
    agg: ["ägg"],
    bar: ["bär", "blåbär", "jordgubbar"],
    blabar: ["blåbär"],
    brod: ["bröd", "rågbröd"],
    chicken: ["kyckling"],
    cottagecheese: ["keso"],
    kycklingfile: ["kyckling", "kycklingfilé"],
    kvarg: ["kvarg", "färskost kvarg"],
    lax: ["lax", "salmon"],
    mjolk: ["mjölk"],
    notfars: ["nötfärs", "köttfärs"],
    olivolja: ["olja oliv"],
    potatis: ["potatis"],
    rakor: ["räkor"],
    ris: ["ris"],
    skyr: ["skyr"],
    spenat: ["spenat"],
    torsk: ["torsk"],
    yoghurt: ["yoghurt", "yogurt"]
  };
  return (aliases[normalizedQuery] || []).map(normalizeText);
}

function fallbackFoods() {
  return [
    fallbackFood("egg", "Ägg", "analyserat", { kcal: 143, protein: 13, carbs: 1, fat: 10, fiber: 0, sugar: 0, salt: 0.35 }),
    fallbackFood("chicken", "Kycklingfilé", "lokal råvarubank", { kcal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, salt: 0.18 }),
    fallbackFood("salmon", "Lax", "lokal råvarubank", { kcal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, salt: 0.12 }),
    fallbackFood("cod", "Torsk", "lokal råvarubank", { kcal: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, salt: 0.2 }),
    fallbackFood("kvarg", "Kvarg naturell", "lokal råvarubank", { kcal: 60, protein: 11, carbs: 4, fat: 0.2, fiber: 0, sugar: 4, salt: 0.1 }),
    fallbackFood("skyr", "Skyr naturell", "lokal råvarubank", { kcal: 65, protein: 11, carbs: 4, fat: 0.2, fiber: 0, sugar: 4, salt: 0.1 }),
    fallbackFood("broccoli", "Broccoli", "lokal råvarubank", { kcal: 35, protein: 3, carbs: 7, fat: 0.4, fiber: 3, sugar: 1.5, salt: 0.03 }),
    fallbackFood("potato", "Potatis kokt", "lokal råvarubank", { kcal: 87, protein: 2, carbs: 20, fat: 0.1, fiber: 2, sugar: 1, salt: 0.01 }),
    fallbackFood("oats", "Havregryn", "lokal råvarubank", { kcal: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, sugar: 1, salt: 0.01 }),
    fallbackFood("blueberries", "Blåbär", "lokal råvarubank", { kcal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10, salt: 0.01 })
  ];
}

function fallbackFood(id, name, type, nutrients) {
  return {
    number: `local-${id}`,
    name,
    type,
    typeId: null,
    version: "",
    project: "",
    analysis: "",
    cookingMethod: "",
    scientificName: "",
    normalized: normalizeText(name),
    matchedPantryId: id,
    matchedPantryName: name,
    nutrients
  };
}

function normalizeApiInfo(info) {
  return {
    apiName: cleanText(info && info.apiName, 80),
    apiVersion: cleanText(info && info.apiVersion, 40),
    apiReleased: cleanText(info && info.apiReleased, 40),
    apiDocumentation: cleanText(info && info.apiDocumentation, 180),
    apiStatus: cleanText(info && info.apiStatus, 40),
    error: cleanText(info && info.error, 120)
  };
}

function attributionText() {
  return "Källa: Livsmedelsverkets Livsmedelsdatabas. Näringsvärden anges per 100 g ätbar del när SLV-data finns.";
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9åäö]+/g, " ")
    .trim()
    .replace(/\s+/g, "");
}

function roundNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : null;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}
