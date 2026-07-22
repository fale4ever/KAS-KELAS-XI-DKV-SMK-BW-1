import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  Edit2,
  Check,
} from 'lucide-react';
import { AppState, Student } from '../types';
import { calculateStudentSummary, formatRupiah } from '../utils/formatters';

interface StudentDirectoryViewProps {
  state: AppState;
  isAdmin: boolean;
  onSelectStudent: (student: Student) => void;
  onUpdatePhone: (studentId: string, phone: string) => void;
  onOpenLoginModal: () => void;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  state,
  isAdmin,
  onSelectStudent,
  onUpdatePhone,
  onOpenLoginModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'NAME' | 'ARREARS' | 'PAID'>('NAME');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');

  const summaries = state.students.map((student) =>
    calculateStudentSummary(student, state.weeks, state.payments, state.weeklyTarget, state.activeWeekId)
  );

  let filtered = summaries.filter((s) =>
    s.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortBy === 'ARREARS') {
    filtered.sort((a, b) => b.totalArrears - a.totalArrears);
  } else if (sortBy === 'PAID') {
    filtered.sort((a, b) => b.totalPaid - a.totalPaid);
  } else {
    filtered.sort((a, b) => a.student.name.localeCompare(b.student.name));
  }

  const handleSavePhone = (studentId: string) => {
    onUpdatePhone(studentId, phoneInput.trim());
    setEditingStudentId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Daftar Siswa Kelas XI DKV
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {state.students.length} Anggota
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Klik kartu nama siswa untuk melihat kartu riwayat kas lengkap dan status kelunasan per minggu.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="NAME">Urut Nama (A-Z)</option>
            <option value="ARREARS">Urut Tunggakan Tertinggi</option>
            <option value="PAID">Urut Pembayaran Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => {
          const student = item.student;
          const isLunas = item.totalArrears === 0;
          const isEditingPhone = editingStudentId === student.id;

          return (
            <div
              key={student.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {student.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">XI Desain Komunikasi Visual</p>
                    </div>
                  </div>

                  {isLunas ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      LUNAS
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                      ADA TUNGGAKAN
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Terbayar</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(item.totalPaid)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Sisa Tunggakan</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">
                      {formatRupiah(item.totalArrears)}
                    </span>
                  </div>
                </div>

                {/* Phone contact */}
                <div className="flex items-center space-x-2 text-xs mb-4">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isEditingPhone ? (
                    <div className="flex items-center space-x-1.5 w-full">
                      <input
                        type="text"
                        placeholder="08..."
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-800 text-xs rounded border border-slate-300 dark:border-slate-700"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSavePhone(student.id)}
                        className="p-1 rounded bg-emerald-600 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {student.phone ? student.phone : 'Belum ada nomor WA'}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingStudentId(student.id);
                            setPhoneInput(student.phone || '');
                          }}
                          className="text-[10px] text-indigo-500 font-semibold hover:underline"
                        >
                          {student.phone ? 'Edit' : '+ Tambah'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onSelectStudent(student)}
                className="w-full py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center space-x-1"
              >
                <span>Lihat Kartu Kas Complete</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
