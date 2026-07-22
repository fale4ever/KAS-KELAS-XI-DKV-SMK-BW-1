import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, AlertCircle, Sparkles, User, Calendar } from 'lucide-react';
import { Student, WeekPeriod } from '../types';
import { formatRupiah } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  week: WeekPeriod | null;
  currentAmount: number;
  weeklyTarget: number;
  isAdmin: boolean;
  onSavePayment: (studentId: string, weekId: string, amount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  student,
  week,
  currentAmount,
  weeklyTarget,
  isAdmin,
  onSavePayment,
}) => {
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    setAmount(currentAmount || 0);
  }, [currentAmount, isOpen]);

  if (!isOpen || !student || !week) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onSavePayment(student.id, week.id, Math.max(0, amount));
    onClose();
  };

  const remaining = Math.max(0, weeklyTarget - amount);

  let statusType: 'LUNAS' | 'KURANG' | 'BELUM' = 'LUNAS';
  if (remaining > 0) {
    statusType = amount > 0 ? 'KURANG' : 'BELUM';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 relative border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Catat Pembayaran Kas</h3>
              <p className="text-xs text-slate-400">Target iuran: {formatRupiah(weeklyTarget)} / minggu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Student & Week Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Nama Siswa:
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Minggu Kas:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{week.label}</span>
            </div>
          </div>

          {/* Amount Entry */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Nominal Diterima (Rupiah)
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="500"
                disabled={!isAdmin}
                value={amount === 0 ? '' : amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-lg rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            {/* Quick Preset Buttons */}
            {isAdmin && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setAmount(weeklyTarget)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    amount === weeklyTarget
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100'
                  }`}
                >
                  Lunas ({formatRupiah(weeklyTarget)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(2500)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    amount === 2500
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100'
                  }`}
                >
                  Separuh (Rp 2.500)
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(0)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    amount === 0
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40 hover:bg-rose-100'
                  }`}
                >
                  Belum (Rp 0)
                </button>
              </div>
            )}
          </div>

          {/* Status Indicator & Sisa Calculation */}
          <div className="p-4 rounded-xl border transition-all space-y-2">
            {statusType === 'LUNAS' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl flex items-center space-x-3 text-emerald-800 dark:text-emerald-300">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Status: LUNAS</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Iuran minggu ini sudah terpenuhi sepenuhnya ({formatRupiah(amount)}).
                  </p>
                </div>
              </div>
            )}

            {statusType === 'KURANG' && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 p-3 rounded-xl flex items-center space-x-3 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">
                    Status: KURANG • Sisa {formatRupiah(remaining)}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Pembayaran kurang dari target {formatRupiah(weeklyTarget)}. Sisa tunggakan minggu ini: <strong>{formatRupiah(remaining)}</strong>.
                  </p>
                </div>
              </div>
            )}

            {statusType === 'BELUM' && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40 p-3 rounded-xl flex items-center space-x-3 text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Status: BELUM BAYAR</p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400">
                    Siswa belum melakukan pembayaran iuran minggu ini ({formatRupiah(weeklyTarget)}).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Tutup
            </button>
            {isAdmin ? (
              <button
                type="submit"
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Kas</span>
              </button>
            ) : (
              <p className="w-1/2 text-[11px] text-slate-400 text-center py-2">
                Login Bendahara untuk edit
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
