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
-- USERS & PROFILES
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

-- Up to 8 profiles per user (enforced by trigger below)
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
-- GAMES
-- ============================================================

-- Supported game modes
CREATE TYPE game_mode AS ENUM ('501', '301', '180', 'cricket', 'around_the_world', 'practice');

-- Overall status of a game
CREATE TYPE game_status AS ENUM ('waiting', 'in_progress', 'finished', 'abandoned');

CREATE TABLE IF NOT EXISTS games (
    id              SERIAL          PRIMARY KEY,
    mode            game_mode       NOT NULL,
    status          game_status     NOT NULL DEFAULT 'waiting',
    -- for x01 modes: starting score (501, 301, 180…)
    starting_score  INTEGER         DEFAULT NULL,
    -- must finish on a double in x01
    double_out      BOOLEAN         NOT NULL DEFAULT TRUE,
    -- must start scoring on a double in x01
    double_in       BOOLEAN         NOT NULL DEFAULT FALSE,
    winner_id       INTEGER         REFERENCES profiles(id) ON DELETE SET NULL,
    started_at      TIMESTAMP       DEFAULT NULL,
    finished_at     TIMESTAMP       DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Players in a game (one row per profile per game)
CREATE TABLE IF NOT EXISTS game_players (
    id              SERIAL          PRIMARY KEY,
    game_id         INTEGER         NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    profile_id      INTEGER         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    turn_order      SMALLINT        NOT NULL,   -- 1 = first to throw
    score_remaining INTEGER         DEFAULT NULL, -- current remaining score (x01)
    legs_won        SMALLINT        NOT NULL DEFAULT 0,
    sets_won        SMALLINT        NOT NULL DEFAULT 0,
    UNIQUE (game_id, profile_id),
    UNIQUE (game_id, turn_order)
);

-- ============================================================
-- ROUNDS & THROWS
-- ============================================================

-- One round = one player's turn (up to 3 darts)
CREATE TABLE IF NOT EXISTS rounds (
    id              SERIAL          PRIMARY KEY,
    game_id         INTEGER         NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    profile_id      INTEGER         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    round_number    SMALLINT        NOT NULL,   -- global round index within the game
    total_score     SMALLINT        NOT NULL DEFAULT 0,
    is_bust         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Multiplier for each dart sector
CREATE TYPE dart_multiplier AS ENUM ('single', 'double', 'triple', 'bull', 'bullseye', 'miss');

-- One throw = one dart
CREATE TABLE IF NOT EXISTS throws (
    id              SERIAL          PRIMARY KEY,
    round_id        INTEGER         NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    dart_number     SMALLINT        NOT NULL CHECK (dart_number BETWEEN 1 AND 3),
    sector          SMALLINT        CHECK (sector BETWEEN 0 AND 20),  -- 0 = bull area
    multiplier      dart_multiplier NOT NULL DEFAULT 'single',
    score           SMALLINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (round_id, dart_number)
);

-- ============================================================
-- STATISTICS (aggregated per profile)
-- ============================================================

CREATE TABLE IF NOT EXISTS stats (
    id                      SERIAL      PRIMARY KEY,
    profile_id              INTEGER     NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

    -- games
    games_played            INTEGER     NOT NULL DEFAULT 0,
    games_won               INTEGER     NOT NULL DEFAULT 0,
    games_abandoned         INTEGER     NOT NULL DEFAULT 0,

    -- scoring
    total_darts_thrown      INTEGER     NOT NULL DEFAULT 0,
    total_score             INTEGER     NOT NULL DEFAULT 0,
    -- average score per dart (total_score / total_darts_thrown)
    avg_per_dart            NUMERIC(6,2) NOT NULL DEFAULT 0,
    -- average score per round (3 darts)
    avg_per_round           NUMERIC(6,2) NOT NULL DEFAULT 0,

    -- best performances
    highest_round_score     SMALLINT    NOT NULL DEFAULT 0,  -- best single round (max 180)
    highest_checkout        SMALLINT    NOT NULL DEFAULT 0,  -- highest finishing score
    count_180               INTEGER     NOT NULL DEFAULT 0,  -- number of 180s hit
    count_100_plus          INTEGER     NOT NULL DEFAULT 0,  -- rounds ≥ 100
    count_140_plus          INTEGER     NOT NULL DEFAULT 0,  -- rounds ≥ 140

    -- checkouts
    checkout_attempts       INTEGER     NOT NULL DEFAULT 0,
    checkout_hits           INTEGER     NOT NULL DEFAULT 0,
    -- checkout_hits / checkout_attempts * 100
    checkout_pct            NUMERIC(5,2) NOT NULL DEFAULT 0,

    -- first 9 darts average (x01 only)
    avg_first_9             NUMERIC(6,2) NOT NULL DEFAULT 0,

    updated_at              TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user        ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_games_status         ON games(status);
CREATE INDEX IF NOT EXISTS idx_game_players_game    ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_profile ON game_players(profile_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game          ON rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_rounds_profile       ON rounds(profile_id);
CREATE INDEX IF NOT EXISTS idx_throws_round         ON throws(round_id);
CREATE INDEX IF NOT EXISTS idx_stats_profile        ON stats(profile_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Max 8 profiles per user
CREATE OR REPLACE FUNCTION check_max_profiles()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM profiles WHERE user_id = NEW.user_id) >= 8 THEN
        RAISE EXCEPTION 'A user cannot have more than 8 profiles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_max_profiles ON profiles;
CREATE TRIGGER trg_max_profiles
    BEFORE INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION check_max_profiles();

-- Auto-create a stats row when a profile is created
CREATE OR REPLACE FUNCTION create_stats_for_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stats (profile_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_stats ON profiles;
CREATE TRIGGER trg_create_stats
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_stats_for_profile();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at    ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_games_updated_at    ON games;
CREATE TRIGGER trg_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_stats_updated_at    ON stats;
CREATE TRIGGER trg_stats_updated_at
    BEFORE UPDATE ON stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
