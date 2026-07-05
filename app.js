const STORAGE_KEY = "visceral-plan-state-v1";
const USERS_KEY = "visceral-plan-users-v1";
const SESSION_KEY = "visceral-plan-session-v1";
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
    edge: "Vi styr på bukmått, midja/längd och nästa åtgärd."
  },
  {
    name: "Lifesum",
    sources: [["Källa", "https://lifesum.com/"]],
    strength: "AI, foto/röst/streckkod, måltidsplaner och vanepoäng.",
    gap: "Mer bred nutrition än fokuserad bukfettscoach.",
    edge: "Vi gör gram-baserad tallrik och visceralt beslutsrum."
  },
  {
    name: "Cronometer",
    sources: [["Källa", "https://cronometer.com/"]],
    strength: "Djup mikro- och makronäringsdata, rapporter och biometrik.",
    gap: "Kraftfullt men kan bli tungt för användare som vill ha beslut.",
    edge: "Vi förenklar till metabolt index + konkret byte."
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
      ["Nötter och frön", "Näringsrikt men energitätt; bäst som kontrollerad mängd.", "15-30 g"],
      ["Potatis, quinoa, fullkornsris", "Bra kolhydratbas när den äts kokt och portionsstyrd.", "120-220 g kokt"]
    ]
  },
  {
    title: "Frukt",
    items: [
      ["Hallon, blåbär, jordgubbar", "Mycket smak, fiber och volym per energi.", "100-200 g"],
      ["Äpple och päron", "Fiberrikt, bärbart och bra mot sötsug.", "120-180 g"],
      ["Apelsin, grapefrukt, clementin", "Vätska, C-vitamin och tydlig portionsstorlek.", "150-300 g"],
      ["Kiwi", "Fiberrik frukt med mycket C-vitamin.", "75-150 g"],
      ["Plommon, persika, nektarin", "Bra vardagsfrukt när den äts hel.", "100-200 g"],
      ["Banan", "Bra runt träning; något mer energität än bär/citrus.", "100-130 g"],
      ["Mango och druvor", "Näringsrika men lättare att överäta; välj uppmätt portion.", "100-150 g"],
      ["Torkad frukt och juice", "Koncentrerad energi/fritt socker; använd sparsamt.", "0-30 g eller byt mot hel frukt"]
    ]
  },
  {
    title: "Grönsaker",
    items: [
      ["Broccoli, blomkål, vitkål", "Mycket volym, fiber och låg energitäthet.", "150-300 g"],
      ["Spenat, grönkål, ruccola", "Mikronäringsrikt och lätt att lägga till i stora mängder.", "50-150 g"],
      ["Paprika, tomat, gurka", "Fräscht, kalorisnålt och bra för stora tallrikar.", "150-300 g"],
      ["Morot, rödbeta, palsternacka", "Fiberrika rotfrukter; bra ugnsbakade eller kokta.", "120-250 g"],
      ["Svamp, lök, zucchini", "Ger smak och volym utan att energin sticker iväg.", "150-300 g"],
      ["Ärtor och edamame", "Mer protein och fiber än många grönsaker.", "100-200 g"],
      ["Potatis och sötpotatis", "Bra mättnad, men räkna som kolhydratbas.", "120-220 g kokt"],
      ["Avokado", "Bra omättat fett men energitätt; bäst i mindre mängd.", "50-100 g"]
    ]
  }
];

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
  bindMemberMessages();
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
  const sessionId = localStorage.getItem(SESSION_KEY);
  const user = loadUsers().find((item) => item.id === sessionId);
  return user || GUEST_USER;
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
  $("#authForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const rawName = $("#authName").value.trim();
    const pin = $("#authPin").value.trim();
    if (!rawName || pin.length < 4) {
      setAuthMessage("Ange namn/e-post och minst 4 siffror.");
      return;
    }

    const users = loadUsers();
    const id = normalizeUserId(rawName);
    const pinHash = hashPin(pin);
    let user = users.find((item) => item.id === id);

    if (user && user.pinHash !== pinHash) {
      setAuthMessage("Fel PIN för den profilen.");
      return;
    }

    if (!user) {
      user = { id, name: rawName, pinHash, createdAt: new Date().toISOString() };
      users.push(user);
      saveUsers(users);
      setAuthMessage("Ny lokal profil skapad.");
    } else {
      setAuthMessage("Inloggad på lokal profil.");
    }

    switchUser(user);
    $("#authPin").value = "";
  });

  $("#logoutProfile").addEventListener("click", () => {
    switchUser(GUEST_USER);
    setAuthMessage("Gästläge aktivt.");
  });
}

function renderAuth() {
  $("#activeUserLabel").textContent = activeUser.name;
  $("#authName").value = activeUser.guest ? "" : activeUser.name;
}

function setAuthMessage(message) {
  $("#authMessage").textContent = `${message} Data sparas endast på denna enhet.`;
}

function switchUser(user) {
  activeUser = user;
  if (user.guest) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, user.id);
  state = loadState();
  syncProfileFields();
  renderAuth();
  renderAll();
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
  renderMealTemplates();
  renderFoodGuide();
  renderTraining();
  renderWeeklySummary();
  renderMemberHub();
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

function renderSources() {
  $("#videoNote").textContent = "Jag kunde verifiera videons titel, kanal, beskrivning, kapitel och auto-caption-spår. Själva caption-endpointen returnerade tom respons här, så appens sakpåståenden bygger på videons verifierbara metadata och etablerade medicinska källor. Inloggningen är en lokal PWA-profil på denna enhet, inte en serverbaserad journal.";
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

function formatTrend(value, unit) {
  if (!value) return `0 ${unit}`;
  const prefix = value > 0 ? "-" : "+";
  return `${prefix}${Math.abs(value).toFixed(1).replace(".", ",")} ${unit}`;
}
