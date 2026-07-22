import React from 'react';
import { X, User, Check, AlertCircle, Phone, Calendar, Printer, FileText } from 'lucide-react';
import { AppState, Student } from '../types';
import { calculateStudentSummary, formatRupiah } from '../utils/formatters';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  state: AppState;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  state,
}) => {
  if (!isOpen || !student) return null;

  const summary = calculateStudentSummary(
    student,
    state.weeks,
    state.payments,
    state.weeklyTarget,
    state.activeWeekId
  );

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">{student.name}</h3>
              <p className="text-xs text-slate-400">Rincian Kartu Kas Siswa XI DKV</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintReceipt}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Cetak Bukti Kas"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Terbayar</span>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatRupiah(summary.totalPaid)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Sisa Tunggakan</span>
              <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                {formatRupiah(summary.totalArrears)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Minggu Lunas</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {summary.paidWeeksCount} Minggu
              </span>
            </div>
          </div>

          {/* Timeline of All Weeks */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Riwayat Pembayaran Per Minggu (Juli 2026 - Juni 2027)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {state.weeks.map((w) => {
                const key = `${student.id}_${w.id}`;
                const paidAmount = state.payments[key] || 0;
                const isLunas = paidAmount >= state.weeklyTarget;
                const isKurang = paidAmount > 0 && paidAmount < state.weeklyTarget;

                return (
                  <div
                    key={w.id}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                      isLunas
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                        : isKurang
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[11px]">{w.shortLabel}</span>
                      {isLunas ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white">
                          Lunas
                        </span>
                      ) : isKurang ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                          Kurang
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500 text-white">
                          Belum
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-semibold">
                      Bayar: {formatRupiah(paidAmount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Tutup Kartu
          </button>
        </div>
      </div>
    </div>
  );
};
