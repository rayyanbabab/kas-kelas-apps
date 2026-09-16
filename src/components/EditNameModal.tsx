import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { X, UserCheck, Edit3, Check, AlertCircle, Sparkles } from 'lucide-react';

interface EditNameModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({ user, isOpen, onClose }) => {
  const { updateUser } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setError('');
      setIsSaved(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Nama tidak boleh kosong.');
      return;
    }

    if (trimmed.length < 2) {
      setError('Nama minimal harus terdiri dari 2 karakter.');
      return;
    }

    if (trimmed.length > 50) {
      setError('Nama maksimal 50 karakter.');
      return;
    }

    updateUser(user.id, { name: trimmed });
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2563EB] to-blue-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">Ubah Nama Pengguna</h3>
              <p className="text-xs text-blue-100 font-medium">Perbarui nama tampilan akun kas digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* User Preview */}
          <div className="flex items-center space-x-3.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB]">
                  {user.role}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{user.memberQrCode}</span>
              </div>
              <p className="text-xs font-bold text-slate-600 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Input Name */}
          <div className="space-y-1.5">
            <label htmlFor="user-name-input" className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Nama Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="user-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masukkan nama lengkap / panggilan..."
                autoFocus
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-[#2563EB] focus:border-[#2563EB] bg-slate-50/50'
                }`}
              />
              {name.trim() && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 text-xs"
                  title="Hapus input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-bold flex items-center space-x-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 font-medium">
              Nama ini akan tampil di seluruh kuitansi, riwayat kas, dan daftar kelas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-blue-200 active:scale-95'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Simpan Nama</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
