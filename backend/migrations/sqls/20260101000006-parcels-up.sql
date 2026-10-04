CREATE TABLE lots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    shopping_serial VARCHAR(100) NOT NULL,
    shipping_lot VARCHAR(50),
    shipping_lot_sequence INTEGER,
    po_number VARCHAR(50),
    packing_type VARCHAR(20) NOT NULL DEFAULT 'no' CHECK (packing_type IN ('no', 'normal', 'solid')),
    product_type_id INTEGER REFERENCES product_types(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    weight NUMERIC(10, 2) NOT NULL DEFAULT 0,
    width NUMERIC(10, 1) NOT NULL DEFAULT 0,
    depth NUMERIC(10, 1) NOT NULL DEFAULT 0,
    height NUMERIC(10, 1) NOT NULL DEFAULT 0,
    volume NUMERIC(12, 4) NOT NULL DEFAULT 0,
    total_weight NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_volume NUMERIC(12, 4) NOT NULL DEFAULT 0,
    delivery_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (delivery_cost >= 0),
    packing_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (packing_cost >= 0),
    qc_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (qc_cost >= 0),
    extra_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (extra_cost >= 0),
    other_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (other_cost >= 0),
    th_other_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (th_other_cost >= 0),
    storage_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (storage_cost >= 0),
    total_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
    counting_note TEXT NOT NULL DEFAULT '',
    remarks TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    product_image TEXT,
    current_location_id INTEGER NOT NULL REFERENCES stock_locations(id),
    cn_checkin TIMESTAMPTZ,
    cn_checkout TIMESTAMPTZ,
    th_expected_checkin TIMESTAMPTZ,
    th_checkin TIMESTAMPTZ,
    th_checkout TIMESTAMPTZ,
    confirm_state VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (confirm_state IN ('none', 'pending', 'submitted')),
    po_upload_id INTEGER REFERENCES uploads(id) ON DELETE SET NULL,
    sale_order_id INTEGER REFERENCES sale_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lots_user_id ON lots(user_id);
CREATE INDEX idx_lots_sale_order_id ON lots(sale_order_id);

CREATE TABLE china_trackings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shopping_serial VARCHAR(100) NOT NULL,
    delivery_type_id INTEGER NOT NULL REFERENCES delivery_types(id),
    shipping_with_box VARCHAR(20) NOT NULL DEFAULT 'no' CHECK (shipping_with_box IN ('no', 'normal', 'solid')),
    qc BOOLEAN NOT NULL DEFAULT false,
    required_picture BOOLEAN NOT NULL DEFAULT false,
    remarks TEXT NOT NULL DEFAULT '',
    lot_id INTEGER UNIQUE REFERENCES lots(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_china_trackings_user_id ON china_trackings (user_id, id DESC);
CREATE UNIQUE INDEX china_trackings_serial_key ON china_trackings (UPPER(shopping_serial));
