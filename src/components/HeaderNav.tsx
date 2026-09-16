import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Bell, CheckCircle2, QrCode, RefreshCw, Sparkles, ChevronDown, Info, Camera, Edit3, Database, LogOut } from 'lucide-react';
import { RolePermissionModal } from './RolePermissionModal';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { EditNameModal } from './EditNameModal';
import { DatabaseModal } from './DatabaseModal';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQrModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab, onOpenQrModal }) => {
  const { currentUser, switchRole, switchUser, users, notifications, markNotificationRead, markAllNotificationsRead, resetDemoData, classGroup, dbStatus, isLoading, logout } = useApp();
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);

  const myNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || n.userId === 'all'
  );
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;
  const memberCount = users.filter((u) => u.role === 'anggota').length;

  const roleMeta: Record<Role, { label: string; badge: string }> = {
    anggota: { label: `Anggota (${memberCount})`, badge: 'bg-emerald-500' },
    bendahara: { label: 'Bendahara', badge: 'bg-blue-600' },
    admin: { label: 'Admin', badge: 'bg-purple-600' },
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md">
        {/* Clean Minimal Role Switcher Top Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px] tracking-wide uppercase border border-blue-400/30">
              Role Switcher
            </span>
            <span className="text-slate-400 font-medium text-xs hidden sm:inline">Simulasi Hak Akses:</span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {(['anggota', 'bendahara', 'admin'] as Role[]).map((r) => {
              const isActive = currentUser.role === r;
              return (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-white/30 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${roleMeta[r].badge}`} />
                  <span>{roleMeta[r].label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowPermissionModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center space-x-1 border border-amber-400/30 cursor-pointer ml-1 transition-colors"
              title="Perbedaan Hak Akses"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hak Akses</span>
            </button>

            <button
              onClick={() => setShowDatabaseModal(true)}
              title="Status Database Neon (PostgreSQL)"
              className={`px-2.5 py-1 rounded-lg font-semibold text-xs flex items-center space-x-1.5 border transition-colors cursor-pointer ml-1 ${
                dbStatus.connected
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border-cyan-500/30'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isLoading ? 'animate-pulse text-yellow-400' : ''}`} />
              <span className="hidden sm:inline">{dbStatus.connected ? 'Neon DB' : 'Database'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            </button>

            <button
              onClick={resetDemoData}
              title="Reset ke Data Awal"
              className="ml-1 text-slate-400 hover:text-amber-300 transition-colors p-1 flex items-center space-x-1 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-white text-blue-600 font-extrabold px-3 py-1.5 rounded-xl text-lg tracking-tight shadow-sm flex items-center justify-center">
              CF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">Class Fund</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-white/15 text-blue-50 rounded-full border border-white/10">
                  {classGroup.name}
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium">
                Kas Rp{(classGroup.weeklyDues || 6000).toLocaleString('id-ID')} / minggu • {memberCount} Anggota
              </p>
            </div>
          </div>

          {/* Clean Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/10 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              {currentUser.role === 'bendahara' ? 'Dashboard Bendahara' : currentUser.role === 'admin' ? 'Dashboard Admin' : 'Beranda Saya'}
            </button>

            {currentUser.role === 'anggota' && (
              <>
                <button
                  onClick={() => setActiveTab('bayar')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'bayar'
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Bayar Kas
                </button>
                <button
                  onClick={() => setActiveTab('riwayat')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'riwayat'
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'pembayaran'
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Kas Anggota ({memberCount})
                </button>
                <button
                  onClick={() => setActiveTab('pengeluaran')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'pengeluaran'
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Catat Pengeluaran
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('laporan')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'laporan'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              Laporan Keuangan
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-blue-700 shadow-sm font-bold'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                Pengaturan
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenQrModal}
              className="p-2 text-white hover:bg-white/15 rounded-xl transition-colors relative cursor-pointer"
              title="QR ID Anggota"
            >
              <QrCode className="w-5 h-5 text-white" />
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
                className="p-2 text-white hover:bg-white/15 rounded-xl transition-colors relative cursor-pointer"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-blue-600">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationsPopover && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-800 z-50 overflow-hidden animate-fadeIn">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-sm text-slate-800">Notifikasi</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {myNotifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Tidak ada notifikasi baru
                      </div>
                    ) : (
                      myNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 ${
                            !n.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'payment_success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : n.type === 'reminder' ? (
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Info className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                          </div>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1.5 hover:bg-white/15 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/10"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/50"
                />
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{currentUser.name}</p>
                  <p className="text-[10px] text-blue-100 font-medium capitalize">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-white/80" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-800 z-50 overflow-hidden animate-fadeIn">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center space-x-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 border-b border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowEditNameModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      <span>Ubah Nama Tampilan</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowProfilePhotoModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span>Ganti Foto Profil</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <RolePermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
      />

      <ProfilePhotoModal
        isOpen={showProfilePhotoModal}
        onClose={() => setShowProfilePhotoModal(false)}
      />

      <EditNameModal
        user={currentUser}
        isOpen={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
      />

      <DatabaseModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
      />
    </>
  );
};
