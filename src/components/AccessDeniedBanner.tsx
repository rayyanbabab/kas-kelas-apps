import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AccessDeniedProps {
  requiredRole: string;
  setActiveTab: (tab: string) => void;
}

export const AccessDeniedBanner: React.FC<AccessDeniedProps> = ({ requiredRole, setActiveTab }) => {
  const { switchRole, currentUser } = useApp();

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider rounded-full">
          Akses Terbatas: Khusus {requiredRole.toUpperCase()}
        </span>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          Halaman Ini Hanya Dapat Diakses Oleh {requiredRole}
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Akun Anda saat ini login sebagai <strong>{currentUser.name}</strong> (Role: <span className="uppercase font-bold text-[#2563EB]">{currentUser.role}</span>). Fitur ini membutuhkan hak akses <strong>{requiredRole}</strong> untuk keamanan kas kelas.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 text-left space-y-1">
        <p className="font-bold">💡 Uji Coba Mode Simulator:</p>
        <p className="text-blue-700">
          Anda dapat berpindah role menggunakan tombol simulator di bar bagian atas atau klik tombol di bawah untuk beralih peran:
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          onClick={() => switchRole('bendahara')}
          className="px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-200 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Ganti ke Akun Bendahara</span>
        </button>
      </div>
    </div>
  );
};
