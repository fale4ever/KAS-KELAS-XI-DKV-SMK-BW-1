export interface Student {
  id: string;
  name: string;
  phone: string; // e.g. "081234567890" or "628..."
  notes?: string;
}

export interface WeekPeriod {
  id: string; // e.g. "2026-07-W3"
  month: string; // e.g. "Juli 2026"
  weekNumber: number; // 1, 2, 3, 4
  year: number; // 2026 or 2027
  label: string; // e.g. "Minggu 3 (Juli 2026)"
  shortLabel: string; // e.g. "Jul M3"
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  note?: string;
}

export type PaymentStatusType = 'LUNAS' | 'KURANG' | 'BELUM';

export interface StudentPaymentSummary {
  student: Student;
  totalPaid: number;
  totalRequired: number;
  totalArrears: number;
  paidWeeksCount: number;
  partialWeeksCount: number;
  unpaidWeeksCount: number;
  status: PaymentStatusType;
}

export interface AppState {
  students: Student[];
  weeks: WeekPeriod[];
  payments: Record<string, number>; // key: `${studentId}_${weekId}` -> amount paid
  expenses: ExpenseRecord[];
  weeklyTarget: number; // default 5000 IDR
  activeWeekId: string;
  adminPin: string; // default "dkv2026" or user modified
  waReminderTemplate: string;
}
