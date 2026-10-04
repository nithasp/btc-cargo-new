CREATE TABLE shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_simple BOOLEAN NOT NULL DEFAULT true,
    has_stock BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_products_shop_id ON products(shop_id);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    key VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    has_stock BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

CREATE TABLE product_uploads (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    file TEXT NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'main'
);

CREATE INDEX idx_product_uploads_product_id ON product_uploads(product_id);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    json JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
