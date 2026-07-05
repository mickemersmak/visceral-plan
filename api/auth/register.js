const crypto = require("node:crypto");
const {
  assertEmail,
  assertPin,
  createSession,
  ensureSchema,
  getSql,
  hashSecret,
  insertAudit,
  publicUser,
  readBody,
  sendError,
  setNoStore
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
    const name = assertName(body.name, email);
    const pin = assertPin(body.pin, 6);
    const existing = (await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`)[0];

    if (existing) {
      res.status(409).json({ message: "Det finns redan ett konto med den e-postadressen. Logga in istället." });
      return;
    }

    const id = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, name, role, status, password_hash, last_login_at)
      VALUES (${id}, ${email}, ${name}, 'user', 'active', ${hashSecret(pin)}, NOW())
    `;

    const session = await createSession(id);
    await insertAudit("auth.register", id, id, { email });
    const user = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`)[0];

    res.status(201).json({
      user: publicUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
      message: "Kontot är skapat och du är inloggad."
    });
  } catch (error) {
    sendError(res, error);
  }
};

function assertName(name, email) {
  const value = String(name || "").trim();
  if (value.length >= 2) return value.slice(0, 80);
  return email.split("@")[0].slice(0, 80);
}
