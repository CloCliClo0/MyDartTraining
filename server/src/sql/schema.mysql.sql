-- ============================================================
-- MyDartTraining — Schéma MySQL (Hostinger)
-- Converti depuis PostgreSQL
-- ============================================================

-- Créer et sélectionner la base (adapter le nom selon Hostinger)
-- CREATE DATABASE IF NOT EXISTS mydarttraining CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE mydarttraining;

-- ============================================================
-- DÉSACTIVER LES VÉRIFICATIONS FK PENDANT L'IMPORT
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- NETTOYAGE (si ré-exécuté)
-- ============================================================
DROP TABLE IF EXISTS stats;
DROP TABLE IF EXISTS throws;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id          INT             NOT NULL AUTO_INCREMENT,
    username    VARCHAR(50)     NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    password    VARCHAR(255)    DEFAULT NULL,           -- NULL pour les comptes Google OAuth
    google_id   VARCHAR(255)    DEFAULT NULL,
    avatar      VARCHAR(500)    DEFAULT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROFILES (max 8 par user, vérifié par trigger)
-- ============================================================
CREATE TABLE profiles (
    id          INT             NOT NULL AUTO_INCREMENT,
    user_id     INT             NOT NULL,
    name        VARCHAR(50)     NOT NULL,
    color       VARCHAR(7)      NOT NULL DEFAULT '#ffffff',
    avatar      VARCHAR(500)    DEFAULT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- GAMES
-- ============================================================
CREATE TABLE games (
    id              INT             NOT NULL AUTO_INCREMENT,
    mode            ENUM('501','301','180','cricket','around_the_world','practice') NOT NULL,
    status          ENUM('waiting','in_progress','finished','abandoned') NOT NULL DEFAULT 'waiting',
    starting_score  INT             DEFAULT NULL,
    double_out      TINYINT(1)      NOT NULL DEFAULT 1,
    double_in       TINYINT(1)      NOT NULL DEFAULT 0,
    winner_id       INT             DEFAULT NULL,
    started_at      DATETIME        DEFAULT NULL,
    finished_at     DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_games_winner FOREIGN KEY (winner_id) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- GAME_PLAYERS
-- ============================================================
CREATE TABLE game_players (
    id              INT             NOT NULL AUTO_INCREMENT,
    game_id         INT             NOT NULL,
    profile_id      INT             NOT NULL,
    turn_order      SMALLINT        NOT NULL,
    score_remaining INT             DEFAULT NULL,
    legs_won        SMALLINT        NOT NULL DEFAULT 0,
    sets_won        SMALLINT        NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_gp_game_profile (game_id, profile_id),
    UNIQUE KEY uq_gp_game_turn (game_id, turn_order),
    CONSTRAINT fk_gp_game    FOREIGN KEY (game_id)    REFERENCES games(id)    ON DELETE CASCADE,
    CONSTRAINT fk_gp_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ROUNDS
-- ============================================================
CREATE TABLE rounds (
    id              INT             NOT NULL AUTO_INCREMENT,
    game_id         INT             NOT NULL,
    profile_id      INT             NOT NULL,
    round_number    SMALLINT        NOT NULL,
    total_score     SMALLINT        NOT NULL DEFAULT 0,
    is_bust         TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_rounds_game    FOREIGN KEY (game_id)    REFERENCES games(id)    ON DELETE CASCADE,
    CONSTRAINT fk_rounds_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- THROWS
-- ============================================================
CREATE TABLE throws (
    id              INT             NOT NULL AUTO_INCREMENT,
    round_id        INT             NOT NULL,
    dart_number     SMALLINT        NOT NULL,
    sector          SMALLINT        DEFAULT NULL,
    multiplier      ENUM('single','double','triple','bull','bullseye','miss') NOT NULL DEFAULT 'single',
    score           SMALLINT        NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_throws_round_dart (round_id, dart_number),
    CONSTRAINT chk_dart_number CHECK (dart_number BETWEEN 1 AND 3),
    CONSTRAINT chk_sector      CHECK (sector IS NULL OR sector BETWEEN 0 AND 20),
    CONSTRAINT fk_throws_round FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- STATS (une ligne par profil, créée automatiquement par trigger)
-- ============================================================
CREATE TABLE stats (
    id                      INT             NOT NULL AUTO_INCREMENT,
    profile_id              INT             NOT NULL,
    games_played            INT             NOT NULL DEFAULT 0,
    games_won               INT             NOT NULL DEFAULT 0,
    games_abandoned         INT             NOT NULL DEFAULT 0,
    total_darts_thrown      INT             NOT NULL DEFAULT 0,
    total_score             INT             NOT NULL DEFAULT 0,
    avg_per_dart            DECIMAL(6,2)    NOT NULL DEFAULT 0.00,
    avg_per_round           DECIMAL(6,2)    NOT NULL DEFAULT 0.00,
    highest_round_score     SMALLINT        NOT NULL DEFAULT 0,
    highest_checkout        SMALLINT        NOT NULL DEFAULT 0,
    count_180               INT             NOT NULL DEFAULT 0,
    count_100_plus          INT             NOT NULL DEFAULT 0,
    count_140_plus          INT             NOT NULL DEFAULT 0,
    checkout_attempts       INT             NOT NULL DEFAULT 0,
    checkout_hits           INT             NOT NULL DEFAULT 0,
    checkout_pct            DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    avg_first_9             DECIMAL(6,2)    NOT NULL DEFAULT 0.00,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_stats_profile (profile_id),
    CONSTRAINT fk_stats_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES SUPPLÉMENTAIRES
-- ============================================================
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_profiles_user        ON profiles(user_id);
CREATE INDEX idx_games_status         ON games(status);
CREATE INDEX idx_game_players_game    ON game_players(game_id);
CREATE INDEX idx_game_players_profile ON game_players(profile_id);
CREATE INDEX idx_rounds_game          ON rounds(game_id);
CREATE INDEX idx_rounds_profile       ON rounds(profile_id);
CREATE INDEX idx_throws_round         ON throws(round_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1 : limite de 8 profils par utilisateur
DELIMITER //
CREATE TRIGGER trg_max_profiles
BEFORE INSERT ON profiles
FOR EACH ROW
BEGIN
    DECLARE profile_count INT;
    SELECT COUNT(*) INTO profile_count FROM profiles WHERE user_id = NEW.user_id;
    IF profile_count >= 8 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Un utilisateur ne peut pas avoir plus de 8 profils';
    END IF;
END//
DELIMITER ;

-- Trigger 2 : création automatique d'une ligne stats pour chaque nouveau profil
DELIMITER //
CREATE TRIGGER trg_create_stats
AFTER INSERT ON profiles
FOR EACH ROW
BEGIN
    INSERT INTO stats (profile_id) VALUES (NEW.id);
END//
DELIMITER ;

-- ============================================================
-- RÉACTIVER LES VÉRIFICATIONS FK
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
