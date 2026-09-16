import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { X, QrCode, Building2, Wallet, CheckCircle2, Upload, AlertCircle, ArrowRight, ShieldCheck, Download, Copy, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, classGroup, addPayment } = useApp();

  const [step, setStep] = useState<'amount' | 'method' | 'process' | 'success'>('amount');
  const [selectedMonth, setSelectedMonth] = useState<string>(classGroup.period);
  const [amount, setAmount] = useState<number>(classGroup.monthlyDues);
  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastTxn, setLastTxn] = useState<any>(null);

  if (!isOpen) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(classGroup.bankInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      // Auto-approve QRIS and GoPay/ShopeePay/DANA for instant convenience in demo
      const isAutoLunas = method === 'qris' || method === 'gopay' || method === 'shopeepay' || method === 'dana';

      const newTxn = addPayment({
        userId: currentUser.id,
        userName: currentUser.name,
        amount,
        date: new Date().toISOString().split('T')[0],
        monthPeriod: selectedMonth,
        method,
        status: isAutoLunas ? 'lunas' : 'menunggu',
        proofUrl: proofUrl || (method === 'transfer_bank' ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500' : undefined),
        notes: notes || `Pembayaran kas via ${method.toUpperCase()}`,
        verifiedAt: isAutoLunas ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
        verifiedBy: isAutoLunas ? 'System Auto Payment' : undefined,
      });

      setLastTxn(newTxn);
      setStep('success');
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Bayar Uang Kas</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">KasKu Digital — {classGroup.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Select Period & Amount */}
        {step === 'amount' && (
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">
                Periode Kas
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              >
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="Juli 2026">Juli 2026 (Tunggakan)</option>
              </select>
            </div>

            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 text-center space-y-1">
              <span className="text-xs font-black text-[#2563EB] uppercase tracking-widest">
                Total Tagihan Kas
              </span>
              <p className="text-4xl font-black text-[#2563EB] tracking-tight">
                Rp {amount.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-blue-700 font-medium">Nominal kas bulanan yang disepakati kelas</p>
            </div>

            <button
              onClick={() => setStep('method')}
              className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>PILIH METODE PEMBAYARAN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Select Payment Method */}
        {step === 'method' && (
          <div className="space-y-6 pt-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Metode Pembayaran
            </label>

            <div className="space-y-2.5">
              {/* QRIS */}
              <button
                onClick={() => setMethod('qris')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'qris'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">QRIS All Payment</p>
                    <p className="text-xs text-slate-500">BCA, GoPay, OVO, ShopeePay, Dana, LinkAja</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Instant Auto ✅
                </span>
              </button>

              {/* GoPay / ShopeePay / DANA */}
              <button
                onClick={() => setMethod('gopay')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'gopay' || method === 'shopeepay' || method === 'dana'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">E-Wallet (GoPay / DANA / ShopeePay)</p>
                    <p className="text-xs text-slate-500">Bayar cepat dari aplikasi dompet digital</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Instant Auto ✅
                </span>
              </button>

              {/* Transfer Bank */}
              <button
                onClick={() => setMethod('transfer_bank')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'transfer_bank'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Transfer Bank Manual</p>
                    <p className="text-xs text-slate-500">BCA, Mandiri, BRI + Upload Bukti</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                  Verifikasi Bendahara
                </span>
              </button>

              {/* Cash / Setor Manual */}
              <button
                onClick={() => setMethod('cash_manual')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'cash_manual'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-700 text-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Setor Tunai ke Bendahara</p>
                    <p className="text-xs text-slate-500">Bayar langsung uang tunai di kelas</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStep('amount')}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep('process')}
                className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Details & Simulation */}
        {step === 'process' && (
          <div className="space-y-6 pt-6">
            {/* Display method details */}
            {method === 'qris' && (
              <div className="text-center space-y-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Scan Kode QRIS Digital KasKu
                </p>
                <div className="bg-slate-900 p-4 rounded-3xl inline-block shadow-lg border-4 border-white">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KASKU-DIGITAL-12MIPA1-PAYMENT-RP10000"
                    alt="QRIS Code"
                    className="w-44 h-44 mx-auto rounded-xl"
                  />
                  <p className="text-white text-[11px] font-mono mt-2">NMID: ID1029384756123</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-800 text-xs font-medium">
                  💡 Buka e-wallet (GoPay, OVO, ShopeePay, DANA, Mobile Banking) lalu scan QR di atas.
                </div>
              </div>
            )}

            {method === 'transfer_bank' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Rekening Bendahara Kas Kelas:</p>
                  <p className="text-sm font-bold text-slate-900">{classGroup.bankInfo.bankName}</p>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-mono font-bold text-blue-700 text-base">
                      {classGroup.bankInfo.accountNumber}
                    </span>
                    <button
                      onClick={handleCopyAccount}
                      className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">a.n. {classGroup.bankInfo.accountName}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Upload Bukti Transfer / Struk (Simulasi)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800">Klik / Seret foto bukti transfer di sini</p>
                    <p className="text-[10px] text-slate-400">Format JPG, PNG (Maks 5MB)</p>
                  </div>
                </div>
              </div>
            )}

            {(method === 'gopay' || method === 'shopeepay' || method === 'dana') && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
                <Wallet className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-emerald-900 text-base">
                  Pembayaran Dompet Digital
                </h3>
                <p className="text-xs text-emerald-800">
                  Aplikasi akan menghubungkan saldo E-Wallet kamu untuk pembayaran kas sebesar{' '}
                  <span className="font-bold">Rp {amount.toLocaleString('id-ID')}</span>.
                </p>
              </div>
            )}

            {method === 'cash_manual' && (
              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-2 text-center">
                <p className="text-xs font-bold text-slate-600 uppercase">Setor Tunai Langsung</p>
                <p className="text-sm font-semibold text-slate-800">
                  Serahkan uang tunai sebesar Rp {amount.toLocaleString('id-ID')} kepada Bendahara ({classGroup.treasurerName}).
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Catatan Pembayaran (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Titip lewat Andi / Kas Bulan Agustus"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStep('method')}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Memproses Transaksi...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>KONFIRMASI BAYAR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Digital Struk */}
        {step === 'success' && lastTxn && (
          <div className="space-y-6 pt-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Pembayaran Berhasil Dicatat!</h3>
              <p className="text-xs text-slate-500 font-medium">
                {lastTxn.status === 'lunas'
                  ? 'Status pembayaran kamu telah LUNAS ✅'
                  : 'Bukti pembayaran berhasil dikirim dan menunggu verifikasi Bendahara 🟡'}
              </p>
            </div>

            {/* Struk Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">ID Transaksi:</span>
                <span className="font-mono font-bold text-slate-900">{lastTxn.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pembayar:</span>
                <span className="font-bold text-slate-900">{lastTxn.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode Kas:</span>
                <span className="font-bold text-slate-900">{lastTxn.monthPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-bold text-slate-900">{lastTxn.method.toUpperCase()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold">
                <span className="text-slate-700">Total Diterima:</span>
                <span className="text-emerald-700">Rp {lastTxn.amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              TUTUP & KEMBALI KE BERANDA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
