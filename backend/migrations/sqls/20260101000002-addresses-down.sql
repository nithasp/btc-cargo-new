ALTER TABLE users
    DROP COLUMN shipping_address_id,
    DROP COLUMN billing_address_id;

DROP TABLE addresses;
