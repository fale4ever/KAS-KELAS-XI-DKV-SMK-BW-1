import React, { useState } from 'react';
import {
  Search,
  Filter,
  Check,
  AlertCircle,
  X,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCheck,
  Users,
  Calendar,
  Share2,
  Image as ImageIcon,
} from 'lucide-react';
import { AppState, Student, WeekPeriod } from '../types';
import { calculateStudentSummary, formatRupiah } from '../utils/formatters';

interface WeeklyMatrixViewProps {
  state: AppState;
  isAdmin: boolean;
  onOpenPaymentModal: (student: Student, week: WeekPeriod) => void;
  onOpenLoginModal: () => void;
  onBulkSetLunas?: (weekId: string, studentIds: string[]) => void;
  onOpenShareMatrixModal?: () => void;
  onOpenShareModal?: () => void;
}

export const WeeklyMatrixView: React.FC<WeeklyMatrixViewProps> = ({
  state,
  isAdmin,
  onOpenPaymentModal,
  onOpenLoginModal,
  onBulkSetLunas,
  onOpenShareMatrixModal,
  onOpenShareModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [selectedBulkStudents, setSelectedBulkStudents] = useState<string[]>([]);

  // Unique months for filter dropdown
  const uniqueMonths = Array.from(new Set(state.weeks.map((w) => w.month)));

  // Filter weeks by selected month
  const filteredWeeks = state.weeks.filter((w) => {
    if (selectedMonth !== 'ALL' && w.month !== selectedMonth) return false;
    return true;
  });

  // Filter students
  const filteredStudents = state.students.filter((student) => {
    if (searchTerm.trim()) {
      const matchName = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchName) return false;
    }

    if (selectedStatus !== 'ALL') {
      const summary = calculateStudentSummary(
        student,
        state.weeks,
        state.payments,
        state.weeklyTarget,
        state.activeWeekId
      );
      if (selectedStatus === 'LUNAS' && summary.totalArrears > 0) return false;
      if (selectedStatus === 'KURANG' && (summary.totalPaid === 0 || summary.totalArrears === 0))
        return false;
      if (selectedStatus === 'BELUM' && summary.totalPaid > 0) return false;
    }

    return true;
  });

  const activeWeekObj = state.weeks.find((w) => w.id === state.activeWeekId) || state.weeks[0];

  const handleToggleBulkStudent = (studentId: string) => {
    if (selectedBulkStudents.includes(studentId)) {
      setSelectedBulkStudents(selectedBulkStudents.filter((id) => id !== studentId));
    } else {
      setSelectedBulkStudents([...selectedBulkStudents, studentId]);
    }
  };

  const handleSelectAllBulk = () => {
    if (selectedBulkStudents.length === filteredStudents.length) {
      setSelectedBulkStudents([]);
    } else {
      setSelectedBulkStudents(filteredStudents.map((s) => s.id));
    }
  };

  const handleExecuteBulkLunas = () => {
    if (!onBulkSetLunas || selectedBulkStudents.length === 0) return;
    onBulkSetLunas(state.activeWeekId, selectedBulkStudents);
    setSelectedBulkStudents([]);
    setShowBulkMode(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Matriks Kas Mingguan (Siswa x Minggu)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {state.students.length} Siswa
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Klik pada sel siswa/minggu untuk memperbarui status dan nominal pembayaran.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan Laporan Kas (WA & CSV)</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setShowBulkMode(!showBulkMode);
                  setSelectedBulkStudents([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  showBulkMode
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 hover:bg-indigo-100'
                }`}
              >
                <CheckCheck className="w-4 h-4" />
                <span>{showBulkMode ? 'Tutup Input Masal' : 'Input Lunas Sekaligus'}</span>
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-all flex items-center space-x-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Login Bendahara</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Panduan Tampilan Mobile:</strong> Usap (swipe) tabel ke kanan atau kiri untuk melihat seluruh kolom minggu dan nama siswa secara lengkap.
          </span>
        </p>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Bulan (Jul 2026 - Jun 2027)</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  Bulan {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Status Siswa</option>
              <option value="LUNAS">Siswa Lunas Dues</option>
              <option value="KURANG">Siswa Kurang Bayar</option>
              <option value="BELUM">Siswa Belum Bayar Sama Sekali</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Panel if active */}
        {showBulkMode && isAdmin && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Modus Input Lunas Sekaligus ({activeWeekObj.label})
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Pilih siswa yang sudah membayar lunas ({formatRupiah(state.weeklyTarget)}) untuk minggu ini, lalu klik Simpan.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAllBulk}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-300"
                >
                  {selectedBulkStudents.length === filteredStudents.length
                    ? 'Batal Pilih Semua'
                    : 'Pilih Semua Siswa'}
                </button>
                <button
                  disabled={selectedBulkStudents.length === 0}
                  onClick={handleExecuteBulkLunas}
                  className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 transition-all shadow-sm"
                >
                  Tandai Lunas ({selectedBulkStudents.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                {showBulkMode && <th className="p-3.5 text-center w-10">Pilih</th>}
                <th className="p-3.5 w-10 text-center bg-slate-900 border-r border-slate-800">No</th>
                <th className="p-3.5 w-48 sm:w-56 bg-slate-900 border-r border-slate-700">
                  Nama Siswa
                </th>
                <th className="p-3.5 text-right w-28 bg-slate-900 border-r border-slate-800">
                  Total Bayar
                </th>
                <th className="p-3.5 text-right w-28 bg-slate-900 border-r border-slate-800">
                  Tunggakan
                </th>

                {/* Week Columns */}
                {filteredWeeks.map((w) => {
                  const isActiveWeek = w.id === state.activeWeekId;
                  return (
                    <th
                      key={w.id}
                      className={`p-3 text-center min-w-[105px] border-r border-slate-800 transition-colors ${
                        isActiveWeek ? 'bg-indigo-950 text-indigo-300 font-extrabold ring-1 ring-indigo-500 inset-0' : ''
                      }`}
                    >
                      <div className="text-[11px] leading-tight">{w.shortLabel}</div>
                      {isActiveWeek && (
                        <span className="mt-0.5 inline-block px-1.5 py-0.2 rounded text-[9px] bg-indigo-600 text-white font-bold uppercase">
                          Acuan
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + filteredWeeks.length}
                    className="p-8 text-center text-slate-400 font-medium"
                  >
                    Tidak ada data siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const summary = calculateStudentSummary(
                    student,
                    state.weeks,
                    state.payments,
                    state.weeklyTarget,
                    state.activeWeekId
                  );

                  const isCheckedBulk = selectedBulkStudents.includes(student.id);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {showBulkMode && (
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isCheckedBulk}
                            onChange={() => handleToggleBulkStudent(student.id)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                      )}

                      <td className="p-3.5 text-center font-bold text-slate-400 border-r border-slate-100 dark:border-slate-800">
                        {idx + 1}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {student.name}
                      </td>

                      <td className="p-3.5 text-right font-extrabold text-indigo-600 dark:text-indigo-400 border-r border-slate-100 dark:border-slate-800">
                        {formatRupiah(summary.totalPaid)}
                      </td>

                      <td className="p-3.5 text-right font-extrabold border-r border-slate-100 dark:border-slate-800">
                        {summary.totalArrears > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            {formatRupiah(summary.totalArrears)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Rp 0</span>
                        )}
                      </td>

                      {/* Cell for each week */}
                      {filteredWeeks.map((w) => {
                        const key = `${student.id}_${w.id}`;
                        const paidAmount = state.payments[key] || 0;
                        const isLunas = paidAmount >= state.weeklyTarget;
                        const isKurang = paidAmount > 0 && paidAmount < state.weeklyTarget;
                        const remaining = Math.max(0, state.weeklyTarget - paidAmount);
                        const isActiveWeek = w.id === state.activeWeekId;

                        return (
                          <td
                            key={w.id}
                            onClick={() => onOpenPaymentModal(student, w)}
                            className={`p-2 text-center border-r border-slate-100 dark:border-slate-800 cursor-pointer hover:scale-95 transition-all ${
                              isActiveWeek ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                            }`}
                            title={`Klik untuk edit ${student.name} - ${w.label}`}
                          >
                            {isLunas ? (
                              <div className="inline-flex flex-col items-center justify-center w-full py-1 px-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-bold">
                                <span className="flex items-center space-x-1 text-[11px]">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Lunas</span>
                                </span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {formatRupiah(paidAmount)}
                                </span>
                              </div>
                            ) : isKurang ? (
                              <div className="inline-flex flex-col items-center justify-center w-full py-1 px-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 font-bold">
                                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                                  Kurang
                                </span>
                                <span className="text-[10px] text-amber-700 dark:text-amber-400">
                                  {formatRupiah(paidAmount)} | Sisa {formatRupiah(remaining)}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center justify-center w-full py-1 px-1 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400 border border-slate-200 dark:border-slate-700/40">
                                <span className="text-[11px] font-semibold text-rose-500">
                                  Belum
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Sisa {formatRupiah(state.weeklyTarget)}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
