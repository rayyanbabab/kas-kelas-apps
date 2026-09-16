import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Printer, Download, CheckCircle2, TrendingUp, TrendingDown, Wallet, Calendar, Share2, Layers, Lock, ShieldCheck, EyeOff, UserCheck, PlusCircle } from 'lucide-react';

interface FinancialReportViewProps {
  setActiveTab?: (tab: string) => void;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({ setActiveTab }) => {
  const { classGroup, payments, expenses, users, totalBalance, currentUser } = useApp();
  const [periodFilter, setPeriodFilter] = useState<'bulanan' | 'semester' | 'mingguan' | 'harian'>('bulanan');

  const isTreasurerOrAdmin = currentUser.role === 'bendahara' || currentUser.role === 'admin';

  const lunasPayments = payments.filter((p) => p.status === 'lunas');
  const myLunasPayments = lunasPayments.filter((p) => p.userId === currentUser.id);
  
  // Displayed income entries based on role
  const displayedIncomeList = isTreasurerOrAdmin ? lunasPayments : myLunasPayments;

  const totalIncome = lunasPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvHeader = 'Tanggal,Jenis,Nama / Keterangan,Nominal,Metode / Kategori\n';
    const incomeRows = displayedIncomeList.map(
      (p) => `${p.date},Pemasukan Kas,${p.userName},${p.amount},${p.method}`
    );
    const expenseRows = expenses.map(
      (e) => `${e.date},Pengeluaran Kas,${e.description},${e.amount},${e.category}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + csvHeader + [...incomeRows, ...expenseRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Kas_${classGroup.name}_${isTreasurerOrAdmin ? 'Lengkap' : currentUser.name}_${periodFilter}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Wrapper */}
      <div id="printable-report" className="space-y-6">
        {/* Header & Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-[#2563EB]" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                Laporan Keuangan Kas Digital
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Transparansi Keuangan {classGroup.name} — {classGroup.treasurerName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Period Filter Selector */}
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-black text-slate-800 bg-white uppercase tracking-wider shadow-xs"
            >
              <option value="bulanan">Periode Bulanan ({classGroup.period})</option>
              <option value="semester">Periode Semester Ganjil 2026</option>
              <option value="mingguan">Periode Mingguan</option>
              <option value="harian">Periode Harian</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer border border-slate-200"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="px-5 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-200 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pemasukan Kas</span>
            <p className="text-3xl font-black text-emerald-600 tracking-tight">
              Rp {totalIncome.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              {isTreasurerOrAdmin
                ? `Dari ${lunasPayments.length} transaksi seluruh anggota`
                : `Total kas masuk kelas`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pengeluaran Kas</span>
            <p className="text-3xl font-black text-rose-600 tracking-tight">
              Rp {totalExpense.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{expenses.length} item pengeluaran</p>
          </div>

          <div className="bg-[#2563EB] text-white p-6 rounded-3xl shadow-lg shadow-blue-200 space-y-1">
            <span className="text-xs font-black text-blue-100 uppercase tracking-widest">Saldo Bersih Kas Kelas</span>
            <p className="text-3xl font-black text-white tracking-tight">
              Rp {netBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-blue-100 font-bold uppercase tracking-wider">Saldo riil di kas bendahara</p>
          </div>
        </div>

        {/* Privacy Notice Banner for Members */}
        {!isTreasurerOrAdmin && (
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start space-x-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">Kebijakan Privasi Aktivitas Kas Anggota</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Untuk menjaga privasi data antaranggota, Anda hanya dapat melihat aktivitas dan riwayat setoran kas pribadi Anda serta transparansi pengeluaran kelas. Riwayat setoran anggota lain hanya dapat diakses oleh <strong>Bendahara</strong> dan <strong>Admin</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Ledger Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Log */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>
                  {isTreasurerOrAdmin
                    ? 'Rincian Pemasukan Kas Seluruh Anggota'
                    : 'Rincian Pemasukan Kas Saya'}
                </span>
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {displayedIncomeList.length} Lunas
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {displayedIncomeList.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="font-bold">Belum Ada Transaksi Kas</p>
                  <p className="text-[11px] mt-0.5">
                    {isTreasurerOrAdmin
                      ? 'Belum ada pembayaran yang lunas.'
                      : 'Anda belum memiliki transaksi pembayaran yang lunas.'}
                  </p>
                </div>
              ) : (
                displayedIncomeList.map((p) => (
                  <div key={p.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{p.userName}</p>
                      <p className="text-[10px] text-slate-400">{p.date} • {p.monthPeriod} • <span className="uppercase">{p.method}</span></p>
                    </div>
                    <span className="font-extrabold text-emerald-700">
                      + Rp {p.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expense Log (Transparent for all members) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>Rincian Pengeluaran Kas Kelas</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  {expenses.length} Item
                </span>
                {isTreasurerOrAdmin && setActiveTab && (
                  <button
                    onClick={() => setActiveTab('pengeluaran')}
                    className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                    title="Tambah Pengeluaran Kas Baru"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Tambah</span>
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {expenses.map((e) => (
                <div key={e.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{e.description}</p>
                    <p className="text-[10px] text-slate-400">{e.date} • {e.category}</p>
                  </div>
                  <span className="font-extrabold text-rose-600">
                    - Rp {e.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Member Payment Matrix Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>
                {isTreasurerOrAdmin
                  ? 'Matriks Rekap Pembayaran Seluruh Anggota (Akses Khusus Bendahara & Admin)'
                  : 'Status Rekap Pembayaran Kas Anda'}
              </span>
            </h2>
            {!isTreasurerOrAdmin && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Data Anggota Lain Terproteksi</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Anggota</th>
                  <th className="py-2.5 px-3">Juli 2026</th>
                  <th className="py-2.5 px-3">Agustus 2026</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(isTreasurerOrAdmin
                  ? users.filter((u) => u.role !== 'admin')
                  : users.filter((u) => u.id === currentUser.id)
                ).map((u, idx) => {
                  const pJul = payments.find((p) => p.userId === u.id && p.monthPeriod === 'Juli 2026' && p.status === 'lunas');
                  const pAug = payments.find((p) => p.userId === u.id && p.monthPeriod === 'Agustus 2026' && p.status === 'lunas');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {u.name}
                        {u.id === currentUser.id && (
                          <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            Anda
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {pJul ? (
                          <span className="text-emerald-700 font-bold">LUNAS ✅</span>
                        ) : (
                          <span className="text-rose-600 font-bold">BELUM</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {pAug ? (
                          <span className="text-emerald-700 font-bold">LUNAS ✅</span>
                        ) : (
                          <span className="text-rose-600 font-bold">BELUM</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          pAug ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pAug ? 'LUNAS' : 'TUNGGAKAN'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isTreasurerOrAdmin && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Hanya status kas pribadi Anda yang ditampilkan di atas. Rekapitulasi nama dan status 31 anggota lainnya disembunyikan untuk privasi.</span>
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
