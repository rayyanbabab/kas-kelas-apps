import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory } from '../types';
import { PlusCircle, Search, Trash2, FileText, ShoppingBag, Calendar, Tag, Image as ImageIcon, Upload, ArrowDownRight, Edit3, X, CheckCircle2, Coins, Sparkles, AlertTriangle, Eye, ChevronDown, ChevronUp } from 'lucide-react';

const NOMINAL_PRESETS = [
  { label: '50 Rb', value: 50_000 },
  { label: '100 Rb', value: 100_000 },
  { label: '250 Rb', value: 250_000 },
  { label: '500 Rb', value: 500_000 },
  { label: '1 Juta', value: 1_000_000 },
  { label: '2 Juta', value: 2_000_000 },
  { label: '3 Juta', value: 3_000_000 },
  { label: '5 Juta', value: 5_000_000 },
  { label: '10 Juta', value: 10_000_000 },
];

const INCREMENT_BUTTONS = [
  { label: '+100 Rb', delta: 100_000 },
  { label: '+500 Rb', delta: 500_000 },
  { label: '+1 Juta', delta: 1_000_000 },
  { label: '+2.5 Juta', delta: 2_500_000 },
  { label: '+5 Juta', delta: 5_000_000 },
];

const SAMPLE_RECEIPTS = [
  { label: 'Struk Toko Buku / ATK', url: 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Kwitansi Sewa Bus / Acara', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Struk Perlengkapan / Kebersihan', url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&auto=format&fit=crop&q=80' },
  { label: 'Kwitansi Sound System / Audio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80' },
];

function formatNominalRingkas(num: number): string {
  if (num <= 0) return 'Rp 0';
  if (num >= 1_000_000_000) {
    const m = num / 1_000_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(2)} Miliar Rupiah`;
  }
  if (num >= 1_000_000) {
    const jt = num / 1_000_000;
    return `${jt % 1 === 0 ? jt : jt.toFixed(2)} Juta Rupiah`;
  }
  if (num >= 1_000) {
    const rb = num / 1_000;
    return `${rb % 1 === 0 ? rb : rb.toFixed(1)} Ribu Rupiah`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export const ExpensesManager: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, classGroup, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; desc: string; amount: number; date: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Form state
  const [amount, setAmount] = useState<number>(100000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('keperluan_kelas');
  const [description, setDescription] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>(SAMPLE_RECEIPTS[0].url);

  // Edit Form state
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('keperluan_kelas');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editReceiptUrl, setEditReceiptUrl] = useState<string>('');

  const categoryLabels: Record<ExpenseCategory, { label: string; badge: string }> = {
    keperluan_kelas: { label: 'Keperluan Kelas', badge: 'bg-blue-100 text-blue-800' },
    kegiatan: { label: 'Kegiatan & Acara', badge: 'bg-purple-100 text-purple-800' },
    perlengkapan: { label: 'Perlengkapan Kebersihan/Alat', badge: 'bg-emerald-100 text-emerald-800' },
    lainnya: { label: 'Lainnya', badge: 'bg-slate-100 text-slate-800' },
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isEdit) {
            setEditReceiptUrl(reader.result);
          } else {
            setReceiptUrl(reader.result);
          }
          showToast('Foto nota/struk berhasil diunggah!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) return;

    addExpense({
      classId: classGroup.id,
      amount: Number(amount),
      date,
      category,
      description: description.trim(),
      receiptUrl: receiptUrl || SAMPLE_RECEIPTS[0].url,
      recordedBy: currentUser.name,
    });

    setShowAddModal(false);
    setShowInlineAdd(false);
    const addedDesc = description.trim();
    const addedAmt = amount;
    setDescription('');
    setAmount(100000);
    showToast(`Pengeluaran "${addedDesc}" senilai Rp ${addedAmt.toLocaleString('id-ID')} berhasil dicatat!`);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setEditAmount(exp.amount);
    setEditDate(exp.date);
    setEditCategory(exp.category);
    setEditDescription(exp.description);
    setEditReceiptUrl(exp.receiptUrl || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editAmount || !editDescription.trim()) return;

    updateExpense(editingExpense.id, {
      amount: Number(editAmount),
      date: editDate,
      category: editCategory,
      description: editDescription.trim(),
      receiptUrl: editReceiptUrl || editingExpense.receiptUrl,
    });

    const updatedDesc = editDescription.trim();
    setEditingExpense(null);
    showToast(`Rincian "${updatedDesc}" berhasil diperbarui.`);
  };

  const openDeleteModal = (exp: Expense) => {
    setDeletingExpense(exp);
  };

  const confirmDelete = () => {
    if (!deletingExpense) return;
    const desc = deletingExpense.description;
    deleteExpense(deletingExpense.id);
    setDeletingExpense(null);
    if (editingExpense?.id === deletingExpense.id) {
      setEditingExpense(null);
    }
    showToast(`Catatan pengeluaran "${desc}" berhasil dihapus.`);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'semua' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pencatatan Pengeluaran Uang Kas
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Tambah, kelola, dan perbarui setiap transaksi belanja uang kas kelas (didukung hingga nominal jutaan rupiah dan foto nota)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInlineAdd(!showInlineAdd)}
            className="px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer border border-blue-200"
          >
            {showInlineAdd ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showInlineAdd ? 'Tutup Formulir Cepat' : 'Formulir Cepat'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ TAMBAH PENGELUARAN KAS</span>
          </button>
        </div>
      </div>

      {/* Inline Quick-Add Form Card */}
      {showInlineAdd && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-500/30 shadow-lg space-y-4 animate-scale-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Formulir Cepat Tambah Pengeluaran Kas Kelas
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Isi rincian transaksi belanja kas secara langsung tanpa membuka pop-up
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInlineAdd(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Rincian Belanja Kas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Spidol, Cat Mading 17-an, Sound System"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
                  >
                    <option value="keperluan_kelas">Keperluan Kelas</option>
                    <option value="kegiatan">Kegiatan & Acara</option>
                    <option value="perlengkapan">Perlengkapan</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Receipt Attachment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto Bukti Nota / Struk</label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} className="hidden" />
                  </label>

                  {receiptUrl && (
                    <div className="flex items-center space-x-2 bg-slate-50 p-1 pr-2 rounded-xl border border-slate-200">
                      <img src={receiptUrl} alt="Preview" className="w-6 h-6 object-cover rounded-md" />
                      <span className="text-[10px] font-bold text-emerald-700">Nota Terlampir</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nominal Section with Presets */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800">Nominal Pengeluaran</label>
                  <span className="text-xs font-black text-[#2563EB]">{formatNominalRingkas(amount)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    min={500}
                    step={1000}
                    value={amount || ''}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="Contoh: 1500000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {NOMINAL_PRESETS.slice(0, 6).map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setAmount(p.value)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                        amount === p.value ? 'bg-[#2563EB] text-white' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SIMPAN PENGELUARAN INI</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Expense Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Pengeluaran Kas Tersebab
          </span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">
            - Rp {totalExpenseSum.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Total dari {expenses.length} transaksi pembelanjaan kebutuhan kelas ({formatNominalRingkas(totalExpenseSum)})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Table & Filter Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="font-extrabold text-slate-900 text-base">
              Riwayat Pembelanjaan Kas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
              {filteredExpenses.length} Item
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pengeluaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <th className="py-3 px-4">Nota / Struk</th>
                  <th className="py-3 px-4">Pencatat</th>
                  <th className="py-3 px-4">Nominal (Rp)</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">{exp.date}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${categoryLabels[exp.category].badge}`}>
                        {categoryLabels[exp.category].label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{exp.description}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {exp.receiptUrl ? (
                        <button
                          onClick={() => setViewingReceipt({ url: exp.receiptUrl!, desc: exp.description, amount: exp.amount, date: exp.date })}
                          className="flex items-center space-x-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                          title="Lihat Foto Nota Bukti"
                        >
                          <img src={exp.receiptUrl} alt="Nota" className="w-4 h-4 rounded object-cover" />
                          <span>Lihat Nota</span>
                          <Eye className="w-3 h-3 text-slate-400" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{exp.recordedBy}</td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>- Rp {exp.amount.toLocaleString('id-ID')}</span>
                        {exp.amount >= 1_000_000 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            ({formatNominalRingkas(exp.amount)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {currentUser.role === 'bendahara' || currentUser.role === 'admin' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Ganti / Edit Rincian Pengeluaran"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Ganti</span>
                          </button>

                          <button
                            onClick={() => openDeleteModal(exp)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Hapus Catatan Pengeluaran Kas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleAdd}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Catat Pengeluaran Baru
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Bisa memasukkan nominal ratusan ribu hingga jutaan rupiah & lampiran nota</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pengeluaran</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setDate(new Date().toISOString().split('T')[0])}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                  >
                    Hari Ini
                  </button>
                </div>
              </div>

              {/* Nominal Input with Million Presets */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Nominal Pengeluaran (Rp)
                  </label>
                  <span className="text-xs font-black text-[#2563EB]">
                    {formatNominalRingkas(amount)}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    min={500}
                    step={1000}
                    value={amount || ''}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="Contoh: 1500000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <p className="text-[11px] text-slate-500 font-semibold">
                  Nilai terformat: <strong className="text-slate-900">Rp {(amount || 0).toLocaleString('id-ID')}</strong>
                </p>

                {/* Preset Chips */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pilihan Cepat Nominal:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {NOMINAL_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setAmount(p.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          amount === p.value
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Increment Chips */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Tambah:
                  </span>
                  {INCREMENT_BUTTONS.map((inc) => (
                    <button
                      key={inc.label}
                      type="button"
                      onClick={() => setAmount((prev) => (prev || 0) + inc.delta)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                    >
                      {inc.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(0)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer ml-auto"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="keperluan_kelas">Keperluan Kelas (Spidol, Modul, FC, Proyektor)</option>
                  <option value="kegiatan">Kegiatan & Acara (17-an, Karyawisata, Study Tour, Lomba)</option>
                  <option value="perlengkapan">Perlengkapan Kebersihan / Dekorasi / Sound System</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Rincian Pengeluaran</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Pembayaran DP Sewa Bus Study Tour Kelas ke Bandung (Rp 2.500.000)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Receipt File / Sample Picker */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Foto Nota / Bukti Struk</label>
                
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors border border-blue-200">
                    <Upload className="w-4 h-4" />
                    <span>Upload Foto Struk Sendiri</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} className="hidden" />
                  </label>
                  
                  {receiptUrl && (
                    <button
                      type="button"
                      onClick={() => setReceiptUrl('')}
                      className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {/* Sample Receipts Quick Selector */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Atau Pilih Contoh Struk Siap Pakai:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SAMPLE_RECEIPTS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setReceiptUrl(s.url)}
                        className={`p-1.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                          receiptUrl === s.url ? 'border-blue-500 bg-blue-50/50 text-[#2563EB] font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <img src={s.url} alt={s.label} className="w-6 h-6 rounded object-cover" />
                        <span className="text-[10px] truncate">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {receiptUrl && (
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2">
                    <img src={receiptUrl} alt="Preview Nota" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">Foto Nota Terlampir</p>
                      <p className="text-[10px] text-slate-400">Akan tersimpan bersama transaksi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SIMPAN PENGELUARAN</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Ganti Rincian Pengeluaran Kas
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Ubah nominal, tanggal, kategori, atau foto nota belanja</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pengeluaran</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Nominal Input with Million Presets */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Nominal Pengeluaran (Rp)
                  </label>
                  <span className="text-xs font-black text-[#2563EB]">
                    {formatNominalRingkas(editAmount)}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    min={500}
                    step={1000}
                    value={editAmount || ''}
                    onChange={(e) => setEditAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="Contoh: 2500000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <p className="text-[11px] text-slate-500 font-semibold">
                  Nilai terformat: <strong className="text-slate-900">Rp {(editAmount || 0).toLocaleString('id-ID')}</strong>
                </p>

                {/* Preset Chips */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pilihan Cepat Nominal:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {NOMINAL_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setEditAmount(p.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          editAmount === p.value
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Increment Chips */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Tambah:
                  </span>
                  {INCREMENT_BUTTONS.map((inc) => (
                    <button
                      key={inc.label}
                      type="button"
                      onClick={() => setEditAmount((prev) => (prev || 0) + inc.delta)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                    >
                      {inc.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditAmount(0)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer ml-auto"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="keperluan_kelas">Keperluan Kelas (Spidol, Modul, FC, Proyektor)</option>
                  <option value="kegiatan">Kegiatan & Acara (17-an, Karyawisata, Study Tour, Lomba)</option>
                  <option value="perlengkapan">Perlengkapan Kebersihan / Dekorasi / Sound System</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Rincian Pengeluaran</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Beli perlengkapan panggung dan tenda acara pentas seni kelas"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Edit Receipt Attachment */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Foto Bukti Nota / Struk</label>
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors border border-blue-200">
                    <Upload className="w-4 h-4" />
                    <span>Ganti Foto Nota</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="hidden" />
                  </label>
                  {editReceiptUrl && (
                    <button
                      type="button"
                      onClick={() => setEditReceiptUrl('')}
                      className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {editReceiptUrl && (
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2">
                    <img src={editReceiptUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    <span className="text-[11px] font-bold text-slate-800">Nota Terlampir</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = editingExpense;
                  setEditingExpense(null);
                  if (target) openDeleteModal(target);
                }}
                className="py-2.5 px-3 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                title="Hapus Pengeluaran Ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SIMPAN PERUBAHAN</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Hapus Catatan Pengeluaran Kas?
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Apakah Anda yakin ingin menghapus data transaksi pengeluaran ini dari kas kelas?
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-bold">Keterangan:</span>
                <span className="font-extrabold text-slate-900 text-right max-w-[220px]">
                  {deletingExpense.description}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Nominal:</span>
                <span className="font-extrabold text-rose-600 text-sm">
                  - Rp {deletingExpense.amount.toLocaleString('id-ID')}
                  {deletingExpense.amount >= 1_000_000 && (
                    <span className="text-[10px] font-bold text-slate-400 block text-right">
                      ({formatNominalRingkas(deletingExpense.amount)})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Tanggal:</span>
                <span className="font-semibold text-slate-700">{deletingExpense.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Kategori:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${categoryLabels[deletingExpense.category].badge}`}>
                  {categoryLabels[deletingExpense.category].label}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Saldo kas kelas akan otomatis bertambah kembali <strong>+ Rp {deletingExpense.amount.toLocaleString('id-ID')}</strong>.
              </span>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="w-1/2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-1/2 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Pengeluaran</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Full View Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Foto Nota & Bukti Struk Pengeluaran
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {viewingReceipt.desc} • {viewingReceipt.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-80 flex items-center justify-center">
              <img
                src={viewingReceipt.url}
                alt="Nota Lengkap"
                className="w-full h-full object-contain max-h-80"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pengeluaran:</span>
                <span className="font-black text-rose-600 text-base">
                  - Rp {viewingReceipt.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
