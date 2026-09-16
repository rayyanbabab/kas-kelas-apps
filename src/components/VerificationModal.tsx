import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Payment } from '../types';
import { X, CheckCircle2, XCircle, ShieldCheck, AlertCircle, Eye } from 'lucide-react';

interface VerificationModalProps {
  payment: Payment;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ payment, onClose }) => {
  const { verifyPayment } = useApp();
  const [notes, setNotes] = useState('');
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const handleAction = (status: 'lunas' | 'belum_bayar') => {
    verifyPayment(payment.id, status, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Verifikasi Bukti Pembayaran</h3>
            <p className="text-xs text-slate-500 font-medium">Periksa detail transfer anggota</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member & Payment Info */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Anggota:</span>
            <span className="font-bold text-slate-900">{payment.userName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Periode Kas:</span>
            <span className="font-bold text-slate-900">{payment.monthPeriod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Nominal Transfer:</span>
            <span className="font-extrabold text-emerald-700 text-sm">
              Rp {payment.amount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Metode:</span>
            <span className="font-bold text-slate-900 uppercase">{payment.method.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal Pengiriman:</span>
            <span className="font-bold text-slate-900">{payment.date}</span>
          </div>
        </div>

        {/* Uploaded Receipt Image */}
        {payment.proofUrl ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Foto Bukti Transfer:</span>
              <a
                href={payment.proofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Buka Ukuran Penuh</span>
              </a>
            </div>
            <img
              src={payment.proofUrl}
              alt="Bukti Transfer"
              className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-inner"
            />
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Anggota tidak melampirkan foto bukti. Verifikasi secara manual.</span>
          </div>
        )}

        {/* Optional Notes */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Catatan Bendahara (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: Bukti cocok / Transfer kurang Rp 2.000"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Verification Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => handleAction('belum_bayar')}
            className="w-1/2 py-3 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>TOLAK PEMBAYARAN</span>
          </button>
          <button
            onClick={() => handleAction('lunas')}
            className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>SETUJUI (SET LUNAS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
