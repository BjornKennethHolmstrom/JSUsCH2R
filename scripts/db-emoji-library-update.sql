-- Drop existing table if needed
DROP TABLE IF EXISTS emoji_libraries;

-- Create emoji_libraries table with proper constraints
CREATE TABLE emoji_libraries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    emojis JSONB NOT NULL,
    visibility VARCHAR(50) DEFAULT 'private',
    shared_with TEXT[] DEFAULT '{}',
    unique_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Add composite unique constraint for user_id and name
    CONSTRAINT unique_user_library UNIQUE (user_id, name)
);
