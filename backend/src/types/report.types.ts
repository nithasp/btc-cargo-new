export const REPORT_NAMES = ['aff_report_1', 'aff_report_2', 'aff_goal_report'] as const;

export type ReportName = (typeof REPORT_NAMES)[number];

export type ReportType = 'dashboard' | 'question';

export interface ReportLink {
  report_url: string;
  report_type: ReportType;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface DailyCommission {
  day: string;
  orders: number;
  delivery: number;
  commission: number;
  discount: number;
}

export interface MemberCommission {
  affiliate_code: string;
  name: string;
  orders: number;
  delivery: number;
  commission: number;
}

export interface Column {
  label: string;
  numeric?: boolean;
}
