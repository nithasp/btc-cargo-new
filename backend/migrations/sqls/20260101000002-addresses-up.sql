CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    person VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL DEFAULT '',
    is_juristic BOOLEAN NOT NULL DEFAULT false,
    vat VARCHAR(50) NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    district VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

ALTER TABLE users
    ADD COLUMN billing_address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    ADD COLUMN shipping_address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL;
