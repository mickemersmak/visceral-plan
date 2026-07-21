const {
  ensureSchema,
  getSql,
  insertAudit,
  readBody,
  requireSession,
  sendError,
  setNoStore
} = require("../_db");
const {
  connectionFromRow,
  dailyFromRow,
  normalizeDailySummary,
  normalizeWorkout,
  safeObject,
  toText,
  workoutFromRow
} = require("./_health");

module.exports = async function handler(req, res) {
  setNoStore(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Only POST is allowed." });
    return;
  }

  try {
    const user = await requireSession(req);
    const body = await readBody(req);
    const result = await syncHealthPayload(user, body);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
};

async function syncHealthPayload(user, body) {
  await ensureSchema();
  const sql = getSql();
  const provider = toText(body.provider, "apple-health", 40) || "apple-health";
  if (provider !== "apple-health") {
    const error = new Error("Endast apple-health stöds i första versionen.");
    error.statusCode = 400;
    throw error;
  }

  const device = safeObject(body.device);
  const permissions = safeObject(body.permissions);
  const daily = (Array.isArray(body.daily) ? body.daily : [])
    .map(normalizeDailySummary)
    .filter(Boolean)
    .slice(0, 31);
  const workouts = (Array.isArray(body.workouts) ? body.workouts : [])
    .map(normalizeWorkout)
    .filter(Boolean)
    .slice(0, 50);

  if (!daily.length && !workouts.length) {
    const error = new Error("Synken saknar dagliga värden eller träningspass.");
    error.statusCode = 400;
    throw error;
  }

  await sql`
    INSERT INTO health_connections (user_id, provider, status, device_name, device_model, permissions, last_synced_at, updated_at)
    VALUES (
      ${user.id},
      ${provider},
      'connected',
      ${toText(device.name, "Apple Watch", 80)},
      ${toText(device.model, "", 80) || null},
      ${JSON.stringify(permissions)}::jsonb,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      provider = EXCLUDED.provider,
      status = 'connected',
      device_name = EXCLUDED.device_name,
      device_model = EXCLUDED.device_model,
      permissions = EXCLUDED.permissions,
      last_synced_at = NOW(),
      updated_at = NOW()
  `;

  for (const item of daily) {
    await sql`
      INSERT INTO health_daily_summaries (
        user_id,
        date,
        step_count,
        active_energy_kcal,
        exercise_minutes,
        stand_hours,
        resting_heart_rate_bpm,
        hrv_ms,
        vo2_max_ml_kg_min,
        sleep_minutes,
        mindful_minutes,
        body_mass_kg,
        waist_cm,
        source,
        metadata,
        synced_at
      )
      VALUES (
        ${user.id},
        ${item.date},
        ${item.stepCount},
        ${item.activeEnergyKcal},
        ${item.exerciseMinutes},
        ${item.standHours},
        ${item.restingHeartRateBpm},
        ${item.hrvMs},
        ${item.vo2MaxMlKgMin},
        ${item.sleepMinutes},
        ${item.mindfulMinutes},
        ${item.bodyMassKg},
        ${item.waistCm},
        ${item.source},
        ${JSON.stringify(item.metadata)}::jsonb,
        NOW()
      )
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        step_count = EXCLUDED.step_count,
        active_energy_kcal = EXCLUDED.active_energy_kcal,
        exercise_minutes = EXCLUDED.exercise_minutes,
        stand_hours = EXCLUDED.stand_hours,
        resting_heart_rate_bpm = EXCLUDED.resting_heart_rate_bpm,
        hrv_ms = EXCLUDED.hrv_ms,
        vo2_max_ml_kg_min = EXCLUDED.vo2_max_ml_kg_min,
        sleep_minutes = EXCLUDED.sleep_minutes,
        mindful_minutes = EXCLUDED.mindful_minutes,
        body_mass_kg = EXCLUDED.body_mass_kg,
        waist_cm = EXCLUDED.waist_cm,
        source = EXCLUDED.source,
        metadata = EXCLUDED.metadata,
        synced_at = NOW()
    `;
  }

  for (const workout of workouts) {
    await sql`
      INSERT INTO health_workouts (
        user_id,
        external_id,
        workout_type,
        started_at,
        ended_at,
        duration_minutes,
        active_energy_kcal,
        distance_meters,
        average_heart_rate_bpm,
        max_heart_rate_bpm,
        source_name,
        metadata,
        synced_at
      )
      VALUES (
        ${user.id},
        ${workout.externalId},
        ${workout.workoutType},
        ${workout.startedAt},
        ${workout.endedAt},
        ${workout.durationMinutes},
        ${workout.activeEnergyKcal},
        ${workout.distanceMeters},
        ${workout.averageHeartRateBpm},
        ${workout.maxHeartRateBpm},
        ${workout.sourceName},
        ${JSON.stringify(workout.metadata)}::jsonb,
        NOW()
      )
      ON CONFLICT (user_id, external_id)
      DO UPDATE SET
        workout_type = EXCLUDED.workout_type,
        started_at = EXCLUDED.started_at,
        ended_at = EXCLUDED.ended_at,
        duration_minutes = EXCLUDED.duration_minutes,
        active_energy_kcal = EXCLUDED.active_energy_kcal,
        distance_meters = EXCLUDED.distance_meters,
        average_heart_rate_bpm = EXCLUDED.average_heart_rate_bpm,
        max_heart_rate_bpm = EXCLUDED.max_heart_rate_bpm,
        source_name = EXCLUDED.source_name,
        metadata = EXCLUDED.metadata,
        synced_at = NOW()
    `;
  }

  await insertAudit("health.sync", user.id, user.id, {
    provider,
    daily: daily.length,
    workouts: workouts.length,
    deviceName: toText(device.name, "Apple Watch", 80)
  });

  const [connection, dailyRows, workoutRows] = await Promise.all([
    sql`SELECT * FROM health_connections WHERE user_id = ${user.id} LIMIT 1`,
    sql`
      SELECT *
      FROM health_daily_summaries
      WHERE user_id = ${user.id}
      ORDER BY date DESC
      LIMIT 14
    `,
    sql`
      SELECT *
      FROM health_workouts
      WHERE user_id = ${user.id}
      ORDER BY started_at DESC
      LIMIT 20
    `
  ]);

  return {
    message: "Apple Hälsa-data synkades.",
    synced: {
      daily: daily.length,
      workouts: workouts.length
    },
    connection: connectionFromRow(connection[0]),
    daily: dailyRows.map(dailyFromRow),
    workouts: workoutRows.map(workoutFromRow)
  };
}
