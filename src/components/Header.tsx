import React from 'react';
import {
  Wallet,
  ShieldCheck,
  Lock,
  LogOut,
  LayoutDashboard,
  Table,
  Receipt,
  AlertTriangle,
  Users,
  Settings,
  Sparkles,
  Share2,
} from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onLogoutAdmin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalBalance: number;
  onOpenShareModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onOpenLoginModal,
  onLogoutAdmin,
  activeTab,
  setActiveTab,
  onOpenShareModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'matrix', label: 'Matriks Kas', icon: Table },
    { id: 'expenses', label: 'Pengeluaran', icon: Receipt },
    { id: 'arrears', label: 'Tunggakan & WA', icon: AlertTriangle },
    { id: 'students', label: 'Daftar Siswa', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Class Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md text-white font-bold text-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Kas Kelas XI DKV
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  SMK DKV
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tahun Ajaran 2026/2027 • Jul 2026 - Jun 2027
              </p>
            </div>
          </div>

          {/* Access Control Badge & Login/Logout & Share */}
          <div className="flex items-center space-x-2">
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Kas</span>
              </button>
            )}

            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Akses Bendahara
                </span>
                <button
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                  title="Keluar dari mode Bendahara"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Mode Tamu (Read-Only)
                </span>
                <button
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md hover:shadow-indigo-500/20"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login Bendahara</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
