import React, { useState } from 'react';
import { Share2, Copy, Check, X, MessageSquare, Send } from 'lucide-react';
import { AppState } from '../types';
import { calculateClassTotals, formatRupiah } from '../utils/formatters';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totals = calculateClassTotals(state);
  const activeWeekObj = state.weeks.find((w) => w.id === state.activeWeekId) || state.weeks[0];

  // Generate clean WhatsApp & plain text formatted summary
  const summaryText = `📊 *LAPORAN RINGKASAN KAS XI DKV*
🗓️ Periode: ${activeWeekObj.label}

💰 *Ringkasan Keuangan:*
• Saldo Kas Saat Ini: *${formatRupiah(totals.currentBalance)}*
• Total Kas Masuk: ${formatRupiah(totals.totalIncome)}
• Total Pengeluaran: ${formatRupiah(totals.totalExpenses)}
• Total Tunggakan s/d ${activeWeekObj.shortLabel}: ${formatRupiah(totals.totalArrearsUpToActive)}
• Tingkat Keterbayaran: ${totals.collectionRate}%

📌 *Target Iuran Kas:* Rp ${state.weeklyTarget.toLocaleString('id-ID')} / minggu per siswa

👥 *Ketentuan Akses:*
3 Bendahara XI DKV mengelola data menggunakan 1 password bersama. Semua siswa dapat memantau saldo, rincian pengeluaran, dan tunggakan secara transparan.

_Diperbarui secara otomatis pada: ${new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Laporan Kas XI DKV',
          text: summaryText,
        });
      } catch (err) {
        console.error('Share cancelled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Bagikan Ringkasan Kas</h2>
              <p className="text-xs text-indigo-200">Format pesan rapi untuk grup WhatsApp XI DKV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Container */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
            {summaryText}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bagikan ke WhatsApp</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Bagikan Sistem</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className={`py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all border ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
