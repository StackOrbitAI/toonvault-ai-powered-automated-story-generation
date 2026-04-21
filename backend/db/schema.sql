-- ToonVault Database Schema

-- Users & Roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'reader', -- 'reader', 'creator', 'admin'
    plan VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold'
    avatar_text VARCHAR(2),
    avatar_color TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'warned', 'banned'
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    coins INTEGER DEFAULT 0
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(50),
    cover_icon TEXT,
    cover_bg TEXT,
    author_id INTEGER REFERENCES users(id),
    type VARCHAR(20) DEFAULT 'comic', -- 'comic', 'novel'
    views BIGINT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending', 'live', 'flagged'
    update_day VARCHAR(10),
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Nodes (for interactive stories)
CREATE TABLE IF NOT EXISTS story_nodes (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    content TEXT,
    is_start_node BOOLEAN DEFAULT FALSE
);

-- Node Links
CREATE TABLE IF NOT EXISTS node_links (
    id SERIAL PRIMARY KEY,
    source_node_id INTEGER REFERENCES story_nodes(id) ON DELETE CASCADE,
    target_node_id INTEGER REFERENCES story_nodes(id) ON DELETE CASCADE,
    choice_text TEXT,
    choice_stats INTEGER DEFAULT 0
);

-- Transactions
CREATE TABLE IF NOT EXISTS coin_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2),
    coins INTEGER,
    transaction_type VARCHAR(20), -- 'purchase', 'payout', 'unlock'
    paypal_order_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moderation Flags
CREATE TABLE IF NOT EXISTS mod_flags (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id),
    user_id INTEGER REFERENCES users(id),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT
);

-- Initial Settings
INSERT INTO settings (key, value) VALUES ('paypal_mode', 'sandbox') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('platform_fee', '10') ON CONFLICT (key) DO NOTHING;
