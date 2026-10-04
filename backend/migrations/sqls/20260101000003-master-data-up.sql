-- Reference data keeps fixed ids: the frontend hardcodes some of them (delivery type 1,
-- carrier 2 = private express, Alipay account 1), so they are seeded, never generated.
CREATE TABLE delivery_types (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE product_types (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE product_type_delivery_types (
    product_type_id INTEGER NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
    delivery_type_id INTEGER NOT NULL REFERENCES delivery_types(id) ON DELETE CASCADE,
    PRIMARY KEY (product_type_id, delivery_type_id)
);

CREATE TABLE stock_picking_types (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE stock_locations (
    id INTEGER PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL
);

CREATE TABLE shop_types (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE thai_carriers (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE local_deliveries (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    province_codes TEXT[] NOT NULL DEFAULT '{}',
    sub_district_codes TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE alipay_accounts (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    note VARCHAR(255) NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE currency_rates (
    id SERIAL PRIMARY KEY,
    service VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(10) NOT NULL,
    rate NUMERIC(12, 4) NOT NULL CHECK (rate > 0),
    is_online BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
