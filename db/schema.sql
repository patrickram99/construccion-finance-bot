-- Improved PostgreSQL schema for MVP

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    whatsapp_number TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('gasto','ingreso')),
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PEN',
    category TEXT NOT NULL,
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_period ON transactions(user_id, occurred_at);

-- OTPs
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT otps_expires_after_created CHECK (expires_at > created_at)
);

-- Only one active (unused + unexpired) OTP per user at a time using partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS otps_one_active_per_user
ON otps(user_id)
WHERE used = FALSE AND expires_at > now();

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_otps_user_created ON otps(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_otps_user_expires ON otps(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_otps_user_code ON otps(user_id, code);

-- Drafts
CREATE TABLE IF NOT EXISTS drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT CHECK (type IN ('gasto','ingreso')),
    amount NUMERIC,
    currency TEXT,
    category TEXT,
    description TEXT,
    occurred_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drafts_user_created ON drafts(user_id, created_at);
