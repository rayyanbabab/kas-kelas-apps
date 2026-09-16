import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  LayoutDashboard,
  CreditCard,
  History,
  PlusCircle,
  BarChart3,
  Settings,
  Bell,
  QrCode,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Sparkles,
  Info,
  Database,
  ChevronRight,
  UserCircle2,
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { DatabaseModal } from './DatabaseModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQrModal: () => void;
  onOpenPayModal: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  roles: string[];
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQrModal,
  onOpenPayModal,
}) => {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dbStatus,
    isLoading,
    logout,
    classGroup,
    users,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);

  const myNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || n.userId === 'all'
  );
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;
  const memberCount = users.filter((u) => u.role === 'anggota').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label:
        currentUser.role === 'bendahara'
          ? 'Dashboard Bendahara'
          : currentUser.role === 'admin'
          ? 'Dashboard Admin'
          : 'Beranda Saya',
      icon: LayoutDashboard,
      roles: ['anggota', 'bendahara', 'admin'],
    },
    { id: 'bayar', label: 'Bayar Kas', icon: CreditCard, roles: ['anggota'] },
    { id: 'riwayat', label: 'Riwayat Bayar', icon: History, roles: ['anggota'] },
    {
      id: 'pembayaran',
      label: 'Kas Anggota',
      icon: CreditCard,
      roles: ['bendahara', 'admin'],
      badge: memberCount,
    },
    { id: 'pengeluaran', label: 'Catat Pengeluaran', icon: PlusCircle, roles: ['bendahara', 'admin'] },
    { id: 'laporan', label: 'Laporan Keuangan', icon: BarChart3, roles: ['anggota', 'bendahara', 'admin'] },
    { id: 'admin', label: 'Pengaturan Sistem', icon: Settings, roles: ['admin'] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const roleBadge: Record<string, string> = {
    admin: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
    bendahara: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    anggota: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  };

  const navigate = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  /* ─── Reusable sidebar body ─── */
  const SidebarBody = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">KasKu Digital</p>
            <p className="text-[11px] text-slate-500 truncate">{classGroup.name}</p>
          </div>
        </div>
      </div>

      {/* DB Status */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={() => setShowDatabaseModal(true)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border cursor-pointer ${
            dbStatus.connected
              ? 'bg-emerald-500/8 text-emerald-400 border-emerald-500/15 hover:bg-emerald-500/12'
              : 'bg-white/[0.04] text-slate-500 border-white/[0.07] hover:bg-white/[0.07]'
          }`}
        >
          <Database className={`w-3.5 h-3.5 shrink-0 ${isLoading ? 'animate-pulse text-yellow-400' : ''}`} />
          <span className="flex-1 text-left truncate">
            {dbStatus.connected ? 'Neon DB Terhubung' : 'Database Offline'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-px overflow-y-auto">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Navigasi</p>
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer group ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left leading-tight">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Actions */}
        <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-px">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Aksi Cepat</p>
          <button
            onClick={() => { onOpenQrModal(); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            QR ID Anggota
          </button>
          {currentUser.role === 'anggota' && (
            <button
              onClick={() => { onOpenPayModal(); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              Bayar Sekarang
            </button>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/[0.07] p-3">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer text-left"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3b82f6&color=fff`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">{currentUser.name}</p>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-px rounded border mt-0.5 ${roleBadge[currentUser.role] || roleBadge.anggota}`}>
                {currentUser.role.toUpperCase()}
              </span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-200 ${showProfileMenu ? 'rotate-90' : ''}`} />
          </button>

          {/* Profile popover */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="p-1">
                <button
                  onClick={() => { setShowProfileMenu(false); setShowEditProfile(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.07] rounded-lg transition-colors cursor-pointer"
                >
                  <UserCircle2 className="w-4 h-4 text-slate-500" />
                  Edit Profil
                </button>
                <div className="h-px bg-white/[0.07] my-1" />
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-white/[0.07] h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow shadow-blue-600/30">
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">KasKu Digital</span>
        </div>

        <div className="flex items-center gap-1">
          <NotifButton
            count={unreadCount}
            onClick={() => setShowNotif((v) => !v)}
          />
          {showNotif && (
            <div className="absolute top-14 right-4">
              <NotifPanel
                items={myNotifications}
                unread={unreadCount}
                onRead={markNotificationRead}
                onReadAll={markAllNotificationsRead}
                onClose={() => setShowNotif(false)}
              />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.07] rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 bg-slate-900 h-full shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.07] rounded-lg z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarBody />
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:block fixed top-0 left-0 h-full w-60 bg-slate-900 border-r border-white/[0.07] z-30">
        {/* Notification button — top right corner */}
        <div className="absolute top-4 right-3.5 z-10">
          <div className="relative">
            <NotifButton
              count={unreadCount}
              onClick={() => setShowNotif((v) => !v)}
            />
            {showNotif && (
              <div className="absolute left-full top-0 ml-2 shadow-2xl z-50">
                <NotifPanel
                  items={myNotifications}
                  unread={unreadCount}
                  onRead={markNotificationRead}
                  onReadAll={markAllNotificationsRead}
                  onClose={() => setShowNotif(false)}
                />
              </div>
            )}
          </div>
        </div>
        <SidebarBody />
      </aside>

      {/* ── Modals ── */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
      <DatabaseModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
      />
    </>
  );
};

/* ─── Notification Button ─── */
const NotifButton: React.FC<{ count: number; onClick: () => void }> = ({ count, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-2 text-slate-400 hover:text-white hover:bg-white/[0.07] rounded-xl transition-colors cursor-pointer"
  >
    <Bell className="w-4.5 h-4.5" />
    {count > 0 && (
      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </button>
);

/* ─── Notification Panel ─── */
const NotifPanel: React.FC<{
  items: any[];
  unread: number;
  onRead: (id: string) => void;
  onReadAll: () => void;
  onClose: () => void;
}> = ({ items, unread, onRead, onReadAll, onClose }) => (
  <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50">
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-bold text-slate-800">Notifikasi</span>
        {unread > 0 && (
          <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </div>
      {unread > 0 && (
        <button onClick={onReadAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
          Baca semua
        </button>
      )}
    </div>
    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
      {items.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm">Tidak ada notifikasi</div>
      ) : (
        items.map((n) => (
          <div
            key={n.id}
            onClick={() => { onRead(n.id); onClose(); }}
            className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}
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
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{n.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
            </div>
            {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
          </div>
        ))
      )}
    </div>
  </div>
);
