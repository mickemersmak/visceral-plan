const crypto = require("node:crypto");
const { neon } = require("@neondatabase/serverless");

const SESSION_DAYS = 30;
let cachedSql = null;
let schemaReady = false;
let schemaPromise = null;

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const error = new Error("DATABASE_URL saknas.");
    error.statusCode = 503;
    throw error;
  }
  if (!cachedSql) cachedSql = neon(connectionString);
  return cachedSql;
}

async function ensureSchema() {
  if (schemaReady) return;
  if (!schemaPromise) {
    schemaPromise = retryEnsureSchema(0)
      .then(() => {
        schemaReady = true;
      })
      .catch((error) => {
        schemaPromise = null;
        throw error;
      });
  }
  return schemaPromise;
}

async function retryEnsureSchema(attempt) {
  try {
    await ensureSchemaInternal();
  } catch (error) {
    if (attempt < 2 && isConcurrentSchemaError(error)) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      await retryEnsureSchema(attempt + 1);
      return;
    }
    throw error;
  }
}

function isConcurrentSchemaError(error) {
  return /duplicate key value violates unique constraint|already exists/i.test(error && error.message || "");
}

async function ensureSchemaInternal() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      password_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      last_seen_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      action TEXT NOT NULL,
      target_user_id TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS health_connections (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL DEFAULT 'apple-health',
      status TEXT NOT NULL DEFAULT 'connected',
      device_name TEXT,
      device_model TEXT,
      permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
      last_synced_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS health_daily_summaries (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      step_count INTEGER,
      active_energy_kcal NUMERIC,
      exercise_minutes NUMERIC,
      stand_hours NUMERIC,
      resting_heart_rate_bpm NUMERIC,
      hrv_ms NUMERIC,
      vo2_max_ml_kg_min NUMERIC,
      sleep_minutes NUMERIC,
      mindful_minutes NUMERIC,
      body_mass_kg NUMERIC,
      waist_cm NUMERIC,
      source TEXT NOT NULL DEFAULT 'apple-health',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, date)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS health_workouts (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      external_id TEXT NOT NULL,
      workout_type TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL,
      ended_at TIMESTAMPTZ,
      duration_minutes NUMERIC,
      active_energy_kcal NUMERIC,
      distance_meters NUMERIC,
      average_heart_rate_bpm NUMERIC,
      max_heart_rate_bpm NUMERIC,
      source_name TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, external_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_health_daily_user_date ON health_daily_summaries(user_id, date DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_health_workouts_user_started ON health_workouts(user_id, started_at DESC)`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at
  };
}

function assertEmail(email) {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    const error = new Error("Ange en giltig e-postadress.");
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

function assertPin(pin, minLength = 6) {
  const value = String(pin || "").trim();
  if (value.length < minLength) {
    const error = new Error(`PIN/lösenord måste vara minst ${minLength} tecken.`);
    error.statusCode = 400;
    throw error;
  }
  return value;
}

function hashSecret(secret) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 160000;
  const hash = crypto.pbkdf2Sync(String(secret), salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

function verifySecret(secret, storedHash) {
  if (!storedHash) return false;
  const [scheme, iterationsText, salt, expected] = String(storedHash).split("$");
  if (scheme !== "pbkdf2" || !iterationsText || !salt || !expected) return false;
  const iterations = Number.parseInt(iterationsText, 10);
  const actual = crypto.pbkdf2Sync(String(secret), salt, iterations, 32, "sha256").toString("hex");
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

async function createSession(userId) {
  const sql = getSql();
  const token = crypto.randomBytes(32).toString("hex");
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await sql`
    INSERT INTO sessions (id, user_id, token_hash, expires_at)
    VALUES (${sessionId}, ${userId}, ${tokenHash(token)}, ${expiresAt})
  `;
  return { token, expiresAt };
}

async function requireSession(req, allowedRoles = []) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    const error = new Error("Saknar inloggning.");
    error.statusCode = 401;
    throw error;
  }
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT users.*
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ${tokenHash(token)}
      AND sessions.expires_at > NOW()
      AND users.status = 'active'
    LIMIT 1
  `;
  const user = rows[0];
  if (!user) {
    const error = new Error("Sessionen är ogiltig eller har gått ut.");
    error.statusCode = 401;
    throw error;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    const error = new Error("Du saknar behörighet.");
    error.statusCode = 403;
    throw error;
  }
  await sql`UPDATE sessions SET last_seen_at = NOW() WHERE token_hash = ${tokenHash(token)}`;
  return user;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Requesten är för stor."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendError(res, error) {
  const status = error.statusCode || 500;
  res.status(status).json({
    message: error.message || "Serverfel."
  });
}

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

async function insertAudit(action, actorUserId, targetUserId, metadata = {}) {
  const sql = getSql();
  await sql`
    INSERT INTO audit_logs (id, actor_user_id, action, target_user_id, metadata)
    VALUES (${crypto.randomUUID()}, ${actorUserId || null}, ${action}, ${targetUserId || null}, ${JSON.stringify(metadata)}::jsonb)
  `;
}

module.exports = {
  assertEmail,
  assertPin,
  createSession,
  ensureSchema,
  getSql,
  hashSecret,
  insertAudit,
  normalizeEmail,
  publicUser,
  readBody,
  requireSession,
  sendError,
  setNoStore,
  verifySecret
};
