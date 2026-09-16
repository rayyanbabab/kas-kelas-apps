import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentStatus, User } from '../types';
import { VerificationModal } from './VerificationModal';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { DeleteMemberModal } from './DeleteMemberModal';
import { EditNameModal } from './EditNameModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Wallet, Users, ArrowUpRight, ArrowDownRight, Bell, CheckCircle2, Clock, AlertTriangle, Search, Filter, PlusCircle, Settings, ShieldCheck, Mail, Send, Camera, Trash2, Edit3 } from 'lucide-react';

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
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isSelfNameModalOpen, setIsSelfNameModalOpen] = useState<boolean>(false);
  const [selectedUserForEditName, setSelectedUserForEditName] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);

  const memberUsers = users.filter((u) => u.role !== 'admin');

  // Broadcast reminder to all unpaid members
  const handleBroadcastReminder = () => {
    sendReminder('all');
    setReminderToast(`Pengingat pembayaran otomatis dikirimkan ke ${unpaidMembersCount} anggota yang belum bayar.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Single member reminder
  const handleSingleReminder = (user: User) => {
    sendReminder(user.id);
    setReminderToast(`Notifikasi pengingat kas dikirimkan ke ${user.name}.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Filter members list
  const filteredMembers = memberUsers.map((u) => {
    const p = payments.find(
      (pay) => pay.userId === u.id && pay.monthPeriod === classGroup.period
    );
    let status: PaymentStatus = p ? p.status : 'belum_bayar';
    return {
      user: u,
      payment: p,
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
        <div className="p-4 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-amber-300" />
            <span>{reminderToast}</span>
          </div>
          <button onClick={() => setReminderToast(null)} className="text-white hover:text-slate-200">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative group shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#2563EB] shadow-md"
            />
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute bottom-0 right-0 p-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full shadow-md border border-white transition-transform hover:scale-110 cursor-pointer"
              title="Ganti Foto Profil Bendahara"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-blue-50 text-[#2563EB] rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
              <span>BENDAHARA UTAMA KELAS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Pengelolaan & Transparansi Keuangan {memberUsers.length} Anggota {classGroup.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSelfNameModalOpen(true)}
            className="px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Ubah Nama Bendahara"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Ganti Nama</span>
          </button>

          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-600" />
            <span>Ganti Foto</span>
          </button>

          <button
            onClick={handleBroadcastReminder}
            className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Kirim Pengingat Massal</span>
          </button>

          <button
            onClick={() => setActiveTab('pengeluaran')}
            className="px-4 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-black uppercase tracking-widest">
            <span>Total Saldo Kas</span>
            <div className="p-2 bg-blue-50 text-[#2563EB] rounded-2xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#2563EB] tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Saldo Kas Bersih Aktif</span>
          </p>
        </div>

        {/* Sudah Bayar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-black uppercase tracking-widest">
            <span>Sudah Bayar</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 tracking-tight">
            {paidMembersCount} <span className="text-sm text-slate-400 font-bold">/ {memberUsers.length}</span>
          </p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            {pendingVerificationCount} orang menunggu verifikasi
          </p>
        </div>

        {/* Belum Bayar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-black uppercase tracking-widest">
            <span>Belum Bayar</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-2xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 tracking-tight">{unpaidMembersCount} anggota</p>
          <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider">
            Jatuh tempo tgl {classGroup.dueDate} {classGroup.period}
          </p>
        </div>

        {/* Pemasukan & Pengeluaran Bulan Ini */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-black uppercase tracking-widest">
            <span>Pemasukan Bln Ini</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-2xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            Rp {totalIncomeThisMonth.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Pengeluaran: <span className="text-rose-600 font-black">Rp {totalExpenseThisMonth.toLocaleString('id-ID')}</span>
          </p>
        </div>
      </div>

      {/* Financial Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Grafik Pemasukan vs Pengeluaran Kas</h3>
              <p className="text-xs text-slate-400">Arus kas bulanan Kelas 12 MIPA 1</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
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
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="Pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Distribusi Pembayaran Kas</h3>
            <p className="text-xs text-slate-400">Persentase status anggota bulan ini</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
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

          <div className="space-y-1 text-xs">
            {pieChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between font-medium">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900">{item.value} Anggota</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Payment Status Checklist Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Daftar Status Pembayaran Anggota</h2>
            <p className="text-xs text-slate-500">
              Pantau siapa saja yang sudah, menunggu verifikasi, atau belum membayar kas {classGroup.period}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-48"
              />
            </div>

            {/* Filter Tabs */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <option value="semua">Semua Status</option>
              <option value="lunas">🟢 Lunas ({paidMembersCount})</option>
              <option value="menunggu">🟡 Menunggu Verifikasi ({pendingVerificationCount})</option>
              <option value="belum_bayar">🔴 Belum Bayar ({unpaidMembersCount})</option>
            </select>
          </div>
        </div>

        {/* Member Checklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Nama Anggota</th>
                <th className="py-3 px-4">Status Kas</th>
                <th className="py-3 px-4">Tagihan</th>
                <th className="py-3 px-4">Metode / Tanggal</th>
                <th className="py-3 px-4 text-right">Aksi Bendahara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.map(({ user, payment, status, duesAmount }) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <button
                            onClick={() => setSelectedUserForEditName(user)}
                            className="p-1 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title={`Ubah nama ${user.name}`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'menunggu'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {status === 'lunas' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {status === 'menunggu' && <Clock className="w-3 h-3 text-amber-600" />}
                      {status === 'belum_bayar' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    Rp {duesAmount.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {payment ? (
                      <div>
                        <p className="font-semibold uppercase text-[11px]">{payment.method.replace('_', ' ')}</p>
                        <p className="text-[10px] text-slate-400">{payment.date}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1">
                    {status === 'menunggu' && payment && (
                      <button
                        onClick={() => setSelectedPaymentForVerif(payment)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Verifikasi Bukti
                      </button>
                    )}

                    {status === 'belum_bayar' && (
                      <>
                        <button
                          onClick={() => handleSingleReminder(user)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Kirim Pengingat
                        </button>
                        <button
                          onClick={() => markPaidManual(user.id, classGroup.period, classGroup.monthlyDues)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Tandai Lunas
                        </button>
                      </>
                    )}

                    {status === 'lunas' && (
                      <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center space-x-1 mr-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedUserForDelete(user)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center align-middle"
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

      {/* Verification Drawer / Modal */}
      {selectedPaymentForVerif && (
        <VerificationModal
          payment={selectedPaymentForVerif}
          onClose={() => setSelectedPaymentForVerif(null)}
        />
      )}

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      {/* Delete Member Modal */}
      <DeleteMemberModal
        user={selectedUserForDelete}
        isOpen={Boolean(selectedUserForDelete)}
        onClose={() => setSelectedUserForDelete(null)}
      />

      {/* Edit Member Name Modal */}
      <EditNameModal
        user={selectedUserForEditName}
        isOpen={Boolean(selectedUserForEditName)}
        onClose={() => setSelectedUserForEditName(null)}
      />

      {/* Edit Self Name Modal */}
      <EditNameModal
        user={currentUser}
        isOpen={isSelfNameModalOpen}
        onClose={() => setIsSelfNameModalOpen(false)}
      />
    </div>
  );
};
