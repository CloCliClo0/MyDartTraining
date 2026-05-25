-- ============================================================
-- MyDartTraining — Données de test MySQL
-- ⚠️ Dev uniquement — ne jamais exécuter en production
-- Mots de passe = bcrypt de "password123"
-- ============================================================

-- Utilisateurs de test
INSERT IGNORE INTO users (username, email, password) VALUES
    ('alice', 'alice@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    ('bob',   'bob@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Profils (les lignes stats sont créées automatiquement par le trigger)
INSERT IGNORE INTO profiles (user_id, name, color) VALUES
    (1, 'Alice Main', '#e74c3c'),
    (1, 'Alice Alt',  '#3498db'),
    (2, 'Bob Main',   '#2ecc71');

-- Partie 501 terminée entre Alice Main et Bob Main
INSERT INTO games (mode, status, starting_score, double_out, winner_id, started_at, finished_at)
VALUES (
    '501',
    'finished',
    501,
    1,
    1,
    DATE_SUB(NOW(), INTERVAL 1 HOUR),
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)
);

INSERT IGNORE INTO game_players (game_id, profile_id, turn_order, score_remaining, legs_won) VALUES
    (1, 1, 1, 0,   1),
    (1, 3, 2, 120, 0);

-- Tour 1 — Alice : T20 + T20 + T20 = 180
INSERT INTO rounds (game_id, profile_id, round_number, total_score) VALUES (1, 1, 1, 180);
INSERT IGNORE INTO throws (round_id, dart_number, sector, multiplier, score) VALUES
    (1, 1, 20, 'triple', 60),
    (1, 2, 20, 'triple', 60),
    (1, 3, 20, 'triple', 60);

-- Tour 1 — Bob : T20 + T19 + S20 = 119
INSERT INTO rounds (game_id, profile_id, round_number, total_score) VALUES (1, 3, 1, 119);
INSERT IGNORE INTO throws (round_id, dart_number, sector, multiplier, score) VALUES
    (2, 1, 20, 'triple', 60),
    (2, 2, 19, 'triple', 57),
    (2, 3, 20, 'single',  2);

-- Mise à jour manuelle des stats d'Alice (normalement fait par l'application)
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
