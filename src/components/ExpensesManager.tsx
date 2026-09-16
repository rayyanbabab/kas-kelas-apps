import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseCategory } from '../types';
import { PlusCircle, Search, Trash2, FileText, ShoppingBag, Calendar, Tag, Image, Upload, ArrowDownRight } from 'lucide-react';

export const ExpensesManager: React.FC = () => {
  const { expenses, addExpense, deleteExpense, classGroup, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');

  // Form state
  const [amount, setAmount] = useState<number>(10000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('keperluan_kelas');
  const [description, setDescription] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');

  const categoryLabels: Record<ExpenseCategory, { label: string; badge: string }> = {
    keperluan_kelas: { label: 'Keperluan Kelas', badge: 'bg-blue-100 text-blue-800' },
    kegiatan: { label: 'Kegiatan & Acara', badge: 'bg-purple-100 text-purple-800' },
    perlengkapan: { label: 'Perlengkapan Kebersihan/Alat', badge: 'bg-emerald-100 text-emerald-800' },
    lainnya: { label: 'Lainnya', badge: 'bg-slate-100 text-slate-800' },
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    addExpense({
      classId: classGroup.id,
      amount: Number(amount),
      date,
      category,
      description,
      receiptUrl: receiptUrl || 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=400',
      recordedBy: currentUser.name,
    });

    setShowAddModal(false);
    setDescription('');
    setAmount(10000);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'semua' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pencatatan Pengeluaran Uang Kas
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Mencatat setiap kebutuhan kelas secara rapi, terbuka, dan disertai bukti nota
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>TAMBAH PENGELUARAN KAS</span>
        </button>
      </div>

      {/* Expense Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Pengeluaran Kas Tersebab
          </span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">
            Rp {totalExpenseSum.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {expenses.length} item pengeluaran telah dicatat Bendahara
          </p>
        </div>
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl hidden sm:block">
          <ArrowDownRight className="w-8 h-8" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-slate-900 text-base">Rincian Pengeluaran Kas</h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari keterangan pengeluaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-52"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <option value="semua">Semua Kategori</option>
              <option value="keperluan_kelas">Keperluan Kelas</option>
              <option value="kegiatan">Kegiatan</option>
              <option value="perlengkapan">Perlengkapan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Pengeluaran</p>
            <p className="text-xs text-slate-400">Klik tombol Tambah Pengeluaran untuk mencatat transaksi baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Pencatat</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{exp.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${categoryLabels[exp.category].badge}`}>
                        {categoryLabels[exp.category].label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{exp.description}</td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.recordedBy}</td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600">
                      - Rp {exp.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {currentUser.role === 'bendahara' || currentUser.role === 'admin' ? (
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form
            onSubmit={handleAdd}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-slate-100 space-y-4"
          >
            <h3 className="font-extrabold text-slate-900 text-lg pb-2 border-b border-slate-100">
              Catat Pengeluaran Baru
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pengeluaran</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800"
                >
                  <option value="keperluan_kelas">Keperluan Kelas (Spidol, Modul, FC)</option>
                  <option value="kegiatan">Kegiatan & Acara (17-an, Kerja Bakti)</option>
                  <option value="perlengkapan">Perlengkapan Kebersihan/Alat</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Pengeluaran</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Beli 2 pak spidol boardmaker warna hitam dan biru"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md"
              >
                SIMPAN PENGELUARAN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
