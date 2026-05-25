-- ============================================================
-- MyDartTraining — Seed data (dev only)
-- ============================================================
-- Passwords = bcrypt hash of "password123"

INSERT INTO users (username, email, password) VALUES
    ('alice', 'alice@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    ('bob',   'bob@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT DO NOTHING;

-- Profiles (stats rows are auto-created by trigger)
INSERT INTO profiles (user_id, name, color) VALUES
    (1, 'Alice Main', '#e74c3c'),
    (1, 'Alice Alt',  '#3498db'),
    (2, 'Bob Main',   '#2ecc71')
ON CONFLICT DO NOTHING;

-- A finished 501 game between Alice Main (id=1) and Bob Main (id=3)
INSERT INTO games (mode, status, starting_score, double_out, winner_id, started_at, finished_at)
VALUES ('501', 'finished', 501, TRUE, 1, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes');

INSERT INTO game_players (game_id, profile_id, turn_order, score_remaining, legs_won) VALUES
    (1, 1, 1, 0,   1),   -- Alice won
    (1, 3, 2, 120, 0);

-- Round 1 — Alice: T20 + T20 + T20 = 180
INSERT INTO rounds (game_id, profile_id, round_number, total_score) VALUES (1, 1, 1, 180);
INSERT INTO throws (round_id, dart_number, sector, multiplier, score) VALUES
    (1, 1, 20, 'triple', 60),
    (1, 2, 20, 'triple', 60),
    (1, 3, 20, 'triple', 60);

-- Round 1 — Bob: T20 + T19 + S20 = 119
INSERT INTO rounds (game_id, profile_id, round_number, total_score) VALUES (1, 3, 1, 119);
INSERT INTO throws (round_id, dart_number, sector, multiplier, score) VALUES
    (2, 1, 20, 'triple', 60),
    (2, 2, 19, 'triple', 57),
    (2, 3, 20, 'single',  2);

-- Manually update stats for Alice (normally done by the application)
UPDATE stats SET
    games_played        = 1,
    games_won           = 1,
    total_darts_thrown  = 3,
    total_score         = 180,
    avg_per_dart        = 60.00,
    avg_per_round       = 180.00,
    highest_round_score = 180,
    count_180           = 1,
    count_140_plus      = 1
WHERE profile_id = 1;
