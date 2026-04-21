-- ToonVault Initial Database Seeding

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'reader',
    plan VARCHAR(20) DEFAULT 'bronze',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(50),
    cover_icon TEXT,
    cover_bg TEXT,
    author_id INTEGER REFERENCES users(id),
    type VARCHAR(20) DEFAULT 'comic',
    views BIGINT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft',
    update_day VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coin_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2),
    transaction_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mod_flags (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id),
    user_id INTEGER REFERENCES users(id),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Mock Data for Dashboard
INSERT INTO users (username, email, password_hash, role, plan) VALUES 
('admin', 'admin@toonvault.com', '$2a$10$xZz...', 'admin', 'gold'),
('moonwriter', 'moon@example.com', '...', 'creator', 'gold'),
('darkveil', 'dark@example.com', '...', 'creator', 'gold');

INSERT INTO stories (title, genre, cover_icon, cover_bg, author_id, type, views, rating, status, update_day) VALUES
('Crimson Throne', 'Romance Fantasy', '💖', '#FDE8F0', 2, 'comic', 28800000, 4.9, 'live', 'Mon'),
('The Shadow Pact', 'Fantasy', '🌙', '#EDE8FA', 3, 'comic', 9800000, 4.8, 'live', 'Mon');

INSERT INTO coin_transactions (user_id, amount, transaction_type) VALUES
(2, 48200.00, 'purchase');

INSERT INTO activity_logs (user_id, action_text) VALUES
(2, 'submitted Crimson Throne Ch. 48 for review'),
(3, 'upgraded to Gold membership');
