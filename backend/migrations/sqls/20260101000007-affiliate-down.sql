DROP INDEX idx_sale_orders_affiliate_team_id;

ALTER TABLE sale_orders
    DROP CONSTRAINT sale_orders_discount_within_commission,
    DROP COLUMN discount_commission,
    DROP COLUMN affiliate_commission,
    DROP COLUMN selling_price,
    DROP COLUMN cost_price,
    DROP COLUMN affiliate_member_id,
    DROP COLUMN affiliate_team_id;

DROP TABLE affiliate_members;
DROP TABLE affiliate_teams;
DROP TABLE price_sets;
DROP TABLE verification_images;
DROP TABLE verifications;
