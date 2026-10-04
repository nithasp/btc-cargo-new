import pool from '../database';
import {
  AffiliateMember,
  AffiliateTeam,
  MemberAttribution,
  MemberData,
  PriceMap,
  PriceSet,
} from '../types/affiliate.types';
import { Queryable, Row } from '../types/database.types';
import { requireRow } from '../utils/rows';

const SELECT_TEAM = `SELECT t.*, row_to_json(c) AS costing, row_to_json(s) AS selling
  FROM affiliate_teams t
  JOIN price_sets c ON c.id = t.costing_id
  JOIN price_sets s ON s.id = t.selling_id`;

const SELECT_MEMBER = `SELECT m.*, row_to_json(s) AS selling
  FROM affiliate_members m
  JOIN price_sets s ON s.id = m.selling_id`;

const MEMBER_COLUMNS: [keyof MemberData, string][] = [
  ['affiliateCode', 'affiliate_code'],
  ['name', 'name'],
  ['email', 'email'],
  ['commissionType', 'commission_type'],
  ['referralCode', 'referral_code'],
  ['commissionRate', 'commission_rate'],
  ['btcCode', 'btc_code'],
  ['vat', 'vat'],
  ['phoneNumber', 'phone_number'],
  ['line1', 'line1'],
  ['line2', 'line2'],
];

export class AffiliateRepository {
  async createPriceSet(weight: PriceMap, volume: PriceMap, db: Queryable = pool): Promise<number> {
    const { rows } = await db.query(
      'INSERT INTO price_sets (weight_price, volume_price) VALUES ($1, $2) RETURNING id',
      [JSON.stringify(weight), JSON.stringify(volume)],
    );
    return requireRow(rows, 'INSERT INTO price_sets').id as number;
  }

  async updatePriceSet(id: number, weight: PriceMap, volume: PriceMap, db: Queryable = pool): Promise<void> {
    await db.query('UPDATE price_sets SET weight_price = $1, volume_price = $2 WHERE id = $3', [
      JSON.stringify(weight),
      JSON.stringify(volume),
      id,
    ]);
  }

  async findTeamByOwner(userId: number, db: Queryable = pool): Promise<AffiliateTeam | null> {
    const { rows } = await db.query(`${SELECT_TEAM} WHERE t.owner_user_id = $1`, [userId]);
    return rows[0] ? toTeam(rows[0]) : null;
  }

  async findTeamById(id: number, db: Queryable = pool): Promise<AffiliateTeam | null> {
    const { rows } = await db.query(`${SELECT_TEAM} WHERE t.id = $1`, [id]);
    return rows[0] ? toTeam(rows[0]) : null;
  }

  // ON CONFLICT keeps this safe when two requests of a newly verified affiliate race to create it
  async createTeam(
    team: {
      ownerUserId: number;
      btcCode: string;
      commissionRate: number;
      monthlyGoal: number;
      costingId: number;
      sellingId: number;
    },
    db: Queryable = pool,
  ): Promise<void> {
    await db.query(
      `INSERT INTO affiliate_teams (owner_user_id, btc_code, commission_rate, monthly_goal, costing_id, selling_id)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (owner_user_id) DO NOTHING`,
      [team.ownerUserId, team.btcCode, team.commissionRate, team.monthlyGoal, team.costingId, team.sellingId],
    );
  }

  async listMembers(team: AffiliateTeam, db: Queryable = pool): Promise<AffiliateMember[]> {
    const { rows } = await db.query(`${SELECT_MEMBER} WHERE m.team_id = $1 ORDER BY m.id ASC`, [team.id]);
    return rows.map((row) => toMember(row, team.costing));
  }

  async findMemberSellingId(id: number, teamId: number, db: Queryable = pool): Promise<number | null> {
    const { rows } = await db.query(
      'SELECT selling_id FROM affiliate_members WHERE id = $1 AND team_id = $2',
      [id, teamId],
    );
    return rows[0] ? (rows[0].selling_id as number) : null;
  }

  async createMember(
    teamId: number,
    sellingId: number,
    data: MemberData,
    db: Queryable = pool,
  ): Promise<number> {
    const columns = MEMBER_COLUMNS.map(([, column]) => column);
    const values = MEMBER_COLUMNS.map(([key]) => data[key]);
    const placeholders = values.map((_, index) => `$${index + 3}`);

    const { rows } = await db.query(
      `INSERT INTO affiliate_members (team_id, selling_id, ${columns.join(', ')})
       VALUES ($1, $2, ${placeholders.join(', ')}) RETURNING id`,
      [teamId, sellingId, ...values],
    );
    return requireRow(rows, 'INSERT INTO affiliate_members').id as number;
  }

  async updateMember(id: number, data: MemberData, db: Queryable = pool): Promise<void> {
    const values: unknown[] = [];
    const assignments = MEMBER_COLUMNS.map(([key, column]) => `${column} = $${values.push(data[key])}`);
    await db.query(
      `UPDATE affiliate_members SET ${assignments.join(', ')} WHERE id = $${values.push(id)}`,
      values,
    );
  }

  async attributionByCode(code: string, db: Queryable = pool): Promise<MemberAttribution | null> {
    const { rows } = await db.query(
      `SELECT m.id AS member_id, m.team_id, t.commission_rate,
              (c.weight_price->>'p')::numeric AS cost_price,
              (s.weight_price->>'p')::numeric AS selling_price
       FROM affiliate_members m
       JOIN affiliate_teams t ON t.id = m.team_id
       JOIN price_sets c ON c.id = t.costing_id
       JOIN price_sets s ON s.id = m.selling_id
       WHERE UPPER(m.affiliate_code) = UPPER($1)`,
      [code],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      memberId: row.member_id as number,
      teamId: row.team_id as number,
      commissionRate: row.commission_rate as number,
      costPrice: row.cost_price as number,
      sellingPrice: row.selling_price as number,
    };
  }
}

function toTeam(row: Row): AffiliateTeam {
  return {
    id: row.id as number,
    ownerUserId: row.owner_user_id as number,
    btcCode: row.btc_code as string,
    commissionRate: row.commission_rate as number,
    monthlyGoal: row.monthly_goal as number,
    costing: row.costing as PriceSet,
    selling: row.selling as PriceSet,
  };
}

function toMember(row: Row, costing: PriceSet): AffiliateMember {
  const name = row.name as string;
  const line1 = row.line1 as string;
  return {
    id: row.id as number,
    name,
    affiliate_code: row.affiliate_code as string,
    commission_type: row.commission_type as string,
    referral_code: row.referral_code as string,
    commission_rate: row.commission_rate as number,
    btc_code: row.btc_code as string,
    email: row.email as string,
    vat: row.vat as string,
    affiliate_address: {
      phone_number: row.phone_number as string,
      line1,
      line2: row.line2 as string,
      display_name: [name, line1].filter(Boolean).join(', '),
    },
    selling_id: row.selling as PriceSet,
    costing_id: costing,
  };
}
