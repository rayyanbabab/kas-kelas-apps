import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CreditCard, History, FileText, ArrowRight,
  ShieldCheck, QrCode, Wallet, TrendingUp,
  Sparkles, Check, Clock, UserCircle2,
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

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
  const { currentUser, classGroup, payments, totalBalance, users } = useApp();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const weeklyFee = classGroup.weeklyDues || 6000;
  const monthlyFee = classGroup.monthlyDues || 24000;

  const userMonthPayments = payments.filter(
    (p) => p.userId === currentUser.id && p.monthPeriod === classGroup.period && p.status === 'lunas'
  );
  const totalPaidThisMonth = userMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const isWeekPaid = (wk: number) => totalPaidThisMonth >= wk * weeklyFee;
  const isFullMonthPaid = totalPaidThisMonth >= monthlyFee;
  const hasPendingPayment = payments.some(
    (p) => p.userId === currentUser.id && p.monthPeriod === classGroup.period && p.status === 'menunggu'
  );
  const totalMembers = users.filter((u) => u.role === 'anggota').length;
  const remaining = Math.max(0, monthlyFee - totalPaidThisMonth);

  return (
    <div className="space-y-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 shadow-sm">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Left: Avatar + info */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/70 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3b82f6&color=fff`;
                }}
              />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 rounded-md text-[11px] font-medium text-blue-100 border border-white/10">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Anggota • {classGroup.name}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Halo, {currentUser.name} 👋</h1>
              <p className="text-blue-100/80 text-xs">
                Iuran: <span className="font-semibold text-white">Rp {weeklyFee.toLocaleString('id-ID')}</span> / minggu · {totalMembers} Anggota
              </p>
              <button
                onClick={() => setShowEditProfile(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/70 hover:text-white transition-colors mt-0.5 cursor-pointer"
              >
                <UserCircle2 className="w-3.5 h-3.5" />
                Edit Profil
              </button>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            <button
              onClick={onOpenPayModal}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Bayar Kas
            </button>
            <button
              onClick={onOpenQrModal}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              QR ID
            </button>
          </div>
        </div>
      </div>

      {/* ── Weekly Payment Status ── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Status Pembayaran Mingguan</h2>
            <p className="text-xs text-slate-400 mt-0.5">{classGroup.period} · Rp {weeklyFee.toLocaleString('id-ID')} / pekan</p>
          </div>
          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold border ${
            isFullMonthPaid
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : hasPendingPayment
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {isFullMonthPaid ? '✓ Lunas Bulan Ini' : hasPendingPayment ? '⏳ Menunggu Konfirmasi' : 'Belum Lunas'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((wk) => {
            const paid = isWeekPaid(wk);
            return (
              <div key={wk} className={`p-4 rounded-xl border text-center transition-all ${
                paid ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Minggu {wk}</span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${paid ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    {paid ? <Check className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-slate-400" />}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">Rp {weeklyFee.toLocaleString('id-ID')}</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {paid ? 'Lunas' : 'Belum'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Disetor: <strong className="text-slate-800">Rp {totalPaidThisMonth.toLocaleString('id-ID')}</strong></span>
            <span>Target: Rp {monthlyFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalPaidThisMonth / monthlyFee) * 100)}%` }}
            />
          </div>
          {!isFullMonthPaid && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-500">Sisa: <strong className="text-red-600">Rp {remaining.toLocaleString('id-ID')}</strong></p>
              <button
                onClick={onOpenPayModal}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
              >
                Bayar Sekarang →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ringkasan Kas */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Ringkasan Kas</span>
            </div>
            <span className="text-xs text-slate-400">Jatuh Tempo: Tgl {classGroup.dueDate}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Iuran Mingguan</p>
              <p className="text-lg font-bold text-slate-900">Rp {weeklyFee.toLocaleString('id-ID')}<span className="text-xs font-normal text-slate-400 ml-1">/ pekan</span></p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-slate-500 mb-1">Total 1 Bulan</p>
              <p className="text-lg font-bold text-blue-600">Rp {monthlyFee.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Bendahara: <span className="font-semibold text-slate-800">{classGroup.treasurerName}</span></p>
            <button onClick={() => setActiveTab('riwayat')} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors">
              Lihat Kuitansi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Kas Kelas */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kas Kelas</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-400 mt-1">{totalMembers} Anggota aktif</p>
          <div className="mt-auto pt-5">
            <button
              onClick={() => setActiveTab('laporan')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Transparansi Kas
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: 'Bayar Kas', sub: 'QRIS, E-Wallet, atau Transfer',
            icon: CreditCard, color: 'blue', action: onOpenPayModal,
          },
          {
            label: 'Kuitansi & Riwayat', sub: 'Download bukti pembayaran',
            icon: History, color: 'emerald', action: () => setActiveTab('riwayat'),
          },
          {
            label: 'Laporan Keuangan', sub: 'Cek pengeluaran & nota kas',
            icon: TrendingUp, color: 'purple', action: () => setActiveTab('laporan'),
          },
        ].map(({ label, sub, icon: Icon, color, action }) => (
          <button
            key={label}
            onClick={action}
            className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/70 hover:border-slate-300 shadow-sm hover:shadow transition-all text-left cursor-pointer"
          >
            <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white transition-colors shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </div>
  );
};
