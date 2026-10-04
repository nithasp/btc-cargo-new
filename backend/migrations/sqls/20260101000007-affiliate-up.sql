CREATE TABLE verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('partner', 'affiliate')),
    state VARCHAR(20) NOT NULL DEFAULT 'reviewing' CHECK (state IN ('reviewing', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_verifications_user_kind ON verifications (user_id, kind, id DESC);

CREATE TABLE verification_images (
    id SERIAL PRIMARY KEY,
    verification_id INTEGER NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
    upload_id INTEGER NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    image_category VARCHAR(50) NOT NULL
);

CREATE INDEX idx_verification_images_verification_id ON verification_images(verification_id);

CREATE TABLE price_sets (
    id SERIAL PRIMARY KEY,
    weight_price JSONB NOT NULL,
    volume_price JSONB NOT NULL
);

CREATE TABLE affiliate_teams (
    id SERIAL PRIMARY KEY,
    owner_user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    btc_code VARCHAR(50) NOT NULL,
    commission_rate NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (commission_rate BETWEEN 0 AND 100),
    costing_id INTEGER NOT NULL REFERENCES price_sets(id),
    selling_id INTEGER NOT NULL REFERENCES price_sets(id),
    monthly_goal NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (monthly_goal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE affiliate_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES affiliate_teams(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL,
    commission_type VARCHAR(20) NOT NULL DEFAULT 'cost',
    referral_code VARCHAR(50) NOT NULL DEFAULT '',
    commission_rate NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (commission_rate BETWEEN 0 AND 100),
    btc_code VARCHAR(50) NOT NULL DEFAULT '',
    vat VARCHAR(50) NOT NULL DEFAULT '',
    phone_number VARCHAR(50) NOT NULL DEFAULT '',
    line1 TEXT NOT NULL DEFAULT '',
    line2 VARCHAR(10) NOT NULL DEFAULT '',
    selling_id INTEGER NOT NULL REFERENCES price_sets(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliate_members_team_id ON affiliate_members(team_id);
CREATE UNIQUE INDEX affiliate_members_code_key ON affiliate_members (UPPER(affiliate_code));

ALTER TABLE sale_orders
    ADD COLUMN affiliate_team_id INTEGER REFERENCES affiliate_teams(id) ON DELETE SET NULL,
    ADD COLUMN affiliate_member_id INTEGER REFERENCES affiliate_members(id) ON DELETE SET NULL,
    ADD COLUMN cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN affiliate_commission NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (affiliate_commission >= 0),
    ADD COLUMN discount_commission NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (discount_commission >= 0),
    ADD CONSTRAINT sale_orders_discount_within_commission CHECK (discount_commission <= affiliate_commission);

CREATE INDEX idx_sale_orders_affiliate_team_id ON sale_orders (affiliate_team_id, id DESC);
