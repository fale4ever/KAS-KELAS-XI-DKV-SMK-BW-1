import { AppState, Student, StudentPaymentSummary, WeekPeriod } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return '';
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encodedText}`;
}

export function calculateStudentSummary(
  student: Student,
  weeks: WeekPeriod[],
  payments: Record<string, number>,
  weeklyTarget: number,
  untilWeekId?: string
): StudentPaymentSummary {
  let targetWeeks = weeks;
  if (untilWeekId) {
    const activeIndex = weeks.findIndex((w) => w.id === untilWeekId);
    if (activeIndex !== -1) {
      targetWeeks = weeks.slice(0, activeIndex + 1);
    }
  }

  let totalPaid = 0;
  let paidWeeksCount = 0;
  let partialWeeksCount = 0;
  let unpaidWeeksCount = 0;

  const totalRequired = targetWeeks.length * weeklyTarget;

  targetWeeks.forEach((w) => {
    const key = `${student.id}_${w.id}`;
    const paid = payments[key] || 0;
    totalPaid += paid;

    if (paid >= weeklyTarget) {
      paidWeeksCount++;
    } else if (paid > 0) {
      partialWeeksCount++;
    } else {
      unpaidWeeksCount++;
    }
  });

  const totalArrears = Math.max(0, totalRequired - totalPaid);

  let status: 'LUNAS' | 'KURANG' | 'BELUM' = 'LUNAS';
  if (totalArrears > 0) {
    if (totalPaid > 0) {
      status = 'KURANG';
    } else {
      status = 'BELUM';
    }
  }

  return {
    student,
    totalPaid,
    totalRequired,
    totalArrears,
    paidWeeksCount,
    partialWeeksCount,
    unpaidWeeksCount,
    status,
  };
}

export function calculateClassTotals(state: AppState) {
  const { students, weeks, payments, expenses, weeklyTarget, activeWeekId } = state;

  // Active week calculation
  const activeIndex = weeks.findIndex((w) => w.id === activeWeekId);
  const weeksUpToActive = activeIndex !== -1 ? weeks.slice(0, activeIndex + 1) : weeks;

  let totalIncome = 0;
  Object.values(payments).forEach((amount) => {
    if (amount && amount > 0) {
      totalIncome += amount;
    }
  });

  let totalExpenses = 0;
  expenses.forEach((e) => {
    totalExpenses += e.amount || 0;
  });

  const currentBalance = totalIncome - totalExpenses;

  // Expected income up to current active week
  const expectedTotalUpToActive = students.length * weeksUpToActive.length * weeklyTarget;

  // Calculate arrears up to active week
  let totalIncomeUpToActive = 0;
  students.forEach((student) => {
    weeksUpToActive.forEach((w) => {
      const key = `${student.id}_${w.id}`;
      totalIncomeUpToActive += payments[key] || 0;
    });
  });

  const totalArrearsUpToActive = Math.max(0, expectedTotalUpToActive - totalIncomeUpToActive);

  // Overall completion rate up to active week
  const collectionRate =
    expectedTotalUpToActive > 0
      ? Math.min(100, Math.round((totalIncomeUpToActive / expectedTotalUpToActive) * 100))
      : 100;

  return {
    totalIncome,
    totalExpenses,
    currentBalance,
    totalArrearsUpToActive,
    expectedTotalUpToActive,
    totalIncomeUpToActive,
    collectionRate,
    activeWeeksCount: weeksUpToActive.length,
    totalWeeksCount: weeks.length,
  };
}

export function generateStudentReminderText(
  student: Student,
  summary: StudentPaymentSummary,
  weeks: WeekPeriod[],
  payments: Record<string, number>,
  weeklyTarget: number,
  template: string
): string {
  const unpaidWeekLabels: string[] = [];

  weeks.forEach((w) => {
    const key = `${student.id}_${w.id}`;
    const paid = payments[key] || 0;
    if (paid < weeklyTarget) {
      const diff = weeklyTarget - paid;
      if (paid > 0) {
        unpaidWeekLabels.push(`${w.shortLabel} (kurang ${formatRupiah(diff)})`);
      } else {
        unpaidWeekLabels.push(w.shortLabel);
      }
    }
  });

  const rincian =
    unpaidWeekLabels.length > 0 ? unpaidWeekLabels.join(', ') : 'Tidak ada tunggakan';
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return template
    .replace(/\[NAMA\]/g, student.name)
    .replace(/\[TANGGAL\]/g, todayStr)
    .replace(/\[TUNGGAKAN\]/g, formatRupiah(summary.totalArrears))
    .replace(/\[RINCIAN\]/g, rincian);
}
