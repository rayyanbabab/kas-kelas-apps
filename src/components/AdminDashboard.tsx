import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, User } from '../types';
import { Settings, Users, Shield, Building, CreditCard, RefreshCw, Plus, Trash2, Edit2, CheckCircle2, History, Camera, UserX, Edit3 } from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { DeleteMemberModal } from './DeleteMemberModal';
import { EditNameModal } from './EditNameModal';

export const AdminDashboard: React.FC = () => {
  const { classGroup, updateClassGroup, users, addUser, updateUser, resetDemoData, switchUser } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'class' | 'logs'>('users');
  const [selectedUserForPhoto, setSelectedUserForPhoto] = useState<User | null>(null);
  const [selectedUserForEditName, setSelectedUserForEditName] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);

  // Class settings form
  const [className, setClassName] = useState(classGroup.name);
  const [treasurerName, setTreasurerName] = useState(classGroup.treasurerName);
  const [monthlyDues, setMonthlyDues] = useState(classGroup.monthlyDues);
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

  const handleSaveClassSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassGroup({
      name: className,
      treasurerName,
      monthlyDues: Number(monthlyDues),
      dueDate: Number(dueDate),
      bankInfo: {
        bankName,
        accountNumber,
        accountName,
      },
    });
    alert('Pengaturan kelas & rekening pembayaran berhasil diperbarui!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone || '081234567890',
      role: newUserRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      classId: classGroup.id,
      className: classGroup.name,
      memberQrCode: `KASKU-MEMBER-${Math.floor(100 + Math.random() * 900)}`,
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Panel Pengaturan Admin
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola pengguna, struktur kelas, pengaturan pembayaran, dan log audit sistem
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Semua Data Demo</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all ${
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
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'class'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Pengaturan Kelas & Rekening</span>
        </button>
      </div>

      {/* Tab 1: Manage Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-base">Daftar Pengguna Sistem Class Fund</h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggota Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Email / HP</th>
                  <th className="py-3 px-4">Role Hak Akses</th>
                  <th className="py-3 px-4">ID Member QR</th>
                  <th className="py-3 px-4 text-center">Ubah Role</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          onClick={() => {
                            switchUser(u.id);
                            setSelectedUserForPhoto(u);
                          }}
                          className="relative group cursor-pointer shrink-0"
                          title="Klik untuk mengubah foto profil"
                        >
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <button
                              onClick={() => setSelectedUserForEditName(u)}
                              className="p-1 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title={`Ubah nama ${u.name}`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                switchUser(u.id);
                                setSelectedUserForPhoto(u);
                              }}
                              className="text-[10px] text-[#2563EB] hover:underline font-bold"
                            >
                              Ubah Foto
                            </button>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <button
                              onClick={() => setSelectedUserForEditName(u)}
                              className="text-[10px] text-slate-500 hover:text-[#2563EB] hover:underline font-bold"
                            >
                              Ganti Nama
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p>{u.email}</p>
                      <p className="text-[10px] text-slate-400">{u.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'bendahara'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{u.memberQrCode}</td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as Role })}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800 bg-white shadow-2xs"
                      >
                        <option value="anggota">Anggota</option>
                        <option value="bendahara">Bendahara</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUserForDelete(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center space-x-1"
                        title={`Hapus ${u.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[11px] font-bold hidden sm:inline">Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Class & Dues Settings */}
      {activeTab === 'class' && (
        <form onSubmit={handleSaveClassSettings} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 text-base pb-2 border-b border-slate-100">
            Pengaturan Informasi Kelas & Nominal Kas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kelas / Kelompok</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bendahara Utama</label>
              <input
                type="text"
                value={treasurerName}
                onChange={(e) => setTreasurerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominal Kas Bulanan (Rp)</label>
              <input
                type="number"
                step={1000}
                value={monthlyDues}
                onChange={(e) => setMonthlyDues(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo Setiap Bulan</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDate}
                onChange={(e) => setDueDate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm pt-4 border-t border-slate-100">
            Pengaturan Rekening Bank & QRIS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bank / Penyedia</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Rekening</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Atas Nama Rekening</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            SIMPAN PENGATURAN KELAS
          </button>
        </form>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form
            onSubmit={handleAddUser}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs"
          >
            <h3 className="font-extrabold text-slate-900 text-base pb-2 border-b border-slate-100">
              Tambah Anggota Baru
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Anggota #11"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Sekolah / Pribadi</label>
              <input
                type="email"
                required
                placeholder="anggota11@mipa1.sch.id"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Sistem</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as Role)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
              >
                <option value="anggota">Anggota</option>
                <option value="bendahara">Bendahara</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md"
              >
                SIMPAN ANGGOTA
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={Boolean(selectedUserForPhoto)}
        onClose={() => setSelectedUserForPhoto(null)}
      />

      {/* Delete Member Confirmation Modal */}
      <DeleteMemberModal
        user={selectedUserForDelete}
        isOpen={Boolean(selectedUserForDelete)}
        onClose={() => setSelectedUserForDelete(null)}
      />

      {/* Edit User Name Modal */}
      <EditNameModal
        user={selectedUserForEditName}
        isOpen={Boolean(selectedUserForEditName)}
        onClose={() => setSelectedUserForEditName(null)}
      />
    </div>
  );
};
