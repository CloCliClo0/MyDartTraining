-- ============================================================
-- MyDartTraining — Drop all tables (dev reset)
-- ============================================================

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS trg_users_updated_at    ON users;
DROP TRIGGER IF EXISTS trg_max_profiles        ON profiles;

DROP FUNCTION IF EXISTS check_max_profiles();
DROP FUNCTION IF EXISTS update_updated_at();

DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;
