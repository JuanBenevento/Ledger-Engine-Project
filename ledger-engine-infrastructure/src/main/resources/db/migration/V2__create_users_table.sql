-- V2: Create users table with encrypted PII columns
CREATE TABLE users (
    id uuid NOT NULL,
    email_encrypted varchar(1024) NOT NULL,
    phone_encrypted varchar(1024) NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    status varchar(50) NOT NULL,
    version bigint,
    created_at timestamp NOT NULL,
    updated_at timestamp,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email_encrypted),
    CONSTRAINT uk_users_phone UNIQUE (phone_encrypted)
);

-- Index for status queries
CREATE INDEX idx_users_status ON users (status);
