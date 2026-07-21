const {
  ensureSchema,
  getSql,
  requireSession,
  sendError,
  setNoStore
} = require("../_db");
const {
  connectionFromRow,
  dailyFromRow,
  workoutFromRow
} = require("./_health");

module.exports = async function handler(req, res) {
  setNoStore(res);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Only GET is allowed." });
    return;
  }

  try {
    const user = await requireSession(req);
    await ensureSchema();
    const sql = getSql();
    const [connectionRows, dailyRows, workoutRows] = await Promise.all([
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

    res.status(200).json({
      connection: connectionFromRow(connectionRows[0]),
      daily: dailyRows.map(dailyFromRow),
      workouts: workoutRows.map(workoutFromRow)
    });
  } catch (error) {
    sendError(res, error);
  }
};
