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
    <header className="bg-slate-900/95 backdrop-blur-md text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Class Info */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white border border-indigo-400/20 shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
                  Kas XI DKV
                </h1>
                <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  SMK DKV
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>TA 2026/2027</span>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  Live
                </span>
              </p>
            </div>
          </div>

          {/* Action Toolbar & Login Bendahara */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Bagikan button */}
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-emerald-950/70 text-emerald-300 hover:text-emerald-200 border border-slate-700/80 hover:border-emerald-500/40 transition-all shadow-sm"
                title="Bagikan Ringkasan Kas"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline">Bagikan</span>
              </button>
            )}

            {/* Login / Status Bendahara */}
            {isAdmin ? (
              <div className="flex items-center space-x-1.5">
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
                  <span>Bendahara</span>
                </span>
                <button
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Keluar dari mode Bendahara"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/25 whitespace-nowrap"
                title="Login sebagai Bendahara untuk edit data kas"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Login</span>
                <span className="hidden sm:inline">Bendahara</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-1.5 py-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
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


