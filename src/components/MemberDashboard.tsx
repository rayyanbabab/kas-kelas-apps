import React from 'react';
import { useApp } from '../context/AppContext';
import { PaymentStatus } from '../types';
import { CreditCard, History, FileText, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, QrCode, Wallet, TrendingUp, Sparkles } from 'lucide-react';

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

  // Find payment status for current member this month
  const currentMonthPayment = payments.find(
    (p) => p.userId === currentUser.id && p.monthPeriod === classGroup.period
  );

  let status: PaymentStatus = 'belum_bayar';
  if (currentMonthPayment) {
    status = currentMonthPayment.status;
  }

  const statusConfig: Record<
    PaymentStatus,
    { label: string; bg: string; text: string; icon: React.ReactNode; desc: string; badge: string }
  > = {
    lunas: {
      label: 'LUNAS ✅',
      bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      desc: `Pembayaran kas bulan ${classGroup.period} sudah diterima & terverifikasi.`,
    },
    menunggu: {
      label: 'MENUNGGU VERIFIKASI 🟡',
      bg: 'bg-amber-500/10 text-amber-700 border-amber-300',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      desc: 'Bukti pembayaran sedang dalam proses pengecekan oleh Bendahara.',
    },
    belum_bayar: {
      label: 'BELUM BAYAR 🔴',
      bg: 'bg-rose-500/10 text-rose-700 border-rose-300',
      text: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800',
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
      desc: `Silakan lakukan pembayaran sebesar Rp${classGroup.monthlyDues.toLocaleString('id-ID')} sebelum tanggal ${classGroup.dueDate} ${classGroup.period}.`,
    },
    terlambat: {
      label: 'TERLAMBAT ⚠️',
      bg: 'bg-red-500/15 text-red-800 border-red-400',
      text: 'text-red-800',
      badge: 'bg-red-200 text-red-900',
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      desc: `Pembayaran melewati batas waktu tanggal ${classGroup.dueDate}. Mohon segera bayar kas kelas.`,
    },
  };

  const currentStatusInfo = statusConfig[status];

  // Calculate Class Payment Progress
  const totalMembers = users.filter((u) => u.role !== 'admin').length;
  const progressPercentage = Math.round((paidMembersCount / totalMembers) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#2563EB] text-white p-6 sm:p-8 shadow-xl border border-blue-400/30">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>KasKu Digital — {classGroup.name}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
              Halo, {currentUser.name}! 👋
            </h1>
            <p className="text-blue-100 text-sm max-w-xl font-medium">
              Bayar uang kas bulanan dengan cepat, pantau riwayat transaksi, dan tingkatkan transparansi kas kelas bersama.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPayModal}
              className="px-6 py-3.5 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 active:scale-95 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>BAYAR KAS SEKARANG</span>
            </button>
            <button
              onClick={onOpenQrModal}
              className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 border border-white/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Status & Dues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Payment Status Card */}
        <div className={`col-span-1 md:col-span-2 rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${currentStatusInfo.bg}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {currentStatusInfo.icon}
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  Status Kas Bulan {classGroup.period}
                </span>
              </div>
              <span className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wider ${currentStatusInfo.badge}`}>
                {currentStatusInfo.label}
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tagihan Kas Bulan Ini</p>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Rp {classGroup.monthlyDues.toLocaleString('id-ID')}
              </p>
              <p className="text-xs font-medium text-slate-600 mt-2">{currentStatusInfo.desc}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-bold">
              Batas Jatuh Tempo: <span className="font-black text-slate-900">{classGroup.dueDate} {classGroup.period}</span>
            </div>

            {status !== 'lunas' ? (
              <button
                onClick={onOpenPayModal}
                className="text-xs font-black uppercase tracking-wider text-[#2563EB] hover:text-blue-800 flex items-center space-x-1"
              >
                <span>Proses Pembayaran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Terverifikasi</span>
              </span>
            )}
          </div>
        </div>

        {/* Class Balance Summary Card */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Saldo Kas</span>
              <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-2xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <p className="text-3xl font-black text-[#2563EB] tracking-tight">
              Rp {totalBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
              Kas Aktif {classGroup.name}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 uppercase tracking-wider text-[11px]">Progress Kas:</span>
                <span className="font-black text-[#2563EB]">{progressPercentage}% LUNAS</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5">
                <span className="font-bold text-slate-800">{paidMembersCount}</span> dari <span className="font-bold text-slate-800">{totalMembers}</span> anggota sudah bayar.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('laporan')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 border border-slate-200 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Rincian Laporan Kas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenPayModal}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Bayar Kas Digital
            </h3>
            <p className="text-xs text-slate-500 font-medium">QRIS, E-Wallet, atau Transfer Bank</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
              Riwayat Pembayaran
            </h3>
            <p className="text-xs text-slate-500 font-medium">Struk & bukti transaksi saya</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group flex items-center space-x-4 cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
              Transparansi Kas
            </h3>
            <p className="text-xs text-slate-500 font-medium">Laporan pemasukan & pengeluaran</p>
          </div>
        </button>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Aktivitas & Pembayaran Terbaru</h2>
            <p className="text-xs text-slate-500 font-medium">Transaksi kas kelas yang baru saja dicatat</p>
          </div>
          <button
            onClick={() => setActiveTab('riwayat')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {payments.slice(0, 5).map((pay) => (
            <div key={pay.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                    pay.status === 'lunas'
                      ? 'bg-emerald-100 text-emerald-700'
                      : pay.status === 'menunggu'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {pay.userName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{pay.userName}</p>
                  <p className="text-slate-500 text-[11px]">
                    Periode {pay.monthPeriod} • {pay.method.toUpperCase().replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-900">
                  Rp {pay.amount.toLocaleString('id-ID')}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    pay.status === 'lunas'
                      ? 'bg-emerald-100 text-emerald-800'
                      : pay.status === 'menunggu'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {pay.status === 'lunas' ? 'LUNAS' : pay.status === 'menunggu' ? 'VERIFIKASI' : 'BELUM BAYAR'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
