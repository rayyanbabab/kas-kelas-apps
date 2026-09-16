import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Bell, CheckCircle, ShieldCheck, UserCheck, Users, QrCode, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQrModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab, onOpenQrModal }) => {
  const { currentUser, switchRole, switchUser, users, notifications, markNotificationRead, markAllNotificationsRead, resetDemoData, classGroup } = useApp();
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const myNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || n.userId === 'all'
  );
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  const roleColors: Record<Role, { bg: string; border: string; label: string }> = {
    anggota: { bg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200', label: '👦 Anggota' },
    bendahara: { bg: 'bg-blue-50 text-blue-700', border: 'border-blue-200', label: '👩‍💼 Bendahara' },
    admin: { bg: 'bg-purple-50 text-purple-700', border: 'border-purple-200', label: '⚙️ Admin' },
  };

  return (
    <header className="sticky top-0 z-30 bg-[#2563EB] text-white shadow-lg">
      {/* Demo Switcher Bar Top */}
      <div className="bg-[#1E293B] text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#2563EB] text-white font-black text-[10px] tracking-wider uppercase">
            SIMULATOR MODE
          </span>
          <span className="text-slate-300 font-bold text-[11px] hidden sm:inline uppercase tracking-wider">Role User:</span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {(['anggota', 'bendahara', 'admin'] as Role[]).map((r) => {
            const isActive = currentUser.role === r;
            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1 uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm ring-2 ring-white/30 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{roleColors[r].label}</span>
                {isActive && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
              </button>
            );
          })}

          <button
            onClick={resetDemoData}
            title="Reset ke Data Standar"
            className="ml-2 text-slate-400 hover:text-amber-300 transition-colors p-1 flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-white text-[#2563EB] font-black px-3 py-1 rounded-xl text-xl tracking-tighter shadow-md">
            KAS.
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">KasKu Digital</h1>
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/20 text-white rounded-full uppercase tracking-wider">
                {classGroup.name}
              </span>
            </div>
            <p className="text-[11px] text-blue-100 font-medium">Kas Transparan Kelas & Organisasi</p>
          </div>
        </div>

        {/* Navigation Tabs (Role Specific) */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-[#2563EB] shadow-md'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Beranda
          </button>

          {currentUser.role === 'anggota' && (
            <>
              <button
                onClick={() => setActiveTab('bayar')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'bayar'
                    ? 'bg-white text-[#2563EB] shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Bayar Kas
              </button>
              <button
                onClick={() => setActiveTab('riwayat')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'riwayat'
                    ? 'bg-white text-[#2563EB] shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Riwayat Saya
              </button>
            </>
          )}

          {(currentUser.role === 'bendahara' || currentUser.role === 'admin') && (
            <>
              <button
                onClick={() => setActiveTab('pembayaran')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'pembayaran'
                    ? 'bg-white text-[#2563EB] shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Status Anggota
              </button>
              <button
                onClick={() => setActiveTab('pengeluaran')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'pengeluaran'
                    ? 'bg-white text-[#2563EB] shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Pengeluaran
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'laporan'
                ? 'bg-white text-[#2563EB] shadow-md'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Laporan Kas
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-[#2563EB] shadow-md'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Pengaturan Admin
            </button>
          )}
        </nav>

        {/* Right Actions: QR Code, Notifications, Profile */}
        <div className="flex items-center space-x-2">
          {/* Member QR Code Button */}
          <button
            onClick={onOpenQrModal}
            className="p-2 text-white hover:bg-white/15 rounded-xl transition-colors relative"
            title="Tampilkan QR ID Kas Saya"
          >
            <QrCode className="w-5 h-5 text-white" />
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
              className="p-2 text-white hover:bg-white/15 rounded-xl transition-colors relative"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotificationsPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 z-50 p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-[#2563EB] hover:underline font-bold"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                  {myNotifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Belum ada notifikasi
                    </div>
                  ) : (
                    myNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                          !notif.isRead
                            ? 'bg-blue-50/80 border-blue-200 text-slate-900 font-medium shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-extrabold text-slate-900">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{notif.createdAt}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
              <div className="text-left hidden lg:block pr-1">
                <p className="text-xs font-black text-white leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/80 pr-0.5" />
            </button>

            {/* Profile / Switch User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 z-50 p-3 space-y-2 text-xs">
                <div className="px-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-black text-slate-900 text-sm">{currentUser.name}</p>
                  <p className="text-slate-500 text-[11px] font-medium">{currentUser.email}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-wider">
                    ROLE: {currentUser.role.toUpperCase()}
                  </span>
                </div>

                <div className="px-2 py-1 text-[10px] uppercase tracking-widest font-black text-slate-400">
                  Ganti Akun Demo:
                </div>

                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-left transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-blue-50 text-[#2563EB] font-black shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="flex-1 truncate">
                      <p className="truncate font-bold">{u.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{u.role}</p>
                    </div>
                    {u.id === currentUser.id && <CheckCircle className="w-4 h-4 text-[#2563EB]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
