-- ============================================================
-- MyDartTraining — Drop all (dev reset)
-- ============================================================

DROP TRIGGER IF EXISTS trg_stats_updated_at    ON stats;
DROP TRIGGER IF EXISTS trg_games_updated_at    ON games;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS trg_users_updated_at    ON users;
DROP TRIGGER IF EXISTS trg_create_stats        ON profiles;
DROP TRIGGER IF EXISTS trg_max_profiles        ON profiles;

DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS create_stats_for_profile();
DROP FUNCTION IF EXISTS check_max_profiles();

DROP TABLE IF EXISTS stats;
DROP TABLE IF EXISTS throws;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS dart_multiplier;
DROP TYPE IF EXISTS game_status;
DROP TYPE IF EXISTS game_mode;
