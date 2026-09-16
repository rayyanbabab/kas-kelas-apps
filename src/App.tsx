import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { MemberDashboard } from './components/MemberDashboard';
import { PaymentModal } from './components/PaymentModal';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { TreasurerDashboard } from './components/TreasurerDashboard';
import { ExpensesManager } from './components/ExpensesManager';
import { FinancialReportView } from './components/FinancialReportView';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberQrModal } from './components/MemberQrModal';
import { AccessDeniedBanner } from './components/AccessDeniedBanner';
import { LoginPage } from './components/LoginPage';

function AppContent() {
  const { currentUser, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isTreasurerOrAdmin = currentUser.role === 'bendahara' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenPayModal={() => setIsPayModalOpen(true)}
      />

      {/* Main content */}
      <div className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen flex flex-col bg-slate-100">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">

          {activeTab === 'dashboard' && (
            currentUser.role === 'bendahara' ? (
              <TreasurerDashboard setActiveTab={setActiveTab} />
            ) : currentUser.role === 'admin' ? (
              <AdminDashboard initialTab="overview" setActiveTab={setActiveTab} />
            ) : (
              <MemberDashboard
                onOpenPayModal={() => setIsPayModalOpen(true)}
                setActiveTab={setActiveTab}
                onOpenQrModal={() => setIsQrModalOpen(true)}
              />
            )
          )}

          {activeTab === 'bayar' && (
            <div className="max-w-2xl mx-auto py-8">
              <PaymentModal
                isOpen={true}
                onClose={() => setActiveTab('dashboard')}
                onSuccess={() => setActiveTab('riwayat')}
              />
            </div>
          )}

          {activeTab === 'riwayat' && <PaymentHistoryView />}

          {activeTab === 'pembayaran' && (
            isTreasurerOrAdmin ? (
              <TreasurerDashboard setActiveTab={setActiveTab} />
            ) : (
              <AccessDeniedBanner requiredRole="Bendahara" setActiveTab={setActiveTab} />
            )
          )}

          {activeTab === 'pengeluaran' && (
            isTreasurerOrAdmin ? (
              <ExpensesManager />
            ) : (
              <AccessDeniedBanner requiredRole="Bendahara" setActiveTab={setActiveTab} />
            )
          )}

          {activeTab === 'laporan' && <FinancialReportView setActiveTab={setActiveTab} />}

          {activeTab === 'admin' && (
            isAdmin ? (
              <AdminDashboard initialTab="users" setActiveTab={setActiveTab} />
            ) : (
              <AccessDeniedBanner requiredRole="Admin Sistem" setActiveTab={setActiveTab} />
            )
          )}
        </main>
      </div>

      {/* Global Modals */}
      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={() => {
          setIsPayModalOpen(false);
          setActiveTab('riwayat');
        }}
      />

      <MemberQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
