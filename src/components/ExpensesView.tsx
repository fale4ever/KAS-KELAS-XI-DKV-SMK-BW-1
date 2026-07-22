import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Tag,
  Calendar,
  AlertCircle,
  ShieldAlert,
  ArrowDownCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AppState, ExpenseRecord } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ExpensesViewProps {
  state: AppState;
  isAdmin: boolean;
  onOpenAddExpenseModal: () => void;
  onOpenLoginModal: () => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  state,
  isAdmin,
  onOpenAddExpenseModal,
  onOpenLoginModal,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = Array.from(new Set(state.expenses.map((e) => e.category)));

  const filteredExpenses = state.expenses.filter((e) => {
    if (searchTerm.trim()) {
      const matchDesc = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNote = e.note?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchDesc && !matchNote) return false;
    }
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const totalExpenseAmount = state.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Laporan Pengeluaran Kas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              {state.expenses.length} Catatan
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar penggunaan dana kas kelas XI DKV beserta detail keperluan dan bukti pengeluaran.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right pr-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Pengeluaran
            </span>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatRupiah(totalExpenseAmount)}
            </span>
          </div>

          {isAdmin ? (
            <button
              onClick={onOpenAddExpenseModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/20 flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Pengeluaran</span>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Login untuk Tambah</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari deskripsi pengeluaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">Semua Kategori Pengeluaran</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table list or empty state */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum Ada Catatan Pengeluaran
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Saat ini belum ada data pengeluaran kas kelas. Bendahara dapat menambahkan rincian pengeluaran kas kapan saja.
            </p>
            {isAdmin && (
              <button
                onClick={onOpenAddExpenseModal}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tambah Pengeluaran Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white uppercase tracking-wider font-bold">
                  <th className="p-3.5 w-12 text-center">No</th>
                  <th className="p-3.5 w-32">Tanggal</th>
                  <th className="p-3.5 w-48">Kategori</th>
                  <th className="p-3.5">Deskripsi Pengeluaran</th>
                  <th className="p-3.5">Catatan / Nota</th>
                  <th className="p-3.5 text-right w-36">Jumlah (Rp)</th>
                  {isAdmin && <th className="p-3.5 text-center w-16">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map((expense, idx) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {expense.date}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {expense.description}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 italic">
                      {expense.note || '-'}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-rose-600 dark:text-rose-400">
                      {formatRupiah(expense.amount)}
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Apakah Anda yakin ingin menghapus pengeluaran "${expense.description}"?`
                              )
                            ) {
                              onDeleteExpense(expense.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
