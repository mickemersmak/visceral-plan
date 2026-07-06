const {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_MODEL,
  getGeminiKey,
  getOpenAIKey,
  providerFailureDetail,
  requestGeminiJSON,
  requestGeminiText,
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
    const debug = Boolean(body.debug);

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

    const geminiModel = process.env.GEMINI_FRIDGE_MODEL || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const geminiText = await requestGeminiText({
      apiKey: getGeminiKey(),
      model: geminiModel,
      prompt: buildFreeTextDetectionPrompt(goal, foods, images.length),
      images
    });
    if (geminiText.ok) {
      const textScan = buildScanFromGeminiText(geminiText.text, foods, goal);
      sendFridgeScan(res, textScan, foods, detail, images.length, geminiText.provider, debug ? {
        stage: "free-text-primary",
        freeText: String(geminiText.text || "").slice(0, 800),
        rawShape: summarizeRawShape(geminiText.raw),
        mergedSuggestions: summarizeDebugItems(textScan.suggestions)
      } : null);
      return;
    }
    failures.push(geminiText);

    const gemini = await requestGeminiJSON({
      apiKey: getGeminiKey(),
      model: geminiModel,
      prompt,
      images,
      schema
    });
    if (gemini.ok) {
      const enriched = await enrichGeminiScanIfEmpty(gemini.value, {
        apiKey: getGeminiKey(),
        model: process.env.GEMINI_FRIDGE_MODEL || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
        images,
        foods,
        goal,
        imageCount: images.length
      });
      sendFridgeScan(res, enriched.value, foods, detail, images.length, gemini.provider, debug ? enriched.debug : null);
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

function sendFridgeScan(res, parsed, foods, detail, imageCount, source, debugInfo = null) {
    const resolveFoodId = createFoodResolver(foods);

    const payload = {
      source,
      suggestions: normalizeSuggestions(parsed.suggestions, resolveFoodId),
      uncertain: normalizeUncertain(parsed.uncertain, resolveFoodId),
      quality: normalizeQuality(parsed.quality, detail),
      mealIdea: normalizeMealIdea(parsed.mealIdea, resolveFoodId),
      shopping: normalizeShopping(parsed.shopping),
      detail,
      imageCount,
      note: String(parsed.note || "Kontrollera råvarorna innan du lägger till dem.").slice(0, 220)
    };
    if (debugInfo) payload.debug = debugInfo;
    res.status(200).json(payload);
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

function fridgeLabelSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      labels: {
        type: "array",
        maxItems: 18,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            visualEvidence: { type: "string" }
          },
          required: ["label", "confidence", "visualEvidence"]
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
      note: { type: "string" }
    },
    required: ["labels", "quality", "note"]
  };
}

function buildPrompt(goal, foods, profile, feedback, imageCount) {
  const catalog = foods.map((food) => `${food.id}: ${food.name} (${food.role}${food.category ? `, ${food.category}` : ""})`).join("\n");
  return [
    "Du är en svensk premiumscanner för kylskåp, måltider och bukfettsfokus.",
    "Du kan få flera bilder från samma kylskåp, till exempel olika hyllor eller dörrfack.",
    "Slå ihop fynd från alla bilder, men duplicera inte samma råvara.",
    "Identifiera bara råvaror som syns tydligt eller rimligt i bilderna. Hitta aldrig på id.",
    "suggestions.id, uncertain.id och mealIdea.addIds måste vara exakt ett id från listan nedan.",
    "Om du ser svensk text på förpackning, varumärke eller kategori ska du mappa till närmaste råvaru-id från listan.",
    "När du är rimligt säker på kategori men inte exakt variant: använd närmaste id, sätt confidence 0.55-0.72 och needsConfirmation=true.",
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

function buildLabelDetectionPrompt(goal, foods, imageCount) {
  const catalog = foods.map((food) => `${food.id}: ${food.name}`).join("\n");
  return [
    "Du är ett visuellt kylskåpsöga. Din enda uppgift är att lista synliga matvaror i bilderna.",
    "Använd fria svenska råvarunamn eller förpackningstyper i labels, till exempel mjölk, ägg, ost, skinka, tomat, gurka, sallad, broccoli, blåbär.",
    "Du behöver inte returnera appens id i detta steg. Skriv det du faktiskt ser som enkel label.",
    "Lista hellre rimliga osäkra kategorier med lägre confidence än att returnera tomt när mat tydligt syns.",
    "Returnera tom labels-lista bara om bilden inte innehåller synlig mat eller dryck.",
    "Använd visualEvidence för placering, färg, form, förpackning eller läst text.",
    `Måltidsmål: ${goal}. Antal bilder: ${imageCount}.`,
    "Appens råvarukatalog, som senare mappas automatiskt:",
    catalog
  ].join("\n");
}

async function enrichGeminiScanIfEmpty(parsed, options) {
  const resolveFoodId = createFoodResolver(options.foods);
  if (hasResolvedFood(parsed, resolveFoodId)) {
    return {
      value: parsed,
      debug: {
        stage: "primary-had-food",
        primarySuggestions: summarizeDebugItems(parsed && parsed.suggestions),
        primaryUncertain: summarizeDebugItems(parsed && parsed.uncertain)
      }
    };
  }

  const detected = await requestGeminiJSON({
    apiKey: options.apiKey,
    model: options.model,
    prompt: buildLabelDetectionPrompt(options.goal, options.foods, options.imageCount),
    images: options.images,
    schema: fridgeLabelSchema()
  });
  if (detected.ok) {
    const merged = mergeDetectedLabels(parsed, detected.value, resolveFoodId);
    if (hasResolvedFood(merged, resolveFoodId)) {
      return {
        value: merged,
        debug: {
          stage: "label-detection-merged",
          primarySuggestions: summarizeDebugItems(parsed && parsed.suggestions),
          primaryUncertain: summarizeDebugItems(parsed && parsed.uncertain),
          labels: summarizeDebugItems(detected.value && detected.value.labels),
          mergedSuggestions: summarizeDebugItems(merged && merged.suggestions)
        }
      };
    }
  }

  const freeText = await requestGeminiText({
    apiKey: options.apiKey,
    model: options.model,
    prompt: buildFreeTextDetectionPrompt(options.goal, options.foods, options.imageCount),
    images: options.images
  });
  if (freeText.ok) {
    const textMerged = mergeDetectedText(parsed, freeText.text, options.foods);
    return {
      value: textMerged,
      debug: {
        stage: "free-text-merged",
        labelDetectionError: detected.ok ? "" : detected.message,
        labels: detected.ok ? summarizeDebugItems(detected.value && detected.value.labels) : [],
        freeText: String(freeText.text || "").slice(0, 800),
        mergedSuggestions: summarizeDebugItems(textMerged && textMerged.suggestions)
      }
    };
  }

  if (!detected.ok) {
    return {
      value: parsed,
      debug: {
        stage: "label-detection-failed",
        error: detected.message,
        primarySuggestions: summarizeDebugItems(parsed && parsed.suggestions),
        primaryUncertain: summarizeDebugItems(parsed && parsed.uncertain)
      }
    };
  }

  return {
    value: parsed,
    debug: {
      stage: "all-detection-empty",
      primarySuggestions: summarizeDebugItems(parsed && parsed.suggestions),
      primaryUncertain: summarizeDebugItems(parsed && parsed.uncertain),
      labels: summarizeDebugItems(detected.value && detected.value.labels),
      freeTextError: freeText.message
    }
  };
}

function summarizeDebugItems(items) {
  return Array.isArray(items)
    ? items.slice(0, 12).map((item) => ({
      id: item && item.id,
      name: item && item.name,
      label: item && item.label,
      confidence: item && item.confidence,
      reason: item && item.reason,
      visualEvidence: item && item.visualEvidence
    }))
    : [];
}

function summarizeRawShape(value) {
  if (!value || typeof value !== "object") return {};
  return {
    keys: Object.keys(value).slice(0, 12),
    outputType: Array.isArray(value.output) ? "array" : typeof value.output,
    outputKeys: Array.isArray(value.output) && value.output[0] && typeof value.output[0] === "object" ? Object.keys(value.output[0]).slice(0, 12) : [],
    candidateKeys: Array.isArray(value.candidates) && value.candidates[0] && typeof value.candidates[0] === "object" ? Object.keys(value.candidates[0]).slice(0, 12) : [],
    stepKeys: Array.isArray(value.steps) && value.steps[0] && typeof value.steps[0] === "object" ? Object.keys(value.steps[0]).slice(0, 12) : [],
    firstStep: Array.isArray(value.steps) && value.steps[0] ? JSON.stringify(value.steps[0]).slice(0, 1200) : ""
  };
}

function hasResolvedFood(parsed, resolveFoodId) {
  const suggestions = Array.isArray(parsed && parsed.suggestions) ? parsed.suggestions : [];
  const uncertain = Array.isArray(parsed && parsed.uncertain) ? parsed.uncertain : [];
  return [...suggestions, ...uncertain].some((item) => resolveFoodId(item.id, item.name, item.label, item.reason, item.visualEvidence));
}

function mergeDetectedLabels(parsed, detected, resolveFoodId) {
  const next = parsed && typeof parsed === "object" ? { ...parsed } : {};
  const current = [
    ...(Array.isArray(next.suggestions) ? next.suggestions : []),
    ...(Array.isArray(next.uncertain) ? next.uncertain : [])
  ];
  const seen = new Set(current.map((item) => resolveFoodId(item.id, item.name, item.label)).filter(Boolean));
  const labels = Array.isArray(detected && detected.labels) ? detected.labels : [];
  const additions = labels.map((item) => {
    const id = resolveFoodId(item.id, item.name, item.label, item.visualEvidence);
    if (!id || seen.has(id)) return null;
    seen.add(id);
    const confidence = clampNumber(item.confidence, 0.4, 0.88);
    return {
      id,
      confidence,
      reason: "Matchad från fri Gemini-detektion.",
      visualEvidence: String(item.visualEvidence || item.label || "Synlig i kylskåpsbilden.").slice(0, 140),
      needsConfirmation: confidence < 0.76
    };
  }).filter(Boolean);

  next.suggestions = [...(Array.isArray(next.suggestions) ? next.suggestions : []), ...additions].slice(0, 10);
  if (!next.quality && detected && detected.quality) next.quality = detected.quality;
  if (!next.note && detected && detected.note) next.note = detected.note;
  return next;
}

function buildFreeTextDetectionPrompt(goal, foods, imageCount) {
  const examples = foods.map((food) => food.name || food.id).slice(0, 80).join(", ");
  return [
    "Titta på kylskåpsbilden och skriv en enkel kommaseparerad lista över alla synliga livsmedel och förpackningar.",
    "Svara inte med recept. Svara inte med JSON. Skriv bara råvaror/varor du ser.",
    "Ta med tydliga frukter, grönsaker, ägg, mejeri, yoghurt, mjölk, ost, pålägg, burkar och flaskor.",
    "Om något är osäkert, skriv ändå kategorin med ordet 'möjligen'.",
    `Mål: ${goal}. Antal bilder: ${imageCount}.`,
    `Exempel på ord appen kan förstå: ${examples}.`
  ].join("\n");
}

function mergeDetectedText(parsed, text, foods) {
  const next = parsed && typeof parsed === "object" ? { ...parsed } : {};
  const ids = findFoodIdsInText(text, foods);
  const existing = new Set([
    ...(Array.isArray(next.suggestions) ? next.suggestions : []),
    ...(Array.isArray(next.uncertain) ? next.uncertain : [])
  ].map((item) => item && item.id).filter(Boolean));
  const additions = ids
    .filter((id) => !existing.has(id))
    .map((id) => ({
      id,
      confidence: 0.64,
      reason: "Matchad från fri Gemini-bildbeskrivning.",
      visualEvidence: "Gemini beskrev varan i kylskåpsbilden.",
      needsConfirmation: true
    }));
  next.suggestions = [...(Array.isArray(next.suggestions) ? next.suggestions : []), ...additions].slice(0, 10);
  if (!next.note && additions.length) next.note = "AI:n hittade råvaror via fri bildbeskrivning. Bekräfta träffarna innan du bygger måltiden.";
  return next;
}

function buildScanFromGeminiText(text, foods, goal) {
  const ids = findFoodIdsInText(text, foods).slice(0, 10);
  const namesById = new Map((Array.isArray(foods) ? foods : []).map((food) => [food.id, food.name || food.id]));
  const suggestions = ids.map((id) => ({
    id,
    confidence: 0.68,
    reason: "Hittad via Gemini-bildbeskrivning.",
    visualEvidence: `Gemini beskrev bilden med text som matchar ${namesById.get(id) || id}.`,
    needsConfirmation: true
  }));
  return {
    suggestions,
    uncertain: [],
    quality: {
      score: suggestions.length ? 0.72 : 0.52,
      lighting: "Bedömd via Gemini-bildbeskrivning.",
      framing: "Kylskåpsbilden lästes som helhetsbild.",
      occlusion: "Kontrollera skymda varor manuellt.",
      shouldRetake: suggestions.length === 0,
      advice: suggestions.length
        ? "Bekräfta träffarna och lägg till fler hyllbilder för ännu bättre precision."
        : "Ta en närmare bild med tydligare råvaror och mindre dörr/skuggor."
    },
    mealIdea: {
      title: goal === "training" ? "Snabb återhämtningsmåltid" : "Smart midjemåltid från kylskåpet",
      text: suggestions.length
        ? "Lägg till träffarna och låt Köks-AI räkna gram, protein och grön volym."
        : "AI:n kunde läsa bilden men hittade inga matchade råvaror i appens bank.",
      addIds: ids.slice(0, 5)
    },
    shopping: suggestions.length < 3 ? ["Kvarg naturell", "Ägg", "Frysta wokgrönsaker"] : [],
    note: suggestions.length
      ? "Gemini hittade råvaror via fri bildbeskrivning. Bekräfta träffarna innan du bygger måltiden."
      : "Gemini kunde inte matcha synliga varor till råvarubanken. Testa närmare bild eller fler hyllor."
  };
}

function normalizeSuggestions(items, resolveFoodId) {
  const seen = new Set();
  return Array.isArray(items)
    ? items
      .map((item) => {
        const id = resolveFoodId(item.id, item.name, item.label, item.reason, item.visualEvidence);
        if (!id || seen.has(id)) return null;
        seen.add(id);
        return {
          id,
          confidence: clampNumber(item.confidence, 0.35, 0.98),
          reason: String(item.reason || "Identifierad i bilden.").slice(0, 140),
          visualEvidence: String(item.visualEvidence || "Syns i kylskåpsbilden.").slice(0, 140),
          needsConfirmation: Boolean(item.needsConfirmation) || Number(item.confidence) < 0.72
        };
      })
      .filter(Boolean)
      .slice(0, 10)
    : [];
}

function normalizeUncertain(items, resolveFoodId) {
  const seen = new Set();
  return Array.isArray(items)
    ? items
      .map((item) => {
        const id = resolveFoodId(item.id, item.name, item.label, item.question, item.reason);
        if (!id || seen.has(id)) return null;
        seen.add(id);
        return {
          id,
          confidence: clampNumber(item.confidence, 0.2, 0.72),
          question: String(item.question || "Stämmer detta?").slice(0, 140),
          alternatives: Array.isArray(item.alternatives)
            ? item.alternatives.map((value) => resolveFoodId(value)).filter(Boolean).filter((value) => value !== id).slice(0, 3)
            : [],
          reason: String(item.reason || "Osäkert fynd i bilden.").slice(0, 140)
        };
      })
      .filter(Boolean)
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

function normalizeMealIdea(value, resolveFoodId) {
  const idea = value && typeof value === "object" ? value : {};
  return {
    title: String(idea.title || "Smart kylskåpsmåltid").slice(0, 90),
    text: String(idea.text || "Lägg till råvarorna i byggaren och låt Köks-AI skruva gram och balans.").slice(0, 180),
    addIds: Array.isArray(idea.addIds)
      ? Array.from(new Set(idea.addIds.map((value) => resolveFoodId(value)).filter(Boolean))).slice(0, 5)
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

function createFoodResolver(foods) {
  const list = Array.isArray(foods) ? foods.filter((food) => food && food.id) : [];
  const byId = new Map(list.map((food) => [String(food.id), food]));
  const aliasEntries = Object.entries(foodAliases()).sort((a, b) => b[0].length - a[0].length);

  return (...candidates) => {
    for (const candidate of candidates) {
      const id = resolveFoodCandidate(candidate, list, byId, aliasEntries);
      if (id) return id;
    }
    return "";
  };
}

function resolveFoodCandidate(value, foods, byId, aliasEntries) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (byId.has(raw)) return raw;

  const normalized = normalizeScanText(raw);
  if (!normalized) return "";

  const exactId = foods.find((food) => normalizeScanText(food.id) === normalized);
  if (exactId) return exactId.id;

  const exactName = foods.find((food) => normalizeScanText(food.name) === normalized);
  if (exactName) return exactName.id;

  for (const [alias, id] of aliasEntries) {
    if (!byId.has(id)) continue;
    if (normalized === alias || (alias.length > 3 && normalized.includes(alias))) return id;
  }

  const byName = foods.find((food) => {
    const name = normalizeScanText(food.name);
    const id = normalizeScanText(food.id);
    return (name.length > 3 && (name.includes(normalized) || normalized.includes(name))) ||
      (id.length > 3 && normalized.includes(id));
  });
  return byName ? byName.id : "";
}

function foodAliases() {
  return {
    agg: "egg",
    aggkartong: "egg",
    eggs: "egg",
    egg: "egg",
    kyckling: "chicken",
    kycklingfile: "chicken",
    chickenbreast: "chicken",
    lax: "salmon",
    salmon: "salmon",
    tonfisk: "tuna",
    tuna: "tuna",
    torsk: "cod",
    kalkon: "turkey",
    rakor: "shrimp",
    prawns: "shrimp",
    tofu: "tofu",
    tempeh: "tempeh",
    keso: "cottage",
    cottagecheese: "cottage",
    kvarg: "kvarg",
    kesella: "kvarg",
    yoghurt: "yogurt",
    yogurt: "yogurt",
    grekiskyoghurt: "yogurt",
    skyr: "skyr",
    proteinpudding: "protein-pudding",
    mjolk: "milk",
    mellanmjolk: "milk",
    lattmjolk: "milk",
    milk: "milk",
    ost: "cheese",
    hushallsost: "cheese",
    cheddar: "cheese",
    cheese: "cheese",
    feta: "feta",
    fetaost: "feta",
    mozzarella: "mozzarella",
    philadelphia: "cream-cheese",
    farskost: "cream-cheese",
    smor: "butter",
    butter: "butter",
    skinka: "ham",
    ham: "ham",
    kalkonpaslagg: "turkey-slices",
    paslagg: "ham",
    notfars: "ground-beef",
    kottfars: "ground-beef",
    kycklingfars: "ground-chicken",
    falukorv: "falukorv",
    linser: "lentils",
    kikartor: "chickpeas",
    svartabonor: "blackbeans",
    bonor: "blackbeans",
    edamame: "edamame",
    artor: "peas",
    broccoli: "broccoli",
    blomkal: "cauliflower",
    vitkal: "cabbage",
    spenat: "spinach",
    gronkal: "kale",
    morot: "carrot",
    tomat: "tomato",
    gurka: "cucumber",
    paprika: "pepper",
    svamp: "mushroom",
    zucchini: "zucchini",
    wokgronsaker: "frozen-veg",
    sallad: "lettuce",
    lettuce: "lettuce",
    lok: "onion",
    onion: "onion",
    vitlok: "garlic",
    citron: "lemon",
    lemon: "lemon",
    potatis: "potato",
    sotpotatis: "sweetpotato",
    sweetpotato: "sweetpotato",
    ris: "brownrice",
    quinoa: "quinoa",
    havre: "oats",
    havregryn: "oats",
    ragbrod: "rye-bread",
    pasta: "wholegrain-pasta",
    olivolja: "olive-oil",
    avocado: "avocado",
    avokado: "avocado",
    mandel: "almonds",
    pumpakarnor: "pumpkin-seeds",
    hummus: "hummus",
    bar: "berries",
    berries: "berries",
    blabar: "blueberries",
    blueberries: "blueberries",
    jordgubbar: "strawberries",
    strawberries: "strawberries",
    apple: "apple",
    applefruit: "apple",
    banan: "banana",
    banana: "banana",
    apelsin: "orange",
    orange: "orange",
    paron: "pear",
    pear: "pear",
    vindruvor: "grapes",
    grapes: "grapes"
  };
}

function normalizeScanText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function findFoodIdsInText(text, foods) {
  const normalized = normalizeScanText(text);
  if (!normalized) return [];

  const list = Array.isArray(foods) ? foods : [];
  const allowed = new Set(list.map((food) => String(food.id)));
  const ids = new Set();

  for (const food of list) {
    if (!food || !food.id) continue;
    const id = normalizeScanText(food.id);
    const name = normalizeScanText(food.name);
    if ((id.length > 2 && normalized.includes(id)) || (name.length > 2 && normalized.includes(name))) {
      ids.add(food.id);
    }
  }

  for (const [alias, id] of Object.entries(foodAliases())) {
    if (!allowed.has(id)) continue;
    if (alias.length > 2 && normalized.includes(alias)) ids.add(id);
  }

  return Array.from(ids);
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
