import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, User } from '../types';
import { Settings, Users, Building, Wallet, TrendingUp, TrendingDown, ArrowUpRight, Plus, Trash2, CheckCircle2, Shield, UserPlus, AlertCircle, RefreshCw, Layers, UserCircle2, Edit3 } from 'lucide-react';
import { DeleteMemberModal } from './DeleteMemberModal';
import { EditProfileModal } from './EditProfileModal';

interface AdminDashboardProps {
  initialTab?: 'overview' | 'users' | 'class';
  setActiveTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview', setActiveTab: setParentActiveTab }) => {
  const {
    classGroup,
    updateClassGroup,
    users,
    addUser,
    updateUser,
    resetDemoData,
    switchUser,
    totalBalance,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    paidMembersCount,
    unpaidMembersCount,
    pendingVerificationCount,
    payments,
    expenses,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'class'>(initialTab);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);

  // Class settings form
  const [className, setClassName] = useState(classGroup.name);
  const [treasurerName, setTreasurerName] = useState(classGroup.treasurerName);
  const [monthlyDues, setMonthlyDues] = useState(classGroup.monthlyDues);
  const [weeklyDues, setWeeklyDues] = useState(classGroup.weeklyDues);
  const [dueDate, setDueDate] = useState(classGroup.dueDate);
  const [bankName, setBankName] = useState(classGroup.bankInfo.bankName);
  const [accountNumber, setAccountNumber] = useState(classGroup.bankInfo.accountNumber);
  const [accountName, setAccountName] = useState(classGroup.bankInfo.accountName);

  // New User form
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('anggota');

  const memberList = users.filter((u) => u.role === 'anggota');
  const treasurerList = users.filter((u) => u.role === 'bendahara');

  const handleSaveClassSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassGroup({
      name: className,
      treasurerName,
      monthlyDues: Number(monthlyDues),
      weeklyDues: Number(weeklyDues),
      dueDate: Number(dueDate),
      bankInfo: {
        bankName,
        accountNumber,
        accountName,
      },
    });
    alert('Pengaturan kelas & rekening pembayaran berhasil disimpan!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim() || `${newUserName.toLowerCase().replace(/\s+/g, '')}@kasku.id`,
      phone: newUserPhone.trim() || '081234567890',
      role: newUserRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      classId: classGroup.id,
      className: classGroup.name,
      memberQrCode: `KASKU-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('anggota');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-semibold border border-purple-100 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Administrator
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola pengguna, struktur kas, otoritas akun, dan konfigurasi sistem {classGroup.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Anggota</span>
          </button>

          <button
            onClick={resetDemoData}
            title="Bersihkan / Reset Data"
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ringkasan Eksekutif</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('class')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'class'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Pengaturan Kelas & Rekening</span>
        </button>
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <span>Saldo Kas Aktif</span>
              </p>
            </div>

            <div className="card-clean p-5 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span>Total Pengguna</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600 tracking-tight">
                {users.length} <span className="text-xs text-slate-400 font-normal">Pengguna</span>
              </p>
              <p className="text-xs text-slate-500">
                {memberList.length} Anggota • {treasurerList.length} Bendahara
              </p>
            </div>

            <div className="card-clean p-5 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span>Pemasukan Bulan Ini</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 tracking-tight">
                Rp {totalIncomeThisMonth.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-slate-500">
                {paidMembersCount} anggota lunas
              </p>
            </div>

            <div className="card-clean p-5 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span>Pengeluaran Bulan Ini</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-rose-600 tracking-tight">
                Rp {totalExpenseThisMonth.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-slate-500">
                {expenses.length} pengeluaran tercatat
              </p>
            </div>
          </div>

          {/* Quick Actions & Class Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 card-clean p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Aksi Cepat Administrator</h3>
                <span className="text-xs text-slate-400">{classGroup.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-600 text-white rounded-lg">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs group-hover:text-purple-700">Tambah Anggota Kelas</p>
                      <p className="text-[11px] text-slate-500">Daftarkan siswa baru ke sistem</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('class')}
                  className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-lg">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs group-hover:text-blue-700">Atur Kelas & Tarif Kas</p>
                      <p className="text-[11px] text-slate-500">Ubah nominal mingguan & rekening</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setParentActiveTab && setParentActiveTab('pengeluaran')}
                  className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-rose-600 text-white rounded-lg">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs group-hover:text-rose-700">Catat Pengeluaran</p>
                      <p className="text-[11px] text-slate-500">Input nota & bukti belanja kelas</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setParentActiveTab && setParentActiveTab('laporan')}
                  className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs group-hover:text-emerald-700">Laporan Keuangan</p>
                      <p className="text-[11px] text-slate-500">Download CSV & Cetak PDF</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Class Info Box */}
            <div className="card-clean p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3">Informasi Kas Kelas</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Nama Kelas</span>
                    <span className="font-semibold text-slate-900">{classGroup.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Bendahara</span>
                    <span className="font-semibold text-slate-900">{classGroup.treasurerName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Iuran Kas</span>
                    <span className="font-semibold text-blue-600">Rp {classGroup.weeklyDues.toLocaleString('id-ID')} / minggu</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Rekening</span>
                    <span className="font-semibold text-slate-900">{classGroup.bankInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">No. Rekening</span>
                    <span className="font-mono font-semibold text-slate-900">{classGroup.bankInfo.accountNumber}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('class')}
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Ubah Informasi Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Users */}
      {activeTab === 'users' && (
        <div className="card-clean p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Daftar Pengguna Sistem</h2>
              <p className="text-xs text-slate-500">Kelola role hak akses anggota, bendahara, dan admin</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggota Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Email / HP</th>
                  <th className="py-3 px-4">Role Hak Akses</th>
                  <th className="py-3 px-4">ID Member QR</th>
                  <th className="py-3 px-4 text-center">Ubah Role</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          onClick={() => setSelectedUserForEdit(u)}
                          className="relative group cursor-pointer shrink-0"
                          title={`Edit profil ${u.name}`}
                        >
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-900 block">{u.name}</span>
                            <button
                              onClick={() => setSelectedUserForEdit(u)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title={`Edit Profil ${u.name}`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                            <button
                              onClick={() => setSelectedUserForEdit(u)}
                              className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                            >
                              <UserCircle2 className="w-3 h-3" />
                              Edit Profil
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium">{u.email}</p>
                      <p className="text-[10px] text-slate-400">{u.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'bendahara'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{u.memberQrCode}</td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as Role })}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                      >
                        <option value="anggota">Anggota</option>
                        <option value="bendahara">Bendahara</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {users.length > 1 && (
                        <button
                          onClick={() => setSelectedUserForDelete(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center space-x-1"
                          title={`Hapus ${u.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">Hapus</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Class & Dues Settings */}
      {activeTab === 'class' && (
        <form onSubmit={handleSaveClassSettings} className="card-clean p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-base">
              Pengaturan Informasi Kelas & Rekening Kas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Konfigurasi ini akan ditampilkan kepada seluruh anggota kelas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kelas / Organisasi</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Bendahara Utama</label>
              <input
                type="text"
                value={treasurerName}
                onChange={(e) => setTreasurerName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nominal Kas Mingguan (Rp)</label>
              <input
                type="number"
                value={weeklyDues}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWeeklyDues(val);
                  setMonthlyDues(val * 4);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nominal Kas 1 Bulan (4 Pekan)</label>
              <input
                type="number"
                value={monthlyDues}
                onChange={(e) => setMonthlyDues(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo Bulanan</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDate}
                onChange={(e) => setDueDate(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Bank / E-Wallet</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening / No. HP E-Wallet</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pemilik Rekening (Atas Nama)</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}

      {/* Modal Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>Tambah Anggota Baru</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa / Anggota *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="budi@sekolah.sch.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP (Opsional)</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran / Hak Akses</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="anggota">👦 Anggota Kelas (Dapat bayar kas & lihat laporan)</option>
                  <option value="bendahara">👩‍💼 Bendahara (Dapat verifikasi & catat pengeluaran)</option>
                  <option value="admin">⚙️ Administrator (Kontrol penuh sistem)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUserForEdit && (
        <EditProfileModal
          user={selectedUserForEdit}
          isOpen={Boolean(selectedUserForEdit)}
          onClose={() => setSelectedUserForEdit(null)}
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
