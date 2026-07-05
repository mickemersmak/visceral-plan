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
  requireSession,
  sendError,
  setNoStore
} = require("../_db");

const ADMIN_ROLES = ["admin", "super_admin"];
const VALID_ROLES = ["user", "admin", "super_admin"];
const VALID_STATUSES = ["active", "paused"];

module.exports = async function handler(req, res) {
  setNoStore(res);

  try {
    const actor = await requireSession(req, ADMIN_ROLES);
    if (req.method === "GET") {
      await listUsers(res);
      return;
    }
    if (req.method === "POST") {
      await createOrUpdateUser(req, res, actor);
      return;
    }
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ message: "Only GET and POST are allowed." });
  } catch (error) {
    sendError(res, error);
  }
};

async function listUsers(res) {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, name, role, status, created_at, updated_at, last_login_at
    FROM users
    ORDER BY
      CASE role WHEN 'super_admin' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END,
      created_at DESC
  `;
  res.status(200).json({ users: rows.map(publicUser) });
}

async function createOrUpdateUser(req, res, actor) {
  await ensureSchema();
  const sql = getSql();
  const body = await readBody(req);
  const email = assertEmail(body.email);
  const name = String(body.name || email).trim();
  const requestedRole = VALID_ROLES.includes(body.role) ? body.role : "user";
  const role = actor.role === "super_admin" ? requestedRole : "user";
  const status = VALID_STATUSES.includes(body.status) ? body.status : "active";
  const existing = (await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`)[0];
  const temporaryPin = body.pin ? assertPin(body.pin, 6) : randomPin();
  const passwordHash = hashSecret(temporaryPin);

  let id = existing && existing.id;
  if (existing) {
    id = existing.id;
    const nextRole = existing.role === "super_admin" && actor.role !== "super_admin" ? existing.role : role;
    await sql`
      UPDATE users
      SET name = ${name},
          role = ${nextRole},
          status = ${status},
          password_hash = ${passwordHash},
          updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    id = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, name, role, status, password_hash)
      VALUES (${id}, ${email}, ${name}, ${role}, ${status}, ${passwordHash})
    `;
  }

  await insertAudit(existing ? "admin.update_user" : "admin.create_user", actor.id, id, { email, role, status });
  const user = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`)[0];
  res.status(existing ? 200 : 201).json({
    user: publicUser(user),
    temporaryPin,
    message: existing
      ? "Användaren uppdaterades och fick ny PIN."
      : "Användaren skapades. Spara PIN säkert; den visas bara nu."
  });
}

function randomPin() {
  return String(crypto.randomInt(100000, 999999));
}
