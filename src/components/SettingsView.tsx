import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import { AppState } from '../types';

interface SettingsViewProps {
  state: AppState;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onUpdatePin: (newPin: string) => void;
  onUpdateWeeklyTarget: (newTarget: number) => void;
  onImportData: (newState: AppState) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  isAdmin,
  onOpenLoginModal,
  onUpdatePin,
  onUpdateWeeklyTarget,
  onImportData,
  onResetData,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinMessage, setPinMessage] = useState('');
  const [targetInput, setTargetInput] = useState<number>(state.weeklyTarget);
  const [targetMessage, setTargetMessage] = useState('');

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 3) {
      setPinMessage('Password/PIN minimal 3 karakter.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage('Konfirmasi password tidak cocok.');
      return;
    }

    onUpdatePin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinMessage('Password/PIN Bendahara berhasil diperbarui!');
    setTimeout(() => setPinMessage(''), 3000);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput || targetInput <= 0) {
      setTargetMessage('Masukkan nominal yang valid.');
      return;
    }

    onUpdateWeeklyTarget(targetInput);
    setTargetMessage('Nominal iuran mingguan berhasil diperbarui!');
    setTimeout(() => setTargetMessage(''), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `kas_xi_dkv_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.students && parsed.weeks) {
            onImportData(parsed);
            alert('Data kas kelas berhasil dipulihkan!');
          } else {
            alert('Format file JSON tidak valid.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-slate-900 text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Pengaturan Aplikasi Kas XI DKV
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola keamanan Bendahara, nominal iuran mingguan, cadangan data JSON, dan reset database.
            </p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Mode Akses Tamu (Read-Only)
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Pengaturan keamanan dan modifikasi data hanya dapat diakses oleh Bendahara / Admin.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shrink-0"
          >
            Login Bendahara
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password / PIN Management */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
            <KeyRound className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold">Keamanan Password Bendahara</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Password atau PIN digunakan untuk mengunci hak akses edit. Password tidak pernah ditampilkan secara langsung di layar publik.
          </p>

          {pinMessage && (
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
              {pinMessage}
            </div>
          )}

          <form onSubmit={handleSavePin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password Baru Bendahara
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  disabled={!isAdmin}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                disabled={!isAdmin}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Ketik ulang password..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={!isAdmin}
              className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              Simpan Password Baru
            </button>
          </form>
        </div>

        {/* Weekly Fee Target Adjustment */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold">Nominal Target Iuran Mingguan</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Default target iuran ditetapkan sebesar <strong>Rp 5.000</strong> per minggu.
          </p>

          {targetMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              {targetMessage}
            </div>
          )}

          <form onSubmit={handleSaveTarget} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Iuran Per Minggu (Rp)
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-xs">
                  Rp
                </span>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  disabled={!isAdmin}
                  value={targetInput}
                  onChange={(e) => setTargetInput(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isAdmin}
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              Simpan Nominal Target
            </button>
          </form>
        </div>
      </div>

      {/* Backup, Restore & Reset Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Penyimpanan & Cadangan Data Kas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Download JSON Backup */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <Download className="w-5 h-5 text-indigo-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Unduh Backup JSON</h4>
            <p className="text-[11px] text-slate-500">
              Simpan cadangan semua pembayaran, siswa, dan pengeluaran ke file JSON.
            </p>
            <button
              onClick={handleExportJSON}
              className="w-full py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
            >
              Unduh Backup
            </button>
          </div>

          {/* Restore JSON Backup */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <Upload className="w-5 h-5 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pulihkan Backup JSON</h4>
            <p className="text-[11px] text-slate-500">
              Unggah file backup JSON untuk mengembalikan data kas sebelumnya.
            </p>
            <label className={`w-full py-2 text-xs font-bold text-center block rounded-lg cursor-pointer transition-colors shadow-sm ${isAdmin ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
              Pilih File Backup
              <input
                type="file"
                accept=".json"
                disabled={!isAdmin}
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Database */}
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 space-y-2">
            <RotateCcw className="w-5 h-5 text-rose-500" />
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Reset Data Awal</h4>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Kosongkan semua pembayaran & pengeluaran ke saldo awal Rp 0.
            </p>
            <button
              disabled={!isAdmin}
              onClick={() => {
                if (
                  confirm(
                    'PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kas ke keadaan awal (Saldo Rp 0, 0 Pengeluaran)?'
                  )
                ) {
                  onResetData();
                  alert('Data kas berhasil direset ke keadaan awal.');
                }
              }}
              className="w-full py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              Reset ke Awal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
