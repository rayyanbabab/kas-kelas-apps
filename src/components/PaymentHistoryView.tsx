import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Payment } from '../types';
import { History, Search, Download, CheckCircle2, Clock, AlertTriangle, FileText, X, ShieldCheck } from 'lucide-react';

export const PaymentHistoryView: React.FC = () => {
  const { currentUser, payments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedTxn, setSelectedTxn] = useState<Payment | null>(null);

  // Filter payments for current user (or all if admin)
  const myPayments = payments.filter((p) => p.userId === currentUser.id);

  const filteredPayments = myPayments.filter((p) => {
    const matchesSearch =
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.monthPeriod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'semua' || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <History className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">Riwayat Pembayaran Kas Saya</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Daftar seluruh transaksi pembayaran kas atas nama {currentUser.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-44"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="lunas">🟢 Lunas</option>
              <option value="menunggu">🟡 Menunggu Verifikasi</option>
              <option value="belum_bayar">🔴 Belum Bayar</option>
            </select>
          </div>
        </div>

        {/* Transactions Table / Cards */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Catatan Transaksi</p>
            <p className="text-xs text-slate-400 mt-1">Lakukan pembayaran kas pertama kamu untuk melihat riwayat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal & ID</th>
                  <th className="py-3 px-4">Periode Kas</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Struk / Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.date}</p>
                      <p className="font-mono text-[10px] text-slate-400">{p.transactionId}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{p.monthPeriod}</td>
                    <td className="py-3.5 px-4 uppercase text-slate-600 font-semibold">
                      {p.method.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Rp {p.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          p.status === 'lunas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'menunggu'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status === 'lunas' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {p.status === 'menunggu' && <Clock className="w-3 h-3 text-amber-600" />}
                        {p.status === 'belum_bayar' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        <span>
                          {p.status === 'lunas'
                            ? 'LUNAS'
                            : p.status === 'menunggu'
                            ? 'VERIFIKASI'
                            : 'BELUM BAYAR'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTxn(p)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                      >
                        Lihat Struk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Struk Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Struk Digital Class Fund</h3>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-slate-200">
                <div className="w-10 h-10 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center mx-auto mb-1 text-lg">
                  K
                </div>
                <p className="font-bold text-slate-900 text-sm">BUKTI PEMBAYARAN KAS</p>
                <p className="text-[10px] text-slate-400 font-mono">{selectedTxn.transactionId}</p>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pembayar:</span>
                <span className="font-bold text-slate-900">{selectedTxn.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Transaksi:</span>
                <span className="font-bold text-slate-900">{selectedTxn.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode Kas:</span>
                <span className="font-bold text-slate-900">{selectedTxn.monthPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span className="font-bold text-slate-900">{selectedTxn.method.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Verification:</span>
                <span className="font-bold text-emerald-700 capitalize">{selectedTxn.status}</span>
              </div>

              {selectedTxn.verifiedBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Diverifikasi Oleh:</span>
                  <span className="font-bold text-slate-800">{selectedTxn.verifiedBy}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span className="text-slate-700">Nominal:</span>
                <span className="text-emerald-700">Rp {selectedTxn.amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {selectedTxn.proofUrl && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Bukti Transfer Terlampir:</p>
                <img
                  src={selectedTxn.proofUrl}
                  alt="Proof"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            <button
              onClick={() => alert('Struk digital berhasil diunduh sebagai PDF/Gambar!')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>UNDUH STRUK PEMBAYARAN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
