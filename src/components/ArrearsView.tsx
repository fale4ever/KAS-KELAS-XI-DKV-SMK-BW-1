import React, { useState } from 'react';
import {
  MessageSquare,
  AlertCircle,
  Phone,
  Edit2,
  Check,
  Search,
  Send,
  Sparkles,
  User,
  Copy,
  ExternalLink,
  Settings2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { AppState, Student } from '../types';
import {
  buildWhatsAppLink,
  calculateStudentSummary,
  formatRupiah,
  generateStudentReminderText,
} from '../utils/formatters';

interface ArrearsViewProps {
  state: AppState;
  isAdmin: boolean;
  onUpdatePhone: (studentId: string, phone: string) => void;
  onOpenLoginModal: () => void;
  onUpdateWaTemplate: (template: string) => void;
}

export const ArrearsView: React.FC<ArrearsViewProps> = ({
  state,
  isAdmin,
  onUpdatePhone,
  onOpenLoginModal,
  onUpdateWaTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateText, setTemplateText] = useState(state.waReminderTemplate);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate summaries for all students up to active week
  const studentSummaries = state.students.map((student) =>
    calculateStudentSummary(student, state.weeks, state.payments, state.weeklyTarget, state.activeWeekId)
  );

  // Filter students with arrears > 0 or all students if toggled
  const studentsWithArrears = studentSummaries
    .filter((s) => s.totalArrears > 0)
    .sort((a, b) => b.totalArrears - a.totalArrears);

  const filteredList = studentsWithArrears.filter((s) =>
    s.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClassArrears = studentsWithArrears.reduce((sum, s) => sum + s.totalArrears, 0);

  const handleStartEditPhone = (student: Student) => {
    setEditingStudentId(student.id);
    setPhoneInput(student.phone || '');
  };

  const handleSavePhone = (studentId: string) => {
    onUpdatePhone(studentId, phoneInput.trim());
    setEditingStudentId(null);
  };

  const handleCopyReminderText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveTemplate = () => {
    onUpdateWaTemplate(templateText);
    setShowTemplateModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-6 rounded-2xl border border-amber-800/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              FEATURE REMINDER WA
            </span>
            <span className="text-xs text-amber-200/80">
              Acuan s/d minggu aktif
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Pelacakan Tunggakan & Reminder WhatsApp
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Kirimkan pesan pengingat pembayaran kas kelas otomatis via WhatsApp ke nomor HP masing-masing siswa yang memiliki tunggakan.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/20 text-right space-y-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
            Total Tunggakan Kas Kelas
          </span>
          <span className="text-2xl font-extrabold text-amber-400">
            {formatRupiah(totalClassArrears)}
          </span>
          <p className="text-[10px] text-slate-400">
            {studentsWithArrears.length} dari {state.students.length} siswa menunggak
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center space-x-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Edit Template WA</span>
          </button>
        </div>
      </div>

      {/* List of Students with Arrears */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-emerald-500">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Tunggakan!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Semua siswa sudah melunasi iuran kas hingga minggu acuan ini. Luar biasa!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.map((item) => {
              const student = item.student;
              const isEditingPhone = editingStudentId === student.id;
              const reminderText = generateStudentReminderText(
                student,
                item,
                state.weeks,
                state.payments,
                state.weeklyTarget,
                state.waReminderTemplate
              );

              const waLink = buildWhatsAppLink(student.phone, reminderText);

              return (
                <div
                  key={student.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Student info & arrears */}
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                        Tunggakan: {formatRupiah(item.totalArrears)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Belum lunas: <strong className="text-slate-700 dark:text-slate-300">{item.unpaidWeeksCount} minggu</strong> • Terbayar: {formatRupiah(item.totalPaid)}
                    </p>

                    {/* Phone Number Entry */}
                    <div className="flex items-center space-x-2 text-xs pt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {isEditingPhone ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            placeholder="Nomor WA (contoh: 081234567890)"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePhone(student.id)}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                            {student.phone ? student.phone : 'Belum ada nomor WA'}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleStartEditPhone(student)}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-medium"
                            >
                              {student.phone ? 'Ubah' : '+ Tambah No WA'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: WA Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() =>
                        handleCopyReminderText(reminderText, student.id)
                      }
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center space-x-1"
                      title="Salin teks pesan reminder"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === student.id ? 'Tersalin!' : 'Salin Pesan'}</span>
                    </button>

                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            onOpenLoginModal();
                          } else {
                            handleStartEditPhone(student);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100"
                      >
                        Input No WA
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold">Edit Template Pesan WhatsApp</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gunakan tag variabel otomatis: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-indigo-500">[NAMA]</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-indigo-500">[TANGGAL]</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-indigo-500">[TUNGGAKAN]</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-indigo-500">[RINCIAN]</code>.
              </p>

              <textarea
                rows={6}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 font-mono"
              />

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="w-1/2 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
                >
                  Simpan Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
