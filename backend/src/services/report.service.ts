import { config } from '../config';
import { ReportRangeInput } from '../schemas/report.schema';
import { AffiliateTeam } from '../types/affiliate.types';
import {
  DailyCommission,
  DateRange,
  MemberCommission,
  REPORT_NAMES,
  ReportLink,
  ReportName,
  ReportType,
} from '../types/report.types';
import { ReportServiceDeps } from '../types/service.types';
import { AppError, notFound } from '../utils/errors';
import { formatMoney } from '../utils/format';
import { barChart, cards, heading, progress, reportPage, table } from '../utils/reportPage';
import { signReportToken, verifyReportToken } from './token.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 366;

const REPORTS: Record<ReportName, { type: ReportType; title: string }> = {
  aff_report_1: { type: 'dashboard', title: 'ค่าคอมมิชชัน' },
  aff_report_2: { type: 'question', title: 'รายการตัวแทน' },
  aff_goal_report: { type: 'dashboard', title: 'เป้าหมายค่าคอมมิชชัน' },
};

const NO_DATA = 'ไม่มีข้อมูลในช่วงเวลานี้';

const today = (): string => new Date(Date.now() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);

const shift = (day: string, days: number): string =>
  new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

// The window is capped so one report request can never scan the whole table (OWASP API4)
function resolveRange(input: ReportRangeInput): DateRange {
  let end = input.end_date ?? today();
  let start = input.start_date ?? shift(end, -DEFAULT_RANGE_DAYS);
  if (start > end) [start, end] = [end, start];
  if (Date.parse(end) - Date.parse(start) > MAX_RANGE_DAYS * DAY_MS) start = shift(end, -MAX_RANGE_DAYS);
  return { start, end };
}

const baht = (value: number): string => `${formatMoney(value)} ฿`;
const rangeLabel = (range: DateRange): string => `${range.start} – ${range.end}`;
const sum = (rows: DailyCommission[], pick: (row: DailyCommission) => number): number =>
  rows.reduce((acc, row) => acc + pick(row), 0);

function commissionPage(rows: DailyCommission[], range: DateRange): string {
  const commission = sum(rows, (row) => row.commission);
  const discount = sum(rows, (row) => row.discount);

  return reportPage(
    REPORTS.aff_report_1.title,
    heading(REPORTS.aff_report_1.title, rangeLabel(range)) +
      cards([
        { label: 'จำนวนรายการ', value: String(sum(rows, (row) => row.orders)) },
        { label: 'ยอดค่าขนส่ง', value: baht(sum(rows, (row) => row.delivery)) },
        { label: 'ค่าคอมมิชชัน', value: baht(commission), tone: 'primary' },
        { label: 'ส่วนลดที่ให้', value: baht(discount), tone: 'danger' },
        { label: 'ค่าคอมมิชชันสุทธิ', value: baht(commission - discount), tone: 'success' },
      ]) +
      barChart(rows.map((row) => ({ label: row.day.slice(5), value: row.commission - row.discount }))) +
      table(
        [
          { label: 'วันที่' },
          { label: 'รายการ', numeric: true },
          { label: 'ค่าขนส่ง', numeric: true },
          { label: 'ค่าคอมมิชชัน', numeric: true },
          { label: 'ส่วนลด', numeric: true },
          { label: 'สุทธิ', numeric: true },
        ],
        rows.map((row) => [
          row.day,
          row.orders,
          formatMoney(row.delivery),
          formatMoney(row.commission),
          formatMoney(row.discount),
          formatMoney(row.commission - row.discount),
        ]),
        NO_DATA,
      ),
  );
}

function membersPage(rows: MemberCommission[], range: DateRange): string {
  return reportPage(
    REPORTS.aff_report_2.title,
    heading(REPORTS.aff_report_2.title, rangeLabel(range)) +
      table(
        [
          { label: 'รหัสผู้แนะนำ' },
          { label: 'ชื่อ' },
          { label: 'รายการ', numeric: true },
          { label: 'ยอดค่าขนส่ง', numeric: true },
          { label: 'ค่าคอมมิชชันสุทธิ', numeric: true },
        ],
        rows.map((row) => [
          row.affiliate_code,
          row.name,
          row.orders,
          formatMoney(row.delivery),
          formatMoney(row.commission),
        ]),
        'ยังไม่มีตัวแทนในทีม',
      ),
  );
}

function goalPage(team: AffiliateTeam, rows: DailyCommission[], range: DateRange): string {
  const achieved = sum(rows, (row) => row.commission - row.discount);
  const percent = team.monthlyGoal > 0 ? (achieved / team.monthlyGoal) * 100 : 0;

  return reportPage(
    REPORTS.aff_goal_report.title,
    heading(REPORTS.aff_goal_report.title, rangeLabel(range)) +
      cards([
        { label: 'เป้าหมายค่าคอมมิชชัน', value: baht(team.monthlyGoal) },
        { label: 'ทำได้แล้ว', value: baht(achieved), tone: 'success' },
        { label: 'ความคืบหน้า', value: `${percent.toFixed(1)}%`, tone: 'primary' },
        { label: 'จำนวนรายการ', value: String(sum(rows, (row) => row.orders)) },
      ]) +
      progress(percent) +
      barChart(rows.map((row) => ({ label: row.day.slice(5), value: row.commission - row.discount }))),
  );
}

export function createReportService({ saleOrders, affiliates, affiliateAccess }: ReportServiceDeps) {
  return {
    // The frame cannot send an Authorization header, so the link carries a short-lived token that
    // names one report for one user and is accepted nowhere else
    async link(userId: number, name: ReportName): Promise<ReportLink> {
      await affiliateAccess.requireTeam(userId);
      const { type } = REPORTS[name];
      return {
        report_url: `${config.publicUrl}/embed/${type}/${signReportToken(userId, name)}`,
        report_type: type,
      };
    },

    async render(token: string, input: ReportRangeInput): Promise<string> {
      let payload: { userId: number; report: string };
      try {
        payload = verifyReportToken(token);
      } catch {
        throw new AppError(
          'This report link has expired. Reload the page to open it again.',
          401,
          'token_expired',
        );
      }

      const name = REPORT_NAMES.find((candidate) => candidate === payload.report);
      const team = await affiliates.findTeamByOwner(payload.userId);
      if (!name || !team) throw notFound('Report');

      const range = resolveRange(input);
      switch (name) {
        case 'aff_report_1':
          return commissionPage(await saleOrders.commissionByDay(team.id, range), range);
        case 'aff_report_2':
          return membersPage(await saleOrders.commissionByMember(team.id, range), range);
        case 'aff_goal_report':
          return goalPage(team, await saleOrders.commissionByDay(team.id, range), range);
      }
    },
  };
}

export type ReportService = ReturnType<typeof createReportService>;
