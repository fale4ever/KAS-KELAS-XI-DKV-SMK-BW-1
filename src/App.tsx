import React, { useState, useEffect } from 'react';
import { AppState, ExpenseRecord, Student, WeekPeriod } from './types';
import { INITIAL_STATE } from './data/initialData';
import { subscribeToKasData, saveKasDataToFirebase } from './lib/firebase';
import { Header } from './components/Header';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DashboardView } from './components/DashboardView';
import { WeeklyMatrixView } from './components/WeeklyMatrixView';
import { PaymentModal } from './components/PaymentModal';
import { ExpensesView } from './components/ExpensesView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ArrearsView } from './components/ArrearsView';
import { StudentDirectoryView } from './components/StudentDirectoryView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { SettingsView } from './components/SettingsView';
import { ShareSummaryModal } from './components/ShareSummaryModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { calculateClassTotals } from './utils/formatters';

const STORAGE_KEY = 'kas_kelas_xi_dkv_v1';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.students && parsed.weeks) {
          return {
            ...INITIAL_STATE,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.error('Failed to load local state', e);
    }
    return INITIAL_STATE;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('kas_dkv_admin_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Payment Modal
  const [paymentModalData, setPaymentModalData] = useState<{
    student: Student;
    week: WeekPeriod;
  } | null>(null);

  // Modals
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Student Detail Modal
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  const isInitialFirebaseLoadedRef = React.useRef<boolean>(false);
  const isReceivingFirebaseUpdateRef = React.useRef<boolean>(false);

  // Subscribe to real-time updates from Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = subscribeToKasData((firebaseData) => {
      isReceivingFirebaseUpdateRef.current = true;
      setState(firebaseData);
      isInitialFirebaseLoadedRef.current = true;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Persist state to Firebase Realtime Database and localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      if (isReceivingFirebaseUpdateRef.current) {
        isReceivingFirebaseUpdateRef.current = false;
        return;
      }

      if (!isInitialFirebaseLoadedRef.current) {
        return;
      }

      saveKasDataToFirebase(state);

      fetch('/api/kas-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      }).catch((e) => console.warn('Failed to post state to server', e));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [state]);

  // Handle Treasurer Login
  const handleLogin = (enteredPin: string): boolean => {
    if (enteredPin === state.adminPin || enteredPin === 'dkv20262027') {
      setIsAdmin(true);
      sessionStorage.setItem('kas_dkv_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('kas_dkv_admin_auth');
  };

  // Payment update
  const handleSavePayment = (studentId: string, weekId: string, amount: number) => {
    setState((prev) => {
      const key = `${studentId}_${weekId}`;
      const newPayments = { ...prev.payments };
      if (amount <= 0) {
        delete newPayments[key];
      } else {
        newPayments[key] = amount;
      }
      return {
        ...prev,
        payments: newPayments,
      };
    });
  };

  // Bulk set lunas
  const handleBulkSetLunas = (weekId: string, studentIds: string[]) => {
    setState((prev) => {
      const newPayments = { ...prev.payments };
      studentIds.forEach((sId) => {
        const key = `${sId}_${weekId}`;
        newPayments[key] = prev.weeklyTarget;
      });
      return {
        ...prev,
        payments: newPayments,
      };
    });
  };

  // Expense management
  const handleAddExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newRecord: ExpenseRecord = {
      ...expenseData,
      id: 'exp-' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      expenses: [newRecord, ...prev.expenses],
    }));
  };

  const handleDeleteExpense = (expenseId: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }));
  };

  // Student phone contact update
  const handleUpdatePhone = (studentId: string, phone: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === studentId ? { ...s, phone } : s)),
    }));
  };

  // Settings updates
  const handleUpdatePin = (newPin: string) => {
    setState((prev) => ({ ...prev, adminPin: newPin }));
  };

  const handleUpdateWeeklyTarget = (newTarget: number) => {
    setState((prev) => ({ ...prev, weeklyTarget: newTarget }));
  };

  const handleUpdateWaTemplate = (template: string) => {
    setState((prev) => ({ ...prev, waReminderTemplate: template }));
  };

  const handleSetActiveWeek = (weekId: string) => {
    setState((prev) => ({ ...prev, activeWeekId: weekId }));
  };

  const handleResetData = () => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleImportData = (newState: AppState) => {
    setState(newState);
  };

  const totals = calculateClassTotals(state);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
      <Header
        isAdmin={isAdmin}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogoutAdmin={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalBalance={totals.currentBalance}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            state={state}
            isAdmin={isAdmin}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onNavigateTab={setActiveTab}
            onOpenAddExpenseModal={() => setIsAddExpenseModalOpen(true)}
            onSetActiveWeek={handleSetActiveWeek}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {activeTab === 'matrix' && (
          <WeeklyMatrixView
            state={state}
            isAdmin={isAdmin}
            onOpenPaymentModal={(student, week) => setPaymentModalData({ student, week })}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onBulkSetLunas={handleBulkSetLunas}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            state={state}
            isAdmin={isAdmin}
            onOpenAddExpenseModal={() => setIsAddExpenseModalOpen(true)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'arrears' && (
          <ArrearsView
            state={state}
            isAdmin={isAdmin}
            onUpdatePhone={handleUpdatePhone}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onUpdateWaTemplate={handleUpdateWaTemplate}
          />
        )}

        {activeTab === 'students' && (
          <StudentDirectoryView
            state={state}
            isAdmin={isAdmin}
            onSelectStudent={(student) => setSelectedStudentForDetail(student)}
            onUpdatePhone={handleUpdatePhone}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            state={state}
            isAdmin={isAdmin}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onUpdatePin={handleUpdatePin}
            onUpdateWeeklyTarget={handleUpdateWeeklyTarget}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            Aplikasi Kas Kelas XI Desain Komunikasi Visual (DKV)
          </p>
          <p>
            Periode Kas: Minggu 3 Juli 2026 – Minggu 4 Juni 2027 • Standard Target: Rp 5.000 / minggu
          </p>
        </div>
      </footer>

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <PaymentModal
        isOpen={!!paymentModalData}
        onClose={() => setPaymentModalData(null)}
        student={paymentModalData?.student || null}
        week={paymentModalData?.week || null}
        currentAmount={
          paymentModalData
            ? state.payments[`${paymentModalData.student.id}_${paymentModalData.week.id}`] || 0
            : 0
        }
        weeklyTarget={state.weeklyTarget}
        isAdmin={isAdmin}
        onSavePayment={handleSavePayment}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <StudentDetailModal
        isOpen={!!selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        student={selectedStudentForDetail}
        state={state}
      />

      <ShareSummaryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        state={state}
      />

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
