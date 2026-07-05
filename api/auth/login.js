const {
  assertEmail,
  assertPin,
  createSession,
  ensureSchema,
  getSql,
  insertAudit,
  publicUser,
  readBody,
  sendError,
  setNoStore,
  verifySecret
} = require("../_db");

module.exports = async function handler(req, res) {
  setNoStore(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Only POST is allowed." });
    return;
  }

  try {
    await ensureSchema();
    const sql = getSql();
    const body = await readBody(req);
    const email = assertEmail(body.email);
    const pin = assertPin(body.pin, 4);
    const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    const user = rows[0];

    if (!user || user.status !== "active" || !verifySecret(pin, user.password_hash)) {
      res.status(401).json({ message: "Fel e-post eller PIN." });
      return;
    }

    await sql`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ${user.id}`;
    const session = await createSession(user.id);
    await insertAudit("auth.login", user.id, user.id, {});

    res.status(200).json({
      user: publicUser({ ...user, last_login_at: new Date().toISOString() }),
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    sendError(res, error);
  }
};
