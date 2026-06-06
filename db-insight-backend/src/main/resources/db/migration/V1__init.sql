CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(64)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_users_username_lower ON users (LOWER(username));

CREATE TABLE db_connections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(128) NOT NULL,
    db_type     VARCHAR(16)  NOT NULL,
    host        VARCHAR(255) NOT NULL,
    port        INT          NOT NULL,
    db_username VARCHAR(128) NOT NULL,
    db_password VARCHAR(255) NOT NULL,
    database    VARCHAR(128) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_db_conn_user ON db_connections (user_id);
CREATE UNIQUE INDEX idx_db_conn_user_name ON db_connections (user_id, name);
