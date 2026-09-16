import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderNav } from './components/HeaderNav';
import { MemberDashboard } from './components/MemberDashboard';
import { PaymentModal } from './components/PaymentModal';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { TreasurerDashboard } from './components/TreasurerDashboard';
import { ExpensesManager } from './components/ExpensesManager';
import { FinancialReportView } from './components/FinancialReportView';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberQrModal } from './components/MemberQrModal';
import { AccessDeniedBanner } from './components/AccessDeniedBanner';
import { Home, CreditCard, History, FileText, PlusCircle, Settings, QrCode } from 'lucide-react';

function AppContent() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  const isTreasurerOrAdmin = currentUser.role === 'bendahara' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1E293B] font-sans flex flex-col pb-20 md:pb-8">
      {/* Top Header */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Render Tab based on activeTab & user role */}
        {activeTab === 'dashboard' && (
          currentUser.role === 'bendahara' ? (
            <TreasurerDashboard setActiveTab={setActiveTab} />
          ) : currentUser.role === 'admin' ? (
            <AdminDashboard />
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
            <AdminDashboard />
          ) : (
            <AccessDeniedBanner requiredRole="Admin Sistem" setActiveTab={setActiveTab} />
          )
        )}
      </main>

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

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-3 py-2 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
            activeTab === 'dashboard' ? 'text-[#2563EB]' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Beranda</span>
        </button>

        {currentUser.role === 'anggota' && (
          <>
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider text-[#2563EB]"
            >
              <div className="p-2.5 bg-[#2563EB] text-white rounded-full shadow-lg -mt-5 border-2 border-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <span>Bayar</span>
            </button>

            <button
              onClick={() => setActiveTab('riwayat')}
              className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
                activeTab === 'riwayat' ? 'text-[#2563EB]' : 'text-slate-400'
              }`}
            >
              <History className="w-5 h-5" />
              <span>Riwayat</span>
            </button>
          </>
        )}

        {(currentUser.role === 'bendahara' || currentUser.role === 'admin') && (
          <>
            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
                activeTab === 'pembayaran' ? 'text-[#2563EB]' : 'text-slate-400'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Kas Class</span>
            </button>

            <button
              onClick={() => setActiveTab('pengeluaran')}
              className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
                activeTab === 'pengeluaran' ? 'text-[#2563EB]' : 'text-slate-400'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex flex-col items-center space-y-0.5 text-[10px] font-black uppercase tracking-wider ${
            activeTab === 'laporan' ? 'text-[#2563EB]' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Laporan</span>
        </button>
      </div>
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
