-- ============================================================
-- MyDartTraining — Database Schema
-- ============================================================

-- Create database (run as superuser if needed)
-- CREATE DATABASE mydarttraining;

-- Connect to the database before running the rest:
-- \c mydarttraining

-- ============================================================
-- Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL          PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    avatar      VARCHAR(500)    DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id          SERIAL          PRIMARY KEY,
    user_id     INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(50)     NOT NULL,
    color       VARCHAR(7)      NOT NULL DEFAULT '#ffffff',
    avatar      VARCHAR(500)    DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user  ON profiles(user_id);

-- ============================================================
-- Trigger : max 8 profiles per user
-- ============================================================

CREATE OR REPLACE FUNCTION check_max_profiles()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*) FROM profiles WHERE user_id = NEW.user_id
    ) >= 8 THEN
        RAISE EXCEPTION 'A user cannot have more than 8 profiles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_max_profiles ON profiles;
CREATE TRIGGER trg_max_profiles
    BEFORE INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION check_max_profiles();

-- ============================================================
-- Trigger : auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
