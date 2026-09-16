import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { X, QrCode, Building2, Wallet, CheckCircle2, Upload, AlertCircle, ArrowRight, ShieldCheck, Download, Copy, Check, Calendar, CheckSquare, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, classGroup, addPayment } = useApp();

  const [step, setStep] = useState<'amount' | 'method' | 'process' | 'success'>('amount');
  const [selectedMonth, setSelectedMonth] = useState<string>(classGroup.period);
  const [paymentOption, setPaymentOption] = useState<'1_minggu' | '2_minggu' | '3_minggu' | '1_bulan' | 'custom'>('1_bulan');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState<number>(classGroup.weeklyDues);
  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastTxn, setLastTxn] = useState<any>(null);

  if (!isOpen) return null;

  const weeklyFee = classGroup.weeklyDues || 6000;
  const monthlyFee = classGroup.monthlyDues || 24000;

  const getComputedAmount = () => {
    switch (paymentOption) {
      case '1_minggu':
        return weeklyFee;
      case '2_minggu':
        return weeklyFee * 2;
      case '3_minggu':
        return weeklyFee * 3;
      case '1_bulan':
        return monthlyFee;
      case 'custom':
        return customAmount;
      default:
        return monthlyFee;
    }
  };

  const getWeekPeriodLabel = () => {
    switch (paymentOption) {
      case '1_minggu':
        return `Minggu ${selectedWeek}`;
      case '2_minggu':
        return 'Minggu 1 & 2 (2 Minggu)';
      case '3_minggu':
        return 'Minggu 1, 2 & 3 (3 Minggu)';
      case '1_bulan':
        return '1 Bulan Penuh (Minggu 1 - 4)';
      case 'custom':
        return `Pembayaran Kas Khusus`;
      default:
        return '1 Bulan Penuh';
    }
  };

  const amount = getComputedAmount();

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
        weekPeriod: getWeekPeriodLabel(),
        weeksPaid: paymentOption === '1_minggu' ? [selectedWeek] : paymentOption === '1_bulan' ? [1, 2, 3, 4] : [1, 2],
        method,
        status: isAutoLunas ? 'lunas' : 'menunggu',
        proofUrl: proofUrl || (method === 'transfer_bank' ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500' : undefined),
        notes: notes || `Pembayaran kas ${getWeekPeriodLabel()} via ${method.toUpperCase()}`,
        verifiedAt: isAutoLunas ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
        verifiedBy: isAutoLunas ? 'System Auto Payment' : undefined,
      });

      setLastTxn(newTxn);
      setStep('success');
      onSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Bayar Uang Kas</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {classGroup.name} — Rp {weeklyFee.toLocaleString('id-ID')} / Minggu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Select Period & Weekly / Monthly Option */}
        {step === 'amount' && (
          <div className="space-y-5 pt-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">
                Periode Bulan Kas
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#2563EB] focus:outline-none uppercase tracking-wider"
              >
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="Juli 2026">Juli 2026 (Tunggakan)</option>
              </select>
            </div>

            {/* Pilihan Paket Minggu */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">
                Pilih Durasi Pembayaran:
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1 Minggu */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('1_minggu')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentOption === '1_minggu'
                      ? 'border-[#2563EB] bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">1 Minggu</p>
                  <p className="text-base font-black text-[#2563EB]">Rp {(weeklyFee * 1).toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Bayar per pekan</p>
                </button>

                {/* 2 Minggu */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('2_minggu')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentOption === '2_minggu'
                      ? 'border-[#2563EB] bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">2 Minggu</p>
                  <p className="text-base font-black text-[#2563EB]">Rp {(weeklyFee * 2).toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Hemat waktu 2 pekan</p>
                </button>

                {/* 3 Minggu */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('3_minggu')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentOption === '3_minggu'
                      ? 'border-[#2563EB] bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">3 Minggu</p>
                  <p className="text-base font-black text-[#2563EB]">Rp {(weeklyFee * 3).toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">3 pekan sekaligus</p>
                </button>

                {/* 1 Bulan Penuh (4 Minggu) */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('1_bulan')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                    paymentOption === '1_bulan'
                      ? 'border-[#2563EB] bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase">
                    Rekomendasi
                  </span>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">1 Bulan (4 Mg)</p>
                  <p className="text-base font-black text-emerald-600">Rp {monthlyFee.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Langsung lunas 1 bulan</p>
                </button>
              </div>
            </div>

            {/* If 1 Minggu is chosen, choose which week */}
            {paymentOption === '1_minggu' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Pilih Minggu yang Hendak Dibayar:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((wk) => (
                    <button
                      key={wk}
                      type="button"
                      onClick={() => setSelectedWeek(wk)}
                      className={`py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                        selectedWeek === wk
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Minggu {wk}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total Display */}
            <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-100 text-center space-y-1">
              <span className="text-xs font-black text-[#2563EB] uppercase tracking-widest">
                Total Tagihan Yang Akan Dibayar
              </span>
              <p className="text-4xl font-black text-[#2563EB] tracking-tight">
                Rp {amount.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">
                {getWeekPeriodLabel()} • {selectedMonth}
              </p>
            </div>

            <button
              onClick={() => setStep('method')}
              className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>LANJUT KE METODE PEMBAYARAN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Select Payment Method */}
        {step === 'method' && (
          <div className="space-y-5 pt-5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Pilih Metode Pembayaran
              </label>
              <span className="text-xs font-black text-[#2563EB]">
                Rp {amount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* QRIS */}
              <button
                onClick={() => setMethod('qris')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'qris'
                    ? 'border-[#2563EB] bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#2563EB] text-white rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">QRIS All Payment</p>
                    <p className="text-xs text-slate-500">BCA, GoPay, OVO, ShopeePay, DANA, LinkAja</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
                  Instant Auto ✅
                </span>
              </button>

              {/* GoPay / ShopeePay / DANA */}
              <button
                onClick={() => setMethod('gopay')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'gopay' || method === 'shopeepay' || method === 'dana'
                    ? 'border-[#2563EB] bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">E-Wallet (GoPay / DANA / ShopeePay)</p>
                    <p className="text-xs text-slate-500">Bayar instan saldo dompet digital</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
                  Instant Auto ✅
                </span>
              </button>

              {/* Transfer Bank */}
              <button
                onClick={() => setMethod('transfer_bank')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'transfer_bank'
                    ? 'border-[#2563EB] bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">Transfer Bank Rekening Kelas</p>
                    <p className="text-xs text-slate-500">BCA Kas Kelas + Upload Bukti Struk</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full uppercase tracking-wider">
                  Verif Bendahara
                </span>
              </button>

              {/* Cash / Setor Manual */}
              <button
                onClick={() => setMethod('cash_manual')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  method === 'cash_manual'
                    ? 'border-[#2563EB] bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-700 text-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">Setor Tunai Langsung</p>
                    <p className="text-xs text-slate-500">Bayar tunai di kelas ke Bendahara Utama</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStep('amount')}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep('process')}
                className="w-2/3 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md shadow-blue-200 transition-all cursor-pointer"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Details & Simulation */}
        {step === 'process' && (
          <div className="space-y-5 pt-5">
            {/* Display method details */}
            {method === 'qris' && (
              <div className="text-center space-y-3">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Scan QRIS Digital Class Fund — Rp {amount.toLocaleString('id-ID')}
                </p>
                <div className="bg-slate-900 p-4 rounded-3xl inline-block shadow-lg border-4 border-white">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KASKU-DIGITAL-12MIPA1-PAYMENT-RP6000"
                    alt="QRIS Code"
                    className="w-40 h-40 mx-auto rounded-xl"
                  />
                  <p className="text-white text-[11px] font-mono mt-2">NMID: ID1029384756123</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-[#2563EB] text-xs font-medium">
                  💡 Buka aplikasi GoPay / DANA / OVO / BCA Mobile lalu scan QR di atas.
                </div>
              </div>
            )}

            {method === 'transfer_bank' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rekening Kas Kelas:</p>
                  <p className="text-sm font-black text-slate-900">{classGroup.bankInfo.bankName}</p>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-mono font-black text-[#2563EB] text-base">
                      {classGroup.bankInfo.accountNumber}
                    </span>
                    <button
                      onClick={handleCopyAccount}
                      className="px-2.5 py-1 text-xs bg-blue-50 text-[#2563EB] hover:bg-blue-100 rounded-lg font-black flex items-center space-x-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">a.n. {classGroup.bankInfo.accountName}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Upload Foto Bukti Transfer (Simulasi)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload className="w-7 h-7 text-[#2563EB] mx-auto mb-1" />
                    <p className="text-xs font-black text-slate-800">Klik / Seret foto bukti transfer di sini</p>
                    <p className="text-[10px] text-slate-400">Format JPG, PNG (Maks 5MB)</p>
                  </div>
                </div>
              </div>
            )}

            {(method === 'gopay' || method === 'shopeepay' || method === 'dana') && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                <Wallet className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-black text-emerald-950 text-sm uppercase tracking-wide">
                  Pembayaran Dompet Digital
                </h3>
                <p className="text-xs text-emerald-800">
                  Pembayaran kas <strong className="font-black">{getWeekPeriodLabel()}</strong> sebesar{' '}
                  <span className="font-black text-emerald-900">Rp {amount.toLocaleString('id-ID')}</span> akan diproses otomatis.
                </p>
              </div>
            )}

            {method === 'cash_manual' && (
              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-2 text-center">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Setor Tunai Langsung</p>
                <p className="text-xs font-semibold text-slate-800">
                  Serahkan uang tunai sebesar <strong>Rp {amount.toLocaleString('id-ID')}</strong> ({getWeekPeriodLabel()}) kepada Bendahara Utama di kelas.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Catatan Pembayaran (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Titip lewat ketua kelas / Kas Minggu 1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStep('method')}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
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
          <div className="space-y-5 pt-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pembayaran Berhasil Dicatat!</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                {lastTxn.status === 'lunas'
                  ? 'Status pembayaran kas kamu telah LUNAS ✅'
                  : 'Bukti pembayaran menunggu verifikasi Bendahara 🟡'}
              </p>
            </div>

            {/* Struk Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">ID Transaksi:</span>
                <span className="font-mono font-black text-slate-900">{lastTxn.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Nama:</span>
                <span className="font-black text-slate-900">{lastTxn.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Alokasi Kas:</span>
                <span className="font-black text-[#2563EB]">{lastTxn.weekPeriod || 'Kas Kelas'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Periode:</span>
                <span className="font-bold text-slate-900">{lastTxn.monthPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Metode:</span>
                <span className="font-bold text-slate-900 uppercase">{lastTxn.method}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
                <span className="text-slate-700">Total Dibayar:</span>
                <span className="text-emerald-700">Rp {lastTxn.amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer"
            >
              TUTUP & KEMBALI KE BERANDA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
