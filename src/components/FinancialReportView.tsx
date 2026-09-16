import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Printer, Download, TrendingUp, TrendingDown, Layers, Lock, ShieldCheck, PlusCircle } from 'lucide-react';

interface FinancialReportViewProps {
  setActiveTab?: (tab: string) => void;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({ setActiveTab }) => {
  const { classGroup, payments, expenses, users, currentUser } = useApp();
  const [periodFilter, setPeriodFilter] = useState<'bulanan' | 'semester' | 'mingguan' | 'harian'>('bulanan');

  const isTreasurerOrAdmin = currentUser.role === 'bendahara' || currentUser.role === 'admin';

  // Real date & period filtering algorithm
  const filteredData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const lunasList = payments.filter((p) => p.status === 'lunas');

    let incomeFiltered = lunasList;
    let expenseFiltered = expenses;

    if (periodFilter === 'bulanan') {
      incomeFiltered = lunasList.filter((p) => p.monthPeriod === classGroup.period);
      expenseFiltered = expenses.filter((e) => e.date.startsWith('2026-08') || e.date.startsWith(today.substring(0, 7)));
    } else if (periodFilter === 'mingguan') {
      incomeFiltered = lunasList.filter((p) => p.date >= sevenDaysAgo);
      expenseFiltered = expenses.filter((e) => e.date >= sevenDaysAgo);
    } else if (periodFilter === 'harian') {
      incomeFiltered = lunasList.filter((p) => p.date === today);
      expenseFiltered = expenses.filter((e) => e.date === today);
    } // 'semester' includes all

    const displayedIncome = isTreasurerOrAdmin
      ? incomeFiltered
      : incomeFiltered.filter((p) => p.userId === currentUser.id);

    const totalIncome = incomeFiltered.reduce((sum, p) => sum + p.amount, 0);
    const totalExpense = expenseFiltered.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpense;

    return {
      displayedIncome,
      expenseFiltered,
      totalIncome,
      totalExpense,
      netBalance,
    };
  }, [payments, expenses, periodFilter, classGroup.period, isTreasurerOrAdmin, currentUser.id]);

  const { displayedIncome, expenseFiltered, totalIncome, totalExpense, netBalance } = filteredData;

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvHeader = 'Tanggal,Jenis,Nama / Keterangan,Nominal,Metode / Kategori\n';
    const incomeRows = displayedIncome.map(
      (p) => `${p.date},Pemasukan Kas,${p.userName},${p.amount},${p.method}`
    );
    const expenseRows = expenseFiltered.map(
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
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Laporan Keuangan Kas Kelas
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Transparansi Keuangan {classGroup.name} • Bendahara: {classGroup.treasurerName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Period Filter Selector */}
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-xs"
            >
              <option value="bulanan">Periode Bulanan ({classGroup.period})</option>
              <option value="semester">Periode Semester</option>
              <option value="mingguan">7 Hari Terakhir</option>
              <option value="harian">Hari Ini</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-clean p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan</span>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">
              Rp {totalIncome.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-400">
              {isTreasurerOrAdmin ? `Dari ${displayedIncome.length} transaksi lunas` : `Kas masuk kelas`}
            </p>
          </div>

          <div className="card-clean p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              Rp {totalExpense.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-400">{expenseFiltered.length} item pengeluaran</p>
          </div>

          <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm space-y-1">
            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">Saldo Periode Ini</span>
            <p className="text-2xl font-bold text-white tracking-tight">
              Rp {netBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-blue-100/90">Saldo riil kas kelas</p>
          </div>
        </div>

        {/* Privacy Notice Banner for Members */}
        {!isTreasurerOrAdmin && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start space-x-3 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">Privasi Aktivitas Kas Anggota</p>
              <p className="text-blue-800/90 mt-0.5 leading-relaxed">
                Anda dapat melihat riwayat pembayaran kas pribadi Anda dan rincian pengeluaran kelas. Riwayat setoran anggota lain hanya dapat diakses oleh <strong>Bendahara</strong> dan <strong>Admin</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Ledger Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Log */}
          <div className="card-clean p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{isTreasurerOrAdmin ? 'Pemasukan Kas Anggota' : 'Pemasukan Kas Saya'}</span>
              </h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                {displayedIncome.length} Lunas
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {displayedIncome.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="font-medium">Belum Ada Transaksi Kas</p>
                </div>
              ) : (
                displayedIncome.map((p) => (
                  <div key={p.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{p.userName}</p>
                      <p className="text-[10px] text-slate-400">{p.date} • {p.monthPeriod} • <span className="uppercase">{p.method.replace('_', ' ')}</span></p>
                    </div>
                    <span className="font-bold text-emerald-600">
                      + Rp {p.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expense Log */}
          <div className="card-clean p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>Rincian Pengeluaran Kas</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  {expenseFiltered.length} Item
                </span>
                {isTreasurerOrAdmin && setActiveTab && (
                  <button
                    onClick={() => setActiveTab('pengeluaran')}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>+ Catat</span>
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {expenseFiltered.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="font-medium">Belum ada pengeluaran kas tercatat</p>
                </div>
              ) : (
                expenseFiltered.map((e) => (
                  <div key={e.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{e.description}</p>
                      <p className="text-[10px] text-slate-400">{e.date} • {e.category.replace('_', ' ')}</p>
                    </div>
                    <span className="font-bold text-rose-600">
                      - Rp {e.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Member Payment Matrix Checklist */}
        <div className="card-clean p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>
                {isTreasurerOrAdmin
                  ? 'Matriks Rekap Pembayaran Anggota'
                  : 'Status Rekap Pembayaran Kas Anda'}
              </span>
            </h2>
            {!isTreasurerOrAdmin && (
              <span className="inline-flex items-center space-x-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Data Anggota Lain Terproteksi</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Anggota</th>
                  <th className="py-2.5 px-3">Juli 2026</th>
                  <th className="py-2.5 px-3">Agustus 2026</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(isTreasurerOrAdmin
                  ? users.filter((u) => u.role !== 'admin')
                  : users.filter((u) => u.id === currentUser.id)
                ).map((u, idx) => {
                  const pJul = payments.find((p) => p.userId === u.id && p.monthPeriod === 'Juli 2026' && p.status === 'lunas');
                  const pAug = payments.find((p) => p.userId === u.id && p.monthPeriod === 'Agustus 2026' && p.status === 'lunas');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {u.name}
                        {u.id === currentUser.id && (
                          <span className="ml-2 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                            Anda
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {pJul ? (
                          <span className="text-emerald-700 font-semibold">Lunas ✅</span>
                        ) : (
                          <span className="text-slate-400">Belum</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {pAug ? (
                          <span className="text-emerald-700 font-semibold">Lunas ✅</span>
                        ) : (
                          <span className="text-rose-600 font-semibold">Belum</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          pAug ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {pAug ? 'Lunas' : 'Tunggakan'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isTreasurerOrAdmin && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Hanya status kas pribadi Anda yang ditampilkan. Data anggota lain diproteksi untuk privasi.</span>
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
