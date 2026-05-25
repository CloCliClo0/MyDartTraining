-- ============================================================
-- MyDartTraining — Seed data (dev only)
-- ============================================================

-- Passwords are bcrypt hashes of "password123"
INSERT INTO users (username, email, password) VALUES
    ('alice',   'alice@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    ('bob',     'bob@example.com',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT DO NOTHING;

INSERT INTO profiles (user_id, name, color) VALUES
    (1, 'Alice Main',  '#e74c3c'),
    (1, 'Alice Alt',   '#3498db'),
    (2, 'Bob Main',    '#2ecc71')
ON CONFLICT DO NOTHING;
