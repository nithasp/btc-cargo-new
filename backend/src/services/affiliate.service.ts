import { withTransaction } from '../database';
import { MemberInput } from '../schemas/affiliate.schema';
import { AffiliateTeam, MemberData, PriceMap, TeamView } from '../types/affiliate.types';
import { AffiliateServiceDeps } from '../types/service.types';
import { CreatedVerification, VerificationState } from '../types/verification.types';
import { notFound } from '../utils/errors';

export const STANDARD_WEIGHT_PRICE: PriceMap = { p: 25, d: 40, hy: 70, m: 180, sp: 20, sd: 35 };
export const STANDARD_VOLUME_PRICE: PriceMap = { p: 6200, d: 7200, hy: 10500, m: 18000, sp: 4000, sd: 6000 };

const DEFAULT_COMMISSION_RATE = 5;
const DEFAULT_MONTHLY_GOAL = 10000;

export const btcCodeFor = (userId: number): string => `BTC${1000 + userId}`;

export function createAffiliateService({ affiliates, verification }: AffiliateServiceDeps) {
  async function ensureTeam(userId: number): Promise<AffiliateTeam> {
    const existing = await affiliates.findTeamByOwner(userId);
    if (existing) return existing;

    await withTransaction(async (tx) => {
      const costingId = await affiliates.createPriceSet(STANDARD_WEIGHT_PRICE, STANDARD_VOLUME_PRICE, tx);
      const sellingId = await affiliates.createPriceSet(STANDARD_WEIGHT_PRICE, STANDARD_VOLUME_PRICE, tx);
      await affiliates.createTeam(
        {
          ownerUserId: userId,
          btcCode: btcCodeFor(userId),
          commissionRate: DEFAULT_COMMISSION_RATE,
          monthlyGoal: DEFAULT_MONTHLY_GOAL,
          costingId,
          sellingId,
        },
        tx,
      );
    });

    const team = await affiliates.findTeamByOwner(userId);
    if (!team) throw new Error('[affiliate] the team could not be created');
    return team;
  }

  // Every agent-management route goes through here: a verified affiliate, and only its own team (OWASP API5)
  async function requireTeam(userId: number): Promise<AffiliateTeam> {
    await verification.requireVerified(userId, 'affiliate');
    return ensureTeam(userId);
  }

  return {
    requireTeam,

    async me(
      userId: number,
    ): Promise<{ type: string; verification_state: VerificationState; team_id: number | null }> {
      const state = await verification.state(userId, 'affiliate');
      const team = state === 'verified' ? await ensureTeam(userId) : null;
      return { type: team ? 'agent' : 'customer', verification_state: state, team_id: team?.id ?? null };
    },

    async team(userId: number): Promise<TeamView> {
      const team = await requireTeam(userId);
      return {
        team_setting: {
          id: team.id,
          btc_code: team.btcCode,
          commission_rate: team.commissionRate,
          selling_id: team.selling,
          costing_id: team.costing,
        },
        team_members: await affiliates.listMembers(team),
      };
    },

    submitVerification(userId: number, uploadUrl: string, consentUrl: string): Promise<CreatedVerification> {
      return verification.submit(userId, 'affiliate', [
        { url: uploadUrl, category: 'id_card' },
        { url: consentUrl, category: 'consent' },
      ]);
    },

    async saveMember(userId: number, input: MemberInput): Promise<{ id: number }> {
      const team = await requireTeam(userId);
      const { weight_price: weight, volume_price: volume } = input.selling_id;

      const data: MemberData = {
        affiliateCode: input.affiliate_code,
        name: input.name,
        email: input.email,
        commissionType: input.commission_type,
        referralCode: input.referral_code,
        commissionRate: input.commission_rate,
        btcCode: input.btc_code,
        vat: input.vat,
        phoneNumber: input.affiliate_address.phone_number,
        line1: input.affiliate_address.line1,
        line2: input.affiliate_address.line2,
      };

      return withTransaction(async (tx) => {
        if (input.id) {
          const sellingId = await affiliates.findMemberSellingId(input.id, team.id, tx);
          if (sellingId === null) throw notFound('Affiliate');
          await affiliates.updatePriceSet(sellingId, weight, volume, tx);
          await affiliates.updateMember(input.id, data, tx);
          return { id: input.id };
        }

        const sellingId = await affiliates.createPriceSet(weight, volume, tx);
        return { id: await affiliates.createMember(team.id, sellingId, data, tx) };
      });
    },
  };
}

export type AffiliateService = ReturnType<typeof createAffiliateService>;
