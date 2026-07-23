import React, { useRef, useState } from 'react';
import { Download, X, MessageSquare, Image, Check, Loader2, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { AppState } from '../types';
import { calculateClassTotals, calculateStudentSummary, formatRupiah } from '../utils/formatters';

interface ShareMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const ShareMatrixModal: React.FC<ShareMatrixModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const matrixRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  if (!isOpen) return null;

  const totals = calculateClassTotals(state);
  const activeWeekObj = state.weeks.find((w) => w.id === state.activeWeekId) || state.weeks[0];

  // Filter weeks by selected month if requested
  const weeksToRender = state.weeks.filter((w) => {
    if (selectedMonth !== 'ALL' && w.month !== selectedMonth) return false;
    return true;
  });

  const uniqueMonths = Array.from(new Set(state.weeks.map((w) => w.month)));

  const handleExportImage = async (mode: 'download' | 'whatsapp') => {
    if (!matrixRef.current) return;
    setIsGenerating(true);

    try {
      // Small delay to ensure rendering is complete
      await new Promise((res) => setTimeout(res, 200));

      const canvas = await html2canvas(matrixRef.current, {
        scale: 2, // High resolution image
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
      );

      if (!imageBlob) throw new Error('Gagal menghasilkan gambar matrix.');

      if (mode === 'download') {
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Matriks_Kas_XI_DKV_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } else if (mode === 'whatsapp') {
        // Prepare text message & prompt download first so user has the image ready
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Matriks_Kas_XI_DKV_${activeWeekObj.shortLabel}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const caption = encodeURIComponent(
          `📊 *GAMBAR MATRIKS KAS XI DKV (${activeWeekObj.label})*\n` +
          `💰 Saldo Saat Ini: *${formatRupiah(totals.currentBalance)}*\n` +
          `📌 Total Tunggakan: ${formatRupiah(totals.totalArrearsUpToActive)}\n\n` +
          `_Gambar matriks telah terunduh otomatis. Silakan lampirkan gambar tersebut ke grup WhatsApp!_`
        );
        window.open(`https://wa.me/?text=${caption}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to export matrix image', err);
      alert('Gagal membuat gambar matriks. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Bagikan Matriks Kas Sebagai Gambar</h2>
              <p className="text-xs text-indigo-200">
                Ekspor tabel visual matriks kas XI DKV ke format PNG siap kirim ke WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Bulan Matriks:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Minggu (Ringkas)</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  Bulan {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={isGenerating}
              onClick={() => handleExportImage('download')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-sm disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{downloadSuccess ? 'Berhasil Diunduh!' : 'Unduh Gambar (PNG)'}</span>
            </button>

            <button
              disabled={isGenerating}
              onClick={() => handleExportImage('whatsapp')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-sm disabled:opacity-50 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bagikan ke WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Matrix Image Render Target Container */}
        <div className="p-5 overflow-auto flex-1 bg-slate-100 dark:bg-slate-950">
          <div className="flex justify-center">
            <div
              ref={matrixRef}
              className="bg-white text-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 min-w-[780px] max-w-[950px]"
            >
              {/* Header Image Title */}
              <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Laporan Resmi DKV
                    </span>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">
                      MATRIKS KAS XI DESAIN KOMUNIKASI VISUAL
                    </h1>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Periode: {activeWeekObj.label} • Standard Iuran: Rp 5.000 / minggu
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Saldo Kas
                  </p>
                  <p className="text-xl font-black text-indigo-700">
                    {formatRupiah(totals.currentBalance)}
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-3 mb-4 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Kas Masuk</p>
                  <p className="font-extrabold text-emerald-600">{formatRupiah(totals.totalIncome)}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Pengeluaran</p>
                  <p className="font-extrabold text-rose-600">{formatRupiah(totals.totalExpenses)}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Total Tunggakan</p>
                  <p className="font-extrabold text-amber-600">
                    {formatRupiah(totals.totalArrearsUpToActive)}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tingkat Bayar</p>
                  <p className="font-extrabold text-indigo-600">{totals.collectionRate}%</p>
                </div>
              </div>

              {/* Clean Table Matrix */}
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                    <th className="p-2.5 text-center w-8">No</th>
                    <th className="p-2.5 w-44 border-r border-slate-700">Nama Siswa</th>
                    <th className="p-2.5 text-right w-24 border-r border-slate-700">Total Bayar</th>
                    <th className="p-2.5 text-right w-24 border-r border-slate-700">Tunggakan</th>
                    {weeksToRender.slice(0, 8).map((w) => (
                      <th
                        key={w.id}
                        className={`p-2 text-center border-r border-slate-700 ${
                          w.id === state.activeWeekId ? 'bg-indigo-700 text-white font-black' : ''
                        }`}
                      >
                        {w.shortLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.students.map((student, idx) => {
                    const summary = calculateStudentSummary(
                      student,
                      state.weeks,
                      state.payments,
                      state.weeklyTarget,
                      state.activeWeekId
                    );

                    return (
                      <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-200 truncate">
                          {student.name}
                        </td>
                        <td className="p-2 text-right font-extrabold text-indigo-700 border-r border-slate-200">
                          {formatRupiah(summary.totalPaid)}
                        </td>
                        <td className="p-2 text-right font-bold border-r border-slate-200">
                          {summary.totalArrears > 0 ? (
                            <span className="text-rose-600 font-extrabold">
                              {formatRupiah(summary.totalArrears)}
                            </span>
                          ) : (
                            <span className="text-emerald-600">Rp 0</span>
                          )}
                        </td>
                        {weeksToRender.slice(0, 8).map((w) => {
                          const paid = state.payments[`${student.id}_${w.id}`] || 0;
                          const isLunas = paid >= state.weeklyTarget;
                          const isKurang = paid > 0 && paid < state.weeklyTarget;

                          return (
                            <td key={w.id} className="p-1.5 text-center border-r border-slate-200">
                              {isLunas ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                                  LUNAS
                                </span>
                              ) : isKurang ? (
                                <span className="inline-block px-1 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px]">
                                  {formatRupiah(paid)}
                                </span>
                              ) : (
                                <span className="inline-block px-1 py-0.5 rounded bg-rose-50 text-rose-600 font-medium text-[9px]">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <p>Aplikasi Kas Transparan XI DKV • Diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
                <p>Oleh Bendahara XI DKV</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
