function toNumber(value, min = 0, max = 100000) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(max, Math.max(min, number));
}

function toInteger(value, min = 0, max = 100000) {
  const number = toNumber(value, min, max);
  return number === null ? null : Math.round(number);
}

function toText(value, fallback = "", maxLength = 120) {
  const text = String(value || fallback).trim();
  return text.slice(0, maxLength);
}

function toDateKey(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toIsoDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function normalizeDailySummary(item) {
  const date = toDateKey(item && item.date);
  if (!date) return null;
  return {
    date,
    stepCount: toInteger(item.stepCount, 0, 100000),
    activeEnergyKcal: toNumber(item.activeEnergyKcal, 0, 10000),
    exerciseMinutes: toNumber(item.exerciseMinutes, 0, 1440),
    standHours: toNumber(item.standHours, 0, 24),
    restingHeartRateBpm: toNumber(item.restingHeartRateBpm, 20, 220),
    hrvMs: toNumber(item.hrvMs, 1, 300),
    vo2MaxMlKgMin: toNumber(item.vo2MaxMlKgMin, 5, 100),
    sleepMinutes: toNumber(item.sleepMinutes, 0, 1440),
    mindfulMinutes: toNumber(item.mindfulMinutes, 0, 1440),
    bodyMassKg: toNumber(item.bodyMassKg, 20, 400),
    waistCm: toNumber(item.waistCm, 40, 220),
    source: toText(item.source, "apple-health", 40),
    metadata: safeObject(item.metadata)
  };
}

function normalizeWorkout(item) {
  const startedAt = toIsoDate(item && item.startedAt);
  if (!startedAt) return null;
  const externalId = toText(item.externalId || item.id || `${startedAt}-${item.workoutType || item.type}`, "", 120);
  if (!externalId) return null;
  return {
    externalId,
    workoutType: toText(item.workoutType || item.type, "other", 60),
    startedAt,
    endedAt: toIsoDate(item.endedAt) || null,
    durationMinutes: toNumber(item.durationMinutes, 0, 1440),
    activeEnergyKcal: toNumber(item.activeEnergyKcal, 0, 10000),
    distanceMeters: toNumber(item.distanceMeters, 0, 500000),
    averageHeartRateBpm: toNumber(item.averageHeartRateBpm, 20, 240),
    maxHeartRateBpm: toNumber(item.maxHeartRateBpm, 20, 260),
    sourceName: toText(item.sourceName, "Apple Watch", 80),
    metadata: safeObject(item.metadata)
  };
}

function safeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function connectionFromRow(row) {
  if (!row) return null;
  return {
    provider: row.provider,
    status: row.status,
    deviceName: row.device_name || "",
    deviceModel: row.device_model || "",
    permissions: row.permissions || {},
    lastSyncedAt: row.last_synced_at,
    updatedAt: row.updated_at
  };
}

function dailyFromRow(row) {
  return {
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10),
    stepCount: numberOrNull(row.step_count),
    activeEnergyKcal: numberOrNull(row.active_energy_kcal),
    exerciseMinutes: numberOrNull(row.exercise_minutes),
    standHours: numberOrNull(row.stand_hours),
    restingHeartRateBpm: numberOrNull(row.resting_heart_rate_bpm),
    hrvMs: numberOrNull(row.hrv_ms),
    vo2MaxMlKgMin: numberOrNull(row.vo2_max_ml_kg_min),
    sleepMinutes: numberOrNull(row.sleep_minutes),
    mindfulMinutes: numberOrNull(row.mindful_minutes),
    bodyMassKg: numberOrNull(row.body_mass_kg),
    waistCm: numberOrNull(row.waist_cm),
    source: row.source || "apple-health",
    syncedAt: row.synced_at
  };
}

function workoutFromRow(row) {
  return {
    externalId: row.external_id,
    workoutType: row.workout_type,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMinutes: numberOrNull(row.duration_minutes),
    activeEnergyKcal: numberOrNull(row.active_energy_kcal),
    distanceMeters: numberOrNull(row.distance_meters),
    averageHeartRateBpm: numberOrNull(row.average_heart_rate_bpm),
    maxHeartRateBpm: numberOrNull(row.max_heart_rate_bpm),
    sourceName: row.source_name || "Apple Watch",
    syncedAt: row.synced_at
  };
}

function numberOrNull(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

module.exports = {
  connectionFromRow,
  dailyFromRow,
  normalizeDailySummary,
  normalizeWorkout,
  safeObject,
  toText,
  workoutFromRow
};
