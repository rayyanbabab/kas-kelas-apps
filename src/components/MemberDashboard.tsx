import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentStatus } from '../types';
import { CreditCard, History, FileText, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, QrCode, Wallet, TrendingUp, Sparkles, Check, XCircle, Camera, Edit3 } from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { EditNameModal } from './EditNameModal';

interface MemberDashboardProps {
  onOpenPayModal: () => void;
  setActiveTab: (tab: string) => void;
  onOpenQrModal: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onOpenPayModal,
  setActiveTab,
  onOpenQrModal,
}) => {
  const { currentUser, classGroup, payments, totalBalance, paidMembersCount, users } = useApp();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const weeklyFee = classGroup.weeklyDues || 6000;
  const monthlyFee = classGroup.monthlyDues || 24000;

  // Find all payments for current member in this month
  const userMonthPayments = payments.filter(
    (p) => p.userId === currentUser.id && p.monthPeriod === classGroup.period && p.status === 'lunas'
  );

  const totalPaidThisMonth = userMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Check which weeks are paid
  const isWeekPaid = (weekNum: number) => {
    return totalPaidThisMonth >= weekNum * weeklyFee;
  };

  const isFullMonthPaid = totalPaidThisMonth >= monthlyFee;
  const hasPendingPayment = payments.some(
    (p) => p.userId === currentUser.id && p.monthPeriod === classGroup.period && p.status === 'menunggu'
  );

  // Total members in class
  const memberList = users.filter((u) => u.role === 'anggota');
  const totalMembers = memberList.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card with Profile Photo */}
      <div className="relative overflow-hidden rounded-3xl bg-[#2563EB] text-white p-6 sm:p-8 shadow-xl border border-blue-400/30">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Avatar with quick edit trigger */}
            <div className="relative group shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white/90 shadow-xl"
              />
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-[#1E293B] hover:bg-slate-900 text-white rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>HAK AKSES: ANGGOTA KELAS ({currentUser.name})</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight uppercase">
                Halo, {currentUser.name}! 👋
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                Iuran kas: <strong>Rp {weeklyFee.toLocaleString('id-ID')} / minggu</strong> • {totalMembers} Anggota {classGroup.name}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setIsNameModalOpen(true)}
                  className="text-[11px] font-black text-white hover:text-amber-200 uppercase tracking-wider bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 cursor-pointer border border-white/20 transition-all"
                  title="Ubah Nama Pengguna"
                >
                  <Edit3 className="w-3 h-3 text-amber-300" />
                  <span>Ganti Nama</span>
                </button>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[11px] font-black text-amber-200 hover:text-white uppercase tracking-wider underline flex items-center space-x-1 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Ubah Foto</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPayModal}
              className="px-6 py-3.5 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 active:scale-95 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>BAYAR KAS DIGITAL</span>
            </button>
            <button
              onClick={onOpenQrModal}
              className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 border border-white/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>ID QR Setor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown Matrix for Member */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Status Pembayaran Kas Mingguan ({classGroup.period})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tarif: <strong>Rp {weeklyFee.toLocaleString('id-ID')}</strong> per pekan • Total Bulan: <strong>Rp {monthlyFee.toLocaleString('id-ID')}</strong>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isFullMonthPaid
                ? 'bg-emerald-100 text-emerald-800'
                : hasPendingPayment
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {isFullMonthPaid ? '1 Bulan Penuh Lunas ✅' : hasPendingPayment ? 'Menunggu Verifikasi 🟡' : 'Belum Lunas 4 Minggu'}
            </span>
          </div>
        </div>

        {/* 4-Week Progress Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((wk) => {
            const paid = isWeekPaid(wk);
            return (
              <div
                key={wk}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  paid
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Minggu #{wk}
                  </span>
                  {paid ? (
                    <span className="p-1 bg-emerald-600 text-white rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="p-1 bg-slate-300 text-slate-600 rounded-full">
                      <Clock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-lg font-black text-slate-900">
                  Rp {weeklyFee.toLocaleString('id-ID')}
                </p>
                <span
                  className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    paid
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {paid ? 'Lunas ✅' : 'Belum Bayar'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-blue-900 font-medium">
            💡 Total sudah disetor bulan ini: <strong className="text-[#2563EB] font-black">Rp {totalPaidThisMonth.toLocaleString('id-ID')}</strong> dari <strong className="font-black">Rp {monthlyFee.toLocaleString('id-ID')}</strong>.
          </div>
          {!isFullMonthPaid && (
            <button
              onClick={onOpenPayModal}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-black rounded-xl uppercase tracking-wider shadow-xs cursor-pointer shrink-0"
            >
              Bayar Sisa Tagihan
            </button>
          )}
        </div>
      </div>

      {/* Main Status & Dues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Payment Summary Card */}
        <div className="col-span-1 md:col-span-2 rounded-3xl p-6 border shadow-sm flex flex-col justify-between bg-white border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  Ringkasan Kas Anggota
                </span>
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Jatuh Tempo: Tgl {classGroup.dueDate} {classGroup.period}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Iuran Kas Mingguan</p>
                <p className="text-2xl font-black text-slate-900">
                  Rp {weeklyFee.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-500">/ pekan</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Kas 1 Bulan (4 Pekan)</p>
                <p className="text-2xl font-black text-[#2563EB]">
                  Rp {monthlyFee.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Bendahara Kelas: <span className="font-black text-slate-900">{classGroup.treasurerName}</span>
            </div>

            <button
              onClick={() => setActiveTab('riwayat')}
              className="text-xs font-black uppercase tracking-wider text-[#2563EB] hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>Lihat Kuitansi Saya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Class Balance Summary Card */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Saldo Kas Kelas</span>
              <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-2xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <p className="text-3xl font-black text-[#2563EB] tracking-tight">
              Rp {totalBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
              Kas Aktif {totalMembers} Anggota {classGroup.name}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            <button
              onClick={() => setActiveTab('laporan')}
              className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-blue-200 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Transparansi Laporan Kas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenPayModal}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#2563EB] transition-colors uppercase tracking-tight">
              Bayar Kas (Rp 6.000)
            </h3>
            <p className="text-xs text-slate-500 font-medium">QRIS, E-Wallet, atau Transfer</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
              Kuitansi & Riwayat
            </h3>
            <p className="text-xs text-slate-500 font-medium">Download bukti pembayaran</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-500 hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors uppercase tracking-tight">
              Laporan Keuangan
            </h3>
            <p className="text-xs text-slate-500 font-medium">Cek pengeluaran & nota kelas</p>
          </div>
        </button>
      </div>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Edit Name Modal */}
      <EditNameModal
        user={currentUser}
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
      />
    </div>
  );
};
