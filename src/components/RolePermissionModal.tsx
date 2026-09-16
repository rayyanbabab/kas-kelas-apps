import React from 'react';
import { ShieldCheck, UserCheck, ShieldAlert, X, Check, Lock } from 'lucide-react';

interface RolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 text-[#2563EB] rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Hak Akses & Peran (RBAC)
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Pembagian Wewenang Bendahara vs Anggota Class Fund
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          {/* ANGGOTA */}
          <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider">
                👦 Anggota Kelas (32 Anggota)
              </span>
            </div>
            <p className="text-xs text-emerald-950 font-medium">
              Fokus pada pembayaran mandiri, transparansi laporan kas, dan tracking tagihan pribadi.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Bayar uang kas mingguan (<strong>Rp 6.000 / minggu</strong>) atau bulanan (<strong>Rp 24.000</strong>).</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Upload bukti transfer (QRIS, E-Wallet, Bank) & unduh kuitansi digital.</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Lihat QR Code ID Anggota untuk setor tunai instan.</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Akses Laporan Keuangan Transparan (saldo kas, grafik arus kas, nota belanja kelas).</span>
              </div>
              
              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-rose-700 font-medium">
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <span>Aktivitas & riwayat kas anggota lain disembunyikan (hanya kas pribadi & pengeluaran kelas).</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <span>Tidak dapat memverifikasi pembayaran anggota lain.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <span>Tidak dapat menambah/mengedit/menghapus pengeluaran kelas.</span>
                </div>
              </div>
            </div>
          </div>

          {/* BENDAHARA */}
          <div className="p-5 rounded-3xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-[#2563EB] text-white text-xs font-black uppercase tracking-wider">
                👩‍💼 Bendahara Utama
              </span>
            </div>
            <p className="text-xs text-blue-950 font-medium">
              Wewenang penuh untuk verifikasi dana masuk, pembukuan kas kelas, dan pengeluaran.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Verifikasi atau tolak bukti transfer pembayaran kas dari 32 anggota.</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Input setoran tunai manual (Tandai Lunas Rp 6.000 / minggu atau Rp 24.000).</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Catat, edit/ganti rincian, dan hapus pengeluaran kas kelas (lengkap konfirmasi keamanan).</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Kirim broadcast pengingat tagihan massal / per anggota.</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Ekspor laporan kas resmi (PDF / Cetak / CSV Excel).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Administrator note */}
        <div className="mt-4 p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center space-x-2">
            <span className="font-black uppercase tracking-wider text-[10px] px-2 py-0.5 bg-purple-600 text-white rounded-full">
              ⚙️ Administrator
            </span>
            <span>Memiliki hak penuh untuk konfigurasi kelas, kelola 32 akun pengguna, serta audit logs.</span>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-200 cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
