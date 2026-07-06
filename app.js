const STORAGE_KEY = "visceral-plan-state-v1";
const USERS_KEY = "visceral-plan-users-v1";
const SESSION_KEY = "visceral-plan-session-v1";
const SERVER_SESSION_KEY = "visceral-plan-server-session-v1";
const ADMIN_ROLES = ["admin", "super_admin"];
const GUEST_USER = { id: "guest", name: "Gästläge", guest: true };

const sources = [
  {
    title: "YouTube: Fastest Way to Shrink Visceral Fat (Backed by Science)",
    note: "Videons verifierade beskrivning anger fokus på bästa mat/dryck och rätt träning, med kapitel vid 00:47 och 04:10.",
    url: "https://www.youtube.com/watch?v=Zt6WaTBnj7E"
  },
  {
    title: "Cleveland Clinic: Visceral Fat",
    note: "Definition, riskkoppling, midjemått, midja/längd och livsstilsåtgärder.",
    url: "https://my.clevelandclinic.org/health/diseases/24147-visceral-fat"
  },
  {
    title: "Mayo Clinic: Belly fat",
    note: "Bukfett omfattar visceralt fett; risker och åtgärder med fysisk aktivitet, kost och styrketräning.",
    url: "https://www.mayoclinic.org/healthy-lifestyle/mens-health/in-depth/belly-fat/art-20045685"
  },
  {
    title: "CDC: Adult Activity",
    note: "Minst 150 minuter måttlig aktivitet per vecka och två dagar muskelstärkande aktivitet.",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html"
  },
  {
    title: "NIDDK: Treatment for Overweight & Obesity",
    note: "Säker viktminskning, 5 procent som rimligt startmål, daglig uppföljning och stöd.",
    url: "https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity/treatment"
  },
  {
    title: "NHLBI: Aim for a Healthy Weight",
    note: "Midjemått runt 89 cm för kvinnor eller 102 cm för män används som riskmarkörer; 3-5 procent viktminskning kan förbättra riskmarkörer.",
    url: "https://www.nhlbi.nih.gov/health/heart-healthy-living/healthy-weight"
  },
  {
    title: "NHLBI: Get Regular Physical Activity",
    note: "Aerob aktivitet, rörelse under veckan och mindre stillasittande.",
    url: "https://www.nhlbi.nih.gov/health/heart-healthy-living/physical-activity"
  },
  {
    title: "WHO: Healthy Diet",
    note: "Minimalt processad mat, minst 400 g frukt/grönt, minst 25 g fiber, begränsat fritt socker, salt och ohälsosamma fetter.",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
  },
  {
    title: "Dietary Guidelines for Americans / RealFood.gov",
    note: "Prioriterar hela, näringsrika livsmedel och begränsning av tillsatt socker, mättat fett, natrium och alkohol.",
    url: "https://www.dietaryguidelines.gov/"
  }
];

const defaultState = {
  profile: {
    sex: "male",
    age: 45,
    height: 178,
    weight: 92,
    waist: 108,
    targetWaist: 88,
    level: "beginner",
    foodMode: "med",
    sexFocus: "male-visceral"
  },
  habits: {},
  logs: {},
  member: {
    bookings: [],
    messages: []
  },
  pantry: {
    goal: "fatloss",
    selected: ["egg", "kvarg", "broccoli", "potato", "olive-oil"],
    recipeFilter: "best",
    kitchenMessages: [],
    scanFeedback: [],
    shoppingList: []
  }
};

const memberValueProps = [
  ["Träning", "Pass, progression, timer och bokningsbara coachytor."],
  ["Kost", "Gram-mallar, smarta byten och livsmedelsranking."],
  ["AI-coach", "Nästa bästa åtgärd, svagaste länk och veckans experiment."],
  ["Hälsodata", "Midja, vikt, vanor, dagspoäng och trend samlat för coachning."],
  ["Bokning", "Rekommenderade pass kopplas till medlemmens mål och status."],
  ["Kommunikation", "Coachmeddelanden, medlemsflöde och uppföljning i samma vy."]
];

const bookingCatalog = [
  {
    id: "visceral-check",
    title: "Midjecheck + AI-genomgång",
    day: "Mån",
    time: "17:30",
    coach: "Coach Sara",
    duration: "25 min",
    capacity: "4 platser",
    fit: "Bäst när midja/längd är över 0,50 eller datan är ny."
  },
  {
    id: "strength-foundation",
    title: "Styrka för bukfett",
    day: "Tis",
    time: "18:15",
    coach: "Coach Amir",
    duration: "45 min",
    capacity: "8 platser",
    fit: "Prioriteras om styrkedagarna är färre än 2 per vecka."
  },
  {
    id: "zone2-club",
    title: "Zon 2-grupp",
    day: "Ons",
    time: "07:00",
    coach: "Coach Lina",
    duration: "40 min",
    capacity: "12 platser",
    fit: "Bygger veckovolym utan att slita på återhämtningen."
  },
  {
    id: "nutrition-lab",
    title: "Kostlab: helg utan bakslag",
    day: "Tors",
    time: "19:00",
    coach: "Dietistteam",
    duration: "30 min",
    capacity: "6 platser",
    fit: "För medlemmar som behöver portionsram, protein och social strategi."
  },
  {
    id: "stress-reset",
    title: "Stressreset och sömnspärr",
    day: "Sön",
    time: "20:00",
    coach: "Coach Elin",
    duration: "20 min",
    capacity: "10 platser",
    fit: "För kvällsätande, stress, alkoholfriktion eller låg sömnföljsamhet."
  }
];

const retentionCards = [
  ["Mer än passbokning", "Bokning kopplas till midjetrend, score och coachens rekommendation, inte bara schema."],
  ["Mer än matlogg", "Kostdelen visar gram-mallar och byten som matchar träning och buksignal."],
  ["Mer än kampanjer", "Kommunikationen kan triggas av faktisk medlemsdata: låg följsamhet, utebliven logg eller förbättrad trend."],
  ["Mer än hälsodata", "Data översätts till bokning, meddelande och nästa åtgärd i samma flöde."],
  ["Bättre retention", "Gymmet får fler naturliga kontaktpunkter före medlemmen tappar fart."]
];

const sexFocusOptions = {
  male: [
    ["male-visceral", "Minska bukmått och leverbelastning"],
    ["male-strength", "Bygga styrka utan att gå upp i midja"],
    ["male-stress", "Stress, sömn och alkohol som bromsar fettminskning"],
    ["male-cardio", "Kondition och blodtryck i fokus"]
  ],
  female: [
    ["female-visceral", "Minska bukmått med stabil energi"],
    ["female-cycle", "Träna runt menscykel och energisvängningar"],
    ["female-peri", "Perimenopaus/klimakterie: styrka, sömn och midja"],
    ["female-postpartum", "Efter graviditet: varsam återstart"]
  ],
  unspecified: [
    ["neutral-visceral", "Minska bukmått och bygga hållbar rutin"],
    ["neutral-strength", "Styrka och kondition i balans"],
    ["neutral-recovery", "Sömn, stress och vanor först"]
  ]
};

const sexProtocols = {
  male: {
    badge: "Man",
    lead: "Män har ofta högre risk vid större bukmått och kan svara starkt på kombinationen styrka, kondition, alkoholfri vecka och sömn.",
    options: {
      "male-visceral": ["Prioritera midja/längd under 0,50", "4 alkoholfria dagar/vecka", "2 styrkepass + 150-210 min kondition", "Protein 1,6 g/kg/dag som riktmärke"],
      "male-strength": ["Progressiv styrka 2-3 dagar/vecka", "Midjemätning varje söndag", "Lägg kolhydrater runt pass", "Undvik bulk som driver midjemått"],
      "male-stress": ["10 min nedvarvning dagligen", "Sätt sömnfönster före extra träning", "Byt kvällsalkohol mot alkoholfritt", "Promenad efter middag"],
      "male-cardio": ["Zon 2 två gånger/vecka", "Intervaller högst 1 gång/vecka i startfas", "Följ vilopuls/känsla om möjligt", "Styrka för ben/rygg/bål"]
    }
  },
  female: {
    badge: "Kvinna",
    lead: "Kvinnor kan behöva mer styrning runt energitillgänglighet, cykel, järn/återhämtning och muskelbevarande träning, särskilt vid perimenopaus.",
    options: {
      "female-visceral": ["Undvik för lågt energiintag", "Styrka 2-3 dagar/vecka", "Fiber + protein i frukost", "Midja/längd och sömn följs veckovis"],
      "female-cycle": ["Planera hårdare pass när energin är högre", "Välj lägre intensitet vid tydliga symtom", "Säkra protein och järnrika råvaror", "Följ hunger, sömn och midja utan att överreagera dag för dag"],
      "female-peri": ["Tung men kontrollerad styrka", "Extra fokus på sömn och stress", "Protein 1,6 g/kg/dag som riktmärke", "Mät midja, inte bara vikt"],
      "female-postpartum": ["Starta varsamt och stäm av med vården vid behov", "Bål och bäckenbotten före maxintervaller", "Promenader och lågintensiv volym", "Prioritera sömn och regelbundna måltider"]
    }
  },
  unspecified: {
    badge: "Profil",
    lead: "Utan könsspecifik väg använder appen midja/längd, träningsnivå och vanor som huvudsignal.",
    options: {
      "neutral-visceral": ["Midja/längd under 0,50", "150-210 min rörelse/vecka", "2 styrkepass", "Protein, fiber och sömn först"],
      "neutral-strength": ["2-3 styrkepass", "Zon 2 som bas", "Mät midja veckovis", "Justera kolhydrater efter pass"],
      "neutral-recovery": ["Sömnfönster", "10 min stresspaus", "Promenad efter måltid", "Alkoholfri basvecka"]
    }
  }
};

const competitorInsights = [
  {
    name: "MyFitnessPal",
    sources: [["Källa", "https://www.myfitnesspal.com/"]],
    strength: "Stor matdatabas, streckkod/röst, kalorier, makronäring och integrationer.",
    gap: "Saknar tydlig visceral-fett-logik och lokal privat PWA utan konto.",
    edge: "Vi styr på bukmått, midja/längd och måltider av råvaror användaren redan har hemma."
  },
  {
    name: "Lifesum",
    sources: [["Källa", "https://lifesum.com/"]],
    strength: "AI, foto/röst/streckkod, måltidsplaner och vanepoäng.",
    gap: "Mer bred nutrition än fokuserad bukfettscoach.",
    edge: "Vi gör gram-baserad tallrik, kylskåpsbyggare och visceralt beslutsrum."
  },
  {
    name: "Cronometer",
    sources: [["Källa", "https://cronometer.com/"]],
    strength: "Djup mikro- och makronäringsdata, rapporter och biometrik.",
    gap: "Kraftfullt men kan bli tungt för användare som vill ha beslut.",
    edge: "Vi förenklar till metabolt index, måltidskvitto och konkret byte."
  },
  {
    name: "Noom",
    sources: [["Källa", "https://www.noom.com/"]],
    strength: "Beteendestöd, coaching och viktresa.",
    gap: "Mindre tydligt kring lokalt dataskydd och bukfettspecifik styrning.",
    edge: "Vi gör beteendet mätbart med dagspoäng, midjetrend och nästa bästa åtgärd."
  },
  {
    name: "Nike/Sweat/BetterMe",
    sources: [["Nike", "https://www.nike.com/ntc-app"], ["Sweat", "https://sweat.com/"], ["BetterMe", "https://betterme.world/"]],
    strength: "Stora träningsbibliotek, visuella pass och specialprogram.",
    gap: "Ofta inte sammanbundet med bukmått/kostbeslut.",
    edge: "Vi kopplar träningsbild, könsprotokoll och midjetrend."
  }
];

const habits = [
  ["walk", "30 min rask promenad eller cykel"],
  ["strength", "Styrka enligt plan"],
  ["protein", "Protein i varje huvudmål"],
  ["veg", "Grönt, bär eller baljväxter"],
  ["sugarfree", "Inga sockerdrycker"],
  ["sleep", "7+ timmar sömn"],
  ["stress", "10 min nedvarvning"],
  ["alcohol", "Alkoholfri dag"]
];

const foodModes = {
  med: [
    ["Frukost", "Grekisk yoghurt eller ägg, bär, havre eller råg, nötter/frön. Kaffe eller te utan socker."],
    ["Lunch", "Halva tallriken grönsaker, en fjärdedel fisk/kyckling/bönor/tofu, en fjärdedel fullkorn eller potatis. Olivolja som fett."],
    ["Middag", "Protein + två sorters grönsaker + baljväxt/fullkorn. Lägg till frukt om sötsug kommer."],
    ["Mellanmål", "Kvarg/yoghurt, frukt, morötter, kokt ägg eller 15-30 g nötter."]
  ],
  dash: [
    ["Frukost", "Havregryn, bär, naturell yoghurt och frön. Vatten, kaffe eller te utan socker."],
    ["Lunch", "Grönsaker, baljväxter, fullkorn och magert protein. Välj låg natriumhalt när det går."],
    ["Middag", "Fisk, kyckling eller bönor med mycket grönt. Smaksätt med örter, citron, vitlök och peppar."],
    ["Mellanmål", "Frukt, osaltade nötter, grönsaksstavar eller naturell yoghurt."]
  ],
  simple: [
    ["Frukost", "Protein + fiber: ägg och rågbröd, yoghurt och bär, eller havre med mjölk."],
    ["Lunch", "Tallrik: 200-300 g grönsaker, 120-180 g protein och 120-200 g potatis, baljväxter eller fullkorn."],
    ["Middag", "Bygg från frys och basvaror: wokgrönt, bönor, tonfisk/kyckling/tofu, ris/potatis."],
    ["Mellanmål", "Planerat mellanmål före hunger: frukt + protein eller grönsaker + hummus."]
  ]
};

const foodTargets = [
  ["1", "Minimalt processat först", "Basera veckan på råvaror, baljväxter, fullkorn, fisk, ägg, magra mejerier, nötter, frukt och grönsaker."],
  ["2", "Fritt socker ned", "Välj vatten, kaffe eller te utan socker. Juice och läsk räknas som sockerkälla i praktiken."],
  ["3", "Fiber varje mål", "Sikta på grönt, baljväxter eller fullkorn vid varje huvudmål. WHO anger minst 400 g frukt/grönt och 25 g fiber per dag för personer över 10 år."],
  ["4", "Protein jämnt fördelat", "Lägg en tydlig proteinkälla i varje huvudmål för mättnad och muskelbevarande träningseffekt."],
  ["5", "Alkohol med friktion", "Planera alkoholfria dagar. Alkohol kan bidra med mycket energi och påverka leverns fettomsättning."],
  ["6", "Sömn och stress", "Sömnbrist och kronisk stress gör planen svårare att följa och kan påverka bukfettsinlagring."]
];

const foodGuideGroups = [
  {
    title: "Livsmedel",
    items: [
      ["Linser, bönor, kikärter", "Fiber + protein ger hög mättnad och jämnare energi.", "150-250 g till lunch/middag"],
      ["Havre, råg, korn", "Fullkorn med mycket fiber; bra bas när portionen är tydlig.", "40-80 g torrvikt"],
      ["Fisk, särskilt fet fisk", "Protein och omättade fetter; bra ersättning för chark och rött kött.", "120-180 g"],
      ["Naturell yoghurt, kvarg, kefir", "Proteinrikt och enkelt; välj osötat.", "150-250 g"],
      ["Ägg", "Mättande protein, lätt att planera runt.", "50-180 g"],
      ["Tofu, tempeh, kyckling", "Magra proteiner som gör energiunderskott lättare.", "120-200 g"],
      ["Räkor, torsk och annan vit fisk", "Mycket protein per kcal och lätt att kombinera med stora grönsaksportioner.", "150-220 g"],
      ["Keso/cottage cheese", "Snabb proteinkälla som fungerar i både kalla och varma måltider.", "150-250 g"],
      ["Nötter och frön", "Näringsrikt men energitätt; bäst som kontrollerad mängd.", "15-30 g"],
      ["Pumpakärnor och chiafrön", "Ger mineraler, crunch och mättnad i små mängder.", "10-25 g"],
      ["Potatis, quinoa, fullkornsris", "Bra kolhydratbas när den äts kokt och portionsstyrd.", "120-220 g kokt"],
      ["Fullkornspasta och rågbröd", "Bättre vardagsval än vitt bröd/pasta när portionen vägs.", "70-180 g beroende på måltid"],
      ["Edamame och gröna ärtor", "Frysvara med mer protein och fiber än många snabba tillbehör.", "100-200 g"],
      ["Olivolja, avokado, hummus", "Bra fettkällor, men de ska doseras så energin inte rusar.", "10-70 g"]
    ]
  },
  {
    title: "Frukt",
    items: [
      ["Hallon, blåbär, jordgubbar", "Mycket smak, fiber och volym per energi.", "100-200 g"],
      ["Frysta bär", "Premiumval i vardagen: billigt, hållbart och enkelt att portionera.", "100-200 g"],
      ["Äpple och päron", "Fiberrikt, bärbart och bra mot sötsug.", "120-180 g"],
      ["Apelsin, grapefrukt, clementin", "Vätska, C-vitamin och tydlig portionsstorlek.", "150-300 g"],
      ["Kiwi", "Fiberrik frukt med mycket C-vitamin.", "75-150 g"],
      ["Granatäpple", "Smakrik topping som höjer måltiden utan att kräva stor mängd.", "50-100 g"],
      ["Melon", "Mycket volym och vätska, bra när aptiten är hög.", "150-300 g"],
      ["Plommon, persika, nektarin", "Bra vardagsfrukt när den äts hel.", "100-200 g"],
      ["Banan", "Bra runt träning; något mer energität än bär/citrus.", "100-130 g"],
      ["Mango och druvor", "Näringsrika men lättare att överäta; välj uppmätt portion.", "100-150 g"],
      ["Avokado", "Botaniskt frukt men praktiskt fettval; mät portionen noga.", "50-100 g"],
      ["Dadlar", "Fungerar som kontrollerad sötma före pass eller i liten dessert.", "10-25 g"],
      ["Torkad frukt och juice", "Koncentrerad energi/fritt socker; använd sparsamt.", "0-30 g eller byt mot hel frukt"]
    ]
  },
  {
    title: "Grönsaker",
    items: [
      ["Broccoli, blomkål, vitkål", "Mycket volym, fiber och låg energitäthet.", "150-300 g"],
      ["Brysselkål, sparris, haricots verts", "Fiberrika premiumgrönsaker som gör tallriken mer mättande.", "150-300 g"],
      ["Spenat, grönkål, ruccola", "Mikronäringsrikt och lätt att lägga till i stora mängder.", "50-150 g"],
      ["Paprika, tomat, gurka", "Fräscht, kalorisnålt och bra för stora tallrikar.", "150-300 g"],
      ["Morot, rödbeta, palsternacka", "Fiberrika rotfrukter; bra ugnsbakade eller kokta.", "120-250 g"],
      ["Svamp, lök, zucchini", "Ger smak och volym utan att energin sticker iväg.", "150-300 g"],
      ["Frysta wokgrönsaker", "Snabbaste vägen till 250-350 g grönt när kylskåpet är tunt.", "200-350 g"],
      ["Surkål och kimchi", "Smak, syra och struktur; välj varianter med låg sockerhalt.", "30-100 g"],
      ["Ärtor och edamame", "Mer protein och fiber än många grönsaker.", "100-200 g"],
      ["Potatis och sötpotatis", "Bra mättnad, men räkna som kolhydratbas.", "120-220 g kokt"],
      ["Avokado", "Bra omättat fett men energitätt; bäst i mindre mängd.", "50-100 g"]
    ]
  }
];

const fridgeCategories = [
  { id: "protein", title: "Protein", hint: "Mättnad och muskelbevarande" },
  { id: "dairy", title: "Mejeri", hint: "Snabbt protein" },
  { id: "legume", title: "Baljväxt", hint: "Fiber + protein" },
  { id: "veg", title: "Grönt", hint: "Volym och fiber" },
  { id: "carb", title: "Kolhydratbas", hint: "Träning och mättnad" },
  { id: "fat", title: "Fettkälla", hint: "Smak i kontrollerad mängd" },
  { id: "fruit", title: "Frukt och bär", hint: "Sött med struktur" },
  { id: "freezer", title: "Frys och nödval", hint: "När tiden är kort" },
  { id: "flavor", title: "Smakbas", hint: "Gör maten lättare att följa" }
];

const fridgeGoalCopy = {
  fatloss: {
    kicker: "Bukfettsfokus",
    title: "Hög mättnad, tydliga gram och låg sockerlast.",
    text: "Bygg runt protein, 250-350 g grönt, lagom kolhydrat och en liten fettkälla."
  },
  training: {
    kicker: "Efter träning",
    title: "Mer kolhydrat och protein för återhämtning.",
    text: "Måltiden skruvas upp efter pass utan att tappa fiber och portionskontroll."
  },
  lowcarb: {
    kicker: "Lägre kolhydrat",
    title: "Mer grönt och protein, mindre stärkelse.",
    text: "Kolhydratbasen halveras och volymen kommer från grönsaker och magert protein."
  },
  vegetarian: {
    kicker: "Vegetariskt fokus",
    title: "Baljväxter, tofu, mejeri och grön volym.",
    text: "Prioriterar proteinrika växtval och kompletterar med fiber så måltiden håller."
  }
};

const pantryFoods = [
  { id: "egg", name: "Ägg", category: "protein", role: "protein", kcal: 143, protein: 13, carbs: 1, fat: 10, fiber: 0, defaultGrams: 120 },
  { id: "chicken", name: "Kycklingfilé", category: "protein", role: "protein", kcal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, defaultGrams: 150 },
  { id: "salmon", name: "Lax", category: "protein", role: "protein", kcal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, defaultGrams: 150 },
  { id: "tuna", name: "Tonfisk i vatten", category: "protein", role: "protein", kcal: 116, protein: 26, carbs: 0, fat: 1, fiber: 0, defaultGrams: 120 },
  { id: "cod", name: "Torsk", category: "protein", role: "protein", kcal: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, defaultGrams: 170 },
  { id: "turkey", name: "Kalkon", category: "protein", role: "protein", kcal: 135, protein: 29, carbs: 0, fat: 1.5, fiber: 0, defaultGrams: 150 },
  { id: "shrimp", name: "Räkor", category: "freezer", role: "protein", kcal: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0, defaultGrams: 150 },
  { id: "tofu", name: "Tofu", category: "protein", role: "protein", kcal: 120, protein: 12, carbs: 2, fat: 7, fiber: 1, defaultGrams: 180 },
  { id: "tempeh", name: "Tempeh", category: "protein", role: "protein", kcal: 193, protein: 20, carbs: 8, fat: 11, fiber: 5, defaultGrams: 150 },
  { id: "cottage", name: "Keso/cottage cheese", category: "dairy", role: "dairy", kcal: 98, protein: 11, carbs: 3, fat: 4, fiber: 0, defaultGrams: 200 },
  { id: "kvarg", name: "Kvarg naturell", category: "dairy", role: "dairy", kcal: 60, protein: 11, carbs: 4, fat: 0.2, fiber: 0, defaultGrams: 250 },
  { id: "yogurt", name: "Naturell yoghurt", category: "dairy", role: "dairy", kcal: 70, protein: 4, carbs: 5, fat: 3, fiber: 0, defaultGrams: 200 },
  { id: "skyr", name: "Skyr naturell", category: "dairy", role: "dairy", kcal: 65, protein: 11, carbs: 4, fat: 0.2, fiber: 0, defaultGrams: 200 },
  { id: "protein-pudding", name: "Proteinpudding", category: "dairy", role: "dairy", kcal: 80, protein: 10, carbs: 6, fat: 1.5, fiber: 0, defaultGrams: 200 },
  { id: "milk", name: "Mjölk", category: "dairy", role: "dairy", kcal: 47, protein: 3.5, carbs: 5, fat: 1.5, fiber: 0, defaultGrams: 250 },
  { id: "cheese", name: "Ost", category: "dairy", role: "fat", kcal: 356, protein: 25, carbs: 1.5, fat: 28, fiber: 0, defaultGrams: 25 },
  { id: "feta", name: "Fetaost", category: "dairy", role: "fat", kcal: 265, protein: 14, carbs: 4, fat: 21, fiber: 0, defaultGrams: 40 },
  { id: "mozzarella", name: "Mozzarella", category: "dairy", role: "fat", kcal: 250, protein: 18, carbs: 2, fat: 18, fiber: 0, defaultGrams: 60 },
  { id: "cream-cheese", name: "Färskost", category: "flavor", role: "fat", kcal: 250, protein: 6, carbs: 4, fat: 24, fiber: 0, defaultGrams: 25 },
  { id: "butter", name: "Smör", category: "fat", role: "fat", kcal: 717, protein: 1, carbs: 1, fat: 81, fiber: 0, defaultGrams: 8 },
  { id: "ham", name: "Skinka", category: "protein", role: "protein", kcal: 110, protein: 20, carbs: 1, fat: 3, fiber: 0, defaultGrams: 80 },
  { id: "turkey-slices", name: "Kalkonpålägg", category: "protein", role: "protein", kcal: 105, protein: 22, carbs: 1, fat: 2, fiber: 0, defaultGrams: 80 },
  { id: "ground-beef", name: "Nötfärs", category: "protein", role: "protein", kcal: 215, protein: 19, carbs: 0, fat: 15, fiber: 0, defaultGrams: 150 },
  { id: "ground-chicken", name: "Kycklingfärs", category: "protein", role: "protein", kcal: 145, protein: 22, carbs: 0, fat: 6, fiber: 0, defaultGrams: 150 },
  { id: "falukorv", name: "Falukorv", category: "protein", role: "protein", kcal: 260, protein: 11, carbs: 5, fat: 22, fiber: 0, defaultGrams: 100 },
  { id: "lentils", name: "Linser kokta", category: "legume", role: "legume", kcal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, defaultGrams: 200 },
  { id: "chickpeas", name: "Kikärter kokta", category: "legume", role: "legume", kcal: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 8, defaultGrams: 180 },
  { id: "blackbeans", name: "Svarta bönor kokta", category: "legume", role: "legume", kcal: 132, protein: 9, carbs: 24, fat: 0.5, fiber: 9, defaultGrams: 200 },
  { id: "edamame", name: "Edamame", category: "freezer", role: "legume", kcal: 121, protein: 12, carbs: 9, fat: 5, fiber: 5, defaultGrams: 150 },
  { id: "peas", name: "Gröna ärtor", category: "freezer", role: "legume", kcal: 81, protein: 5, carbs: 14, fat: 0.4, fiber: 5, defaultGrams: 150 },
  { id: "broccoli", name: "Broccoli", category: "veg", role: "veg", kcal: 35, protein: 3, carbs: 7, fat: 0.4, fiber: 3, defaultGrams: 250 },
  { id: "cauliflower", name: "Blomkål", category: "veg", role: "veg", kcal: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2, defaultGrams: 250 },
  { id: "cabbage", name: "Vitkål", category: "veg", role: "veg", kcal: 25, protein: 1, carbs: 6, fat: 0.1, fiber: 3, defaultGrams: 250 },
  { id: "spinach", name: "Spenat", category: "veg", role: "veg", kcal: 23, protein: 3, carbs: 4, fat: 0.4, fiber: 2, defaultGrams: 100 },
  { id: "kale", name: "Grönkål", category: "veg", role: "veg", kcal: 49, protein: 4, carbs: 9, fat: 0.9, fiber: 4, defaultGrams: 100 },
  { id: "carrot", name: "Morot", category: "veg", role: "veg", kcal: 41, protein: 1, carbs: 10, fat: 0.2, fiber: 3, defaultGrams: 160 },
  { id: "tomato", name: "Tomat", category: "veg", role: "veg", kcal: 18, protein: 1, carbs: 4, fat: 0.2, fiber: 1, defaultGrams: 180 },
  { id: "cucumber", name: "Gurka", category: "veg", role: "veg", kcal: 15, protein: 1, carbs: 4, fat: 0.1, fiber: 1, defaultGrams: 200 },
  { id: "pepper", name: "Paprika", category: "veg", role: "veg", kcal: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2, defaultGrams: 160 },
  { id: "mushroom", name: "Svamp", category: "veg", role: "veg", kcal: 22, protein: 3, carbs: 3, fat: 0.3, fiber: 1, defaultGrams: 200 },
  { id: "zucchini", name: "Zucchini", category: "veg", role: "veg", kcal: 17, protein: 1, carbs: 3, fat: 0.3, fiber: 1, defaultGrams: 200 },
  { id: "lettuce", name: "Sallad", category: "veg", role: "veg", kcal: 15, protein: 1, carbs: 3, fat: 0.2, fiber: 1, defaultGrams: 100 },
  { id: "onion", name: "Lök", category: "veg", role: "veg", kcal: 40, protein: 1, carbs: 9, fat: 0.1, fiber: 2, defaultGrams: 80 },
  { id: "garlic", name: "Vitlök", category: "flavor", role: "flavor", kcal: 149, protein: 6, carbs: 33, fat: 0.5, fiber: 2, defaultGrams: 5 },
  { id: "lemon", name: "Citron", category: "flavor", role: "fruit", kcal: 29, protein: 1, carbs: 9, fat: 0.3, fiber: 3, defaultGrams: 40 },
  { id: "frozen-veg", name: "Wokgrönsaker frysta", category: "freezer", role: "veg", kcal: 45, protein: 2, carbs: 8, fat: 0.5, fiber: 3, defaultGrams: 250 },
  { id: "potato", name: "Potatis kokt", category: "carb", role: "carb", kcal: 87, protein: 2, carbs: 20, fat: 0.1, fiber: 2, defaultGrams: 200 },
  { id: "sweetpotato", name: "Sötpotatis", category: "carb", role: "carb", kcal: 86, protein: 2, carbs: 20, fat: 0.1, fiber: 3, defaultGrams: 180 },
  { id: "brownrice", name: "Fullkornsris kokt", category: "carb", role: "carb", kcal: 112, protein: 3, carbs: 23, fat: 0.9, fiber: 2, defaultGrams: 180 },
  { id: "quinoa", name: "Quinoa kokt", category: "carb", role: "carb", kcal: 120, protein: 4, carbs: 21, fat: 2, fiber: 3, defaultGrams: 170 },
  { id: "oats", name: "Havregryn", category: "carb", role: "carb", kcal: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, defaultGrams: 60 },
  { id: "rye-bread", name: "Rågbröd", category: "carb", role: "carb", kcal: 210, protein: 6, carbs: 40, fat: 2, fiber: 8, defaultGrams: 80 },
  { id: "wholegrain-pasta", name: "Fullkornspasta kokt", category: "carb", role: "carb", kcal: 140, protein: 6, carbs: 27, fat: 1, fiber: 4, defaultGrams: 180 },
  { id: "olive-oil", name: "Olivolja", category: "fat", role: "fat", kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, defaultGrams: 10 },
  { id: "avocado", name: "Avokado", category: "fat", role: "fat", kcal: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, defaultGrams: 70 },
  { id: "almonds", name: "Mandel", category: "fat", role: "fat", kcal: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, defaultGrams: 20 },
  { id: "pumpkin-seeds", name: "Pumpakärnor", category: "fat", role: "fat", kcal: 559, protein: 30, carbs: 11, fat: 49, fiber: 6, defaultGrams: 15 },
  { id: "hummus", name: "Hummus", category: "flavor", role: "fat", kcal: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, defaultGrams: 60 },
  { id: "berries", name: "Bär", category: "fruit", role: "fruit", kcal: 50, protein: 1, carbs: 12, fat: 0.3, fiber: 5, defaultGrams: 150 },
  { id: "blueberries", name: "Blåbär", category: "fruit", role: "fruit", kcal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, defaultGrams: 150 },
  { id: "strawberries", name: "Jordgubbar", category: "fruit", role: "fruit", kcal: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, defaultGrams: 150 },
  { id: "apple", name: "Äpple", category: "fruit", role: "fruit", kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, defaultGrams: 160 },
  { id: "banana", name: "Banan", category: "fruit", role: "fruit", kcal: 89, protein: 1, carbs: 23, fat: 0.3, fiber: 3, defaultGrams: 120 },
  { id: "orange", name: "Apelsin", category: "fruit", role: "fruit", kcal: 47, protein: 1, carbs: 12, fat: 0.1, fiber: 2, defaultGrams: 180 },
  { id: "pear", name: "Päron", category: "fruit", role: "fruit", kcal: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3, defaultGrams: 170 },
  { id: "grapes", name: "Vindruvor", category: "fruit", role: "fruit", kcal: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 1, defaultGrams: 120 }
];

const recipeFilterOptions = [
  { id: "best", label: "Bäst match" },
  { id: "quick", label: "Snabbt" },
  { id: "high-protein", label: "Högt protein" },
  { id: "vegetarian", label: "Vegetariskt" },
  { id: "lowcarb", label: "Låg kolhydrat" },
  { id: "meal-prep", label: "Lunchlåda" }
];

const recipeFamilies = [
  {
    id: "midjebowl",
    type: "Midjeskål",
    minutes: 18,
    tags: ["fatloss", "high-protein", "meal-prep"],
    names: [
      "Midjeskål med {protein}, {veg} och {carb}",
      "Krispig proteinbowl med {protein} och {fat}",
      "Mättnadsbowl med {protein}, {veg} och citron",
      "Premium bowl med {protein}, {carb} och grönt",
      "Fiberbowl med {protein}, {veg} och {fat}"
    ],
    proteins: ["chicken", "tuna", "tofu", "egg", "turkey"],
    vegs: ["broccoli", "cabbage", "pepper", "spinach", "cauliflower"],
    carbs: ["quinoa", "potato", "brownrice", "rye-bread", "sweetpotato"],
    fats: ["olive-oil", "avocado", "hummus", "pumpkin-seeds", "almonds"],
    extras: ["lemon", "cucumber", "tomato", "onion", "garlic"],
    method: "Blanda varm bas med krispigt grönt och toppa med syra.",
    why: "Protein, fiber och tydliga gram gör den lätt att följa när midjan är måttet."
  },
  {
    id: "omelett",
    type: "Omelett",
    minutes: 14,
    tags: ["quick", "high-protein", "lowcarb"],
    names: [
      "Omelett med {protein}, {veg} och {fat}",
      "Snabb proteinpanna med {protein} och {veg}",
      "Grön omelett med {protein} och tomat",
      "Mättande äggpanna med {veg} och {fat}",
      "Frukostomelett med {protein} och extra grönt"
    ],
    proteins: ["egg", "ham", "turkey-slices", "cottage", "tofu"],
    vegs: ["mushroom", "spinach", "tomato", "pepper", "onion"],
    carbs: ["rye-bread", "potato", null, null, "sweetpotato"],
    fats: ["butter", "cheese", "feta", "olive-oil", "avocado"],
    extras: ["cucumber", "lettuce", "lemon", "garlic", "tomato"],
    method: "Stek allt lugnt så proteinet sätter sig och grönsakerna behåller struktur.",
    why: "Snabbt, varmt och proteinrikt utan att bli en tung energimåltid."
  },
  {
    id: "lunchbox",
    type: "Lunchlåda",
    minutes: 24,
    tags: ["meal-prep", "high-protein", "fatloss"],
    names: [
      "Lunchlåda med {protein}, {carb} och {veg}",
      "Tre-dagarslåda med {protein} och grön bas",
      "Stabil arbetslunch med {protein} och {fat}",
      "Mättande matlåda med {protein}, {veg} och {carb}",
      "Coachlåda med {protein} och extra fiber"
    ],
    proteins: ["chicken", "salmon", "ground-chicken", "ground-beef", "tempeh"],
    vegs: ["frozen-veg", "zucchini", "broccoli", "carrot", "cabbage"],
    carbs: ["potato", "wholegrain-pasta", "brownrice", "quinoa", "sweetpotato"],
    fats: ["olive-oil", "hummus", "avocado", "pumpkin-seeds", "feta"],
    extras: ["onion", "garlic", "lemon", "tomato", "pepper"],
    method: "Bygg i låda med protein först, sedan kolhydratbas och minst två gröna val.",
    why: "Förberedd mat minskar beslutströtthet och gör portionskontrollen enklare."
  },
  {
    id: "salad",
    type: "Sallad",
    minutes: 12,
    tags: ["quick", "fatloss", "meal-prep"],
    names: [
      "Krispig sallad med {protein}, {veg} och {fat}",
      "Mättnadssallad med {protein} och {carb}",
      "Fräsch lunchsallad med {protein} och citron",
      "Proteinrik sallad med {veg}, {protein} och {fat}",
      "Kylskåpssallad med {protein} och extra fiber"
    ],
    proteins: ["tuna", "shrimp", "chicken", "feta", "edamame"],
    vegs: ["lettuce", "cucumber", "tomato", "pepper", "spinach"],
    carbs: ["quinoa", "rye-bread", "potato", "chickpeas", "brownrice"],
    fats: ["avocado", "olive-oil", "hummus", "pumpkin-seeds", "almonds"],
    extras: ["lemon", "onion", "cabbage", "carrot", "garlic"],
    method: "Skär grovt, väg energitäta delar och låt syran bära smaken.",
    why: "Stor volym på få kalorier, men fortfarande med protein och fett som mättar."
  },
  {
    id: "soup",
    type: "Soppa",
    minutes: 26,
    tags: ["meal-prep", "fatloss", "fiber"],
    names: [
      "Mättande soppa med {protein}, {veg} och {carb}",
      "Krämig grön soppa med {protein} och {fat}",
      "Fibergryta i soppskål med {protein} och {veg}",
      "Värmande lunchsoppa med {protein} och citron",
      "Lätt kvällssoppa med {protein}, {veg} och kål"
    ],
    proteins: ["cod", "chicken", "lentils", "blackbeans", "tofu"],
    vegs: ["cauliflower", "broccoli", "carrot", "onion", "cabbage"],
    carbs: ["potato", "quinoa", "sweetpotato", null, "brownrice"],
    fats: ["cream-cheese", "olive-oil", "hummus", "feta", "avocado"],
    extras: ["garlic", "lemon", "spinach", "tomato", "pepper"],
    method: "Koka grön bas mjuk, lägg i protein och avsluta med syra eller liten fettkälla.",
    why: "Vätska, fiber och protein ger hög mättnad per kalori."
  },
  {
    id: "wok",
    type: "Wok",
    minutes: 17,
    tags: ["quick", "high-protein", "training"],
    names: [
      "Snabb wok med {protein}, {veg} och {carb}",
      "Efter-passet-wok med {protein} och {carb}",
      "Grön wok med {protein}, {veg} och {fat}",
      "Kylskåpswok med {protein} och frysta grönsaker",
      "Proteinwok med {protein}, {veg} och citron"
    ],
    proteins: ["shrimp", "chicken", "tofu", "tempeh", "ground-chicken"],
    vegs: ["frozen-veg", "broccoli", "pepper", "mushroom", "zucchini"],
    carbs: ["brownrice", "quinoa", "wholegrain-pasta", "potato", "sweetpotato"],
    fats: ["olive-oil", "pumpkin-seeds", "hummus", "avocado", "almonds"],
    extras: ["garlic", "onion", "lemon", "spinach", "cabbage"],
    method: "Hetta upp snabbt, håll grönsakerna spänstiga och väg oljan.",
    why: "Bra när du vill ha mycket mat, tydliga gram och låg friktion."
  },
  {
    id: "dairybowl",
    type: "Skål",
    minutes: 6,
    tags: ["quick", "high-protein", "breakfast"],
    names: [
      "Proteinskål med {protein}, {veg} och {fat}",
      "Kvällsskål med {protein}, {carb} och bär",
      "Frukostskål med {protein}, {veg} och krisp",
      "Mättande mejeriskål med {protein} och {fat}",
      "Söt men smart skål med {protein}, {veg} och fiber"
    ],
    proteins: ["kvarg", "skyr", "yogurt", "cottage", "protein-pudding"],
    vegs: ["berries", "blueberries", "strawberries", "apple", "banana"],
    carbs: ["oats", "rye-bread", "pear", "orange", "grapes"],
    fats: ["almonds", "pumpkin-seeds", "hummus", null, "avocado"],
    extras: ["milk", "berries", "blueberries", "strawberries", "apple"],
    method: "Rör ihop mejeribas, toppa med frukt eller bär och mät nötter/frön.",
    why: "Ett kontrollerat sött alternativ med protein före snabba kalorier."
  },
  {
    id: "breakfast",
    type: "Frukost",
    minutes: 10,
    tags: ["quick", "high-protein", "breakfast"],
    names: [
      "Premiumfrukost med {protein}, {carb} och {fat}",
      "Mättnadsfrukost med {protein} och {veg}",
      "Stark start med {protein}, {veg} och fiber",
      "Snabb frukosttallrik med {protein} och {carb}",
      "Frukost för midjan med {protein}, {veg} och {fat}"
    ],
    proteins: ["egg", "skyr", "cottage", "kvarg", "yogurt"],
    vegs: ["tomato", "spinach", "berries", "blueberries", "apple"],
    carbs: ["rye-bread", "oats", "banana", "pear", "orange"],
    fats: ["avocado", "almonds", "butter", "pumpkin-seeds", "cheese"],
    extras: ["cucumber", "milk", "lemon", "strawberries", "grapes"],
    method: "Bygg en liten tallrik med protein först och låt kolhydraten vara mättande.",
    why: "En jämn start gör nästa beslut enklare, särskilt om kvällen brukar bli svår."
  },
  {
    id: "lowcarbplate",
    type: "Lågkolhydrat",
    minutes: 16,
    tags: ["lowcarb", "high-protein", "fatloss"],
    names: [
      "Lågkolhydrattallrik med {protein}, {veg} och {fat}",
      "Grön proteintallrik med {protein} och {veg}",
      "Blomkålsbas med {protein} och {fat}",
      "Mättande lågkolhydrat med {protein} och kål",
      "Kvällstallrik med {protein}, {veg} och kontrollerat fett"
    ],
    proteins: ["cod", "turkey", "chicken", "tofu", "shrimp"],
    vegs: ["cauliflower", "zucchini", "broccoli", "cabbage", "spinach"],
    carbs: [null, null, null, null, "rye-bread"],
    fats: ["olive-oil", "avocado", "feta", "hummus", "pumpkin-seeds"],
    extras: ["lemon", "cucumber", "tomato", "garlic", "pepper"],
    method: "Byt stärkelserik bas mot mer grönt och håll fettkällan mätt men uppmätt.",
    why: "Passar dagar när du vill hålla kolhydraterna lägre utan att tappa volym."
  },
  {
    id: "vegetarian",
    type: "Vegetariskt",
    minutes: 20,
    tags: ["vegetarian", "fiber", "meal-prep"],
    names: [
      "Vegetarisk bowl med {protein}, {veg} och {carb}",
      "Baljväxttallrik med {protein} och {fat}",
      "Grön lunch med {protein}, {veg} och quinoa",
      "Fiberstark vegomåltid med {protein} och kål",
      "Vegetarisk premiumlåda med {protein}, {carb} och {veg}"
    ],
    proteins: ["tofu", "tempeh", "lentils", "chickpeas", "blackbeans"],
    vegs: ["broccoli", "spinach", "pepper", "zucchini", "cabbage"],
    carbs: ["quinoa", "potato", "brownrice", "sweetpotato", "rye-bread"],
    fats: ["hummus", "avocado", "olive-oil", "pumpkin-seeds", "almonds"],
    extras: ["lemon", "onion", "garlic", "tomato", "cucumber"],
    method: "Kombinera baljväxt eller tofu med grönt, syra och en liten fettkälla.",
    why: "Ger protein och fiber utan att bygga måltiden på bara pasta eller bröd."
  },
  {
    id: "fish",
    type: "Fisk",
    minutes: 18,
    tags: ["high-protein", "fatloss", "quick"],
    names: [
      "Fisktallrik med {protein}, {veg} och {carb}",
      "Nordisk fiskbowl med {protein} och {fat}",
      "Snabb fisklunch med {protein}, {veg} och citron",
      "Lätt middag med {protein}, {veg} och potatis",
      "Proteinrik fiskrätt med {protein} och extra grönt"
    ],
    proteins: ["salmon", "cod", "tuna", "shrimp", "egg"],
    vegs: ["tomato", "cucumber", "broccoli", "cauliflower", "lettuce"],
    carbs: ["potato", "quinoa", "rye-bread", "brownrice", "sweetpotato"],
    fats: ["avocado", "olive-oil", "feta", "hummus", "pumpkin-seeds"],
    extras: ["lemon", "spinach", "cabbage", "pepper", "onion"],
    method: "Håll fisken enkel, väg kolhydratbasen och låt grönsakerna fylla tallriken.",
    why: "Fisk ger mycket protein och gör det lätt att hålla måltiden ren och tydlig."
  },
  {
    id: "ryeplate",
    type: "Rågbröd",
    minutes: 8,
    tags: ["quick", "breakfast", "fatloss"],
    names: [
      "Rågbrödsmål med {protein}, {veg} och {fat}",
      "Snabb smörgåstallrik med {protein} och grönsaker",
      "Proteinmacka med {protein}, {veg} och kontroll",
      "Kall lunch med {protein}, {carb} och extra grönt",
      "Mättande rågbröd med {protein} och {fat}"
    ],
    proteins: ["ham", "turkey-slices", "cottage", "egg", "tuna"],
    vegs: ["cucumber", "tomato", "lettuce", "pepper", "onion"],
    carbs: ["rye-bread", "rye-bread", "rye-bread", "rye-bread", "rye-bread"],
    fats: ["cheese", "avocado", "cream-cheese", "hummus", "feta"],
    extras: ["lemon", "spinach", "cabbage", "carrot", "berries"],
    method: "Bygg öppet med mycket protein och grön volym ovanpå brödet.",
    why: "Ett bättre akutval än snabbmat när du behöver något kallt och snabbt."
  },
  {
    id: "mince",
    type: "Färs",
    minutes: 22,
    tags: ["high-protein", "meal-prep", "training"],
    names: [
      "Färsgryta med {protein}, {veg} och {carb}",
      "Proteinrik panna med {protein} och {veg}",
      "Matlådefärs med {protein}, {carb} och kål",
      "Snabb köttfri färsstil med {protein} och grönt",
      "Mättande färsbowl med {protein}, {veg} och {fat}"
    ],
    proteins: ["ground-chicken", "ground-beef", "turkey", "chicken", "tempeh"],
    vegs: ["zucchini", "mushroom", "onion", "pepper", "cabbage"],
    carbs: ["potato", "wholegrain-pasta", "brownrice", "quinoa", "sweetpotato"],
    fats: ["olive-oil", "cream-cheese", "cheese", "avocado", "hummus"],
    extras: ["garlic", "tomato", "spinach", "lemon", "carrot"],
    method: "Stek protein och grönsaker tillsammans, väg fettet och håll basen tydlig.",
    why: "Färsrätter blir lätt energitäta; den här motorn styr mängderna."
  },
  {
    id: "emergency",
    type: "Akutval",
    minutes: 5,
    tags: ["quick", "high-protein", "fatloss"],
    names: [
      "Akutskål med {protein}, {veg} och {fat}",
      "Fem-minutersmål med {protein} och {carb}",
      "Smart nödval med {protein}, {veg} och krisp",
      "Proteinräddare med {protein}, {carb} och fiber",
      "Kvällsval med {protein}, {veg} och kontrollerat fett"
    ],
    proteins: ["protein-pudding", "skyr", "kvarg", "cottage", "tuna"],
    vegs: ["berries", "banana", "apple", "orange", "pear"],
    carbs: ["oats", "rye-bread", "grapes", "blueberries", "strawberries"],
    fats: ["almonds", "pumpkin-seeds", "hummus", "avocado", null],
    extras: ["milk", "cucumber", "tomato", "lemon", "berries"],
    method: "Välj det som kräver minst matlagning men fortfarande ger protein först.",
    why: "När tiden är kort vinner ett bra nödval över ett perfekt recept som inte blir av."
  },
  {
    id: "tray",
    type: "Ugnsplåt",
    minutes: 30,
    tags: ["meal-prep", "high-protein", "fatloss"],
    names: [
      "Ugnsplåt med {protein}, {veg} och {carb}",
      "Plåtmat med {protein}, {veg} och citron",
      "Matlådesplåt med {protein}, {carb} och grönt",
      "Grön plåt med {protein}, {veg} och {fat}",
      "Mättnadsplåt med {protein}, {carb} och kål"
    ],
    proteins: ["chicken", "salmon", "cod", "tofu", "ground-chicken"],
    vegs: ["broccoli", "cauliflower", "carrot", "zucchini", "onion"],
    carbs: ["potato", "sweetpotato", "quinoa", "brownrice", "wholegrain-pasta"],
    fats: ["olive-oil", "feta", "avocado", "hummus", "pumpkin-seeds"],
    extras: ["garlic", "lemon", "pepper", "cabbage", "spinach"],
    method: "Rosta protein, bas och grönt tillsammans och dela upp i gram efteråt.",
    why: "Perfekt för flera portioner utan att varje måltid kräver nytt beslut."
  },
  {
    id: "pasta",
    type: "Pasta",
    minutes: 19,
    tags: ["training", "meal-prep", "high-protein"],
    names: [
      "Fullkornspasta med {protein}, {veg} och {fat}",
      "Träningspasta med {protein} och extra grönt",
      "Krämig proteinpasta med {protein}, {veg} och kontroll",
      "Snabb pastalåda med {protein} och {veg}",
      "Smart pastatallrik med {protein}, {carb} och fiber"
    ],
    proteins: ["tuna", "chicken", "ground-chicken", "shrimp", "tofu"],
    vegs: ["tomato", "zucchini", "spinach", "mushroom", "onion"],
    carbs: ["wholegrain-pasta", "wholegrain-pasta", "wholegrain-pasta", "wholegrain-pasta", "wholegrain-pasta"],
    fats: ["olive-oil", "cream-cheese", "mozzarella", "feta", "hummus"],
    extras: ["garlic", "lemon", "pepper", "cabbage", "broccoli"],
    method: "Låt pastan vara mätt bas, men gör protein och grönt till majoriteten visuellt.",
    why: "Gör kolhydratrik mat mer metabolt smart genom protein och fiber."
  },
  {
    id: "potato",
    type: "Potatis",
    minutes: 20,
    tags: ["fatloss", "meal-prep", "fiber"],
    names: [
      "Potatistallrik med {protein}, {veg} och {fat}",
      "Mättande potatisbas med {protein} och kål",
      "Nordisk bowl med {protein}, {carb} och grönt",
      "Lätt middag med {protein}, potatis och {veg}",
      "Proteinrik potatislåda med {protein} och {fat}"
    ],
    proteins: ["egg", "chicken", "cod", "turkey", "blackbeans"],
    vegs: ["cabbage", "broccoli", "cucumber", "tomato", "lettuce"],
    carbs: ["potato", "potato", "potato", "potato", "potato"],
    fats: ["hummus", "avocado", "olive-oil", "feta", "pumpkin-seeds"],
    extras: ["lemon", "onion", "garlic", "carrot", "spinach"],
    method: "Håll potatisen kokt eller ugnsrostad och låt proteinet styra portionen.",
    why: "Potatis ger stark mättnad när fettmängden hålls uppmätt."
  },
  {
    id: "mediterranean",
    type: "Medelhav",
    minutes: 16,
    tags: ["fatloss", "meal-prep", "fiber"],
    names: [
      "Medelhavsskål med {protein}, {veg} och {fat}",
      "Citronbowl med {protein}, {carb} och grönt",
      "Fräsch tallrik med {protein}, {veg} och hummus",
      "Premiumsallad med {protein}, {carb} och olivolja",
      "Mättande medelhavslunch med {protein} och {veg}"
    ],
    proteins: ["chicken", "tuna", "shrimp", "tofu", "feta"],
    vegs: ["tomato", "cucumber", "pepper", "lettuce", "onion"],
    carbs: ["quinoa", "chickpeas", "brownrice", "rye-bread", "potato"],
    fats: ["olive-oil", "avocado", "hummus", "pumpkin-seeds", "almonds"],
    extras: ["lemon", "spinach", "cabbage", "garlic", "berries"],
    method: "Bygg kallt eller ljummet med syra, grön volym och kontrollerad olivolja.",
    why: "Smakrikt utan att behöva stora mängder fett eller socker."
  },
  {
    id: "fiberstew",
    type: "Fibergryta",
    minutes: 28,
    tags: ["vegetarian", "fiber", "meal-prep"],
    names: [
      "Fibergryta med {protein}, {veg} och {carb}",
      "Baljväxtgryta med {protein} och extra grönt",
      "Mättande vegogryta med {protein}, {veg} och {fat}",
      "Bukfettssmart gryta med {protein}, kål och tomat",
      "Lunchgryta med {protein}, {carb} och fiber"
    ],
    proteins: ["lentils", "blackbeans", "chickpeas", "edamame", "tempeh"],
    vegs: ["cabbage", "carrot", "tomato", "onion", "spinach"],
    carbs: ["potato", "quinoa", "brownrice", "sweetpotato", "rye-bread"],
    fats: ["olive-oil", "hummus", "avocado", "pumpkin-seeds", "feta"],
    extras: ["garlic", "lemon", "pepper", "zucchini", "broccoli"],
    method: "Låt baljväxter och grönt sjuda ihop och toppa med uppmätt fettkälla.",
    why: "Hög fiber gör måltiden långsam, mättande och bättre för blodsockerkontroll."
  },
  {
    id: "recovery",
    type: "Återhämtning",
    minutes: 13,
    tags: ["training", "high-protein", "quick"],
    names: [
      "Återhämtningsmål med {protein}, {carb} och {veg}",
      "Efter träning med {protein}, {carb} och {fat}",
      "Snabb återstart med {protein}, {veg} och fiber",
      "Protein plus kolhydrat med {protein} och {carb}",
      "Träningsskål med {protein}, {carb} och grönt"
    ],
    proteins: ["chicken", "egg", "skyr", "salmon", "turkey"],
    vegs: ["broccoli", "spinach", "pepper", "tomato", "cucumber"],
    carbs: ["banana", "oats", "potato", "brownrice", "quinoa"],
    fats: ["almonds", "pumpkin-seeds", "avocado", "olive-oil", "hummus"],
    extras: ["milk", "berries", "lemon", "cabbage", "garlic"],
    method: "Para protein med lagom kolhydrat och lägg grönt för mättnad och mikronäring.",
    why: "Gör träningsdagar starkare utan att släppa midjemålet."
  }
];

const recipeTemplates = buildRecipeTemplates();

const swapGuide = [
  {
    id: "sweet-drink",
    label: "Läsk, juice eller söt dryck",
    better: "Kolsyrat vatten + citron, osötat te eller kaffe",
    portion: "Byt 330 ml mot 330 ml utan socker",
    why: "Du tar bort fritt socker utan att behöva ändra måltiden."
  },
  {
    id: "evening-snack",
    label: "Kvällschips eller snacks",
    better: "200 g naturell yoghurt/kvarg + 100 g bär",
    portion: "Lägg till kanel eller 10 g nötter om du behöver mer mättnad",
    why: "Mer protein och volym, mindre energitäthet."
  },
  {
    id: "white-bread",
    label: "Vitt bröd eller söt frukost",
    better: "Rågbröd/havre + ägg, yoghurt eller kvarg",
    portion: "60-80 g fullkorn + 20-35 g protein",
    why: "Fiber + protein gör frukosten mer stabil."
  },
  {
    id: "large-pasta",
    label: "Stor pasta-/risportion",
    better: "Halvera kolhydraten och lägg till baljväxter/grönsaker",
    portion: "120-180 g kokt fullkorn + 200-300 g grönsaker",
    why: "Du behåller måltidskänslan men ökar volym och fiber."
  },
  {
    id: "processed-meat",
    label: "Chark, bacon eller fet snabbmat",
    better: "Fisk, kyckling, tofu, ägg eller bönor",
    portion: "120-180 g protein eller 150-250 g baljväxter",
    why: "Mer mättnad och bättre fettprofil i vardagen."
  },
  {
    id: "alcohol",
    label: "Alkohol till maten",
    better: "Alkoholfritt alternativ + planerad proteinrik måltid",
    portion: "Välj 0 ml alkohol minst 4 dagar/vecka",
    why: "Alkohol tillför energi och gör kvällsbeslut svårare."
  }
];

const edgeCards = [
  ["Buksignal före kalorier", "Appen prioriterar midja/längd, midjetrend och vanor som påverkar visceralt fett, inte bara dagskalorier."],
  ["Beslut varje dag", "Användaren får en nästa bästa åtgärd baserad på svagaste länken i veckan."],
  ["Kön och livsfas", "Protokollen skiljer på man, kvinna, cykel, perimenopaus, postpartum, stress, alkohol och konditionsmål."],
  ["Svensk gram-precision", "Måltider och råvaror är byggda i cm, kg, g och minuter med vanliga nordiska livsmedel."],
  ["Privat PWA", "Profil och logg ligger lokalt på enheten, vilket ger en premiumcoach utan extern kontotvång."]
];

const sprintBlueprint = [
  ["Mät nolläge", "Midja på morgonen, vikt och 30 min rask gång.", "Kvarg/yoghurt 200 g + bär 150 g + havre 40 g."],
  ["Ta bort flytande energi", "Alla drycker utan socker och 10 min promenad efter middag.", "Protein 120-180 g + grönsaker 250-350 g."],
  ["Styrkestart", "Helkropp 25 min, lugnt tempo och bra teknik.", "Ägg 100-150 g eller tofu 150 g med råg/havre."],
  ["Fiberankare", "Minst 400 g frukt/grönt under dagen.", "Linser/bönor 180-250 g i lunch eller middag."],
  ["Sömnspärr", "Sätt 7+ timmar sömnfönster och stäng sena snacks.", "Planerat kvällsmål: yoghurt/kvarg 200 g + bär 100 g."],
  ["Zon 2-bas", "35-45 min prattempo, cykel eller rask gång.", "Potatis/fullkorn 120-200 g + protein 120-180 g."],
  ["Veckomätning", "Mät midja igen och skriv vad som var lättast.", "Förbered två matlådor med 250 g grönt per låda."],
  ["Alkoholfri hävstång", "Planera minst fyra alkoholfria dagar kommande vecka.", "Byt alkohol till 0 ml och ät proteinrik middag först."],
  ["Progressiv styrka", "Upprepa styrkan och höj 1-2 repetitioner per övning.", "Proteinmål per huvudmål enligt tallriken i gram."],
  ["Sockerkontroll", "Noll läsk/juice och ett smart byte från matlabbet.", "Frukt 150 g istället för juice eller sött mellanmål."],
  ["Stressbroms", "10 min nedvarvning, andning eller lugn promenad.", "Fet fisk 120-180 g eller baljväxtmål med olivolja 10 g."],
  ["Intervall light", "Kort intervallpass om kroppen känns pigg, annars zon 2.", "Kolhydrater runt pass: potatis/ris/fullkorn 120-180 g."],
  ["Social strategi", "Bestäm portionsram innan helg/social mat.", "Halva tallriken grönt, protein först, dessert uppmätt."],
  ["Ny baslinje", "Mät midja, vikt, rörelseminuter och välj nästa 14-dagarsfokus.", "Planera tre standardmåltider som kan upprepas."]
];

const workoutLibrary = {
  beginner: [
    {
      name: "Rask gång bas",
      tag: "30 min",
      why: "Bygger veckovolym utan hög skaderisk.",
      steps: ["5 min lugnt", "20 min prattempo men tydligt flås", "5 min lugnt"]
    },
    {
      name: "Styrka A",
      tag: "25 min",
      why: "Helkropp med låg tröskel.",
      steps: ["Knäböj mot stol 3x8-12", "Lutande armhävning 3x6-10", "Höftfällning 3x10", "Rodd med band/ryggsäck 3x10", "Sidoplanka 3x20 sek/sida"]
    },
    {
      name: "Intervall start",
      tag: "18 min",
      why: "Kort och kontrollerad intensitet efter uppvärmning.",
      steps: ["5 min uppvärmning", "6 rundor: 30 sek snabb gång/backe + 90 sek lugnt", "3 min nedvarvning"]
    }
  ],
  steady: [
    {
      name: "Zon 2",
      tag: "35-45 min",
      why: "Stabil kaloriförbrukning och kondition.",
      steps: ["5 min lugnt", "25-35 min jämnt tempo", "5 min lugnt"]
    },
    {
      name: "Styrka B",
      tag: "35 min",
      why: "Mer muskelmassa och bättre glukoshantering.",
      steps: ["Utfall eller step-up 3x8/sida", "Hantelpress eller armhävning 3x8-12", "Rumänska marklyft 3x8-10", "Rodd 3x10-12", "Dead bug 3x8/sida"]
    },
    {
      name: "HIIT kontrollerad",
      tag: "22 min",
      why: "Tidsbesparande pass som kan minska buk- och visceralt fett hos rätt person.",
      steps: ["6 min uppvärmning", "8 rundor: 30 sek hårt + 90 sek lätt", "4 min nedvarvning"]
    }
  ],
  trained: [
    {
      name: "Tröskelintervall",
      tag: "28 min",
      why: "Hög konditionseffekt utan att varje pass blir maxning.",
      steps: ["8 min uppvärmning", "6 rundor: 60 sek hårt + 90 sek lätt", "5 min nedvarvning"]
    },
    {
      name: "Styrka tung teknik",
      tag: "45 min",
      why: "Helkropp, progressiv belastning och mättnadsvänlig muskelmassa.",
      steps: ["Knäböj eller benpress 4x5-8", "Press 4x6-8", "Höftfällning 4x6-8", "Drag/rodd 4x8-10", "Bålrotation eller carry 4 set"]
    },
    {
      name: "Lång zon 2",
      tag: "50-70 min",
      why: "Ökar totalvolymen när återhämtningen håller.",
      steps: ["10 min lugnt", "35-55 min jämnt tempo", "5 min lugnt"]
    }
  ]
};

const weeklyPlans = {
  beginner: [
    ["Mån", "Rask gång bas", "Protein i varje huvudmål", "10 min lugn kväll"],
    ["Tis", "Styrka A", "Grönt vid lunch och middag", "Alkoholfri dag"],
    ["Ons", "Rask gång bas", "Inga sockerdrycker", "Sömnfönster 7+ h"],
    ["Tors", "Rörlighet 15 min", "Baljväxt eller fullkorn", "Stresspaus"],
    ["Fre", "Styrka A", "Planerad middag", "Kort promenad efter mat"],
    ["Lör", "Intervall start", "Färdig frukt/protein hemma", "Skärm ner före sömn"],
    ["Sön", "Lång promenad 45 min", "Förbered 2 matlådor", "Mät midja morgon"]
  ],
  steady: [
    ["Mån", "Zon 2", "Fiberrik frukost", "10 min promenad efter middag"],
    ["Tis", "Styrka B", "Protein + grönsaker", "Alkoholfri dag"],
    ["Ons", "HIIT kontrollerad", "Inga sockerdrycker", "Tidigare läggning"],
    ["Tors", "Zon 2 lätt", "Baljväxter/fullkorn", "Stresspaus"],
    ["Fre", "Styrka B", "Planerad helgmat", "Kort kvällspromenad"],
    ["Lör", "Valfri aktivitet 45 min", "Mättande lunch före social mat", "Alkoholgräns"],
    ["Sön", "Återhämtning + rörlighet", "Förbered 3 basmåltider", "Mät midja morgon"]
  ],
  trained: [
    ["Mån", "Tröskelintervall", "Protein + fullkorn", "Nedvarvning"],
    ["Tis", "Styrka tung teknik", "Grönt 400 g+", "Sömnprioritet"],
    ["Ons", "Lång zon 2", "Sockerdryck 0", "Stresspaus"],
    ["Tors", "Rörlighet + lätt gång", "Baljväxtmål", "Alkoholfri dag"],
    ["Fre", "Styrka tung teknik", "Planerad middag", "Kort promenad efter mat"],
    ["Lör", "HIIT kort eller backe", "Protein före/efter pass", "Skärm ner före sömn"],
    ["Sön", "Lång zon 2", "Matlådor och inköp", "Mät midja morgon"]
  ]
};

const timerPresets = {
  "Intervall start": [
    ["Uppvärmning", 300],
    ...Array.from({ length: 6 }, (_, i) => [["Hårt", 30], ["Lugnt", 90], i]).flat().filter((item) => Array.isArray(item)),
    ["Nedvarvning", 180]
  ],
  "HIIT kontrollerad": [
    ["Uppvärmning", 360],
    ...Array.from({ length: 8 }, (_, i) => [["Hårt", 30], ["Lugnt", 90], i]).flat().filter((item) => Array.isArray(item)),
    ["Nedvarvning", 240]
  ],
  "Tröskelintervall": [
    ["Uppvärmning", 480],
    ...Array.from({ length: 6 }, (_, i) => [["Hårt", 60], ["Lugnt", 90], i]).flat().filter((item) => Array.isArray(item)),
    ["Nedvarvning", 300]
  ]
};

let activeUser = loadActiveUser();
let state = loadState();
let timer = {
  presetName: "Intervall start",
  index: 0,
  remaining: 0,
  running: false,
  intervalId: null
};
let fridgeScan = {
  status: "idle",
  imageUrl: "",
  images: [],
  suggestions: [],
  uncertain: [],
  quality: null,
  mealIdea: null,
  shopping: [],
  detail: "high",
  source: "idle",
  message: "Kamera redo",
  note: ""
};
let mealScan = {
  status: "idle",
  imageUrl: "",
  result: null,
  source: "idle",
  message: "Matkamera redo",
  note: ""
};
let kitchenAiLoading = false;
let adminUsers = [];
let adminLoading = false;
let adminLoaded = false;
let adminMessage = "Logga in som admin för databasläge.";
let authMode = "login";
let deferredInstallPrompt = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  registerServiceWorker();
  bindInstallPrompt();
  syncConnectionState();
  bindAuth();
  setToday();
  bindTabs();
  bindProfile();
  bindLog();
  bindTimer();
  bindSwapLab();
  bindMealScan();
  bindFridgeBuilder();
  bindKitchenAssistant();
  bindMemberMessages();
  bindAdmin();
  renderAll();
  activateInitialTab();
});

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

function bindInstallPrompt() {
  const button = $("#installApp");
  if (!button) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    button.hidden = false;
  });

  button.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    button.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    button.hidden = true;
  });
}

function syncConnectionState() {
  const status = $("#connectionStatus");
  if (!status) return;
  const update = () => {
    const offline = navigator.onLine === false;
    status.textContent = offline ? "Offline redo" : "Online";
    status.classList.toggle("is-offline", offline);
  };
  update();
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
}

function loadUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadActiveUser() {
  const serverSession = loadServerSession();
  if (serverSession && serverSession.user && serverSession.token) {
    return {
      ...serverSession.user,
      token: serverSession.token,
      server: true,
      name: serverSession.user.name || serverSession.user.email
    };
  }
  const sessionId = localStorage.getItem(SESSION_KEY);
  const user = loadUsers().find((item) => item.id === sessionId);
  return user || GUEST_USER;
}

function loadServerSession() {
  try {
    return JSON.parse(localStorage.getItem(SERVER_SESSION_KEY));
  } catch {
    return null;
  }
}

function saveServerSession(payload) {
  localStorage.setItem(SERVER_SESSION_KEY, JSON.stringify(payload));
}

function stateStorageKey(userId = activeUser.id) {
  return `${STORAGE_KEY}:${userId}`;
}

function normalizeUserId(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9åäö._-]+/gi, "-").replace(/^-+|-+$/g, "") || "profil";
}

function hashPin(pin) {
  let hash = 5381;
  for (const char of pin) hash = ((hash << 5) + hash) + char.charCodeAt(0);
  return String(hash >>> 0);
}

function bindAuth() {
  renderAuth();
  $$(".auth-mode button").forEach((button) => {
    button.addEventListener("click", () => {
      setAuthMode(button.dataset.authMode);
      $("#authMessage").textContent = authMode === "register"
        ? "Skapa konto med e-post och PIN för en personlig kontoprofil."
        : "Logga in med e-post och PIN för att fortsätta på din profil.";
    });
  });

  $("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("#authEmail").value.trim();
    const pin = $("#authPin").value.trim();
    if (!email || !email.includes("@")) {
      setAuthMessage("Ange en giltig e-postadress.");
      return;
    }
    if (authMode === "register") {
      const name = $("#authDisplayName").value.trim();
      const confirmPin = $("#authPinConfirm").value.trim();
      if (!name || name.length < 2) {
        setAuthMessage("Ange ditt namn för kontot.");
        return;
      }
      if (pin.length < 6) {
        setAuthMessage("Välj en PIN med minst 6 siffror.");
        return;
      }
      if (pin !== confirmPin) {
        setAuthMessage("PIN och bekräftelse matchar inte.");
        return;
      }
      await registerWithDatabase(name, email, pin);
      return;
    }

    if (pin.length < 4) {
      setAuthMessage("Ange PIN med minst 4 siffror.");
      return;
    }
    await loginWithDatabase(email, pin);
  });

  $("#logoutProfile").addEventListener("click", () => {
    switchUser(GUEST_USER);
    setAuthMessage("Gästläge aktivt.");
  });
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
  const isRegister = authMode === "register";
  const loginButton = $("#authLoginMode");
  const registerButton = $("#authRegisterMode");
  loginButton?.classList.toggle("is-active", !isRegister);
  registerButton?.classList.toggle("is-active", isRegister);
  loginButton?.setAttribute("aria-selected", String(!isRegister));
  registerButton?.setAttribute("aria-selected", String(isRegister));
  $("#authDisplayNameField").hidden = !isRegister;
  $("#authPinConfirmField").hidden = !isRegister;
  $("#authPinLabel").textContent = isRegister ? "PIN, minst 6 siffror" : "PIN";
  $("#authPin").autocomplete = isRegister ? "new-password" : "current-password";
  $("#authPin").minLength = isRegister ? 6 : 4;
  $("#authSubmitButton").textContent = isRegister ? "Skapa konto" : "Logga in";
}

function renderAuth() {
  $("#activeUserLabel").textContent = activeUser.name;
  $("#authEmail").value = activeUser.server ? activeUser.email : "";
  $("#authDisplayName").value = activeUser.server ? activeUser.name : "";
  setAuthMode(authMode);
  const message = activeUser.server
    ? `Databasroll: ${roleLabel(activeUser.role)}. Sessionen sparas på denna enhet.`
    : "Logga in eller skapa konto för en personlig kontoprofil.";
  $("#authMessage").textContent = message;
}

function setAuthMessage(message, suffix = "Data sparas på denna enhet.") {
  $("#authMessage").textContent = `${message} ${suffix}`;
}

function switchUser(user) {
  activeUser = user;
  adminUsers = [];
  adminLoaded = false;
  adminMessage = "Logga in som admin för databasläge.";
  if (user.guest) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SERVER_SESSION_KEY);
  } else if (user.server) {
    localStorage.removeItem(SESSION_KEY);
    saveServerSession({ token: user.token, user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status } });
  } else {
    localStorage.removeItem(SERVER_SESSION_KEY);
    localStorage.setItem(SESSION_KEY, user.id);
  }
  state = loadState();
  syncProfileFields();
  renderAuth();
  renderAll();
}

async function loginWithDatabase(email, pin) {
  setAuthMessage("Loggar in mot databasen...", "Vänta.");
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pin })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Databasinloggning misslyckades.");
    switchUser({
      ...data.user,
      token: data.token,
      server: true,
      name: data.user.name || data.user.email
    });
    $("#authPin").value = "";
    $("#authPinConfirm").value = "";
    setAuthMessage("Inloggad via databas.", `Roll: ${roleLabel(data.user.role)}.`);
  } catch (error) {
    setAuthMessage(error.message || "Databasen kunde inte nås.", "Kontrollera att DATABASE_URL är satt och att profilen finns.");
  }
}

async function registerWithDatabase(name, email, pin) {
  setAuthMessage("Skapar konto i databasen...", "Vänta.");
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, pin })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Registrering misslyckades.");
    setAuthMode("login");
    switchUser({
      ...data.user,
      token: data.token,
      server: true,
      name: data.user.name || data.user.email
    });
    $("#authPin").value = "";
    $("#authPinConfirm").value = "";
    setAuthMessage("Kontot är skapat.", "Du är inloggad med din nya kontoprofil.");
  } catch (error) {
    setAuthMessage(error.message || "Kunde inte skapa konto.", "Försök igen eller logga in om kontot redan finns.");
  }
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(stateStorageKey()));
    if (stored) return mergeState(defaultState, stored);
    const legacy = activeUser.guest ? JSON.parse(localStorage.getItem(STORAGE_KEY)) : null;
    if (legacy) return mergeState(defaultState, legacy);
    return stored ? mergeState(defaultState, stored) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, next) {
  return {
    profile: { ...base.profile, ...(next.profile || {}) },
    habits: { ...base.habits, ...(next.habits || {}) },
    logs: { ...base.logs, ...(next.logs || {}) },
    pantry: {
      ...base.pantry,
      ...(next.pantry || {}),
      selected: Array.isArray(next.pantry && next.pantry.selected) ? next.pantry.selected : base.pantry.selected,
      recipeFilter: typeof (next.pantry && next.pantry.recipeFilter) === "string" ? next.pantry.recipeFilter : base.pantry.recipeFilter,
      kitchenMessages: Array.isArray(next.pantry && next.pantry.kitchenMessages) ? next.pantry.kitchenMessages : base.pantry.kitchenMessages,
      scanFeedback: Array.isArray(next.pantry && next.pantry.scanFeedback) ? next.pantry.scanFeedback : base.pantry.scanFeedback,
      shoppingList: Array.isArray(next.pantry && next.pantry.shoppingList) ? next.pantry.shoppingList : base.pantry.shoppingList
    },
    member: {
      ...base.member,
      ...(next.member || {}),
      bookings: Array.isArray(next.member && next.member.bookings) ? next.member.bookings : base.member.bookings,
      messages: Array.isArray(next.member && next.member.messages) ? next.member.messages : base.member.messages
    }
  };
}

function saveState() {
  localStorage.setItem(stateStorageKey(), JSON.stringify(state));
}

function setToday() {
  const formatter = new Intl.DateTimeFormat("sv-SE", { weekday: "long", day: "numeric", month: "long" });
  $("#todayLabel").textContent = formatter.format(new Date());
  $("#logDate").value = dateKey(new Date());
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function bindTabs() {
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tab);
      if (window.matchMedia("(max-width: 760px)").matches) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

function activateInitialTab() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && $("#" + tab)) activateTab(tab);
}

function activateTab(tab) {
  $$(".tab").forEach((item) => {
    const selected = item.dataset.tab === tab;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-selected", selected ? "true" : "false");
  });
  $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === tab));
}

function bindProfile() {
  const profile = state.profile;
  updateSexFocusOptions(profile.sex, profile.sexFocus);
  Object.entries(profile).forEach(([key, value]) => {
    const field = $("#" + key);
    if (field) field.value = value;
  });
  $("#sex").addEventListener("change", () => updateSexFocusOptions($("#sex").value));

  $("#profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      sex: $("#sex").value,
      age: numberValue("#age"),
      height: numberValue("#height"),
      weight: numberValue("#weight"),
      waist: numberValue("#waist"),
      targetWaist: numberValue("#targetWaist"),
      level: $("#level").value,
      foodMode: $("#foodMode").value,
      sexFocus: $("#sexFocus").value
    };
    saveState();
    renderAll();
  });

  $("#resetData").addEventListener("click", () => {
    if (!confirm("Rensa profil och logg?")) return;
    state = structuredClone(defaultState);
    saveState();
    location.reload();
  });
}

function updateSexFocusOptions(sex, selectedValue) {
  const select = $("#sexFocus");
  if (!select) return;
  const options = sexFocusOptions[sex] || sexFocusOptions.unspecified;
  select.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  const nextValue = selectedValue && options.some(([value]) => value === selectedValue)
    ? selectedValue
    : options[0][0];
  select.value = nextValue;
  $("#sexFocusLabel").textContent = sex === "female" ? "Kvinnospecifikt fokus" : sex === "male" ? "Mansspecifikt fokus" : "Profilfokus";
}

function bindLog() {
  renderHabitControls();
  $("#logDate").addEventListener("change", loadLogForDate);
  $("#logForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const key = $("#logDate").value || dateKey(new Date());
    const entry = {
      minutes: numberValue("#logMinutes", 0),
      weight: numberValue("#logWeight", 0),
      waist: numberValue("#logWaist", 0),
      habits: {}
    };
    habits.forEach(([id]) => {
      entry.habits[id] = $("#habit-" + id).checked;
    });
    state.logs[key] = entry;
    if (entry.weight) state.profile.weight = entry.weight;
    if (entry.waist) state.profile.waist = entry.waist;
    saveState();
    syncProfileFields();
    renderAll();
  });
}

function renderHabitControls() {
  $("#habitGrid").innerHTML = habits.map(([id, label]) => `
    <label class="habit-toggle">
      <input id="habit-${id}" type="checkbox">
      <span>${label}</span>
    </label>
  `).join("");
  loadLogForDate();
}

function loadLogForDate() {
  const key = $("#logDate").value || dateKey(new Date());
  const entry = state.logs[key] || {};
  $("#logMinutes").value = entry.minutes || "";
  $("#logWeight").value = entry.weight || "";
  $("#logWaist").value = entry.waist || "";
  habits.forEach(([id]) => {
    const field = $("#habit-" + id);
    if (field) field.checked = Boolean(entry.habits && entry.habits[id]);
  });
}

function bindTimer() {
  const select = $("#timerWorkout");
  select.innerHTML = Object.keys(timerPresets).map((name) => `<option value="${name}">${name}</option>`).join("");
  select.value = timer.presetName;
  select.addEventListener("change", () => {
    timer.presetName = select.value;
    resetTimer();
  });
  $("#startTimer").addEventListener("click", startTimer);
  $("#pauseTimer").addEventListener("click", pauseTimer);
  $("#resetTimer").addEventListener("click", resetTimer);
  resetTimer();
}

function bindSwapLab() {
  const select = $("#swapTrigger");
  if (!select) return;
  select.innerHTML = swapGuide.map((item) => `<option value="${item.id}">${item.label}</option>`).join("");
  select.addEventListener("change", renderSmartFood);
}

function bindMealScan() {
  const scanButton = $("#mealScanButton");
  const fileInput = $("#mealCameraInput");
  if (!scanButton || !fileInput) return;
  scanButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (event) => {
    const [file] = Array.from(event.target.files || []);
    if (file) handleMealScanFile(file);
    event.target.value = "";
  });
  $("#mealScanPanel")?.addEventListener("click", (event) => {
    const askButton = event.target.closest("[data-meal-scan-ask]");
    if (askButton && !kitchenAiLoading) {
      askKitchenAssistant(askButton.dataset.mealScanAsk || "Gör min fotade måltid bättre för bukfett.");
    }
  });
}

function bindFridgeBuilder() {
  const select = $("#fridgeGoal");
  if (!select) return;
  ensurePantryState();
  select.value = state.pantry.goal;
  select.addEventListener("change", () => {
    ensurePantryState();
    state.pantry.goal = select.value;
    saveState();
    renderFridgeBuilder();
  });

  const scanButton = $("#fridgeScanButton");
  const fileInput = $("#fridgeCameraInput");
  const applyButton = $("#fridgeApplyScan");
  const analyzeButton = $("#fridgeAnalyzeScan");
  scanButton?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length) handleFridgeScanFiles(files);
    event.target.value = "";
  });
  applyButton?.addEventListener("click", applyFridgeScanSuggestions);
  analyzeButton?.addEventListener("click", analyzeFridgeScanImages);

  $("#fridgeScanPreview")?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-scan-remove-image]");
    if (!removeButton) return;
    removeFridgeScanImage(Number(removeButton.dataset.scanRemoveImage));
  });

  $("#fridgeScanSuggestions")?.addEventListener("click", (event) => {
    const confirmButton = event.target.closest("[data-scan-confirm]");
    if (confirmButton) {
      confirmFridgeScanItem(confirmButton.dataset.scanConfirm);
      return;
    }

    const wrongButton = event.target.closest("[data-scan-wrong]");
    if (wrongButton) {
      rejectFridgeScanItem(wrongButton.dataset.scanWrong);
      return;
    }

    const feedbackButton = event.target.closest("[data-scan-feedback]");
    if (feedbackButton) {
      markFridgeScanSuggestion(feedbackButton.dataset.scanFeedback, feedbackButton.dataset.scanVerdict || "right");
      return;
    }

    const addButton = event.target.closest("[data-scan-add]");
    if (addButton) {
      const ids = addButton.dataset.scanAdd.split(",").filter((id) => pantryFoods.some((food) => food.id === id));
      addFridgeIds(ids, "AI-måltiden lades till i byggaren.");
      return;
    }

    const shoppingButton = event.target.closest("[data-scan-shopping]");
    if (shoppingButton) {
      saveScanShoppingItems(fridgeScan.shopping || []);
      return;
    }

    const askButton = event.target.closest("[data-scan-ask]");
    if (askButton && !kitchenAiLoading) {
      askKitchenAssistant(askButton.dataset.scanAsk || "Vad kan jag laga av de scannade råvarorna?");
    }
  });

  $("#recipeEngine")?.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-recipe-filter]");
    if (filterButton) {
      ensurePantryState();
      state.pantry.recipeFilter = filterButton.dataset.recipeFilter || "best";
      saveState();
      renderRecipeEngine();
      return;
    }

    const addButton = event.target.closest("[data-recipe-add]");
    if (addButton) {
      const ids = addButton.dataset.recipeAdd.split(",").filter((id) => pantryFoods.some((food) => food.id === id));
      addFridgeIds(ids, "Receptets råvaror lades till i byggaren.");
      return;
    }

    const askButton = event.target.closest("[data-recipe-ask]");
    if (askButton && !kitchenAiLoading) {
      askKitchenAssistant(askButton.dataset.recipeAsk || "Gör detta recept ännu bättre för bukfett och mättnad.");
    }
  });
}

function bindKitchenAssistant() {
  const form = $("#kitchenAiForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#kitchenAiInput");
    const message = input.value.trim();
    if (!message || kitchenAiLoading) return;
    input.value = "";
    askKitchenAssistant(message);
  });

  $$(".kitchen-ai-prompts [data-kitchen-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!kitchenAiLoading) askKitchenAssistant(button.dataset.kitchenPrompt);
    });
  });

  $("#kitchenAiThread")?.addEventListener("click", (event) => {
    const promptButton = event.target.closest("[data-kitchen-prompt]");
    if (promptButton && !kitchenAiLoading) {
      askKitchenAssistant(promptButton.dataset.kitchenPrompt);
      return;
    }

    const addButton = event.target.closest("[data-kitchen-add]");
    if (!addButton) return;
    const ids = addButton.dataset.kitchenAdd.split(",").filter((id) => pantryFoods.some((food) => food.id === id));
    if (!ids.length) return;
    ensurePantryState();
    state.pantry.selected = Array.from(new Set([...state.pantry.selected, ...ids]));
    saveState();
    renderFridgeBuilder();
  });
}

function bindMemberMessages() {
  const form = $("#memberMessageForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const field = $("#memberMessage");
    const text = field.value.trim();
    if (!text) return;
    state.member.messages.unshift({
      id: `msg-${Date.now()}`,
      type: "member",
      title: "Meddelande skickat",
      text,
      date: new Date().toISOString()
    });
    field.value = "";
    saveState();
    renderMemberHub();
  });
}

function bindAdmin() {
  const form = $("#adminCreateUserForm");
  const refreshButton = $("#refreshAdminUsers");
  if (refreshButton) refreshButton.addEventListener("click", fetchAdminUsers);
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canAccessAdmin()) return;
    const payload = {
      email: $("#adminUserEmail").value.trim(),
      name: $("#adminUserName").value.trim(),
      role: $("#adminUserRole").value,
      pin: $("#adminUserPin").value.trim()
    };
    $("#adminCreateResult").textContent = "Sparar användare i databasen...";
    try {
      const data = await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      $("#adminCreateResult").textContent = `${data.message} PIN: ${data.temporaryPin}`;
      $("#adminUserEmail").value = "";
      $("#adminUserName").value = "";
      $("#adminUserPin").value = "";
      await fetchAdminUsers();
    } catch (error) {
      $("#adminCreateResult").textContent = error.message || "Kunde inte skapa användare.";
    }
  });
}

function startTimer() {
  if (timer.running) return;
  timer.running = true;
  timer.intervalId = window.setInterval(() => {
    timer.remaining -= 1;
    if (timer.remaining <= 0) {
      timer.index += 1;
      const phases = timerPresets[timer.presetName];
      if (timer.index >= phases.length) {
        pauseTimer();
        timer.index = phases.length - 1;
        timer.remaining = 0;
      } else {
        timer.remaining = phases[timer.index][1];
      }
    }
    renderTimer();
  }, 1000);
}

function pauseTimer() {
  timer.running = false;
  window.clearInterval(timer.intervalId);
  timer.intervalId = null;
}

function resetTimer() {
  pauseTimer();
  timer.index = 0;
  timer.remaining = timerPresets[timer.presetName][0][1];
  renderTimer();
}

function renderTimer() {
  const phases = timerPresets[timer.presetName];
  const phase = phases[timer.index] || ["Klar", 0];
  $("#timerPhase").textContent = timer.remaining === 0 && timer.index === phases.length - 1 ? "Klar" : phase[0];
  $("#timerTime").textContent = formatSeconds(timer.remaining);
  $("#timerRound").textContent = `${timer.index + 1} av ${phases.length}`;
}

function formatSeconds(total) {
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = Math.max(0, total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderAll() {
  renderCoach();
  renderMetrics();
  renderSexProtocol();
  renderEdgeGrid();
  renderPriorities();
  renderPlan();
  renderSprintPlan();
  renderNutrition();
  renderSmartFood();
  renderFridgeBuilder();
  renderMealTemplates();
  renderFoodGuide();
  renderTraining();
  renderWeeklySummary();
  renderMemberHub();
  renderAdminHub();
  renderSources();
  renderCompetitors();
  loadLogForDate();
}

function getRecentEntries(days = 7) {
  return Array.from({ length: days }, (_, offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const key = dateKey(d);
    return { key, entry: state.logs[key] };
  }).filter((item) => item.entry);
}

function getTrend(values) {
  return values.length >= 2 ? values[values.length - 1] - values[0] : 0;
}

function analyzeProgress() {
  const p = state.profile;
  const entries = getRecentEntries(7);
  const whtr = p.waist / p.height;
  const minutes = entries.reduce((sum, item) => sum + (item.entry.minutes || 0), 0);
  const habitHits = entries.reduce((sum, item) => sum + Object.values(item.entry.habits || {}).filter(Boolean).length, 0);
  const possibleHabits = Math.max(7, entries.length * 7);
  const strengthDays = entries.filter((item) => item.entry.habits && item.entry.habits.strength).length;
  const sleepDays = entries.filter((item) => item.entry.habits && item.entry.habits.sleep).length;
  const stressDays = entries.filter((item) => item.entry.habits && item.entry.habits.stress).length;
  const alcoholFreeDays = entries.filter((item) => item.entry.habits && item.entry.habits.alcohol).length;
  const vegDays = entries.filter((item) => item.entry.habits && item.entry.habits.veg).length;
  const proteinDays = entries.filter((item) => item.entry.habits && item.entry.habits.protein).length;
  const sugarFreeDays = entries.filter((item) => item.entry.habits && item.entry.habits.sugarfree).length;
  const waistTrend = getTrend(entries.map((item) => item.entry.waist).filter(Boolean));

  const waistBase = whtr < 0.5 ? 27 : whtr < 0.55 ? 22 : whtr < 0.6 ? 17 : 11;
  const waistMomentum = waistTrend > 0.4 ? 3 : waistTrend < -0.4 ? -4 : 0;
  const waistScore = clamp(waistBase + waistMomentum, 0, 30);
  const movementScore = Math.min(20, Math.round((minutes / 150) * 20));
  const strengthScore = Math.min(12, Math.round((strengthDays / 2) * 12));
  const foodScore = Math.min(18, Math.round(((vegDays + proteinDays + sugarFreeDays) / Math.max(3, entries.length * 3)) * 18));
  const recoveryScore = Math.min(12, Math.round(((sleepDays + stressDays + alcoholFreeDays) / Math.max(3, entries.length * 3)) * 12));
  const loggingScore = Math.min(8, Math.round((entries.length / 5) * 8));
  const breakdown = [
    ["Buksignal", waistScore, 30, whtr < 0.5 ? "Under 0,50 eller på väg dit" : "Midja/längd behöver mest fokus"],
    ["Rörelse", movementScore, 20, `${minutes} min senaste 7 dagarna`],
    ["Styrka", strengthScore, 12, `${strengthDays}/2 styrkedagar`],
    ["Kost", foodScore, 18, `${proteinDays + vegDays + sugarFreeDays} matträffar`],
    ["Återhämtning", recoveryScore, 12, `${sleepDays + stressDays + alcoholFreeDays} återhämtningsträffar`],
    ["Loggning", loggingScore, 8, `${entries.length}/5 dagar för smart analys`]
  ];
  const score = clamp(waistScore + movementScore + strengthScore + foodScore + recoveryScore + loggingScore, 0, 100);
  const weakest = breakdown.reduce((lowest, item) => (item[1] / item[2]) < (lowest[1] / lowest[2]) ? item : lowest, breakdown[0]);
  const strongest = breakdown.reduce((highest, item) => (item[1] / item[2]) > (highest[1] / highest[2]) ? item : highest, breakdown[0]);

  return {
    entries,
    score,
    tier: scoreTier(score, whtr),
    breakdown,
    weakest,
    strongest,
    whtr,
    minutes,
    strengthDays,
    sleepDays,
    stressDays,
    alcoholFreeDays,
    vegDays,
    proteinDays,
    sugarFreeDays,
    waistTrend,
    habitHits,
    possibleHabits
  };
}

function scoreTier(score, whtr) {
  if (score >= 82 && whtr < 0.52) return { label: "Precision", className: "low" };
  if (score >= 68) return { label: "Momentum", className: "low" };
  if (score >= 50) return { label: "Byggfas", className: "medium" };
  return { label: "Startläge", className: "high" };
}

function renderCoach() {
  const analysis = analyzeProgress();
  const status = $("#coachStatus");
  const score = analysis.score;
  $("#metabolicScore").textContent = score;
  $("#metabolicProgress").style.width = `${score}%`;
  $("#scoreTier").textContent = analysis.tier.label;
  $("#scoreTier").className = `score-tier ${analysis.tier.className}`;

  let label = "Bygg databas med 3-5 loggdagar.";
  let className = "medium";
  if (score >= 78) {
    label = "Stark rutin. Behåll trycket och höj precisionen.";
    className = "low";
  } else if (score >= 55) {
    label = "Bra bas. En svag länk bromsar resultatet.";
    className = "medium";
  } else {
    label = "Hög hävstång: små dagliga beslut kan ge stor effekt.";
    className = "high";
  }
  $("#metabolicLabel").textContent = label;
  status.textContent = analysis.entries.length ? `${analysis.entries.length}/7 loggdagar` : "Startläge";
  status.className = `status-badge ${className}`;

  const action = getNextBestAction(analysis);
  $("#nextAction").innerHTML = `
    <span>Nästa bästa åtgärd</span>
    <strong>${action.title}</strong>
    <p>${action.text}</p>
    <small>${action.reason}</small>
  `;

  renderScoreBreakdown(analysis);
  renderCoachBrief(analysis);

  const report = getCoachReport(analysis);
  $("#coachReport").innerHTML = report.map(([title, text]) => `
    <article>
      <strong>${title}</strong>
      <span>${text}</span>
    </article>
  `).join("");
}

function renderScoreBreakdown(analysis) {
  const target = $("#scoreBreakdown");
  if (!target) return;
  target.innerHTML = analysis.breakdown.map(([label, value, max, note]) => {
    const ratio = Math.round((value / max) * 100);
    return `
      <article>
        <div>
          <strong>${label}</strong>
          <span>${value}/${max}</span>
        </div>
        <div class="mini-track" aria-hidden="true"><span style="width: ${ratio}%"></span></div>
        <small>${note}</small>
      </article>
    `;
  }).join("");
}

function renderCoachBrief(analysis) {
  const target = $("#coachBrief");
  if (!target) return;
  const blocker = getPrimaryBlocker(analysis);
  const experiment = getWeeklyExperiment(analysis);
  target.innerHTML = `
    <article>
      <span>Starkaste signal</span>
      <strong>${analysis.strongest[0]}</strong>
      <p>${analysis.strongest[3]}</p>
    </article>
    <article>
      <span>Dolda bromsen</span>
      <strong>${blocker.title}</strong>
      <p>${blocker.text}</p>
    </article>
    <article>
      <span>Veckans experiment</span>
      <strong>${experiment.title}</strong>
      <p>${experiment.text}</p>
    </article>
  `;
}

function getPrimaryBlocker(analysis) {
  if (analysis.entries.length < 3) {
    return {
      title: "För lite signaldata",
      text: "Tre loggdagar räcker för att appen ska börja skilja mellan kost, rörelse och återhämtning."
    };
  }
  if (analysis.weakest[0] === "Rörelse") {
    return {
      title: "Veckovolym saknas",
      text: "Lägg 10-20 min efter måltid tills du når minst 150 min per vecka."
    };
  }
  if (analysis.weakest[0] === "Kost") {
    return {
      title: "Måltidsramen läcker",
      text: "Protein, grönt och sockerfri dryck är snabbaste vägen till mindre hunger."
    };
  }
  if (analysis.weakest[0] === "Återhämtning") {
    return {
      title: "Stress eller sömn tar marginalen",
      text: "Sömnfönster och alkoholfri kväll höjer chansen att kosten håller nästa dag."
    };
  }
  return {
    title: `${analysis.weakest[0]} släpar`,
    text: analysis.weakest[3]
  };
}

function getWeeklyExperiment(analysis) {
  if (analysis.alcoholFreeDays < 4) {
    return {
      title: "4 alkoholfria dagar",
      text: "Gör det som ett mätbart experiment, inte ett livslöfte."
    };
  }
  if (analysis.strengthDays < 2) {
    return {
      title: "2 styrkepass",
      text: "Två korta helkroppspass räcker för att skydda muskelmassa under fettminskning."
    };
  }
  if (analysis.vegDays < 5) {
    return {
      title: "400 g frukt/grönt",
      text: "Fördela mängden över två huvudmål och ett mellanmål."
    };
  }
  if (analysis.sleepDays < 5) {
    return {
      title: "Sömn före mer intensitet",
      text: "Lägg dig tidigare tre kvällar innan du ökar träningsbelastningen."
    };
  }
  return {
    title: "Midjemätning + matlådor",
    text: "Behåll basen och gör söndagen till kalibreringsdag."
  };
}

function getNextBestAction(analysis) {
  if (analysis.entries.length < 3) {
    return {
      title: "Logga 3 dagar utan att ändra allt",
      text: "Registrera midja, vikt, rörelse och vanor i tre dagar. Appen blir smartare när den ser din baslinje.",
      reason: "Bra coaching börjar med mönster, inte gissningar."
    };
  }
  if (analysis.minutes < 150) {
    const missing = Math.max(0, 150 - analysis.minutes);
    return {
      title: `Samla ${missing} min rörelse`,
      text: "Dela upp det i 10-20 min promenad efter måltid. Det kräver mindre vilja än ett perfekt träningspass.",
      reason: "Rörelsevolym är en av de tydligaste hävstängerna i veckan."
    };
  }
  if (analysis.strengthDays < 2) {
    return {
      title: "Gör ett kort styrkepass",
      text: "Välj helkroppspasset i träningsfliken. 25-35 min räcker för att skydda muskelmassa.",
      reason: "Styrka gör viktnedgången mer metabolt robust."
    };
  }
  if (analysis.proteinDays < 5 || analysis.vegDays < 5) {
    return {
      title: "Bygg nästa måltid med 3-block",
      text: "120-180 g protein, 200-300 g grönsaker och 120-200 g potatis/baljväxt/fullkorn.",
      reason: "Mättnad och fiber slår småförbud."
    };
  }
  if (analysis.sugarFreeDays < 5) {
    return {
      title: "Byt flytande socker idag",
      text: "Välj vatten, kaffe, te eller light/alkoholfritt om du behöver brygga över vanan.",
      reason: "Flytande energi ger svag mättnad och är lätt att förbise."
    };
  }
  if (analysis.sleepDays < 5) {
    return {
      title: "Sätt sömnfönster ikväll",
      text: "Planera 7+ timmar och stäng matbeslut 2 timmar före läggning.",
      reason: "Sömn gör hunger och impulser lättare att hantera."
    };
  }
  return {
    title: "Skärp nästa vecka med ett experiment",
    text: "Behåll rutinen och välj ett experiment: 30 g mer fiber/dag, två styrkepass eller fyra alkoholfria dagar.",
    reason: "När basen sitter ger ett smalt experiment bäst lärande."
  };
}

function getCoachReport(analysis) {
  const waistText = analysis.waistTrend > 0
    ? `Midjan rör sig åt rätt håll: ${formatTrend(analysis.waistTrend, "cm")}.`
    : analysis.waistTrend < 0
      ? `Midjan har ökat ${formatTrend(analysis.waistTrend, "cm")}; säkra måltidsramen innan du jagar mer träning.`
      : "Midjan är stabil eller saknar trenddata.";
  const movementText = analysis.minutes >= 150
    ? `Du har nått ${analysis.minutes} min rörelse senaste 7 dagarna.`
    : `Du saknar ${150 - analysis.minutes} min till veckogolvet 150 min.`;
  const foodText = (analysis.proteinDays + analysis.vegDays + analysis.sugarFreeDays) >= 15
    ? "Kostvanorna bär planen. Nästa nivå är portionsprecision i gram."
    : "Kostvanorna är den snabbaste vinsten: protein, grönt och sockerfri dryck.";
  return [
    ["Trend", waistText],
    ["Volym", movementText],
    ["Hävstång", foodText]
  ];
}

function renderSmartFood() {
  renderPlateBuilder();
  renderSwapResult();
  renderMealScan();
}

function renderPlateBuilder() {
  const p = state.profile;
  const proteinTarget = clamp(Math.round(p.weight * 1.6), 70, 190);
  const mealProtein = Math.round(proteinTarget / 3);
  const veg = p.waist / p.height >= 0.5 ? "250-350 g" : "200-300 g";
  const carbs = p.foodMode === "dash" ? "120-180 g" : "120-220 g";
  const fats = p.foodMode === "med" ? "10-20 g olivolja/nötter" : "10-15 g omättat fett";
  $("#plateBuilder").innerHTML = `
    <div class="plate-head">
      <span>Din tallrik</span>
      <strong>${mealProtein} g protein per huvudmål</strong>
      <small>Dagligt riktmärke: cirka ${proteinTarget} g protein, plus minst 400 g frukt/grönt.</small>
    </div>
    <div class="plate-grid">
      <article><b>1</b><strong>${veg}</strong><span>Grönsaker eller bär/frukt per huvudmål.</span></article>
      <article><b>2</b><strong>120-180 g</strong><span>Fisk, kyckling, tofu, ägg, kvarg eller baljväxter.</span></article>
      <article><b>3</b><strong>${carbs}</strong><span>Kokt potatis, bönor, linser, havre eller fullkorn.</span></article>
      <article><b>4</b><strong>${fats}</strong><span>Fett som höjer smak utan att ta över energin.</span></article>
    </div>
  `;
}

function renderSwapResult() {
  const select = $("#swapTrigger");
  if (!select) return;
  const selected = swapGuide.find((item) => item.id === select.value) || swapGuide[0];
  $("#swapResult").innerHTML = `
    <span>Bättre byte</span>
    <strong>${selected.better}</strong>
    <p>${selected.why}</p>
    <small>${selected.portion}</small>
  `;
}

function renderMealScan() {
  const preview = $("#mealScanPreview");
  const result = $("#mealScanResult");
  if (!preview || !result) return;
  const hasImage = Boolean(mealScan.imageUrl);
  preview.className = `meal-scan-preview ${hasImage ? "" : "empty"} ${mealScan.status}`;
  preview.innerHTML = hasImage
    ? `<img src="${mealScan.imageUrl}" alt="Fotad måltid"><span>${escapeHTML(mealScan.message)}</span>`
    : `<span>Ingen matbild ännu</span>`;

  const scan = mealScan.result;
  result.innerHTML = `
    <div class="meal-scan-status ${mealScan.status}">
      <strong>${mealScanStatusTitle(mealScan.status)}</strong>
      <span>${escapeHTML(mealScan.note || mealScan.message)}</span>
    </div>
    ${scan ? renderMealScanResult(scan) : `
      <p class="meal-scan-empty">Fota tallriken rakt ovanifrån. AI uppskattar portion, kcal, protein, kolhydrater, fett och fiber samt vad som saknas för en bättre midjemåltid.</p>
    `}
  `;
}

function renderMealScanResult(scan) {
  const totals = scan.totals || {};
  const quality = scan.portionQuality || {};
  const macroCards = [
    ["Energi", `${Math.round(totals.kcal || 0)} kcal`, `${Math.round(totals.grams || 0)} g mat`],
    ["Protein", `${Math.round(totals.protein || 0)} g`, "Mättnad och muskelstöd"],
    ["Kolhydrater", `${Math.round(totals.carbs || 0)} g`, `Socker ca ${Math.round(totals.sugar || 0)} g`],
    ["Fett", `${Math.round(totals.fat || 0)} g`, "Kontrollera olja/sås"],
    ["Fiber", `${Math.round(totals.fiber || 0)} g`, "Bukfettsvänlig mättnad"]
  ];
  return `
    <article class="meal-scan-card">
      <header>
        <div>
          <span>${escapeHTML(sourceLabel(scan.source))}</span>
          <strong>${escapeHTML(scan.dishName || "Fotad måltid")}</strong>
        </div>
        <b>${Math.round((scan.confidence || 0.5) * 100)}%</b>
      </header>
      <div class="meal-scan-quality ${quality.shouldRetake ? "warn" : "good"}">
        <strong>Portionssäkerhet ${Math.round((quality.score || 0.5) * 100)}%</strong>
        <p>${escapeHTML(quality.visibleReference || "Ingen tydlig storleksreferens.")}</p>
        <small>${escapeHTML(quality.advice || "Ta gärna en rak bild med hela tallriken.")}</small>
      </div>
      <div class="meal-scan-macros">
        ${macroCards.map(([label, value, detail]) => `
          <article>
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${detail}</small>
          </article>
        `).join("")}
      </div>
      ${Array.isArray(scan.items) && scan.items.length ? `
        <div class="meal-scan-items">
          <header>
            <strong>Synliga komponenter</strong>
            <span>${scan.items.length} delar</span>
          </header>
          ${scan.items.map((item) => `
            <article>
              <div>
                <strong>${escapeHTML(item.name)}</strong>
                <small>${Math.round(item.kcal || 0)} kcal · P ${formatFridgeValue(item.protein || 0)} g · Fibrer ${formatFridgeValue(item.fiber || 0)} g</small>
              </div>
              <b>${Math.round(item.grams || 0)} g</b>
            </article>
          `).join("")}
        </div>
      ` : ""}
      <div class="meal-scan-verdict ${scan.verdict && scan.verdict.level ? scan.verdict.level : "tune"}">
        <strong>${escapeHTML(scan.verdict && scan.verdict.title || "Näringsvärde uppskattat")}</strong>
        <p>${escapeHTML(scan.verdict && scan.verdict.text || "AI har uppskattat måltiden från bilden.")}</p>
        ${scan.verdict && Array.isArray(scan.verdict.actions) && scan.verdict.actions.length ? `<ul>${scan.verdict.actions.map((action) => `<li>${escapeHTML(action)}</li>`).join("")}</ul>` : ""}
      </div>
      ${Array.isArray(scan.notes) && scan.notes.length ? `
        <div class="meal-scan-notes">
          ${scan.notes.map((note) => `<span>${escapeHTML(note)}</span>`).join("")}
        </div>
      ` : ""}
      <div class="scan-action-row">
        <button type="button" data-meal-scan-ask="${escapeHTML(buildMealScanKitchenPrompt(scan))}">Gör bättre med Köks-AI</button>
      </div>
      ${scan.caution ? `<small class="meal-scan-caution">${escapeHTML(scan.caution)}</small>` : ""}
    </article>
  `;
}

function mealScanStatusTitle(status) {
  if (status === "scanning") return "Analyserar matbild";
  if (status === "ready") return "Näringsvärde klart";
  if (status === "fallback") return "Lokal uppskattning";
  if (status === "error") return "Matbilden kunde inte läsas";
  return "Redo för matfoto";
}

function ensurePantryState() {
  if (!state.pantry) state.pantry = structuredClone(defaultState.pantry);
  if (!Array.isArray(state.pantry.selected)) state.pantry.selected = [...defaultState.pantry.selected];
  if (!Array.isArray(state.pantry.kitchenMessages)) state.pantry.kitchenMessages = [];
  if (!Array.isArray(state.pantry.scanFeedback)) state.pantry.scanFeedback = [];
  if (!Array.isArray(state.pantry.shoppingList)) state.pantry.shoppingList = [];
  if (!state.pantry.goal) state.pantry.goal = defaultState.pantry.goal;
  if (!state.pantry.recipeFilter) state.pantry.recipeFilter = defaultState.pantry.recipeFilter;
}

function renderFridgeBuilder() {
  const target = $("#fridgeMealResult");
  if (!target) return;
  ensurePantryState();
  const select = $("#fridgeGoal");
  if (select && select.value !== state.pantry.goal) select.value = state.pantry.goal;
  renderFridgeScanPanel();
  renderKitchenAssistant();
  renderFridgeFoodBank();
  renderFridgeMeal();
  renderRecipeEngine();
}

function renderFridgeFoodBank() {
  const target = $("#fridgeFoodBank");
  if (!target) return;
  ensurePantryState();
  const selected = new Set(state.pantry.selected);
  target.innerHTML = fridgeCategories.map((category) => {
    const foods = pantryFoods.filter((food) => food.category === category.id);
    if (!foods.length) return "";
    return `
      <section class="fridge-group" aria-label="${category.title}">
        <header>
          <div>
            <strong>${category.title}</strong>
            <span>${category.hint}</span>
          </div>
          <b>${foods.length}</b>
        </header>
        <div class="fridge-chip-grid">
          ${foods.map((food) => `
            <label class="fridge-chip ${selected.has(food.id) ? "selected" : ""}">
              <input type="checkbox" value="${food.id}" ${selected.has(food.id) ? "checked" : ""}>
              <span>
                <strong>${food.name}</strong>
                <small>${Math.round(food.kcal)} kcal/100 g · protein ${formatFridgeValue(food.protein)} g · fiber ${formatFridgeValue(food.fiber)} g</small>
              </span>
            </label>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");

  target.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.addEventListener("change", () => {
      state.pantry.selected = Array.from(target.querySelectorAll("input[type='checkbox']:checked")).map((checked) => checked.value);
      saveState();
      renderFridgeBuilder();
    });
  });
}

function renderFridgeScanPanel() {
  const preview = $("#fridgeScanPreview");
  const target = $("#fridgeScanSuggestions");
  const applyButton = $("#fridgeApplyScan");
  const analyzeButton = $("#fridgeAnalyzeScan");
  if (!preview || !target || !applyButton || !analyzeButton) return;

  const images = fridgeScanImages();
  const suggestions = Array.isArray(fridgeScan.suggestions) ? fridgeScan.suggestions : [];
  const uncertain = Array.isArray(fridgeScan.uncertain) ? fridgeScan.uncertain : [];
  const shopping = Array.isArray(fridgeScan.shopping) ? fridgeScan.shopping : [];
  const mealIdea = fridgeScan.mealIdea && typeof fridgeScan.mealIdea === "object" ? fridgeScan.mealIdea : null;
  const quality = fridgeScan.quality && typeof fridgeScan.quality === "object" ? fridgeScan.quality : null;
  const applyIds = scanApplyIds();
  const hasImage = images.length > 0;
  preview.className = `fridge-scan-preview ${hasImage ? "" : "empty"} ${fridgeScan.status}`;
  preview.innerHTML = hasImage
    ? `
      <div class="fridge-scan-gallery">
        ${images.map((imageUrl, index) => `
          <figure>
            <img src="${imageUrl}" alt="Kylskåpsbild ${index + 1}">
            <button type="button" aria-label="Ta bort bild ${index + 1}" data-scan-remove-image="${index}">×</button>
            <figcaption>Bild ${index + 1}</figcaption>
          </figure>
        `).join("")}
      </div>
      <span>${escapeHTML(fridgeScan.message)}</span>
    `
    : `<span>Ingen bild ännu</span>`;

  analyzeButton.hidden = !hasImage || fridgeScan.status === "scanning";
  analyzeButton.textContent = images.length > 1 ? `Analysera ${images.length} bilder` : "Analysera bild";
  applyButton.hidden = applyIds.length === 0 || fridgeScan.status === "scanning";
  applyButton.textContent = applyIds.length ? `Lägg till ${applyIds.length} säkra` : "Lägg till förslag";
  target.innerHTML = `
    <div class="scan-status-row ${fridgeScan.status}">
      <strong>${scanStatusTitle(fridgeScan.status)}</strong>
      <span>${escapeHTML(fridgeScan.note || fridgeScan.message)}</span>
    </div>
    ${quality ? `
      <article class="scan-quality-card ${quality.shouldRetake ? "warn" : "good"}">
        <div>
          <span>Bildprecision</span>
          <strong>${Math.round((quality.score || 0) * 100)}%</strong>
          <small>${escapeHTML(quality.shouldRetake ? "Ta gärna om bilden för bättre träff." : "Tillräckligt bra för förslag.")}</small>
        </div>
        <p>${escapeHTML(quality.advice || "Ta en rak bild med bra ljus.")}</p>
        <ul>
          <li>${escapeHTML(quality.lighting || "Ljus ej bedömt")}</li>
          <li>${escapeHTML(quality.framing || "Inramning ej bedömd")}</li>
          <li>${escapeHTML(quality.occlusion || "Skymda objekt ej bedömda")}</li>
        </ul>
      </article>
    ` : ""}
    ${mealIdea && (mealIdea.title || mealIdea.text) ? `
      <article class="scan-meal-idea">
        <span>AI-måltid från bilden</span>
        <strong>${escapeHTML(mealIdea.title || "Smart kylskåpsmåltid")}</strong>
        <p>${escapeHTML(mealIdea.text || "Lägg till scannade råvaror och låt Köks-AI räkna gram.")}</p>
        <div class="scan-action-row">
          ${Array.isArray(mealIdea.addIds) && mealIdea.addIds.length ? `<button type="button" data-scan-add="${escapeHTML(mealIdea.addIds.join(","))}">Bygg måltiden</button>` : ""}
          <button type="button" data-scan-ask="${escapeHTML(`Resonera fram bästa måltiden utifrån scanningen: ${mealIdea.title || ""}`)}">Fråga Köks-AI</button>
        </div>
      </article>
    ` : ""}
    ${suggestions.length ? `
      <div class="scan-suggestion-grid">
        ${suggestions.map((suggestion) => {
          const food = pantryFoods.find((item) => item.id === suggestion.id);
          if (!food) return "";
          const confidence = Math.round((suggestion.confidence || 0.6) * 100);
          const needsCheck = suggestion.needsConfirmation && !suggestion.confirmed && suggestion.feedback !== "right";
          const status = suggestion.feedback === "wrong"
            ? "Markerad fel"
            : suggestion.confirmed || suggestion.feedback === "right"
              ? "Bekräftad"
              : needsCheck
                ? "Kontrollera"
                : "Säker";
          return `
            <article class="${suggestion.feedback === "wrong" ? "is-rejected" : ""}">
              <div class="scan-card-main">
                <strong>${food.name}</strong>
                <small>${escapeHTML(suggestion.reason || "Passar måltidsmålet.")}</small>
                ${suggestion.visualEvidence ? `<em>${escapeHTML(suggestion.visualEvidence)}</em>` : ""}
              </div>
              <div class="scan-card-meta">
                <b>${confidence}%</b>
                <span>${status}</span>
              </div>
              <div class="scan-card-actions">
                ${needsCheck ? `<button type="button" data-scan-confirm="${escapeHTML(food.id)}">Bekräfta</button>` : ""}
                <button type="button" data-scan-feedback="${escapeHTML(food.id)}" data-scan-verdict="right">Rätt</button>
                <button type="button" data-scan-wrong="${escapeHTML(food.id)}">Fel</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    ` : ""}
    ${uncertain.length ? `
      <div class="scan-uncertain-list">
        <span>AI behöver din bekräftelse</span>
        ${uncertain.map((item) => {
          const food = pantryFoods.find((entry) => entry.id === item.id);
          if (!food || item.feedback === "wrong") return "";
          const alternatives = Array.from(new Set([item.id, ...(Array.isArray(item.alternatives) ? item.alternatives : [])]))
            .filter((id) => pantryFoods.some((entry) => entry.id === id))
            .slice(0, 4);
          return `
            <article>
              <div>
                <strong>${escapeHTML(item.question || `Är detta ${food.name}?`)}</strong>
                <small>${escapeHTML(item.reason || "Osäker träff i bilden.")}</small>
              </div>
              <div class="scan-action-row">
                ${alternatives.map((id) => `<button type="button" data-scan-confirm="${escapeHTML(id)}">${escapeHTML(foodNameById(id))}</button>`).join("")}
                <button type="button" data-scan-wrong="${escapeHTML(item.id)}">Inte den</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    ` : ""}
    ${shopping.length ? `
      <article class="scan-shopping-card">
        <div>
          <span>Smart inköpskomplettering</span>
          <strong>${shopping.map(escapeHTML).join(" · ")}</strong>
          ${state.pantry.shoppingList.length ? `<small>Sparat i listan: ${state.pantry.shoppingList.length} val</small>` : ""}
        </div>
        <button type="button" data-scan-shopping="true">Spara inköp</button>
      </article>
    ` : ""}
    ${fridgeScan.status === "idle" ? `
      <p class="scan-empty">Ta en eller flera bilder av kylskåpet. Appen väger ihop hyllor, dörrfack, osäkerhet och bildkvalitet innan Köks-AI får kontexten.</p>
    ` : ""}
  `;
}

function fridgeScanImages() {
  const images = Array.isArray(fridgeScan.images) ? fridgeScan.images : [];
  if (images.length) return images;
  return fridgeScan.imageUrl ? [fridgeScan.imageUrl] : [];
}

function removeFridgeScanImage(index) {
  const images = fridgeScanImages().filter((_, itemIndex) => itemIndex !== index);
  fridgeScan = {
    ...fridgeScan,
    images,
    imageUrl: images[images.length - 1] || "",
    status: images.length ? "queued" : "idle",
    suggestions: [],
    uncertain: [],
    quality: null,
    mealIdea: null,
    shopping: [],
    message: images.length ? `${images.length} bild${images.length === 1 ? "" : "er"} redo` : "Kamera redo",
    note: images.length ? "Lägg till fler hyllor eller analysera bildserien." : ""
  };
  renderFridgeBuilder();
}

function scanApplyIds() {
  const suggestions = Array.isArray(fridgeScan.suggestions) ? fridgeScan.suggestions : [];
  return suggestions
    .filter((suggestion) => {
      if (!pantryFoods.some((food) => food.id === suggestion.id)) return false;
      if (suggestion.feedback === "wrong") return false;
      if (suggestion.confirmed || suggestion.feedback === "right") return true;
      return !suggestion.needsConfirmation && Number(suggestion.confidence || 0) >= 0.72;
    })
    .map((suggestion) => suggestion.id);
}

function confirmFridgeScanItem(id) {
  const food = pantryFoods.find((item) => item.id === id);
  if (!food) return;
  let found = false;
  fridgeScan = {
    ...fridgeScan,
    suggestions: normalizeFridgeScanSuggestions([
      ...(fridgeScan.suggestions || []).map((suggestion) => {
        if (suggestion.id !== id) return suggestion;
        found = true;
        return { ...suggestion, confirmed: true, needsConfirmation: false, feedback: "right" };
      }),
      ...(!found ? [{
        id,
        confidence: 0.76,
        reason: "Bekräftad av användaren från osäkert scan-fynd.",
        visualEvidence: "Användaren valde råvaran i scan-panelen.",
        needsConfirmation: false,
        confirmed: true,
        feedback: "right"
      }] : [])
    ]),
    uncertain: (fridgeScan.uncertain || []).map((item) => item.id === id ? { ...item, confirmed: true, feedback: "right" } : item),
    message: `${food.name} bekräftad`,
    note: "AI-feedbacken sparas och används vid nästa scan."
  };
  recordScanFeedback(id, "right", "user-confirmed");
  saveState();
  renderFridgeBuilder();
}

function rejectFridgeScanItem(id) {
  if (!pantryFoods.some((food) => food.id === id)) return;
  fridgeScan = {
    ...fridgeScan,
    suggestions: (fridgeScan.suggestions || []).map((suggestion) => (
      suggestion.id === id ? { ...suggestion, confirmed: false, feedback: "wrong" } : suggestion
    )),
    uncertain: (fridgeScan.uncertain || []).map((item) => item.id === id ? { ...item, confirmed: false, feedback: "wrong" } : item),
    message: `${foodNameById(id)} markerad som fel`,
    note: "Bra. Den korrigeringen följer med nästa AI-analys."
  };
  recordScanFeedback(id, "wrong", "user-rejected");
  saveState();
  renderFridgeBuilder();
}

function markFridgeScanSuggestion(id, verdict) {
  if (verdict === "wrong") {
    rejectFridgeScanItem(id);
    return;
  }
  confirmFridgeScanItem(id);
}

function recordScanFeedback(id, verdict, source) {
  ensurePantryState();
  const item = {
    id,
    verdict,
    source,
    createdAt: new Date().toISOString()
  };
  state.pantry.scanFeedback = [...state.pantry.scanFeedback.filter((entry) => !(entry.id === id && entry.verdict === verdict)), item].slice(-30);
}

function addFridgeIds(ids, message = "Råvarorna lades till i byggaren.") {
  const cleanIds = Array.from(new Set(ids)).filter((id) => pantryFoods.some((food) => food.id === id));
  if (!cleanIds.length) return;
  ensurePantryState();
  state.pantry.selected = Array.from(new Set([...state.pantry.selected, ...cleanIds]));
  fridgeScan = {
    ...fridgeScan,
    message,
    note: "Måltidsbyggaren räknar om direkt med nya gram och makron."
  };
  saveState();
  renderFridgeBuilder();
}

function saveScanShoppingItems(items) {
  const cleanItems = (Array.isArray(items) ? items : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 8);
  if (!cleanItems.length) return;
  ensurePantryState();
  state.pantry.shoppingList = Array.from(new Set([...state.pantry.shoppingList, ...cleanItems])).slice(-30);
  fridgeScan = {
    ...fridgeScan,
    message: `${cleanItems.length} inköpsval sparades`,
    note: "Inköpsraden följer med som kontext till Köks-AI."
  };
  saveState();
  renderFridgeBuilder();
}

function scanStatusTitle(status) {
  if (status === "scanning") return "Analyserar bild";
  if (status === "queued") return "Bildserie redo";
  if (status === "ready") return "AI-förslag klara";
  if (status === "fallback") return "Lokala förslag klara";
  if (status === "error") return "Scan kunde inte läsas";
  return "Redo för scan";
}

function renderKitchenAssistant() {
  const target = $("#kitchenAiThread");
  const source = $("#kitchenAiSource");
  const sendButton = $("#kitchenAiSend");
  if (!target || !source || !sendButton) return;
  ensurePantryState();
  const messages = state.pantry.kitchenMessages.length
    ? state.pantry.kitchenMessages
    : [introKitchenMessage()];
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  source.textContent = kitchenAiLoading ? "Tänker" : sourceLabel(lastAssistant && lastAssistant.source);
  sendButton.disabled = kitchenAiLoading;
  sendButton.textContent = kitchenAiLoading ? "Tänker..." : "Fråga AI";

  target.innerHTML = `
    ${messages.map(renderKitchenMessage).join("")}
    ${kitchenAiLoading ? `
      <article class="kitchen-message assistant thinking">
        <strong>Köks-AI analyserar</strong>
        <p>Väger råvaror, protein, fiber, scanträffar och ditt mål.</p>
      </article>
    ` : ""}
  `;
  target.scrollTop = target.scrollHeight;
}

function introKitchenMessage() {
  const meal = buildFridgeMeal();
  return {
    id: "kitchen-intro",
    role: "assistant",
    source: "local",
    mealName: "Din smarta kökshjälp",
    text: `Scanna kylskåpet eller välj råvaror, så hjälper jag dig resonera fram en måltid. Just nu ser jag ${meal.selectedCount} valda råvaror och ett mål: ${meal.goalCopy.title}.`,
    reasoning: "Jag prioriterar protein, fiber, grön volym och energitäthet för midja och mättnad.",
    steps: ["Fråga vad du kan laga.", "Be mig göra måltiden mer proteinrik.", "Be mig hitta vad som saknas."],
    add: [],
    shopping: [],
    shoppingPlan: [],
    nextBestQuestion: "Vill du att jag gör en komplett måltid i gram?",
    questions: ["Vill du ha frukost, lunchlåda eller middag?"]
  };
}

function renderKitchenMessage(message) {
  const isUser = message.role === "user";
  const addIds = Array.isArray(message.add) ? message.add.filter((id) => pantryFoods.some((food) => food.id === id)) : [];
  const addNames = addIds.map(foodNameById).filter(Boolean);
  return `
    <article class="kitchen-message ${isUser ? "user" : "assistant"}">
      ${isUser ? `
        <p>${escapeHTML(message.text)}</p>
      ` : `
        <header>
          <span>${escapeHTML(sourceLabel(message.source))}</span>
          <strong>${escapeHTML(message.mealName || "Köks-AI")}</strong>
        </header>
        <p>${escapeHTML(message.text || message.reply || "")}</p>
        ${message.reasoning ? `<small>${escapeHTML(message.reasoning)}</small>` : ""}
        ${Array.isArray(message.steps) && message.steps.length ? `
          <ul>${message.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ul>
        ` : ""}
        ${addNames.length ? `
          <div class="kitchen-add-list">
            <span>Lägg till i byggaren</span>
            <strong>${escapeHTML(addNames.join(", "))}</strong>
            <button class="ghost-button" type="button" data-kitchen-add="${escapeHTML(addIds.join(","))}">Använd AI-val</button>
          </div>
        ` : ""}
        ${Array.isArray(message.shopping) && message.shopping.length ? `
          <div class="kitchen-shopping">
            <span>Smart inköpsrad</span>
            <p>${message.shopping.map(escapeHTML).join(" · ")}</p>
          </div>
        ` : ""}
        ${Array.isArray(message.shoppingPlan) && message.shoppingPlan.length ? `
          <div class="kitchen-shopping-plan">
            <span>Inköpsplan i gram</span>
            ${message.shoppingPlan.map((item) => `
              <article>
                <strong>${escapeHTML(item.item)}</strong>
                <b>${Math.round(item.grams || 0)} g</b>
                <small>${escapeHTML(item.priority || "medium")} · ${escapeHTML(item.why || "Kompletterar måltiden.")}</small>
              </article>
            `).join("")}
          </div>
        ` : ""}
        ${message.nextBestQuestion ? `
          <div class="kitchen-next-question">
            <button type="button" data-kitchen-prompt="${escapeHTML(message.nextBestQuestion)}">${escapeHTML(message.nextBestQuestion)}</button>
          </div>
        ` : ""}
        ${message.caution ? `<small class="kitchen-caution">${escapeHTML(message.caution)}</small>` : ""}
        ${Array.isArray(message.questions) && message.questions.length ? `
          <div class="kitchen-followups">
            ${message.questions.map((question) => `<button type="button" data-kitchen-prompt="${escapeHTML(question)}">${escapeHTML(question)}</button>`).join("")}
          </div>
        ` : ""}
      `}
    </article>
  `;
}

function sourceLabel(source) {
  if (source === "openai") return "AI";
  if (source === "gemini") return "Gemini AI";
  if (source === "fallback") return "Smart fallback";
  return "Smart";
}

async function askKitchenAssistant(message) {
  ensurePantryState();
  const userMessage = {
    id: `kitchen-user-${Date.now()}`,
    role: "user",
    text: message,
    createdAt: new Date().toISOString()
  };
  state.pantry.kitchenMessages = [...state.pantry.kitchenMessages, userMessage].slice(-12);
  kitchenAiLoading = true;
  saveState();
  renderKitchenAssistant();

  try {
    const context = buildKitchenContext();
    const reply = await requestKitchenAssistantReply(message, context);
    appendKitchenAssistantReply(reply);
  } catch (error) {
    const fallback = localKitchenAssistantReply(message, buildKitchenContext(), error.message);
    appendKitchenAssistantReply(fallback);
  } finally {
    kitchenAiLoading = false;
    saveState();
    renderFridgeBuilder();
  }
}

function appendKitchenAssistantReply(reply) {
  ensurePantryState();
  const assistantMessage = {
    id: `kitchen-ai-${Date.now()}`,
    role: "assistant",
    source: reply.source || "local",
    mealName: reply.mealName || "Smart kylskåpsmåltid",
    text: reply.reply || reply.text || "Jag kan hjälpa dig skruva måltiden.",
    reasoning: reply.reasoning || "",
    steps: Array.isArray(reply.steps) ? reply.steps.slice(0, 5) : [],
    add: Array.isArray(reply.add) ? reply.add.slice(0, 6) : [],
    remove: Array.isArray(reply.remove) ? reply.remove.slice(0, 4) : [],
    shopping: Array.isArray(reply.shopping) ? reply.shopping.slice(0, 6) : [],
    shoppingPlan: normalizeKitchenShoppingPlan(reply.shoppingPlan),
    nextBestQuestion: String(reply.nextBestQuestion || "").slice(0, 160),
    questions: Array.isArray(reply.questions) ? reply.questions.slice(0, 3) : [],
    caution: reply.caution || "",
    createdAt: new Date().toISOString()
  };
  state.pantry.kitchenMessages = [...state.pantry.kitchenMessages, assistantMessage].slice(-12);
}

async function requestKitchenAssistantReply(message, context) {
  const kitchenImage = message.toLowerCase().includes("fotade") || message.toLowerCase().includes("fotad måltid")
    ? mealScan.imageUrl || fridgeScan.imageUrl || ""
    : fridgeScan.imageUrl || mealScan.imageUrl || "";
  const history = state.pantry.kitchenMessages
    .filter((item) => item.role === "user" || item.role === "assistant")
    .slice(-8)
    .map((item) => ({ role: item.role, text: item.text || item.reply || "" }));
  const response = await fetch("/api/kitchen-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      context,
      image: kitchenImage
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Köks-AI kunde inte svara.");
  return normalizeKitchenAssistantReply(data, context);
}

function normalizeKitchenAssistantReply(reply, context) {
  const allowed = new Set(context.allowedFoodIds);
  const cleanIds = (ids, limit) => Array.isArray(ids)
    ? ids.map(String).filter((id) => allowed.has(id)).slice(0, limit)
    : [];
  const cleanList = (items, limit) => Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean).slice(0, limit)
    : [];
  return {
    source: reply.source || "openai",
    reply: String(reply.reply || "Jag kan hjälpa dig resonera fram en bättre måltid.").slice(0, 900),
    mealName: String(reply.mealName || "Smart kylskåpsmåltid").slice(0, 90),
    reasoning: String(reply.reasoning || "").slice(0, 500),
    steps: cleanList(reply.steps, 5),
    add: cleanIds(reply.add, 6),
    remove: cleanIds(reply.remove, 4),
    shopping: cleanList(reply.shopping, 6),
    shoppingPlan: normalizeKitchenShoppingPlan(reply.shoppingPlan),
    nextBestQuestion: String(reply.nextBestQuestion || "").slice(0, 160),
    questions: cleanList(reply.questions, 3),
    caution: String(reply.caution || "").slice(0, 220)
  };
}

function normalizeKitchenShoppingPlan(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      item: String(item && item.item || "").trim().slice(0, 90),
      grams: clamp(Number(item && item.grams) || 0, 0, 2000),
      why: String(item && item.why || "").trim().slice(0, 140),
      priority: String(item && item.priority || "medium").trim().slice(0, 30)
    }))
    .filter((item) => item.item)
    .slice(0, 5);
}

function buildKitchenContext() {
  ensurePantryState();
  const meal = buildFridgeMeal();
  const selected = state.pantry.selected
    .map((id) => pantryFoods.find((food) => food.id === id))
    .filter(Boolean);
  const scanFoods = (fridgeScan.suggestions || [])
    .filter((suggestion) => suggestion.feedback !== "wrong")
    .map((suggestion) => {
      const food = pantryFoods.find((item) => item.id === suggestion.id);
      return food ? {
        ...food,
        confidence: suggestion.confidence,
        reason: suggestion.reason,
        visualEvidence: suggestion.visualEvidence,
        confirmed: Boolean(suggestion.confirmed || suggestion.feedback === "right")
      } : null;
    })
    .filter(Boolean);
  return {
    goal: meal.goal,
    goalLabel: meal.goalCopy.title,
    profile: {
      sex: state.profile.sex,
      age: state.profile.age,
      height: state.profile.height,
      weight: state.profile.weight,
      waist: state.profile.waist,
      targetWaist: state.profile.targetWaist,
      level: state.profile.level
    },
    meal: {
      kcal: Math.round(meal.macros.kcal),
      protein: Math.round(meal.macros.protein),
      carbs: Math.round(meal.macros.carbs),
      fat: Math.round(meal.macros.fat),
      fiber: Math.round(meal.macros.fiber),
      proteinTarget: meal.proteinTarget,
      vegGrams: Math.round(meal.vegGrams),
      verdict: meal.verdict.title
    },
    mealItems: meal.items.map((item) => ({
      id: item.food.id,
      name: item.food.name,
      grams: item.grams,
      role: item.role,
      suggested: item.suggested
    })),
    selectedFoods: selected.map(kitchenFoodSummary),
    scanFoods: scanFoods.map(kitchenFoodSummary),
    scanQuality: fridgeScan.quality || null,
    mealPhoto: mealScan.result ? {
      dishName: mealScan.result.dishName,
      confidence: mealScan.result.confidence,
      totals: mealScan.result.totals,
      verdict: mealScan.result.verdict && mealScan.result.verdict.title
    } : null,
    feedback: state.pantry.scanFeedback || [],
    shoppingList: state.pantry.shoppingList || [],
    allowedFoodIds: pantryFoods.map((food) => food.id)
  };
}

function kitchenFoodSummary(food) {
  return {
    id: food.id,
    name: food.name,
    role: food.role,
    kcal: food.kcal,
    protein: food.protein,
    fiber: food.fiber,
    confidence: food.confidence,
    reason: food.reason,
    visualEvidence: food.visualEvidence,
    confirmed: food.confirmed
  };
}

function localKitchenAssistantReply(message, context, detail = "") {
  const text = message.toLowerCase();
  const meal = context.meal || {};
  const selectedIds = new Set((context.selectedFoods || []).map((food) => food.id));
  const add = [];
  const steps = [];
  const shopping = [];
  const addIfMissing = (ids) => ids.forEach((id) => {
    if (!selectedIds.has(id) && pantryFoods.some((food) => food.id === id)) add.push(id);
  });

  if ((meal.protein || 0) < (meal.proteinTarget || 35) - 5 || text.includes("protein")) {
    addIfMissing(context.goal === "vegetarian" ? ["tofu", "lentils", "kvarg"] : ["chicken", "egg", "kvarg"]);
    steps.push("Säkra 30-45 g protein i huvudmålet innan du finjusterar kolhydrater och fett.");
  }
  if ((meal.vegGrams || 0) < 250 || text.includes("saknas") || text.includes("fiber")) {
    addIfMissing(["broccoli", "frozen-veg", "cabbage", "spinach"]);
    steps.push("Lägg in 250-350 g grönsaker för volym, fiber och bättre mättnad.");
  }
  if (context.goal === "training" || text.includes("träning")) {
    addIfMissing(["potato", "banana", "brownrice", "oats"]);
    steps.push("Efter träning: addera en kontrollerad kolhydratbas och håll fettkällan mindre.");
  }
  if (text.includes("snabb") || text.includes("lunch")) {
    steps.push("Gör den som panna/skål: värm basen 8-10 min, lägg protein ovanpå och avsluta med 10-15 g fettkälla.");
    shopping.push("Frysta wokgrönsaker", "Kvarg naturell", "Ägg", "Tonfisk eller tofu");
  }
  if (text.includes("inköp") || text.includes("handla") || text.includes("shopping")) {
    shopping.push("Frysta wokgrönsaker", "Kvarg naturell", "Ägg", "Tonfisk eller tofu", "Bär eller äpplen");
    steps.push("För tre dagar: köp en grön volymbas, två proteinbaser och en enkel frukt/bär-komplettering.");
  }
  if (!steps.length) {
    steps.push("Behåll basen, men justera i ordningen protein, grön volym, fiber, fettmängd.");
  }

  const uniqueShopping = Array.from(new Set(shopping)).slice(0, 5);

  return normalizeKitchenAssistantReply({
    source: "local",
    reply: `Jag skulle bygga vidare på din nuvarande måltid: cirka ${meal.kcal || 0} kcal, ${meal.protein || 0} g protein och ${meal.fiber || 0} g fiber. Det smartaste nästa steget är att göra den mer mättande utan att blåsa upp energin.`,
    mealName: context.goal === "training" ? "Träningsklar kylskåpsskål" : "Mättande midjetallrik",
    reasoning: detail
      ? `Lokal fallback används eftersom AI-svaret inte kunde hämtas: ${detail}`
      : "Lokal coachlogik använder måltidsmålet, makron och valda råvaror.",
    steps,
    add: Array.from(new Set(add)).slice(0, 5),
    remove: [],
    shopping: uniqueShopping,
    shoppingPlan: uniqueShopping.map((item, index) => ({
      item,
      grams: index === 0 ? 400 : 250,
      why: index === 0 ? "Ger snabb grön volym och fiber." : "Kompletterar protein eller mättnad.",
      priority: index < 2 ? "hög" : "medium"
    })),
    nextBestQuestion: "Vill du att jag gör en 3-dagars plan från samma råvaror?",
    questions: ["Vill du göra den vegetarisk?", "Ska den passa lunchlåda?", "Vill du minska kolhydraterna?"],
    caution: ""
  }, context);
}

function foodNameById(id) {
  const food = pantryFoods.find((item) => item.id === id);
  return food ? food.name : "";
}

function pantryFoodById(id) {
  return pantryFoods.find((item) => item.id === id) || null;
}

function buildRecipeTemplates() {
  const recipes = [];
  recipeFamilies.forEach((family, familyIndex) => {
    for (let variantIndex = 0; variantIndex < 5; variantIndex += 1) {
      const proteinId = pickRecipeId(family.proteins, variantIndex, familyIndex);
      const vegId = pickRecipeId(family.vegs, variantIndex, familyIndex);
      const secondVegId = pickRecipeId(family.vegs, variantIndex + 2, familyIndex);
      const carbId = pickRecipeId(family.carbs, variantIndex, familyIndex);
      const fatId = pickRecipeId(family.fats, variantIndex, familyIndex);
      const extraId = pickRecipeId(family.extras, variantIndex + 1, familyIndex);
      const ingredients = uniqueRecipeIngredients([
        recipeIngredient(proteinId, "protein", family, variantIndex),
        recipeIngredient(vegId, "veg", family, variantIndex),
        recipeIngredient(secondVegId, "veg", family, variantIndex + 1),
        recipeIngredient(carbId, "carb", family, variantIndex),
        recipeIngredient(fatId, "fat", family, variantIndex),
        recipeIngredient(extraId, "extra", family, variantIndex)
      ].filter(Boolean));
      const title = recipeTitle(family, variantIndex, { proteinId, vegId, carbId, fatId });
      const minutes = Math.max(5, family.minutes + ((variantIndex % 3) - 1) * 2);

      recipes.push({
        id: `${family.id}-${variantIndex + 1}`,
        title,
        type: family.type,
        minutes,
        difficulty: minutes <= 10 ? "Mycket enkel" : minutes <= 18 ? "Enkel" : "Planerad",
        tags: Array.from(new Set([...(family.tags || []), minutes <= 18 ? "quick" : "planned"])),
        ingredients,
        method: family.method,
        why: family.why,
        steps: recipeSteps(family, ingredients, minutes)
      });
    }
  });
  return recipes.slice(0, 100);
}

function pickRecipeId(list, index, offset = 0) {
  if (!Array.isArray(list) || !list.length) return null;
  const value = list[(index + offset) % list.length];
  return value && pantryFoodById(value) ? value : null;
}

function recipeIngredient(id, role, family, index) {
  const food = pantryFoodById(id);
  if (!food) return null;
  return {
    id,
    grams: recipeGramsForFood(food, role, family, index),
    role
  };
}

function recipeGramsForFood(food, role, family, index) {
  let grams = food.defaultGrams || 100;
  if (role === "protein") {
    if (food.role === "dairy") grams = Math.max(180, grams);
    if (food.role === "legume") grams = Math.max(170, grams);
    if (["ham", "turkey-slices"].includes(food.id)) grams = 90;
    if (food.id === "egg") grams = 120 + (index % 2) * 60;
  }
  if (role === "veg") grams = Math.min(Math.max(100, grams), 230);
  if (role === "carb") {
    grams = Math.min(Math.max(70, grams), 190);
    if ((family.tags || []).includes("lowcarb")) grams = Math.round(grams * 0.55);
    if ((family.tags || []).includes("training")) grams = Math.round(grams * 1.15);
  }
  if (role === "fat") {
    const caps = {
      "olive-oil": 10,
      butter: 8,
      almonds: 18,
      "pumpkin-seeds": 15,
      avocado: 65,
      hummus: 55,
      cheese: 25,
      feta: 35,
      mozzarella: 45,
      "cream-cheese": 25
    };
    grams = Math.min(grams, caps[food.id] || 45);
  }
  if (role === "extra") {
    if (food.role === "flavor") grams = Math.min(grams, food.id === "garlic" ? 5 : 35);
    if (food.role === "fruit") grams = Math.min(grams, 110);
    if (food.role === "veg") grams = Math.min(grams, 90);
    if (food.role === "dairy") grams = Math.min(grams, 120);
  }
  return Math.max(5, Math.round(grams / 5) * 5);
}

function uniqueRecipeIngredients(ingredients) {
  const byId = new Map();
  ingredients.forEach((ingredient) => {
    if (!ingredient || !pantryFoodById(ingredient.id)) return;
    const previous = byId.get(ingredient.id);
    if (!previous) {
      byId.set(ingredient.id, ingredient);
      return;
    }
    byId.set(ingredient.id, {
      ...previous,
      grams: Math.max(previous.grams, ingredient.grams),
      role: previous.role === "protein" ? previous.role : ingredient.role
    });
  });
  return Array.from(byId.values());
}

function recipeTitle(family, variantIndex, ids) {
  const pattern = family.names[variantIndex % family.names.length];
  return pattern
    .replace("{protein}", recipeShortFoodName(ids.proteinId))
    .replace("{veg}", recipeShortFoodName(ids.vegId))
    .replace("{carb}", recipeShortFoodName(ids.carbId))
    .replace("{fat}", recipeShortFoodName(ids.fatId));
}

function recipeShortFoodName(id) {
  const name = foodNameById(id);
  return name
    .replace(" kokta", "")
    .replace(" kokt", "")
    .replace(" naturell", "")
    .replace(" i vatten", "")
    .replace(" frysta", "")
    .replace("Kycklingfilé", "kyckling")
    .replace("Fullkornsris", "ris")
    .replace("Fullkornspasta", "pasta")
    .replace("Keso/cottage cheese", "keso")
    .toLowerCase();
}

function recipeSteps(family, ingredients, minutes) {
  const protein = ingredients.find((item) => item.role === "protein");
  const vegCount = ingredients.filter((item) => item.role === "veg").length;
  const carb = ingredients.find((item) => item.role === "carb");
  const proteinName = protein ? foodNameById(protein.id).toLowerCase() : "proteinet";
  const carbText = carb ? ` och ${foodNameById(carb.id).toLowerCase()}` : "";
  return [
    `Väg upp ${proteinName}${carbText} enligt gramlistan.`,
    `${family.method} Sikta på ${vegCount >= 2 ? "två gröna byggstenar" : "minst en grön byggsten"}.`,
    `Smaka av, dela upp portionen och spara rester om tillagningen tar över ${minutes > 18 ? "18" : "10"} minuter.`
  ];
}

function availablePantryIds() {
  ensurePantryState();
  const selectedIds = Array.isArray(state.pantry.selected) ? state.pantry.selected : [];
  const scanIds = (fridgeScan.suggestions || [])
    .filter((suggestion) => suggestion && suggestion.feedback !== "wrong" && suggestion.rejected !== true)
    .map((suggestion) => matchPantryFoodId(suggestion.id || suggestion.name || suggestion.label))
    .filter(Boolean);
  return new Set([...selectedIds, ...scanIds].filter((id) => pantryFoodById(id)));
}

function rankRecipeTemplates(filter = "best") {
  ensurePantryState();
  const available = availablePantryIds();
  const goal = state.pantry.goal || "fatloss";
  return recipeTemplates
    .map((recipe) => scoreRecipe(recipe, available, goal))
    .filter((item) => recipeMatchesFilter(item, filter))
    .sort((a, b) => (
      b.score - a.score ||
      a.missingIds.length - b.missingIds.length ||
      b.macros.protein - a.macros.protein ||
      a.recipe.minutes - b.recipe.minutes
    ));
}

function scoreRecipe(recipe, available, goal) {
  const ingredientIds = recipe.ingredients.map((item) => item.id);
  const matchIds = ingredientIds.filter((id) => available.has(id));
  const missingIds = ingredientIds.filter((id) => !available.has(id));
  const macros = calculateRecipeMacros(recipe);
  const proteinDensity = macros.kcal ? (macros.protein * 100) / macros.kcal : 0;
  const vegetarian = isVegetarianRecipe(recipe);
  let score = 50;
  score += matchIds.length * 18;
  score -= missingIds.length * 7;
  score += Math.min(macros.protein, 55) * 0.7;
  score += Math.min(macros.fiber, 20) * 2.2;
  score += proteinDensity * 16;
  score += recipe.minutes <= 12 ? 9 : recipe.minutes <= 18 ? 5 : 0;
  score -= Math.max(0, macros.kcal - 780) * 0.035;

  if (goal === "fatloss") {
    score += macros.protein >= 32 ? 12 : -6;
    score += macros.fiber >= 9 ? 8 : -3;
    score -= Math.max(0, macros.fat - 32) * 0.45;
  }
  if (goal === "training") {
    score += macros.carbs >= 35 ? 12 : -4;
    score += macros.protein >= 30 ? 10 : -5;
  }
  if (goal === "lowcarb") {
    score += macros.carbs <= 28 ? 18 : macros.carbs <= 40 ? 8 : -16;
  }
  if (goal === "vegetarian") {
    score += vegetarian ? 24 : -34;
  }

  return {
    recipe,
    macros,
    matchIds,
    missingIds,
    score,
    matchRatio: ingredientIds.length ? matchIds.length / ingredientIds.length : 0,
    vegetarian
  };
}

function recipeMatchesFilter(item, filter) {
  if (filter === "quick") return item.recipe.minutes <= 18;
  if (filter === "high-protein") return item.macros.protein >= 32;
  if (filter === "vegetarian") return item.vegetarian;
  if (filter === "lowcarb") return item.macros.carbs <= 35 || item.recipe.tags.includes("lowcarb");
  if (filter === "meal-prep") return item.recipe.tags.includes("meal-prep") || item.recipe.minutes >= 20;
  return true;
}

function calculateRecipeMacros(recipe) {
  return calculateFridgeMacros(recipe.ingredients
    .map((ingredient) => ({
      food: pantryFoodById(ingredient.id),
      grams: ingredient.grams
    }))
    .filter((item) => item.food));
}

function isVegetarianRecipe(recipe) {
  const animalIds = new Set(["chicken", "salmon", "tuna", "cod", "turkey", "shrimp", "ham", "turkey-slices", "ground-beef", "ground-chicken", "falukorv"]);
  return recipe.ingredients.every((ingredient) => !animalIds.has(ingredient.id));
}

function renderRecipeEngine() {
  const target = $("#recipeEngine");
  if (!target) return;
  ensurePantryState();
  const filter = recipeFilterOptions.some((option) => option.id === state.pantry.recipeFilter) ? state.pantry.recipeFilter : "best";
  const ranked = rankRecipeTemplates(filter);
  const closeMatches = rankRecipeTemplates("best").filter((item) => item.missingIds.length <= 2).length;
  const selectedCount = availablePantryIds().size;
  const visible = ranked.slice(0, 8);

  target.innerHTML = `
    <div class="recipe-engine-head">
      <div>
        <span>Receptmotor</span>
        <h3 id="recipe-engine-title">100 smarta recept från ditt kylskåp</h3>
        <p>Rankar efter vad du har hemma, mål, protein, fiber, tid och saknade ingredienser.</p>
      </div>
      <b>${recipeTemplates.length} recept</b>
    </div>
    <div class="recipe-engine-stats" aria-label="Receptmotor status">
      <article>
        <span>Hemma nu</span>
        <strong>${selectedCount}</strong>
      </article>
      <article>
        <span>Passar nära</span>
        <strong>${closeMatches}</strong>
      </article>
      <article>
        <span>Visas</span>
        <strong>${visible.length}</strong>
      </article>
    </div>
    <div class="recipe-filter-row" aria-label="Filtrera recept">
      ${recipeFilterOptions.map((option) => `
        <button type="button" class="${filter === option.id ? "is-active" : ""}" data-recipe-filter="${option.id}">
          ${option.label}
        </button>
      `).join("")}
    </div>
    <div class="recipe-card-grid">
      ${visible.map(renderRecipeCard).join("")}
    </div>
  `;
}

function renderRecipeCard(item) {
  const { recipe, macros, matchIds, missingIds } = item;
  const ingredientIds = recipe.ingredients.map((ingredient) => ingredient.id);
  const homeNames = matchIds.map(foodNameById).filter(Boolean);
  const missingNames = missingIds.map(foodNameById).filter(Boolean).slice(0, 4);
  const askPrompt = recipeAiPrompt(recipe, macros, missingIds);
  const level = missingIds.length === 0 ? "complete" : missingIds.length <= 2 ? "close" : "shop";

  return `
    <article class="recipe-card ${level}">
      <header>
        <div>
          <span>${escapeHTML(recipe.type)}</span>
          <strong>${escapeHTML(recipe.title)}</strong>
        </div>
        <b>${matchIds.length}/${ingredientIds.length} hemma</b>
      </header>
      <div class="recipe-meta-row">
        <span>${recipe.minutes} min</span>
        <span>${Math.round(macros.kcal)} kcal</span>
        <span>${Math.round(macros.protein)} g protein</span>
        <span>${Math.round(macros.fiber)} g fiber</span>
      </div>
      <p class="recipe-why">${escapeHTML(recipe.why)}</p>
      <div class="recipe-ingredient-lines">
        <p><strong>Gram:</strong> ${recipe.ingredients.map((ingredient) => `${escapeHTML(foodNameById(ingredient.id))} ${ingredient.grams} g`).join(", ")}</p>
        <p><strong>Hemma:</strong> ${homeNames.length ? escapeHTML(homeNames.slice(0, 5).join(", ")) : "Inga matchade ännu"}</p>
        <p><strong>Saknas:</strong> ${missingNames.length ? escapeHTML(missingNames.join(", ")) : "Inget saknas"}</p>
      </div>
      <ol>
        ${recipe.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}
      </ol>
      <div class="recipe-actions">
        <button class="ghost-button" type="button" data-recipe-add="${ingredientIds.map(escapeHTML).join(",")}">Lägg råvaror</button>
        <button class="primary-button" type="button" data-recipe-ask="${escapeHTML(askPrompt)}">Fråga Köks-AI</button>
      </div>
    </article>
  `;
}

function recipeAiPrompt(recipe, macros, missingIds) {
  const missing = missingIds.map(foodNameById).filter(Boolean);
  const goalCopy = fridgeGoalCopy[state.pantry.goal || "fatloss"] || fridgeGoalCopy.fatloss;
  return [
    `Gör receptet "${recipe.title}" ännu bättre för ${goalCopy.kicker.toLowerCase()}.`,
    `Makro cirka ${Math.round(macros.kcal)} kcal, ${Math.round(macros.protein)} g protein, ${Math.round(macros.carbs)} g kolhydrater, ${Math.round(macros.fat)} g fett och ${Math.round(macros.fiber)} g fiber.`,
    missing.length ? `Saknas hemma: ${missing.join(", ")}. Föreslå ersättningar från mina valda eller scannade råvaror.` : "Alla huvudingredienser finns hemma. Ge exakt tillagning i gram."
  ].join(" ");
}

async function handleMealScanFile(file) {
  if (!file.type.startsWith("image/")) {
    mealScan = {
      ...mealScan,
      status: "error",
      message: "Välj en bildfil.",
      note: "Matkameran behöver en bild för att kunna uppskatta näringsvärde.",
      result: null
    };
    renderMealScan();
    return;
  }

  try {
    const imageUrl = await resizeFridgeScanImage(file);
    mealScan = {
      status: "scanning",
      imageUrl,
      result: null,
      source: "camera",
      message: "Analyserar tallriken",
      note: "AI uppskattar portion och näringsvärde från bilden."
    };
    renderMealScan();

    const result = await requestMealNutritionScan(imageUrl);
    mealScan = {
      ...mealScan,
      status: "ready",
      source: result.source || "ai",
      result,
      message: `${Math.round(result.totals.kcal || 0)} kcal uppskattat`,
      note: "Kontrollera portionssäkerheten. Fotoanalys är en kvalificerad uppskattning, inte en exakt vägning."
    };
  } catch (error) {
    const result = localMealScanResult(error.message);
    mealScan = {
      ...mealScan,
      status: "fallback",
      source: "local",
      result,
      message: `${Math.round(result.totals.kcal || 0)} kcal lokal uppskattning`,
      note: "Lokal fallback använder måltidsbyggaren när AI-vision inte är tillgänglig."
    };
  }

  renderMealScan();
}

async function requestMealNutritionScan(imageUrl) {
  const response = await fetch("/api/meal-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: imageUrl,
      detail: "high",
      goal: state.pantry && state.pantry.goal || "fatloss",
      profile: {
        sex: state.profile.sex,
        age: state.profile.age,
        weight: state.profile.weight,
        waist: state.profile.waist
      }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Matfoto-AI kunde inte svara.");
  return normalizeMealScanResult(data);
}

function normalizeMealScanResult(data) {
  const totals = normalizeMealScanMacros(data && data.totals);
  return {
    source: data && data.source || "openai",
    dishName: String(data && data.dishName || "Fotad måltid").slice(0, 90),
    confidence: clamp(Number(data && data.confidence) || 0.45, 0.2, 0.98),
    portionQuality: normalizeMealScanQuality(data && data.portionQuality),
    totals,
    items: Array.isArray(data && data.items)
      ? data.items.map(normalizeMealScanItem).filter((item) => item.name).slice(0, 8)
      : [],
    verdict: normalizeMealScanVerdict(data && data.verdict, totals),
    notes: normalizeShoppingItems(data && data.notes),
    caution: String(data && data.caution || "Näringsvärdet är en AI-uppskattning från bild, inte en exakt vägning.").slice(0, 220)
  };
}

function normalizeMealScanItem(item) {
  return {
    name: String(item && item.name || "").trim().slice(0, 90),
    grams: roundToTenth(item && item.grams),
    kcal: roundToTenth(item && item.kcal),
    protein: roundToTenth(item && item.protein),
    carbs: roundToTenth(item && item.carbs),
    fat: roundToTenth(item && item.fat),
    fiber: roundToTenth(item && item.fiber),
    confidence: clamp(Number(item && item.confidence) || 0.45, 0.2, 0.98)
  };
}

function normalizeMealScanMacros(macros) {
  return {
    grams: roundToTenth(macros && macros.grams),
    kcal: roundToTenth(macros && macros.kcal),
    protein: roundToTenth(macros && macros.protein),
    carbs: roundToTenth(macros && macros.carbs),
    fat: roundToTenth(macros && macros.fat),
    fiber: roundToTenth(macros && macros.fiber),
    sugar: roundToTenth(macros && macros.sugar)
  };
}

function normalizeMealScanQuality(quality) {
  return {
    score: clamp(Number(quality && quality.score) || 0.45, 0.2, 0.98),
    visibleReference: String(quality && quality.visibleReference || "Ingen tydlig storleksreferens.").slice(0, 140),
    shouldRetake: Boolean(quality && quality.shouldRetake),
    advice: String(quality && quality.advice || "Ta bilden rakt ovanifrån med hela tallriken synlig.").slice(0, 180),
    detailUsed: String(quality && quality.detailUsed || "high").slice(0, 20)
  };
}

function normalizeMealScanVerdict(verdict, totals) {
  const level = verdict && ["strong", "tune", "watch"].includes(verdict.level)
    ? verdict.level
    : totals.protein >= 30 && totals.fiber >= 8
      ? "strong"
      : totals.kcal > 850 || totals.fiber < 5
        ? "watch"
        : "tune";
  return {
    level,
    title: String(verdict && verdict.title || (level === "strong" ? "Bra bukfettsmåltid" : "Går att skruva bättre")).slice(0, 90),
    text: String(verdict && verdict.text || "AI väger protein, fiber, grön volym och energitäthet.").slice(0, 240),
    actions: Array.isArray(verdict && verdict.actions)
      ? verdict.actions.map((item) => String(item || "").trim()).filter(Boolean).map((item) => item.slice(0, 140)).slice(0, 4)
      : ["Säkra 30-45 g protein.", "Lägg till 250-350 g grönsaker om tallriken saknar volym."]
  };
}

function localMealScanResult(detail = "") {
  const meal = buildFridgeMeal();
  const totals = {
    grams: meal.items.reduce((sum, item) => sum + item.grams, 0),
    kcal: meal.macros.kcal,
    protein: meal.macros.protein,
    carbs: meal.macros.carbs,
    fat: meal.macros.fat,
    fiber: meal.macros.fiber,
    sugar: Math.max(0, meal.macros.carbs * 0.18)
  };
  return normalizeMealScanResult({
    source: "local",
    dishName: "Lokal tallriksuppskattning",
    confidence: 0.42,
    portionQuality: {
      score: 0.35,
      visibleReference: "AI-vision saknas, därför används måltidsbyggarens valda råvaror som uppskattning.",
      shouldRetake: true,
      advice: "När OpenAI eller Gemini är aktivt: fota hela tallriken rakt ovanifrån för bättre portionssäkerhet."
    },
    totals,
    items: meal.items.map((item) => ({
      name: item.food.name,
      grams: item.grams,
      kcal: item.food.kcal * item.grams / 100,
      protein: item.food.protein * item.grams / 100,
      carbs: item.food.carbs * item.grams / 100,
      fat: item.food.fat * item.grams / 100,
      fiber: item.food.fiber * item.grams / 100,
      confidence: item.suggested ? 0.35 : 0.55
    })),
    verdict: meal.verdict,
    notes: ["Fallback utan AI-vision.", "Resultatet blir exaktare om råvaror väljs i byggaren eller om OpenAI/Gemini-nyckel fungerar."],
    caution: detail ? `AI-fallback: ${detail}` : "Näringsvärdet är en lokal uppskattning, inte en exakt vägning."
  });
}

function buildMealScanKitchenPrompt(scan) {
  const totals = scan.totals || {};
  return [
    `Jag fotade en måltid: ${scan.dishName || "måltid"}.`,
    `Uppskattning: ${Math.round(totals.kcal || 0)} kcal, ${Math.round(totals.protein || 0)} g protein, ${Math.round(totals.carbs || 0)} g kolhydrater, ${Math.round(totals.fat || 0)} g fett och ${Math.round(totals.fiber || 0)} g fiber.`,
    "Hur gör jag den bättre för bukfett, mättnad och midjemål?"
  ].join(" ");
}

async function handleFridgeScanFiles(files) {
  const imageFiles = files.filter((file) => file && file.type.startsWith("image/")).slice(0, 4);
  if (!imageFiles.length) {
    fridgeScan = {
      ...fridgeScan,
      status: "error",
      message: "Välj en bildfil.",
      note: "Kameran behöver leverera en bild för att scannen ska fungera.",
      suggestions: [],
      uncertain: [],
      quality: null,
      mealIdea: null,
      shopping: []
    };
    renderFridgeScanPanel();
    return;
  }

  try {
    const resized = await Promise.all(imageFiles.map(resizeFridgeScanImage));
    const images = Array.from(new Set([...fridgeScanImages(), ...resized])).slice(0, 4);
    fridgeScan = {
      ...fridgeScan,
      status: "queued",
      imageUrl: images[images.length - 1] || "",
      images,
      suggestions: [],
      uncertain: [],
      quality: null,
      mealIdea: null,
      shopping: [],
      detail: "high",
      source: "camera",
      message: `${images.length} bild${images.length === 1 ? "" : "er"} redo`,
      note: "Lägg till fler hyllor eller analysera bildserien när du är klar."
    };
    renderFridgeScanPanel();
  } catch (error) {
    fridgeScan = {
      ...fridgeScan,
      status: "error",
      message: "Bilderna kunde inte läsas",
      note: error.message || "Testa att ta nya bilder."
    };
    renderFridgeScanPanel();
  }
}

async function analyzeFridgeScanImages() {
  const images = fridgeScanImages();
  if (!images.length || fridgeScan.status === "scanning") return;

  fridgeScan = {
    ...fridgeScan,
    status: "scanning",
    suggestions: [],
    uncertain: [],
    quality: null,
    mealIdea: null,
    shopping: [],
    message: `Analyserar ${images.length} bild${images.length === 1 ? "" : "er"}`,
    note: "Bildserien skickas till vision-analys om nyckel finns, annars körs lokal fallback."
  };
  renderFridgeScanPanel();

  try {
    const scanResult = await requestFridgeVisionSuggestions(images);
    const suggestionCount = scanResult.suggestions.length;
    const uncertainCount = scanResult.uncertain.length;
    fridgeScan = {
      ...fridgeScan,
      ...scanResult,
      images,
      imageUrl: images[images.length - 1] || "",
      status: "ready",
      source: scanResult.source || "ai",
      message: `${suggestionCount} säkra och ${uncertainCount} osäkra fynd`,
      note: scanResult.note || (suggestionCount
        ? "Bekräfta osäkra fynd och fråga Köks-AI vad du kan laga av dem."
        : "AI hittade inga säkra råvaror. Testa ljusare bilder.")
    };
  } catch {
    const hintLists = await Promise.all(images.map((imageUrl) => extractFridgeColorHints(imageUrl).catch(() => [])));
    const colorHints = Array.from(new Set(hintLists.flat()));
    const fallbackSuggestions = localFridgeScanSuggestions(colorHints);
    fridgeScan = {
      ...fridgeScan,
      images,
      imageUrl: images[images.length - 1] || "",
      status: "fallback",
      source: "local",
      suggestions: fallbackSuggestions,
      uncertain: [],
      quality: {
        score: colorHints.length ? 0.55 : 0.42,
        lighting: "Lokal fallback kan inte bedöma ljus exakt.",
        framing: "Bilden lästes lokalt via färgsignaler.",
        occlusion: "Skymda objekt kan inte bedömas utan AI-vision.",
        shouldRetake: !colorHints.length,
        advice: colorHints.length
          ? "Kontrollera förslagen manuellt och be Köks-AI resonera vidare."
          : "Ta en ljusare, rakare bild eller lägg till råvaror manuellt.",
        detailUsed: "local"
      },
      mealIdea: {
        title: "Lokal midjetallrik",
        text: "Bygg en bas med protein, 250-350 g grönt och en kontrollerad kolhydrat- eller fettkälla.",
        addIds: fallbackSuggestions.slice(0, 5).map((suggestion) => suggestion.id)
      },
      shopping: ["Frysta wokgrönsaker", "Kvarg naturell", "Ägg", "Tonfisk eller tofu"],
      detail: "local",
      message: `${fallbackSuggestions.length} lokala förslag hittades`,
      note: "Appen använder färgsignaler från bildserien och måltidsmål som fallback. Köks-AI kan ändå resonera på råvarorna."
    };
  }

  renderFridgeBuilder();
}

async function requestFridgeVisionSuggestions(imageInput) {
  const images = Array.isArray(imageInput) ? imageInput.filter(Boolean).slice(0, 4) : [imageInput].filter(Boolean);
  const response = await fetch("/api/fridge-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: images[0] || "",
      images,
      goal: state.pantry.goal,
      profile: {
        sex: state.profile.sex,
        weight: state.profile.weight,
        waist: state.profile.waist
      },
      feedback: state.pantry.scanFeedback || [],
      detail: "high",
      foods: pantryFoods.map(({ id, name, category, role }) => ({ id, name, category, role }))
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Vision unavailable");
  return {
    source: data.source || "openai",
    suggestions: normalizeFridgeScanSuggestions(data.suggestions || data.items || []),
    uncertain: normalizeFridgeScanUncertain(data.uncertain || []),
    quality: normalizeFridgeScanQuality(data.quality, data.detail || "high"),
    mealIdea: normalizeFridgeMealIdea(data.mealIdea),
    shopping: normalizeShoppingItems(data.shopping),
    detail: data.detail || "high",
    imageCount: Number(data.imageCount) || images.length,
    note: String(data.note || "").slice(0, 220)
  };
}

function applyFridgeScanSuggestions() {
  const ids = scanApplyIds();
  addFridgeIds(ids, `${ids.length} säkra råvaror lades till`);
}

function normalizeFridgeScanSuggestions(rawSuggestions) {
  const seen = new Set();
  return (Array.isArray(rawSuggestions) ? rawSuggestions : [])
    .map((suggestion) => {
      const id = matchPantryFoodId(suggestion.id || suggestion.name || suggestion.label);
      if (!id || seen.has(id)) return null;
      seen.add(id);
      return {
        id,
        confidence: clamp(Number(suggestion.confidence) || 0.65, 0.35, 0.98),
        reason: String(suggestion.reason || suggestion.why || "Identifierad från kylskåpsbilden.").slice(0, 160),
        visualEvidence: String(suggestion.visualEvidence || suggestion.evidence || "").slice(0, 160),
        needsConfirmation: Boolean(suggestion.needsConfirmation) || Number(suggestion.confidence || 0) < 0.72,
        confirmed: Boolean(suggestion.confirmed),
        feedback: ["right", "wrong"].includes(suggestion.feedback) ? suggestion.feedback : ""
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
}

function normalizeFridgeScanUncertain(rawItems) {
  const seen = new Set();
  return (Array.isArray(rawItems) ? rawItems : [])
    .map((item) => {
      const id = matchPantryFoodId(item.id || item.name || item.label);
      if (!id || seen.has(id)) return null;
      seen.add(id);
      const alternatives = Array.isArray(item.alternatives)
        ? item.alternatives.map(matchPantryFoodId).filter(Boolean)
        : [];
      return {
        id,
        confidence: clamp(Number(item.confidence) || 0.45, 0.2, 0.72),
        question: String(item.question || `Är detta ${foodNameById(id)}?`).slice(0, 160),
        alternatives: Array.from(new Set(alternatives)).filter((value) => value !== id).slice(0, 3),
        reason: String(item.reason || "Osäker träff i bilden.").slice(0, 160),
        confirmed: Boolean(item.confirmed),
        feedback: ["right", "wrong"].includes(item.feedback) ? item.feedback : ""
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

function normalizeFridgeScanQuality(rawQuality, fallbackDetail = "high") {
  const quality = rawQuality && typeof rawQuality === "object" ? rawQuality : {};
  return {
    score: clamp(Number(quality.score) || 0.58, 0.25, 0.98),
    lighting: String(quality.lighting || "Bildljus ej bedömt.").slice(0, 90),
    framing: String(quality.framing || "Inramning ej bedömd.").slice(0, 90),
    occlusion: String(quality.occlusion || "Skymda objekt ej bedömda.").slice(0, 90),
    shouldRetake: Boolean(quality.shouldRetake),
    advice: String(quality.advice || "Ta en rak bild med öppen kylskåpsdörr och bra ljus.").slice(0, 180),
    detailUsed: String(quality.detailUsed || fallbackDetail || "high").slice(0, 20)
  };
}

function normalizeFridgeMealIdea(rawIdea) {
  const idea = rawIdea && typeof rawIdea === "object" ? rawIdea : {};
  const addIds = Array.isArray(idea.addIds)
    ? idea.addIds.map(matchPantryFoodId).filter((id) => pantryFoods.some((food) => food.id === id)).slice(0, 5)
    : [];
  return {
    title: String(idea.title || "Smart kylskåpsmåltid").slice(0, 90),
    text: String(idea.text || "Lägg till scannade råvaror och låt Köks-AI skruva gram och balans.").slice(0, 220),
    addIds
  };
}

function normalizeShoppingItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .map((item) => item.slice(0, 90))
    .slice(0, 6);
}

function matchPantryFoodId(value) {
  if (!value) return "";
  const normalized = normalizeScanText(value);
  const exact = pantryFoods.find((food) => food.id === value || normalizeScanText(food.id) === normalized);
  if (exact) return exact.id;
  const aliases = {
    agg: "egg",
    eggs: "egg",
    yoghurt: "yogurt",
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
    keso: "cottage",
    cottagecheese: "cottage",
    kyckling: "chicken",
    chickenbreast: "chicken",
    tonfisk: "tuna",
    tuna: "tuna",
    rakor: "shrimp",
    prawns: "shrimp",
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
    sallad: "lettuce",
    lettuce: "lettuce",
    lok: "onion",
    onion: "onion",
    vitlok: "garlic",
    citron: "lemon",
    lemon: "lemon",
    potatis: "potato",
    sweetpotato: "sweetpotato",
    sotpotatis: "sweetpotato",
    ris: "brownrice",
    quinoa: "quinoa",
    havre: "oats",
    ragbrod: "rye-bread",
    pasta: "wholegrain-pasta",
    olivolja: "olive-oil",
    avocado: "avocado",
    avokado: "avocado",
    mandel: "almonds",
    hummus: "hummus",
    berries: "berries",
    bar: "berries",
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
  if (aliases[normalized]) return aliases[normalized];
  const byName = pantryFoods.find((food) => {
    const name = normalizeScanText(food.name);
    return name.includes(normalized) || normalized.includes(name.split("/")[0]);
  });
  return byName ? byName.id : "";
}

function normalizeScanText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function localFridgeScanSuggestions(colorHints = []) {
  ensurePantryState();
  const current = new Set(state.pantry.selected);
  const byGoal = {
    fatloss: ["egg", "kvarg", "cottage", "broccoli", "tomato", "cucumber", "chicken", "potato"],
    training: ["kvarg", "banana", "potato", "chicken", "berries", "oats", "yogurt", "egg"],
    lowcarb: ["egg", "chicken", "tuna", "cottage", "broccoli", "cucumber", "avocado", "olive-oil"],
    vegetarian: ["tofu", "tempeh", "lentils", "chickpeas", "kvarg", "edamame", "broccoli", "avocado"]
  };
  const fallback = ["egg", "kvarg", "broccoli", "tomato", "cucumber", "carrot", "potato", "berries", "olive-oil"];
  const ids = Array.from(new Set([...colorHints, ...(byGoal[state.pantry.goal] || byGoal.fatloss), ...fallback]))
    .filter((id) => pantryFoods.some((food) => food.id === id))
    .filter((id) => !current.has(id));
  const finalIds = ids.length ? ids.slice(0, 8) : fallback.slice(0, 6);
  return finalIds.map((id, index) => ({
    id,
    confidence: clamp(0.82 - index * 0.04, 0.52, 0.82),
    reason: colorHints.includes(id)
      ? "Bildsignal matchar färg och form i kylskåpet."
      : "Smart komplettering för valt måltidsmål.",
    visualEvidence: colorHints.includes(id)
      ? "Lokal färgsignal från bilden, behöver manuell kontroll."
      : "Föreslagen från mål och vanliga kylskåpsråvaror.",
    needsConfirmation: true,
    confirmed: false,
    feedback: ""
  }));
}

function resizeFridgeScanImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxSide = 1300;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function extractFridgeColorHints(imageUrl) {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve([]);
      return;
    }
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 72;
      canvas.height = 72;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const counts = { green: 0, red: 0, orange: 0, white: 0, dark: 0 };
      for (let index = 0; index < pixels.length; index += 16) {
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max < 70) counts.dark += 1;
        if (max > 180 && max - min < 38) counts.white += 1;
        if (g > r * 1.12 && g > b * 1.08 && g > 70) counts.green += 1;
        if (r > g * 1.18 && r > b * 1.18 && r > 100) counts.red += 1;
        if (r > 145 && g > 80 && g < 180 && b < 120) counts.orange += 1;
      }
      const hints = [];
      if (counts.green > 18) hints.push("broccoli", "spinach", "cucumber");
      if (counts.red > 12) hints.push("tomato", "pepper");
      if (counts.orange > 12) hints.push("carrot", "banana");
      if (counts.white > 22) hints.push("egg", "kvarg", "yogurt", "cottage");
      if (counts.dark > 28) hints.push("mushroom", "berries", "rye-bread");
      resolve(Array.from(new Set(hints)));
    };
    img.src = imageUrl;
  });
}

function renderFridgeMeal() {
  const target = $("#fridgeMealResult");
  if (!target) return;
  const meal = buildFridgeMeal();
  updateFridgeBadge(meal.selectedCount);
  target.innerHTML = `
    <div class="fridge-result-head">
      <span>${meal.goalCopy.kicker}</span>
      <h3>${meal.goalCopy.title}</h3>
      <p>${meal.goalCopy.text}</p>
    </div>
    <div class="fridge-macro-grid">
      <article>
        <span>Energi</span>
        <strong>${Math.round(meal.macros.kcal)} kcal</strong>
        <small>Beräknat från valda gram</small>
      </article>
      <article>
        <span>Protein</span>
        <strong>${Math.round(meal.macros.protein)} g</strong>
        <small>Mål per måltid: ${meal.proteinTarget} g</small>
      </article>
      <article>
        <span>Kolhydrater</span>
        <strong>${Math.round(meal.macros.carbs)} g</strong>
        <small>${meal.goal === "lowcarb" ? "Reducerad portion" : "Anpassad till målet"}</small>
      </article>
      <article>
        <span>Fiber</span>
        <strong>${Math.round(meal.macros.fiber)} g</strong>
        <small>Grönt: ${Math.round(meal.vegGrams)} g</small>
      </article>
      <article>
        <span>Fett</span>
        <strong>${Math.round(meal.macros.fat)} g</strong>
        <small>Kontrollerad smakdos</small>
      </article>
    </div>
    <div class="fridge-ingredient-list">
      <header>
        <strong>Måltidskvitto</strong>
        <span>${meal.items.length} byggstenar</span>
      </header>
      ${meal.items.map((item) => `
        <article class="${item.suggested ? "suggested" : ""}">
          <div>
            <strong>${item.food.name}</strong>
            <small>${item.suggested ? "Lägg till om det saknas" : "Finns i dina val"} · ${Math.round(item.food.kcal)} kcal/100 g</small>
          </div>
          <b>${item.grams} g</b>
        </article>
      `).join("")}
    </div>
    <div class="fridge-verdict ${meal.verdict.level}">
      <strong>${meal.verdict.title}</strong>
      <p>${meal.verdict.text}</p>
      ${meal.verdict.actions.length ? `<ul>${meal.verdict.actions.map((action) => `<li>${action}</li>`).join("")}</ul>` : ""}
    </div>
  `;
}

function buildFridgeMeal() {
  ensurePantryState();
  const goal = state.pantry.goal || "fatloss";
  const selectedIds = state.pantry.selected.filter((id) => pantryFoods.some((food) => food.id === id));
  const selectedFoods = selectedIds.map((id) => pantryFoods.find((food) => food.id === id)).filter(Boolean);
  const pool = selectedFoods.length ? selectedFoods : defaultState.pantry.selected.map((id) => pantryFoods.find((food) => food.id === id)).filter(Boolean);
  const used = new Set();
  const items = [];
  const findInPool = (predicate) => pool.find((food) => predicate(food) && !used.has(food.id));
  const fallback = (ids) => ids.map((id) => pantryFoods.find((food) => food.id === id)).find((food) => food && !used.has(food.id));
  const add = (food, role, suggested = false) => {
    if (!food || used.has(food.id)) return;
    used.add(food.id);
    items.push({
      food,
      role,
      grams: gramsForFridgeFood(food, role, goal),
      suggested
    });
  };

  const vegetarianProtein = (food) => ["legume", "dairy"].includes(food.role) || ["tofu", "tempeh", "egg"].includes(food.id);
  const protein = goal === "vegetarian"
    ? findInPool(vegetarianProtein) || fallback(["tofu", "lentils", "kvarg", "egg"])
    : findInPool((food) => ["protein", "dairy", "legume"].includes(food.role)) || fallback(["chicken", "egg", "kvarg", "tuna"]);
  add(protein, "protein", !selectedIds.includes(protein && protein.id));

  for (let index = 0; index < 2; index += 1) {
    const veg = findInPool((food) => food.role === "veg") || fallback(index === 0 ? ["broccoli", "frozen-veg", "cauliflower"] : ["frozen-veg", "cabbage", "pepper"]);
    add(veg, "veg", !selectedIds.includes(veg && veg.id));
  }

  const carb = findInPool((food) => food.role === "carb") || (goal === "lowcarb" ? null : fallback(["potato", "quinoa", "brownrice", "rye-bread"]));
  if (carb) add(carb, "carb", !selectedIds.includes(carb.id));

  const fat = findInPool((food) => food.role === "fat") || fallback(["olive-oil", "avocado", "hummus"]);
  add(fat, "fat", !selectedIds.includes(fat && fat.id));

  const fruit = findInPool((food) => food.role === "fruit") || (goal === "training" ? fallback(["banana", "berries"]) : null);
  if (fruit) add(fruit, "fruit", !selectedIds.includes(fruit.id));

  const macros = calculateFridgeMacros(items);
  const proteinTarget = Math.round(clamp(state.profile.weight * 1.6, 70, 190) / 3);
  const vegGrams = items.filter((item) => item.role === "veg").reduce((sum, item) => sum + item.grams, 0);
  return {
    goal,
    goalCopy: fridgeGoalCopy[goal] || fridgeGoalCopy.fatloss,
    selectedCount: selectedIds.length,
    proteinTarget,
    vegGrams,
    items,
    macros,
    verdict: fridgeVerdict(items, macros, goal, proteinTarget, vegGrams)
  };
}

function gramsForFridgeFood(food, role, goal) {
  let grams = food.defaultGrams;
  if (role === "protein" && food.role === "legume") grams += 30;
  if (goal === "fatloss") {
    if (role === "veg") grams *= 1.15;
    if (role === "carb") grams *= 0.9;
  }
  if (goal === "training") {
    if (role === "protein") grams *= 1.1;
    if (role === "carb") grams *= 1.35;
    if (role === "veg") grams *= 1.05;
  }
  if (goal === "lowcarb") {
    if (role === "veg") grams *= 1.2;
    if (role === "carb") grams *= 0.5;
  }
  if (goal === "vegetarian") {
    if (food.role === "legume") grams *= 1.15;
    if (role === "veg") grams *= 1.1;
  }
  if (role === "fat") {
    const caps = {
      "olive-oil": 15,
      almonds: 25,
      "pumpkin-seeds": 25,
      avocado: 80,
      hummus: 70
    };
    grams = Math.min(grams, caps[food.id] || 60);
  }
  if (role === "fruit" && goal === "lowcarb") grams *= 0.65;
  return Math.max(10, Math.round(grams / 5) * 5);
}

function calculateFridgeMacros(items) {
  return items.reduce((sum, item) => {
    const factor = item.grams / 100;
    sum.kcal += item.food.kcal * factor;
    sum.protein += item.food.protein * factor;
    sum.carbs += item.food.carbs * factor;
    sum.fat += item.food.fat * factor;
    sum.fiber += item.food.fiber * factor;
    return sum;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

function fridgeVerdict(items, macros, goal, proteinTarget, vegGrams) {
  const actions = [];
  if (macros.protein < proteinTarget - 5) {
    actions.push(goal === "vegetarian"
      ? "Höj protein: lägg till 180 g tofu, 200 g kvarg eller 200 g linser."
      : "Höj protein: lägg till 150 g kyckling/torsk eller 250 g kvarg.");
  }
  if (vegGrams < 250) actions.push("Höj grön volym: sikta på minst 250 g grönsaker i huvudmålet.");
  if (macros.fiber < 10) actions.push("Höj fiber: välj bär, bönor, linser, kål eller fullkorn i nästa steg.");
  if (goal === "fatloss" && macros.kcal > 760) actions.push("Energin är hög för bukfettsfas: minska fettkälla eller kolhydratbas med 30-50 g.");
  if (goal === "training" && macros.carbs < 35) actions.push("Efter träning kan du lägga till potatis, quinoa, rågbröd eller banan.");

  const suggested = items.filter((item) => item.suggested).map((item) => item.food.name);
  if (suggested.length) actions.push(`Saknas i dina val: ${suggested.join(", ")} lades in som smarta kompletteringar.`);

  if (!actions.length) {
    return {
      level: "strong",
      title: "Komplett måltid för midja och mättnad",
      text: "Protein, grön volym, fiber och energi ligger i en stark zon för målet.",
      actions: []
    };
  }

  return {
    level: actions.length > 2 ? "watch" : "tune",
    title: actions.length > 2 ? "Nästan komplett, men justera två saker" : "Bra bas med en tydlig förbättring",
    text: "Måltiden är användbar, men coachen skulle skruva den lite innan den blir en premium-mall.",
    actions
  };
}

function updateFridgeBadge(count) {
  const badge = $("#fridgeBadge");
  if (!badge) return;
  badge.textContent = `${count} råvaror`;
  const level = count >= 10 ? "high" : count >= 5 ? "medium" : "low";
  badge.className = `status-badge ${level}`;
}

function formatFridgeValue(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(".", ",");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderMetrics() {
  const p = state.profile;
  const whtr = p.waist / p.height;
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  const waistLimit = p.sex === "female" ? 88.9 : p.sex === "male" ? 101.6 : p.height * 0.5;
  const gap = Math.max(0, p.waist - p.targetWaist);
  const risk = riskLevel(whtr, p.waist, waistLimit);

  $("#whtrValue").textContent = whtr.toFixed(2).replace(".", ",");
  $("#whtrLabel").textContent = whtr < 0.5 ? "Under riskmarkör" : "Över 0,50";
  $("#waistLimitValue").textContent = `${waistLimit.toFixed(0)} cm`;
  $("#waistLimitLabel").textContent = p.sex === "unspecified" ? "Halva längden" : "Könsspecifik gräns";
  $("#bmiValue").textContent = bmi.toFixed(1).replace(".", ",");
  $("#bmiLabel").textContent = bmiLabel(bmi);
  $("#goalGapValue").textContent = `${gap.toFixed(1).replace(".", ",")} cm`;
  $("#goalGapLabel").textContent = gap === 0 ? "Mål uppnått" : "Kvar till mål";

  const badge = $("#riskBadge");
  badge.textContent = risk.label;
  badge.className = `status-badge ${risk.className}`;

  const ratio = Math.min(100, Math.max(8, ((p.waist - p.targetWaist) / Math.max(1, waistLimit - p.targetWaist)) * 100));
  $("#waistProgress").style.width = `${ratio}%`;
  $("#riskSummary").textContent = risk.summary;

  const todayScore = scoreForDate(dateKey(new Date()));
  $("#todayScore").textContent = `${todayScore}/7`;
  $("#streakCount").textContent = `${streakDays()} dagar`;
}

function riskLevel(whtr, waist, waistLimit) {
  if (whtr >= 0.6 || waist >= waistLimit + 8) {
    return {
      label: "Hög prioritet",
      className: "high",
      summary: "Midja/längd och midjemått pekar på förhöjd risk. Fokusera på konsekvent matram, daglig rörelse och två styrkepass, med lugn progression."
    };
  }
  if (whtr >= 0.5 || waist >= waistLimit) {
    return {
      label: "Mellanläge",
      className: "medium",
      summary: "Du ligger nära eller över vanliga riskmarkörer. Målet är inte punktförbränning, utan jämn minskning av total fettmassa med särskilt fokus på bukmått."
    };
  }
  return {
    label: "Bra läge",
    className: "low",
    summary: "Bukmåtten ligger under vanliga riskmarkörer. Behåll rutinen med aktivitet, styrka, sömn och en matram som håller vikten stabil."
  };
}

function bmiLabel(bmi) {
  if (bmi < 18.5) return "Lågt BMI";
  if (bmi < 25) return "Normalintervall";
  if (bmi < 30) return "Övervikt";
  return "Fetmaintervall";
}

function renderPriorities() {
  const key = dateKey(new Date());
  const entry = state.logs[key] || { habits: {} };
  const priorities = [
    ["walk", "Rörelse före perfektion", "Minst 30 min gång/cykel eller motsvarande uppdelat under dagen."],
    ["protein", "Mättande måltider", "Protein och fiber i varje huvudmål, förstärk med grönsaker eller baljväxter."],
    ["sugarfree", "Drycker utan socker", "Vatten, kaffe eller te utan socker i stället för läsk/juice."],
    ["strength", "Muskelbevarande styrka", "Två pass per vecka är basen; dagens plan visar vilket pass."],
    ["sleep", "Sömnfönster", "Planera kvällen så att 7 timmar är realistiskt."]
  ];
  $("#priorityList").innerHTML = priorities.map(([id, title, text]) => `
    <li>
      <input type="checkbox" ${entry.habits && entry.habits[id] ? "checked" : ""} data-quick-habit="${id}">
      <div><strong>${title}</strong><span>${text}</span></div>
    </li>
  `).join("");
  $$("[data-quick-habit]").forEach((input) => {
    input.addEventListener("change", () => {
      const log = state.logs[key] || { minutes: 0, habits: {} };
      log.habits = log.habits || {};
      log.habits[input.dataset.quickHabit] = input.checked;
      state.logs[key] = log;
      saveState();
      renderCoach();
      renderMetrics();
      renderSprintPlan();
      renderWeeklySummary();
      renderMemberHub();
      loadLogForDate();
    });
  });
}

function renderSexProtocol() {
  const sex = state.profile.sex || "unspecified";
  const protocol = sexProtocols[sex] || sexProtocols.unspecified;
  const selected = state.profile.sexFocus || Object.keys(protocol.options)[0];
  const items = protocol.options[selected] || Object.values(protocol.options)[0];
  $("#sexBadge").textContent = protocol.badge;
  $("#sexProtocol").innerHTML = `
    <p>${protocol.lead}</p>
    <div class="sex-focus-list">
      ${items.map((item) => `<article><strong>${item}</strong></article>`).join("")}
    </div>
    <small>${sex === "female" && selected === "female-postpartum" ? "Vid graviditet, postpartum, smärta eller bäckenbottenbesvär: stäm av med vården innan progression." : "Protokollet är livsstilsstöd, inte medicinsk diagnos."}</small>
  `;
}

function renderEdgeGrid() {
  const target = $("#edgeGrid");
  if (!target) return;
  target.innerHTML = edgeCards.map(([title, text], index) => `
    <article>
      <b>${index + 1}</b>
      <div>
        <strong>${title}</strong>
        <span>${text}</span>
      </div>
    </article>
  `).join("");
}

function renderPlan() {
  const plan = weeklyPlans[state.profile.level];
  $("#planGrid").innerHTML = plan.map(([day, workout, food, recovery]) => `
    <article class="plan-day">
      <h3>${day}</h3>
      <ul>
        <li>${workout}</li>
        <li>${food}</li>
        <li>${recovery}</li>
      </ul>
    </article>
  `).join("");
  $("#printPlan").onclick = () => window.print();
}

function renderSprintPlan() {
  const target = $("#sprintPlan");
  if (!target) return;
  const analysis = analyzeProgress();
  const dayPointer = clamp(analysis.entries.length + 1, 1, 14);
  $("#sprintBadge").textContent = analysis.entries.length ? `Nästa: dag ${dayPointer}` : "Dag 1-14";
  target.innerHTML = sprintBlueprint.map(([title, action, food], index) => {
    const day = index + 1;
    const profileNote = sprintProfileNote(day);
    return `
      <article class="${day === dayPointer ? "is-current" : ""}">
        <header>
          <span>Dag ${day}</span>
          <strong>${title}</strong>
        </header>
        <p>${action}</p>
        <small>${food}</small>
        ${profileNote ? `<em>${profileNote}</em>` : ""}
      </article>
    `;
  }).join("");
}

function sprintProfileNote(day) {
  const { sex, sexFocus } = state.profile;
  if (sex === "female" && sexFocus === "female-cycle" && [3, 9, 12].includes(day)) {
    return "Justera intensiteten efter energi och symtom.";
  }
  if (sex === "female" && sexFocus === "female-postpartum" && [3, 9, 12].includes(day)) {
    return "Välj bål/bäckenbotten och promenad om kroppen inte är redo för intervall.";
  }
  if (sex === "male" && sexFocus === "male-stress" && [5, 8, 11].includes(day)) {
    return "Lägg extra friktion på kvällsalkohol och sena jobbimpulser.";
  }
  if (sex === "male" && sexFocus === "male-cardio" && [6, 12].includes(day)) {
    return "Håll passet kontrollerat: flås, men inte maxning.";
  }
  return "";
}

function renderNutrition() {
  const p = state.profile;
  const bmr = p.sex === "female"
    ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
    : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
  const maintenance = Math.round(bmr * 1.45);
  const target = Math.max(p.sex === "female" ? 1200 : 1500, maintenance - 400);
  $("#energyTarget").textContent = `${Math.round(target)} kcal riktmärke`;

  $("#mealFrame").innerHTML = foodModes[p.foodMode].map(([name, text]) => `
    <article class="meal-slot">
      <h3>${name}</h3>
      <p>${text}</p>
    </article>
  `).join("");

  $("#foodTargets").innerHTML = foodTargets.map(([num, title, text]) => `
    <article>
      <b>${num}</b>
      <div><strong>${title}</strong><span>${text}</span></div>
    </article>
  `).join("");
}

function renderMealTemplates() {
  const target = $("#mealTemplates");
  if (!target) return;
  const p = state.profile;
  const proteinTarget = clamp(Math.round(p.weight * 1.6), 70, 190);
  const mainProtein = Math.round(proteinTarget / 3);
  const vegTarget = p.waist / p.height >= 0.5 ? "250-350 g" : "200-300 g";
  const femaleNote = p.sex === "female" ? "Undvik för lågt energiintag: lägg till fullkorn/potatis runt träning." : "Bra bas för midja ned utan att tappa styrka.";
  const templates = [
    {
      title: "Proteinfrukost",
      badge: `${mainProtein} g protein`,
      rows: [["Kvarg/yoghurt/kefir", "200-250 g"], ["Bär eller äpple", "100-180 g"], ["Havre/råg", "40-70 g"], ["Frön/nötter", "10-20 g"]],
      note: "Stabil mättnad från morgonen."
    },
    {
      title: "Lunchlåda",
      badge: `${vegTarget} grönt`,
      rows: [["Kyckling/fisk/tofu", "120-180 g"], ["Grönsaker", vegTarget], ["Potatis/fullkorn", "120-220 g"], ["Olivolja/sås", "10-20 g"]],
      note: "Byggbar mall som fungerar även socialt."
    },
    {
      title: "Baljväxtmiddag",
      badge: "Fiberhävstång",
      rows: [["Linser/bönor/kikärter", "180-250 g"], ["Extra grönsaker", "250-350 g"], ["Ägg/fisk/tofu vid behov", "80-150 g"], ["Frukt efteråt", "100-150 g"]],
      note: "Hög volym och fiber utan att kännas som diet."
    },
    {
      title: "Akutval på språng",
      badge: "5 minuter",
      rows: [["Protein", "150-250 g kvarg eller 2-3 ägg"], ["Frukt/grönt", "150-300 g"], ["Fullkorn", "60-100 g bröd eller 40-70 g havre"], ["Dryck", "0 ml socker"]],
      note: femaleNote
    }
  ];
  $("#mealTemplateBadge").textContent = `${proteinTarget} g protein/dag`;
  target.innerHTML = templates.map((template) => `
    <article>
      <header>
        <strong>${template.title}</strong>
        <span>${template.badge}</span>
      </header>
      <dl>
        ${template.rows.map(([name, amount]) => `<div><dt>${name}</dt><dd>${amount}</dd></div>`).join("")}
      </dl>
      <p>${template.note}</p>
    </article>
  `).join("");
}

function renderFoodGuide() {
  $("#foodGuide").innerHTML = foodGuideGroups.map((group) => `
    <section class="food-column" aria-label="${group.title}">
      <h3>${group.title}</h3>
      ${group.items.map(([name, why, portion], index) => `
        <article class="ranked-food">
          <b>${index + 1}</b>
          <div>
            <strong>${name}</strong>
            <span>${why}</span>
            <small>${portion}</small>
          </div>
        </article>
      `).join("")}
    </section>
  `).join("");
}

function renderTraining() {
  const workouts = workoutLibrary[state.profile.level];
  $("#workoutList").innerHTML = workouts.map((workout) => `
    <article class="workout-card">
      ${workoutVisual(workout.name)}
      <header>
        <div>
          <h3>${workout.name}</h3>
          <p>${workout.why}</p>
        </div>
        <span class="status-badge low">${workout.tag}</span>
      </header>
      <ul>${workout.steps.map((step) => `<li>${step}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function workoutVisual(name) {
  const type = /styrka|tung/i.test(name) ? "strength" : /intervall|tröskel|hiit/i.test(name) ? "interval" : /zon|gång|promenad/i.test(name) ? "cardio" : "mobility";
  const figures = {
    strength: `<path d="M62 82h86M64 72v20M146 72v20" stroke="#f1d18a" stroke-width="10" stroke-linecap="round"/><circle cx="106" cy="45" r="14" fill="#fffefa"/><path d="M104 62l-14 38 29 28M105 64l28 24 30-6M91 101l-28 39M119 128l35 23" stroke="#fffefa" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,
    interval: `<path d="M32 138c38-44 72-44 112 0" fill="none" stroke="#2d866e" stroke-width="12" stroke-linecap="round"/><circle cx="96" cy="45" r="13" fill="#fffefa"/><path d="M95 62l-20 35 34 13 23 37M75 97l-34 25M109 110l39-18M88 84l38-22" stroke="#fffefa" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M152 48l20 8-18 11" fill="none" stroke="#f1d18a" stroke-width="8" stroke-linecap="round"/>`,
    cardio: `<circle cx="92" cy="44" r="14" fill="#fffefa"/><path d="M90 62l-10 42 29 14M80 104l-23 43M109 118l29 32M86 78l-35 18M95 76l32 23" stroke="#fffefa" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M137 55c18 13 29 31 33 54" fill="none" stroke="#f1d18a" stroke-width="8" stroke-linecap="round"/>`,
    mobility: `<circle cx="102" cy="43" r="14" fill="#fffefa"/><path d="M101 62l2 54M103 83l-42 20M104 88l43-21M103 116l-42 35M104 116l43 35" stroke="#fffefa" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M48 52c22-20 78-29 110 2" fill="none" stroke="#f1d18a" stroke-width="8" stroke-linecap="round"/>`
  };
  return `
    <div class="exercise-visual ${type}" aria-hidden="true">
      <svg viewBox="0 0 200 170" role="img" focusable="false">
        <rect x="8" y="8" width="184" height="154" rx="22" fill="#0f1916"/>
        <path d="M18 132c30-20 66-23 108-9 24 8 42 7 58-4v43H18z" fill="#17483c"/>
        ${figures[type]}
      </svg>
    </div>
  `;
}

function renderWeeklySummary() {
  const keys = Array.from({ length: 7 }, (_, offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return dateKey(d);
  });
  const entries = keys.map((key) => state.logs[key]).filter(Boolean);
  const minutes = entries.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
  const habitCount = entries.reduce((sum, entry) => sum + Object.values(entry.habits || {}).filter(Boolean).length, 0);
  const waistValues = entries.map((entry) => entry.waist).filter(Boolean);
  const weightValues = entries.map((entry) => entry.weight).filter(Boolean);
  const waistTrend = waistValues.length >= 2 ? waistValues[waistValues.length - 1] - waistValues[0] : 0;
  const weightTrend = weightValues.length >= 2 ? weightValues[weightValues.length - 1] - weightValues[0] : 0;

  $("#weeklySummary").innerHTML = [
    ["Rörelse", `${minutes} min`, "Mål: minst 150 min/vecka"],
    ["Vanor", `${habitCount} träffar`, "Sju dagars följsamhet"],
    ["Midjetrend", formatTrend(waistTrend, "cm"), "Mät på morgonen, samma punkt"],
    ["Vikttrend", formatTrend(weightTrend, "kg"), "Titta på 4-veckorsriktning"]
  ].map(([label, value, note]) => `
    <div class="weekly-row">
      <div><strong>${label}</strong><br><span>${note}</span></div>
      <strong>${value}</strong>
    </div>
  `).join("");
  renderTrendChart();
}

function renderTrendChart() {
  const target = $("#trendChart");
  if (!target) return;
  const days = Array.from({ length: 14 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - index));
    const key = dateKey(d);
    const entry = state.logs[key];
    return {
      key,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      waist: entry && entry.waist ? entry.waist : null,
      score: scoreForDate(key)
    };
  });
  const waistValues = days.map((item) => item.waist).filter(Boolean);
  if (waistValues.length < 2) {
    target.innerHTML = `
      <div class="empty-chart">
        <strong>Trendgraf väntar på mer data</strong>
        <span>Logga midja minst två dagar för att se riktning. Dagspoängen visas samtidigt som vanorna fylls på.</span>
      </div>
    `;
    return;
  }
  const width = 640;
  const height = 220;
  const padX = 34;
  const padY = 24;
  const minWaist = Math.min(...waistValues) - 1;
  const maxWaist = Math.max(...waistValues) + 1;
  const x = (index) => padX + (index / (days.length - 1)) * (width - padX * 2);
  const yWaist = (value) => height - padY - ((value - minWaist) / Math.max(1, maxWaist - minWaist)) * (height - padY * 2);
  const waistPoints = days
    .map((item, index) => item.waist ? `${x(index).toFixed(1)},${yWaist(item.waist).toFixed(1)}` : null)
    .filter(Boolean)
    .join(" ");
  const bars = days.map((item, index) => {
    const barHeight = (item.score / 7) * 58;
    const bx = x(index) - 6;
    const by = height - padY - barHeight;
    return `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="12" height="${barHeight.toFixed(1)}" rx="4"></rect>`;
  }).join("");
  const labels = days.filter((_, index) => index % 3 === 0 || index === days.length - 1).map((item, index, arr) => {
    const originalIndex = days.findIndex((day) => day.key === item.key);
    return `<text x="${x(originalIndex).toFixed(1)}" y="${height - 4}" text-anchor="${index === arr.length - 1 ? "end" : "middle"}">${item.label}</text>`;
  }).join("");
  target.innerHTML = `
    <div class="chart-head">
      <div>
        <strong>14-dagars riktning</strong>
        <span>Linje = midja i cm, staplar = dagspoäng.</span>
      </div>
      <b>${formatTrend(waistValues[0] - waistValues[waistValues.length - 1], "cm")}</b>
    </div>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Midje- och vanetrend senaste 14 dagar">
      <g class="score-bars">${bars}</g>
      <polyline points="${waistPoints}"></polyline>
      <g class="chart-labels">${labels}</g>
    </svg>
  `;
}

function renderMemberHub() {
  ensureMemberState();
  renderMemberValueGrid();
  renderBookingList();
  renderHealthDataGrid();
  renderMessageFeed();
  renderRetentionGrid();
}

function ensureMemberState() {
  state.member = state.member || { bookings: [], messages: [] };
  state.member.bookings = Array.isArray(state.member.bookings) ? state.member.bookings : [];
  state.member.messages = Array.isArray(state.member.messages) ? state.member.messages : [];
}

function renderMemberValueGrid() {
  const target = $("#memberValueGrid");
  if (!target) return;
  target.innerHTML = memberValueProps.map(([title, text]) => `
    <article>
      <strong>${title}</strong>
      <span>${text}</span>
    </article>
  `).join("");
  $("#memberStatus").textContent = activeUser.guest ? "Demo" : "Medlem";
}

function renderBookingList() {
  const target = $("#bookingList");
  if (!target) return;
  const analysis = analyzeProgress();
  const recommended = recommendedBookingIds(analysis);
  $("#bookingBadge").textContent = `${state.member.bookings.length} bokade`;
  target.innerHTML = bookingCatalog.map((item) => {
    const booked = state.member.bookings.includes(item.id);
    const isRecommended = recommended.includes(item.id);
    return `
      <article class="${booked ? "is-booked" : ""}">
        <div class="booking-main">
          <span>${item.day} ${item.time} · ${item.duration}</span>
          <strong>${item.title}</strong>
          <p>${item.fit}</p>
          <small>${item.coach} · ${item.capacity}</small>
        </div>
        <div class="booking-actions">
          ${isRecommended ? `<em>Rekommenderad</em>` : ""}
          <button class="${booked ? "ghost-button" : "primary-button"}" type="button" data-booking-id="${item.id}">
            ${booked ? "Avboka" : "Boka"}
          </button>
        </div>
      </article>
    `;
  }).join("");
  $$("[data-booking-id]").forEach((button) => {
    button.addEventListener("click", () => toggleBooking(button.dataset.bookingId));
  });
}

function recommendedBookingIds(analysis) {
  const ids = [];
  if (analysis.entries.length < 3 || analysis.whtr >= 0.5) ids.push("visceral-check");
  if (analysis.strengthDays < 2) ids.push("strength-foundation");
  if (analysis.minutes < 150) ids.push("zone2-club");
  if (analysis.proteinDays < 5 || analysis.vegDays < 5 || analysis.sugarFreeDays < 5) ids.push("nutrition-lab");
  if (analysis.sleepDays < 5 || analysis.stressDays < 5 || analysis.alcoholFreeDays < 4) ids.push("stress-reset");
  return ids.length ? ids : ["visceral-check", "strength-foundation"];
}

function toggleBooking(id) {
  ensureMemberState();
  const item = bookingCatalog.find((booking) => booking.id === id);
  if (!item) return;
  const booked = state.member.bookings.includes(id);
  state.member.bookings = booked
    ? state.member.bookings.filter((bookingId) => bookingId !== id)
    : [...state.member.bookings, id];
  state.member.messages.unshift({
    id: `booking-${Date.now()}`,
    type: "system",
    title: booked ? "Bokning avbokad" : "Bokning skapad",
    text: `${item.title}, ${item.day} ${item.time}.`,
    date: new Date().toISOString()
  });
  saveState();
  renderMemberHub();
}

function renderHealthDataGrid() {
  const target = $("#healthDataGrid");
  if (!target) return;
  const analysis = analyzeProgress();
  const p = state.profile;
  const whtr = p.waist / p.height;
  const lastLog = getRecentEntries(14)[0];
  const healthCards = [
    ["Visceral Score", `${analysis.score}/100`, `${analysis.tier.label}: ${analysis.weakest[0]} är största hävstången.`],
    ["Midja", `${p.waist.toFixed(1).replace(".", ",")} cm`, `Mål: ${p.targetWaist.toFixed(1).replace(".", ",")} cm.`],
    ["Midja/längd", whtr.toFixed(2).replace(".", ","), whtr < 0.5 ? "Under 0,50." : "Fokusera på buksignal."],
    ["Rörelse 7 dagar", `${analysis.minutes} min`, "Golvet är 150 min/vecka."],
    ["Styrka", `${analysis.strengthDays}/2 pass`, "Bokning kan styra nästa pass."],
    ["Senaste logg", lastLog ? lastLog.key : "Saknas", lastLog ? "Redo för coachuppföljning." : "Logga idag för bättre coachdata."]
  ];
  target.innerHTML = healthCards.map(([title, value, note]) => `
    <article>
      <span>${title}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `).join("");
}

function renderMessageFeed() {
  const target = $("#messageFeed");
  if (!target) return;
  const analysis = analyzeProgress();
  const action = getNextBestAction(analysis);
  const bookedNames = state.member.bookings
    .map((id) => bookingCatalog.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => item.title);
  const automated = [
    {
      id: "coach-action",
      type: "coach",
      title: "AI-coachens prioritet",
      text: `${action.title}: ${action.text}`,
      date: new Date().toISOString()
    },
    {
      id: "gym-next",
      type: "gym",
      title: bookedNames.length ? "Kommande bokningar" : "Boka nästa steg",
      text: bookedNames.length ? bookedNames.join(", ") : "Välj ett rekommenderat pass så kopplas träningen till din buksignal.",
      date: new Date().toISOString()
    }
  ];
  const feed = [...automated, ...state.member.messages].slice(0, 8);
  $("#messageBadge").textContent = `${feed.length} meddelanden`;
  target.innerHTML = feed.map((item) => `
    <article class="${item.type}">
      <span>${messageSender(item.type)} · ${formatMessageDate(item.date)}</span>
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function messageSender(type) {
  if (type === "member") return "Du";
  if (type === "gym") return "Gymteam";
  if (type === "system") return "Bokning";
  return "AI-coach";
}

function formatMessageDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "nu";
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function renderRetentionGrid() {
  const target = $("#retentionGrid");
  if (!target) return;
  target.innerHTML = retentionCards.map(([title, text]) => `
    <article>
      <strong>${title}</strong>
      <span>${text}</span>
    </article>
  `).join("");
}

function canAccessAdmin() {
  return Boolean(activeUser.server && ADMIN_ROLES.includes(activeUser.role));
}

function renderAdminHub() {
  const adminTab = $("#adminTabButton");
  const adminView = $("#admin");
  if (!adminTab || !adminView) return;
  const allowed = canAccessAdmin();
  adminTab.hidden = !allowed;
  if (!allowed && adminView.classList.contains("is-active")) activateTab("dashboard");

  $("#adminRoleLabel").textContent = activeUser.server ? roleLabel(activeUser.role) : "Gäst";
  $("#adminStatus").textContent = allowed ? adminMessage : "Låst";
  $("#adminStatus").className = `status-badge ${allowed ? "low" : "medium"}`;
  const roleSelect = $("#adminUserRole");
  if (roleSelect) {
    roleSelect.disabled = activeUser.role !== "super_admin";
    if (activeUser.role !== "super_admin") roleSelect.value = "user";
  }
  renderAdminUserList();
  if (allowed && !adminLoaded && !adminLoading) fetchAdminUsers();
}

function renderAdminUserList() {
  const target = $("#adminUserList");
  if (!target) return;
  if (!canAccessAdmin()) {
    target.innerHTML = `
      <div class="admin-empty">
        <strong>Admin kräver databaslogin</strong>
        <span>Logga in med en användare som har rollen admin eller super admin.</span>
      </div>
    `;
    return;
  }
  if (adminLoading) {
    target.innerHTML = `<div class="admin-empty"><strong>Laddar databasanvändare...</strong></div>`;
    return;
  }
  if (!adminUsers.length) {
    target.innerHTML = `<div class="admin-empty"><strong>Inga användare laddade</strong><span>Tryck på Uppdatera.</span></div>`;
    return;
  }
  target.innerHTML = adminUsers.map((user) => `
    <article>
      <div>
        <strong>${escapeHTML(user.name || user.email)}</strong>
        <span>${escapeHTML(user.email)} · ${roleLabel(user.role)}</span>
        <small>${user.lastLoginAt ? `Senast inloggad: ${formatMessageDate(user.lastLoginAt)}` : "Ingen inloggning ännu"}</small>
      </div>
      <b class="${user.status === "active" ? "active" : "paused"}">${user.status === "active" ? "Aktiv" : "Pausad"}</b>
    </article>
  `).join("");
}

async function fetchAdminUsers() {
  if (!canAccessAdmin()) return;
  adminLoading = true;
  adminMessage = "Laddar";
  renderAdminUserList();
  try {
    const data = await apiRequest("/api/admin/users");
    adminUsers = Array.isArray(data.users) ? data.users : [];
    adminLoaded = true;
    adminMessage = `${adminUsers.length} användare`;
  } catch (error) {
    adminMessage = "Fel";
    adminLoaded = true;
    $("#adminCreateResult").textContent = error.message || "Kunde inte ladda användare.";
  } finally {
    adminLoading = false;
    renderAdminHub();
  }
}

async function apiRequest(url, options = {}) {
  if (!activeUser.token) throw new Error("Du är inte inloggad via databasen.");
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeUser.token}`,
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "API-anropet misslyckades.");
  return data;
}

function roleLabel(role) {
  if (role === "super_admin") return "Super admin";
  if (role === "admin") return "Admin";
  if (role === "user") return "Användare";
  return "Gäst";
}

function renderSources() {
  $("#videoNote").textContent = "Jag kunde verifiera videons titel, kanal, beskrivning, kapitel och auto-caption-spår. Själva caption-endpointen returnerade tom respons här, så appens sakpåståenden bygger på videons verifierbara metadata och etablerade medicinska källor. Appen kan köras med lokal PWA-profil eller serverbaserad databaslogin när DATABASE_URL är satt.";
  $("#sourceList").innerHTML = sources.map((source) => `
    <article class="source-item">
      <strong>${source.title}</strong>
      <span>${source.note}</span>
      <a href="${source.url}" target="_blank" rel="noreferrer">${source.url}</a>
    </article>
  `).join("");
}

function renderCompetitors() {
  const target = $("#competitorMatrix");
  if (!target) return;
  target.innerHTML = competitorInsights.map(({ name, sources: sourceLinks, strength, gap, edge }) => `
    <article>
      <h3>${name}</h3>
      <p><strong>Styrka:</strong> ${strength}</p>
      <p><strong>Lucka:</strong> ${gap}</p>
      <p><strong>Vår kant:</strong> ${edge}</p>
      <div class="competitor-links">
        ${sourceLinks.map(([label, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`).join("")}
      </div>
    </article>
  `).join("");
}

function scoreForDate(key) {
  const entry = state.logs[key];
  if (!entry) return 0;
  const positive = ["walk", "strength", "protein", "veg", "sugarfree", "sleep", "stress"];
  return positive.reduce((sum, id) => sum + (entry.habits && entry.habits[id] ? 1 : 0), 0);
}

function streakDays() {
  let streak = 0;
  for (let i = 0; i < 60; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (scoreForDate(dateKey(d)) >= 4) streak += 1;
    else break;
  }
  return streak;
}

function syncProfileFields() {
  updateSexFocusOptions(state.profile.sex, state.profile.sexFocus);
  Object.entries(state.profile).forEach(([key, value]) => {
    const field = $("#" + key);
    if (field) field.value = value;
  });
}

function numberValue(selector, fallback = 0) {
  const value = Number.parseFloat($(selector).value);
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundToTenth(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : 0;
}

function formatTrend(value, unit) {
  if (!value) return `0 ${unit}`;
  const prefix = value > 0 ? "-" : "+";
  return `${prefix}${Math.abs(value).toFixed(1).replace(".", ",")} ${unit}`;
}
