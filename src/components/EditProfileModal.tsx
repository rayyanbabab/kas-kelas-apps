import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import {
  X, Mail, Phone, Lock, Camera, Upload, Sparkles,
  Link as LinkIcon, Check, AlertCircle, Eye, EyeOff,
  RefreshCw, ChevronRight, UserCircle2,
} from 'lucide-react';

interface EditProfileModalProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'info' | 'photo' | 'password';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces',
  'https://api.dicebear.com/7.x/bottts/svg?seed=kasku1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=kasku2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=aneka',
];

const roleMeta: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  bendahara: { label: 'Bendahara', color: 'bg-blue-100 text-blue-700' },
  anggota: { label: 'Anggota', color: 'bg-emerald-100 text-emerald-700' },
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose }) => {
  const { currentUser, updateUser } = useApp();
  const targetUser = user || currentUser;
  const isSelf = targetUser.id === currentUser.id;
  const [tab, setTab] = useState<Tab>('info');

  // Info tab state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState('');

  // Password tab state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState('');

  // Photo tab state
  const [photoTab, setPhotoTab] = useState<'upload' | 'preset' | 'url'>('preset');
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && targetUser) {
      setName(targetUser.name || '');
      setEmail(targetUser.email || '');
      setPhone(targetUser.phone || '');
      setSelectedPhoto(targetUser.avatar || '');
      setInfoSaved(false);
      setPassSaved(false);
      setPhotoSaved(false);
      setInfoError('');
      setPassError('');
      setPhotoError('');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  // ── Handlers ──
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setInfoError('Nama tidak boleh kosong.'); return; }
    if (name.trim().length < 2) { setInfoError('Nama minimal 2 karakter.'); return; }
    setInfoError('');
    updateUser(targetUser.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass) { setPassError('Password baru tidak boleh kosong.'); return; }
    if (newPass.length < 6) { setPassError('Password minimal 6 karakter.'); return; }
    if (newPass !== confirmPass) { setPassError('Konfirmasi password tidak cocok.'); return; }
    if (isSelf && targetUser.password && currentPass !== targetUser.password) {
      setPassError('Password saat ini salah.'); return;
    }
    setPassError('');
    updateUser(targetUser.id, { password: newPass });
    setPassSaved(true);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setTimeout(() => setPassSaved(false), 2000);
  };

  const handleSavePhoto = () => {
    if (!selectedPhoto) { setPhotoError('Pilih foto terlebih dahulu.'); return; }
    setPhotoError('');
    updateUser(targetUser.id, { avatar: selectedPhoto });
    setPhotoSaved(true);
    setTimeout(() => { setPhotoSaved(false); }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('Harap pilih file gambar.'); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Ukuran maksimal 5MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300; canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const min = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, 300, 300);
          setSelectedPhoto(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else { setPhotoError('Format tidak didukung.'); }
  };

  // ── Tab config ──
  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'info', label: 'Informasi', icon: UserCircle2 },
    { id: 'photo', label: 'Foto Profil', icon: Camera },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  const rm = roleMeta[targetUser.role] || roleMeta['anggota'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-slate-100">
          <div className="relative shrink-0">
            <img
              src={selectedPhoto || targetUser.avatar}
              alt={targetUser.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/20 border-2 border-white shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name)}&background=3b82f6&color=fff`; }}
            />
            <button
              onClick={() => { setTab('photo'); }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition-colors"
              title="Ganti foto"
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate">{targetUser.name}</h2>
            <p className="text-xs text-slate-500 truncate">{targetUser.email || 'Belum ada email'}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${rm.color}`}>
              {rm.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
                tab === id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Info Tab ── */}
          {tab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <Field
                label="Nama Lengkap"
                icon={UserCircle2}
                required
                error={infoError}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setInfoError(''); }}
                  placeholder="Nama lengkap Anda"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    infoError ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </Field>

              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </Field>

              <Field label="Nomor HP" icon={Phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </Field>

              {/* Read-only info */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Info Akun</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Role</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${rm.color}`}>{rm.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">ID Anggota</span>
                  <span className="font-mono text-slate-700 text-[11px]">{currentUser.memberQrCode}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Kelas</span>
                  <span className="text-slate-700 font-medium truncate max-w-[160px]">{currentUser.className}</span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  infoSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'
                }`}
              >
                {infoSaved ? <><Check className="w-4 h-4" /> Tersimpan!</> : 'Simpan Informasi'}
              </button>
            </form>
          )}

          {/* ── Photo Tab ── */}
          {tab === 'photo' && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={selectedPhoto}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20 border-2 border-white shadow-md shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3b82f6&color=fff`; }}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">Pratinjau foto profil</p>
                </div>
              </div>

              {/* Method tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {([['preset', Sparkles, 'Avatar'], ['upload', Upload, 'Upload'], ['url', LinkIcon, 'URL']] as const).map(([id, Icon, label]) => (
                  <button
                    key={id}
                    onClick={() => setPhotoTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                      photoTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {photoError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {photoError}
                </div>
              )}

              {photoTab === 'preset' && (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPhoto(url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedPhoto === url
                          ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                          : 'border-slate-200 hover:border-slate-400 hover:scale-[1.03]'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {selectedPhoto === url && (
                        <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[2.5]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {photoTab === 'upload' && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                  >
                    <Upload className={`w-7 h-7 mx-auto mb-2 ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-medium text-slate-700">Klik atau seret foto ke sini</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP (maks. 5MB)</p>
                  </div>
                </>
              )}

              {photoTab === 'url' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Tempel URL gambar:</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      onClick={() => { if (urlInput.trim()) { setSelectedPhoto(urlInput.trim()); setUrlInput(''); } }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSelectedPhoto(`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3b82f6&color=fff&size=150`)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset default
                </button>
                <button
                  onClick={handleSavePhoto}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    photoSaved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'
                  }`}
                >
                  {photoSaved ? <><Check className="w-4 h-4" /> Tersimpan!</> : 'Simpan Foto'}
                </button>
              </div>
            </div>
          )}

          {/* ── Password Tab ── */}
          {tab === 'password' && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200/70 rounded-xl">
                <p className="text-xs text-amber-700 font-medium">
                  Buat password minimal 6 karakter. Password digunakan saat login ke akun ini.
                </p>
              </div>

              {currentUser.password && (
                <Field label="Password Saat Ini" icon={Lock}>
                  <PasswordInput
                    value={currentPass}
                    onChange={setCurrentPass}
                    show={showCurrentPass}
                    onToggle={() => setShowCurrentPass((v) => !v)}
                    placeholder="Password saat ini"
                  />
                </Field>
              )}

              <Field label="Password Baru" icon={Lock}>
                <PasswordInput
                  value={newPass}
                  onChange={setNewPass}
                  show={showNewPass}
                  onToggle={() => setShowNewPass((v) => !v)}
                  placeholder="Password baru (min. 6 karakter)"
                />
              </Field>

              <Field label="Konfirmasi Password Baru" icon={Lock}>
                <PasswordInput
                  value={confirmPass}
                  onChange={setConfirmPass}
                  show={showNewPass}
                  onToggle={() => setShowNewPass((v) => !v)}
                  placeholder="Ulangi password baru"
                />
              </Field>

              {passError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {passError}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  passSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'
                }`}
              >
                {passSaved ? <><Check className="w-4 h-4" /> Password Diperbarui!</> : 'Simpan Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helper sub-components ──
const Field: React.FC<{
  label: string;
  icon: React.FC<{ className?: string }>;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, icon: Icon, required, error, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="w-3.5 h-3.5" /> {error}
      </p>
    )}
  </div>
);

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}> = ({ value, onChange, show, onToggle, placeholder }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
);
