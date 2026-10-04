CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    credit_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (credit_amount >= 0),
    remark TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE UNIQUE INDEX wallets_user_name_active_key ON wallets (user_id, LOWER(name)) WHERE active;

CREATE TABLE sale_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(50) NOT NULL UNIQUE,
    carrier_id INTEGER NOT NULL REFERENCES thai_carriers(id),
    local_delivery_id INTEGER REFERENCES local_deliveries(id),
    delivery_address JSONB NOT NULL,
    invoice_address JSONB NOT NULL,
    delivery_price NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (delivery_price >= 0),
    other_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (other_cost >= 0),
    storage_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (storage_cost >= 0),
    total_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sale_orders_user_id ON sale_orders(user_id);

CREATE TABLE payment_gateways (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(50) NOT NULL UNIQUE,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('delivery', 'payment')),
    gateway_type VARCHAR(20) NOT NULL DEFAULT 'bank' CHECK (gateway_type IN ('bank', 'alipay')),
    account_type VARCHAR(20) CHECK (account_type IN ('detail', 'img')),
    account_name VARCHAR(255),
    account_number VARCHAR(100),
    account_upload_id INTEGER REFERENCES uploads(id) ON DELETE SET NULL,
    alipay_account_id INTEGER REFERENCES alipay_accounts(id),
    description TEXT NOT NULL DEFAULT '',
    state VARCHAR(20) NOT NULL DEFAULT 'wait' CHECK (state IN ('wait', 'paid', 'done', 'cancel')),
    quantity NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    amount_pay NUMERIC(14, 2) NOT NULL CHECK (amount_pay >= 0),
    amount_currency NUMERIC(14, 2) NOT NULL CHECK (amount_currency >= 0),
    credit_used NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (credit_used >= 0),
    rate NUMERIC(12, 4) NOT NULL DEFAULT 1 CHECK (rate > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'THB',
    amount_split JSONB NOT NULL DEFAULT '[]',
    sale_order_id INTEGER REFERENCES sale_orders(id) ON DELETE SET NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_gateways_user_id ON payment_gateways (user_id, id DESC);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payment_gateway_id INTEGER NOT NULL REFERENCES payment_gateways(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    paid_at TIMESTAMPTZ NOT NULL,
    slip_upload_id INTEGER REFERENCES uploads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_payment_gateway_id ON payments(payment_gateway_id);
