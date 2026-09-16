import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';

interface DeleteMemberModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({ user, isOpen, onClose }) => {
  const { deleteUser, payments, users, currentUser } = useApp();
  const [deletePaymentsHistory, setDeletePaymentsHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !user) return null;

  // Check how many payments this user has
  const userPayments = payments.filter((p) => p.userId === user.id);
  const isCurrentActiveUser = currentUser.id === user.id;
  const adminUsers = users.filter((u) => u.role === 'admin');
  const isOnlyAdmin = user.role === 'admin' && adminUsers.length <= 1;

  const handleDelete = () => {
    if (isOnlyAdmin) {
      alert('Tidak dapat menghapus satu-satunya akun Admin! Ubah peran akun lain menjadi Admin terlebih dahulu.');
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      deleteUser(user.id, deletePaymentsHistory);
      setIsDeleting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5 text-rose-600">
            <div className="p-2 bg-rose-50 rounded-xl">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Hapus Anggota Kas</h2>
              <p className="text-xs text-slate-500 font-medium">Konfirmasi penghapusan data anggota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Preview Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-slate-900 text-sm truncate">{user.name}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'bendahara'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{user.memberQrCode}</p>
          </div>
        </div>

        {/* Warning / Notes */}
        {isOnlyAdmin ? (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-semibold">
              Akun ini adalah <strong>satu-satunya Admin</strong> di kelas. Anda tidak dapat menghapus akun ini sebelum mengangkat anggota lain menjadi Admin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Peringatan Penghapusan:</p>
                <p className="mt-0.5 text-amber-800">
                  Anggota ini akan dihapus dari daftar kas kelas. Jika anggota ini sedang aktif login, sesi akan dialihkan secara otomatis.
                </p>
              </div>
            </div>

            {/* Payment History Option */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold">Riwayat Pembayaran Kas:</span>
                <span className="font-black px-2 py-0.5 bg-slate-200 rounded-full text-[11px]">
                  {userPayments.length} Transaksi
                </span>
              </div>
              <label className="flex items-start space-x-2.5 pt-2 border-t border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deletePaymentsHistory}
                  onChange={(e) => setDeletePaymentsHistory(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-slate-600 font-medium text-[11px] leading-tight">
                  Hapus juga seluruh catatan transaksi kas anggota ini dari pembukuan (tidak disarankan untuk laporan transparansi).
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isOnlyAdmin || isDeleting}
            className={`w-1/2 py-3 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-all ${
              isOnlyAdmin || isDeleting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-200 cursor-pointer'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Menghapus...' : 'Hapus Anggota'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
