import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentStatus, User } from '../types';
import { VerificationModal } from './VerificationModal';
import { DeleteMemberModal } from './DeleteMemberModal';
import { EditProfileModal } from './EditProfileModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Users, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, Search, PlusCircle, Bell, ShieldCheck, Send, Trash2, X, UserCircle2 } from 'lucide-react';

interface TreasurerDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const TreasurerDashboard: React.FC<TreasurerDashboardProps> = ({ setActiveTab }) => {
  const {
    currentUser,
    classGroup,
    users,
    payments,
    expenses,
    totalBalance,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    paidMembersCount,
    unpaidMembersCount,
    pendingVerificationCount,
    sendReminder,
    markPaidManual,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('semua');
  const [selectedPaymentForVerif, setSelectedPaymentForVerif] = useState<any>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);

  const memberUsers = users.filter((u) => u.role !== 'admin');

  // Broadcast reminder to all unpaid members
  const handleBroadcastReminder = () => {
    sendReminder('all');
    setReminderToast(`Pengingat pembayaran otomatis dikirimkan ke ${unpaidMembersCount} anggota.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Single member reminder
  const handleSingleReminder = (user: User) => {
    sendReminder(user.id);
    setReminderToast(`Notifikasi pengingat kas dikirimkan ke ${user.name}.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Filter members list with accurate multi-payment aggregation
  const filteredMembers = memberUsers.map((u) => {
    const userPayments = payments.filter(
      (pay) => pay.userId === u.id && pay.monthPeriod === classGroup.period
    );
    const lunasPayments = userPayments.filter((p) => p.status === 'lunas');
    const waitingPayments = userPayments.filter((p) => p.status === 'menunggu');
    const totalPaid = lunasPayments.reduce((sum, p) => sum + p.amount, 0);

    let status: PaymentStatus = 'belum_bayar';
    if (totalPaid >= classGroup.monthlyDues) {
      status = 'lunas';
    } else if (waitingPayments.length > 0) {
      status = 'menunggu';
    } else if (totalPaid > 0) {
      status = 'lunas'; // Disetor sebagian / cicilan
    }

    const latestPayment = waitingPayments[0] || userPayments[0];

    return {
      user: u,
      payment: latestPayment,
      totalPaid,
      status,
      duesAmount: classGroup.monthlyDues,
    };
  }).filter((item) => {
    const matchesSearch = item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'semua' || item.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Recharts Monthly Chart Data
  const monthlyChartData = [
    { name: 'Mei', Pemasukan: 320000, Pengeluaran: 50000 },
    { name: 'Juni', Pemasukan: 350000, Pengeluaran: 80000 },
    { name: 'Juli', Pemasukan: 340000, Pengeluaran: 120000 },
    { name: 'Agustus', Pemasukan: totalIncomeThisMonth, Pengeluaran: totalExpenseThisMonth },
  ];

  const pieChartData = [
    { name: 'Lunas', value: paidMembersCount, color: '#10B981' },
    { name: 'Menunggu', value: pendingVerificationCount, color: '#F59E0B' },
    { name: 'Belum Bayar', value: unpaidMembersCount, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {reminderToast && (
        <div className="p-4 rounded-xl bg-blue-600 text-white font-medium text-xs shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-blue-200" />
            <span>{reminderToast}</span>
          </div>
          <button onClick={() => setReminderToast(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3b82f6&color=fff`; }}
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-semibold border border-blue-100 mb-1">
              <span>Bendahara Utama</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{currentUser.name}</h1>
            <p className="text-xs text-slate-400">{memberUsers.length} Anggota · {classGroup.name}</p>
            <button
              onClick={() => setShowEditProfile(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors mt-0.5 cursor-pointer"
            >
              <UserCircle2 className="w-3.5 h-3.5" />
              Edit Profil
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBroadcastReminder}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            Kirim Pengingat
          </button>
          <button
            onClick={() => setActiveTab('pengeluaran')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="card-clean p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total Saldo Kas</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Saldo Kas Bersih Aktif</span>
          </p>
        </div>

        {/* Sudah Bayar */}
        <div className="card-clean p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Sudah Bayar</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">
            {paidMembersCount} <span className="text-xs text-slate-400 font-normal">/ {memberUsers.length}</span>
          </p>
          <p className="text-xs text-slate-500">
            {pendingVerificationCount} menunggu verifikasi
          </p>
        </div>

        {/* Belum Bayar */}
        <div className="card-clean p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Belum Bayar</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 tracking-tight">{unpaidMembersCount} Anggota</p>
          <p className="text-xs text-rose-500">
            Jatuh tempo tgl {classGroup.dueDate} {classGroup.period}
          </p>
        </div>

        {/* Pemasukan & Pengeluaran Bulan Ini */}
        <div className="card-clean p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Pemasukan Bln Ini</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            Rp {totalIncomeThisMonth.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-500">
            Pengeluaran: <span className="text-rose-600 font-semibold">Rp {totalExpenseThisMonth.toLocaleString('id-ID')}</span>
          </p>
        </div>
      </div>

      {/* Financial Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 card-clean p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Grafik Pemasukan vs Pengeluaran Kas</h3>
              <p className="text-xs text-slate-400">Arus kas bulanan {classGroup.name}</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="card-clean p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Distribusi Pembayaran Kas</h3>
            <p className="text-xs text-slate-400">Persentase status anggota bulan ini</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `${val} Anggota`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
            {pieChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </span>
                <span className="font-semibold text-slate-900">{item.value} Anggota</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Payment Status Checklist Table */}
      <div className="card-clean p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Status Pembayaran Anggota</h2>
            <p className="text-xs text-slate-500">
              Pantau siapa saja yang sudah, menunggu verifikasi, atau belum membayar kas {classGroup.period}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-44"
              />
            </div>

            {/* Filter Tabs */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="lunas">🟢 Lunas ({paidMembersCount})</option>
              <option value="menunggu">🟡 Menunggu ({pendingVerificationCount})</option>
              <option value="belum_bayar">🔴 Belum Bayar ({unpaidMembersCount})</option>
            </select>
          </div>
        </div>

        {/* Member Checklist Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nama Anggota</th>
                <th className="py-3 px-4">Status Kas</th>
                <th className="py-3 px-4">Tagihan</th>
                <th className="py-3 px-4">Metode / Tanggal</th>
                <th className="py-3 px-4 text-right">Aksi Bendahara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(({ user, payment, status, duesAmount }) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-semibold text-[10px] ${
                        status === 'lunas'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : status === 'menunggu'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {status === 'lunas' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {status === 'menunggu' && <Clock className="w-3 h-3 text-amber-600" />}
                      {status === 'belum_bayar' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Rp {duesAmount.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {payment ? (
                      <div>
                        <p className="font-medium uppercase text-[11px]">{payment.method.replace('_', ' ')}</p>
                        <p className="text-[10px] text-slate-400">{payment.date}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right space-x-1">
                    {status === 'menunggu' && payment && (
                      <button
                        onClick={() => setSelectedPaymentForVerif(payment)}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Verifikasi
                      </button>
                    )}

                    {status === 'belum_bayar' && (
                      <>
                        <button
                          onClick={() => handleSingleReminder(user)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Ingatkan
                        </button>
                        <button
                          onClick={() => markPaidManual(user.id, classGroup.period, classGroup.monthlyDues)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Tandai Lunas
                        </button>
                      </>
                    )}

                    {status === 'lunas' && (
                      <span className="text-xs text-emerald-600 font-semibold inline-flex items-center space-x-1 mr-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Lunas</span>
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedUserForDelete(user)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                      title={`Hapus ${user.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedPaymentForVerif && (
        <VerificationModal
          payment={selectedPaymentForVerif}
          isOpen={Boolean(selectedPaymentForVerif)}
          onClose={() => setSelectedPaymentForVerif(null)}
        />
      )}

      {showEditProfile && (
        <EditProfileModal
          user={currentUser}
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {selectedUserForDelete && (
        <DeleteMemberModal
          user={selectedUserForDelete}
          isOpen={Boolean(selectedUserForDelete)}
          onClose={() => setSelectedUserForDelete(null)}
        />
      )}
    </div>
  );
};
