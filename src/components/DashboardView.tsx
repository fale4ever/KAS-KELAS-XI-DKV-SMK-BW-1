import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
  Calendar,
  UserCheck,
  PlusCircle,
  Receipt,
  MessageSquare,
  Sparkles,
  Info,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { AppState } from '../types';
import { calculateClassTotals, calculateStudentSummary, formatRupiah } from '../utils/formatters';

interface DashboardViewProps {
  state: AppState;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenPaymentModalForStudent?: (studentId: string, weekId: string) => void;
  onOpenAddExpenseModal?: () => void;
  onSetActiveWeek: (weekId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  isAdmin,
  onOpenLoginModal,
  onNavigateTab,
  onOpenAddExpenseModal,
  onSetActiveWeek,
}) => {
  const totals = calculateClassTotals(state);
  const activeWeekObj = state.weeks.find((w) => w.id === state.activeWeekId) || state.weeks[0];

  // Calculate student payment stats for active week
  let activeWeekPaidCount = 0;
  let activeWeekPartialCount = 0;
  let activeWeekUnpaidCount = 0;

  state.students.forEach((student) => {
    const key = `${student.id}_${state.activeWeekId}`;
    const paid = state.payments[key] || 0;
    if (paid >= state.weeklyTarget) {
      activeWeekPaidCount++;
    } else if (paid > 0) {
      activeWeekPartialCount++;
    } else {
      activeWeekUnpaidCount++;
    }
  });

  // Calculate top students with highest arrears
  const studentSummaries = state.students.map((student) =>
    calculateStudentSummary(student, state.weeks, state.payments, state.weeklyTarget, state.activeWeekId)
  );

  const studentsWithArrears = [...studentSummaries]
    .filter((s) => s.totalArrears > 0)
    .sort((a, b) => b.totalArrears - a.totalArrears)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Active Week Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TAHUN AJARAN 2026/2027
              </span>
              <span className="text-xs text-slate-400">
                21 Siswa XI DKV
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Ringkasan Kas Kelas XI DKV
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Iuran kas mingguan berjalan dari <strong className="text-indigo-200">Minggu 3 Juli 2026</strong> sampai <strong className="text-indigo-200">Minggu 4 Juni 2027</strong> dengan nominal target <strong className="text-emerald-300">Rp {state.weeklyTarget.toLocaleString('id-ID')}/minggu</strong>.
            </p>
          </div>

          {/* Active Week Selector */}
          <div className="bg-slate-800/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Calendar className="w-4 h-4 shrink-0 text-indigo-400" />
              <span className="text-xs font-semibold whitespace-nowrap">Minggu Acuan:</span>
            </div>
            <select
              value={state.activeWeekId}
              onChange={(e) => onSetActiveWeek(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {state.weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas Saat Ini */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Kas Saat Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(totals.currentBalance)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
            Saldo Awal: Rp 0 • Kas Masuk - Pengeluaran
          </p>
        </div>

        {/* Card 2: Total Kas Masuk */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Kas Masuk
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(totals.totalIncome)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center">
            Akumulasi iuran dari {state.students.length} siswa DKV
          </p>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(totals.totalExpenses)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {state.expenses.length} catatan pengeluaran kas
          </p>
        </div>

        {/* Card 4: Total Tunggakan & Progress */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tunggakan s/d {activeWeekObj.shortLabel}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatRupiah(totals.totalArrearsUpToActive)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Tingkat Keterbayaran:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {totals.collectionRate}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totals.collectionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Role Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Navigasi Cepat & Manajemen
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAdmin
                ? 'Anda berada dalam mode Bendahara. Semua fitur pengeditan aktif.'
                : 'Mode Tamu aktif. Login sebagai Bendahara untuk mencatat pembayaran dan pengeluaran.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isAdmin ? (
            <>
              <button
                onClick={() => onNavigateTab('matrix')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Input Kas Siswa</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('expenses');
                  if (onOpenAddExpenseModal) onOpenAddExpenseModal();
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-sm"
              >
                <Receipt className="w-4 h-4" />
                <span>+ Pengeluaran</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Login Bendahara untuk Edit</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('arrears')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reminder WA</span>
          </button>
        </div>
      </div>

      {/* Grid Section: Active Week Status & Arrears Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Week Status Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Status Pembayaran: {activeWeekObj.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Progres iuran {state.students.length} siswa DKV untuk minggu acuan ini.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('matrix')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              <span>Buka Matriks</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {activeWeekPaidCount}
              </div>
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
                Lunas (Rp 5.000)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-center">
              <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                {activeWeekPartialCount}
              </div>
              <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 mt-0.5">
                Kurang (&lt; 5.000)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 text-center">
              <div className="text-xl font-bold text-rose-700 dark:text-rose-400">
                {activeWeekUnpaidCount}
              </div>
              <div className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 mt-0.5">
                Belum Bayar
              </div>
            </div>
          </div>

          {/* Initial Balance Notice as required */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                Ketentuan Kas Kelas XI DKV:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
                <li>Saldo awal ditetapkan secara resmi sebesar <strong>Rp 0</strong>.</li>
                <li>Catatan pengeluaran awal dalam keadaan bersih (kosong) untuk diisi kemudian oleh Bendahara.</li>
                <li>Iuran nominal wajib <strong>Rp 5.000</strong> per minggu per siswa.</li>
                <li>Pembayaran kurang dari Rp 5.000 otomatis berstatus <span className="text-amber-600 dark:text-amber-400 font-semibold">KURANG</span> dan menampilkan sisa kekurangannya.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Top Arrears Watchlist */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Tunggakan Terbesar
              </h3>
              <button
                onClick={() => onNavigateTab('arrears')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            {studentsWithArrears.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-500" />
                <p className="text-xs font-medium">Luar biasa! Tidak ada tunggakan kas saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentsWithArrears.map((item, idx) => (
                  <div
                    key={item.student.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.student.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.unpaidWeeksCount} minggu belum lunas
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 block">
                        {formatRupiah(item.totalArrears)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('arrears')}
            className="w-full mt-5 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center space-x-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kirim Pesan Reminder WA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
