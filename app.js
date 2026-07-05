const STORAGE_KEY = "visceral-plan-state-v1";

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
    note: "Midjemått över 35 tum för kvinnor eller 40 tum för män ökar risk; 3-5 procent viktminskning kan förbättra riskmarkörer.",
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
    foodMode: "med"
  },
  habits: {},
  logs: {}
};

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
    ["Mellanmål", "Kvarg/yoghurt, frukt, morötter, kokt ägg eller en liten näve nötter."]
  ],
  dash: [
    ["Frukost", "Havregryn, bär, naturell yoghurt och frön. Vatten, kaffe eller te utan socker."],
    ["Lunch", "Grönsaker, baljväxter, fullkorn och magert protein. Välj låg natriumhalt när det går."],
    ["Middag", "Fisk, kyckling eller bönor med mycket grönt. Smaksätt med örter, citron, vitlök och peppar."],
    ["Mellanmål", "Frukt, osaltade nötter, grönsaksstavar eller naturell yoghurt."]
  ],
  simple: [
    ["Frukost", "Protein + fiber: ägg och rågbröd, yoghurt och bär, eller havre med mjölk."],
    ["Lunch", "Tallrik: 2 nävar grönt, 1 handflata protein, 1 knytnäve långsamma kolhydrater."],
    ["Middag", "Bygg från frys och basvaror: wokgrönt, bönor, tonfisk/kyckling/tofu, ris/potatis."],
    ["Mellanmål", "Planerat mellanmål före hunger: frukt + protein eller grönsaker + hummus."]
  ]
};

const foodTargets = [
  ["1", "Minimalt processat först", "Basera veckan på råvaror, baljväxter, fullkorn, fisk, ägg, magra mejerier, nötter, frukt och grönsaker."],
  ["2", "Fritt socker ned", "Välj vatten, kaffe eller te utan socker. Juice och läsk räknas som sockerkälla i praktiken."],
  ["3", "Fiber varje mål", "Sikta på grönt, baljväxter eller fullkorn vid varje huvudmål. WHO anger minst 25 g fiber per dag för personer över 10 år."],
  ["4", "Protein jämnt fördelat", "Lägg en tydlig proteinkälla i varje huvudmål för mättnad och muskelbevarande träningseffekt."],
  ["5", "Alkohol med friktion", "Planera alkoholfria dagar. Alkohol kan bidra med mycket energi och påverka leverns fettomsättning."],
  ["6", "Sömn och stress", "Sömnbrist och kronisk stress gör planen svårare att följa och kan påverka bukfettsinlagring."]
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

let state = loadState();
let timer = {
  presetName: "Intervall start",
  index: 0,
  remaining: 0,
  running: false,
  intervalId: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  setToday();
  bindTabs();
  bindProfile();
  bindLog();
  bindTimer();
  renderAll();
});

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored ? mergeState(defaultState, stored) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, next) {
  return {
    profile: { ...base.profile, ...(next.profile || {}) },
    habits: { ...base.habits, ...(next.habits || {}) },
    logs: { ...base.logs, ...(next.logs || {}) }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
      const tab = button.dataset.tab;
      $$(".tab").forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-selected", item === button ? "true" : "false");
      });
      $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === tab));
    });
  });
}

function bindProfile() {
  const profile = state.profile;
  Object.entries(profile).forEach(([key, value]) => {
    const field = $("#" + key);
    if (field) field.value = value;
  });

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
      foodMode: $("#foodMode").value
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
  renderMetrics();
  renderPriorities();
  renderPlan();
  renderNutrition();
  renderTraining();
  renderWeeklySummary();
  renderSources();
  loadLogForDate();
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
      renderMetrics();
      loadLogForDate();
    });
  });
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

function renderTraining() {
  const workouts = workoutLibrary[state.profile.level];
  $("#workoutList").innerHTML = workouts.map((workout) => `
    <article class="workout-card">
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
}

function renderSources() {
  $("#videoNote").textContent = "Jag kunde verifiera videons titel, kanal, beskrivning, kapitel och auto-caption-spår. Själva caption-endpointen returnerade tom respons här, så appens sakpåståenden bygger på videons verifierbara metadata och etablerade medicinska källor.";
  $("#sourceList").innerHTML = sources.map((source) => `
    <article class="source-item">
      <strong>${source.title}</strong>
      <span>${source.note}</span>
      <a href="${source.url}" target="_blank" rel="noreferrer">${source.url}</a>
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
  Object.entries(state.profile).forEach(([key, value]) => {
    const field = $("#" + key);
    if (field) field.value = value;
  });
}

function numberValue(selector, fallback = 0) {
  const value = Number.parseFloat($(selector).value);
  return Number.isFinite(value) ? value : fallback;
}

function formatTrend(value, unit) {
  if (!value) return `0 ${unit}`;
  const prefix = value > 0 ? "-" : "+";
  return `${prefix}${Math.abs(value).toFixed(1).replace(".", ",")} ${unit}`;
}
