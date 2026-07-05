const crypto = require("node:crypto");
const {
  assertEmail,
  assertPin,
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
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!bootstrapSecret) {
      res.status(503).json({ message: "ADMIN_BOOTSTRAP_SECRET saknas i Vercel." });
      return;
    }

    const body = await readBody(req);
    const providedSecret = req.headers["x-bootstrap-secret"] || body.secret;
    if (providedSecret !== bootstrapSecret) {
      res.status(403).json({ message: "Fel bootstrap-hemlighet." });
      return;
    }

    await ensureSchema();
    const sql = getSql();
    const email = assertEmail(body.email || process.env.SUPER_ADMIN_EMAIL || "micke@ccorebro.se");
    const name = String(body.name || process.env.SUPER_ADMIN_NAME || "Micke").trim();
    const existing = (await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`)[0];
    const shouldResetPin = !existing || body.resetPin === true;
    const temporaryPin = shouldResetPin ? assertPin(body.pin || randomPin(), 6) : null;
    const passwordHash = temporaryPin ? hashSecret(temporaryPin) : existing.password_hash;
    const id = existing ? existing.id : crypto.randomUUID();

    if (existing) {
      await sql`
        UPDATE users
        SET name = ${name},
            role = 'super_admin',
            status = 'active',
            password_hash = ${passwordHash},
            updated_at = NOW()
        WHERE id = ${existing.id}
      `;
    } else {
      await sql`
        INSERT INTO users (id, email, name, role, status, password_hash)
        VALUES (${id}, ${email}, ${name}, 'super_admin', 'active', ${passwordHash})
      `;
    }

    await insertAudit("admin.bootstrap_super_admin", null, id, { email, resetPin: shouldResetPin });
    const user = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`)[0];
    res.status(200).json({
      user: publicUser(user),
      temporaryPin,
      message: temporaryPin
        ? "Super admin är skapad/uppdaterad. Spara PIN säkert; den visas bara i detta svar."
        : "Super admin finns redan. PIN ändrades inte."
    });
  } catch (error) {
    sendError(res, error);
  }
};

function randomPin() {
  return String(crypto.randomInt(100000, 999999));
}
