import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LogIn, UserPlus, Eye, EyeOff, Wallet,
  ShieldCheck, Users, TrendingUp, Loader2, AlertCircle,
} from 'lucide-react';

type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const { login, register } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const switchMode = (m: AuthMode) => { setMode(m); setError(''); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) { setError('Email atau nama wajib diisi.'); return; }
    setIsLoading(true); setError('');
    try {
      const r = await login(identifier.trim(), password.trim() || undefined);
      if (!r.success) setError(r.message || 'Login gagal. Periksa kembali data Anda.');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan, coba lagi.');
    } finally { setIsLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) { setError('Nama lengkap wajib diisi.'); return; }
    setIsLoading(true); setError('');
    try {
      const r = await register({
        name: regName.trim(),
        email: regEmail.trim() || undefined,
        phone: regPhone.trim() || undefined,
        password: regPassword.trim() || undefined,
        role: 'anggota',
      });
      if (!r.success) setError(r.message || 'Registrasi gagal.');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan, coba lagi.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-slate-900 px-10 py-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white leading-tight">KasKu Digital</p>
              <p className="text-xs text-slate-500">Sistem Kas Kelas Modern</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Kelola Kas Kelas<br />
            <span className="text-blue-400">Lebih Mudah</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-10">
            Platform terintegrasi untuk mengelola iuran, pembayaran, pengeluaran, dan laporan keuangan kelas secara transparan.
          </p>

          <div className="space-y-5">
            {[
              { icon: ShieldCheck, title: 'Aman & Terpercaya', desc: 'Data tersimpan di cloud Neon PostgreSQL' },
              { icon: Users, title: 'Multi-Role', desc: 'Admin, Bendahara, dan Anggota' },
              { icon: TrendingUp, title: 'Laporan Real-time', desc: 'Pantau keuangan kelas kapan saja' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 bg-white/[0.06] rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.06]">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">© 2026 KasKu Digital. All rights reserved.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow shadow-blue-600/30">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">KasKu Digital</p>
              <p className="text-xs text-slate-500">Sistem Kas Kelas Modern</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100">
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                    mode === m
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {m === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900 mb-0.5">Selamat Datang</p>
                    <p className="text-xs text-slate-500 mb-5">Masukkan email atau nama untuk masuk.</p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email / Nama / No. HP</label>
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="admin@kasku.id"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                          autoComplete="username"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password (opsional)"
                            className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 mt-2"
                  >
                    {isLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                      : <><LogIn className="w-4 h-4" /> Masuk</>}
                  </button>

                  <p className="text-center text-[11px] text-slate-400 pt-1">
                    Demo: <span className="font-mono text-slate-600">admin@kasku.id</span> / <span className="font-mono text-slate-600">admin123</span>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900 mb-0.5">Buat Akun Baru</p>
                    <p className="text-xs text-slate-500 mb-5">Daftar sebagai anggota kelas.</p>

                    <div className="space-y-3">
                      {[
                        { label: 'Nama Lengkap', value: regName, setter: setRegName, type: 'text', placeholder: 'Nama lengkap Anda', required: true },
                        { label: 'Email', value: regEmail, setter: setRegEmail, type: 'email', placeholder: 'email@domain.com', required: false },
                        { label: 'No. HP', value: regPhone, setter: setRegPhone, type: 'tel', placeholder: '08xxxxxxxxxx', required: false },
                      ].map(({ label, value, setter, type, placeholder, required }) => (
                        <div key={label}>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            {label} {required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type={type}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            placeholder={placeholder}
                            required={required}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Buat password (opsional)"
                            className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 mt-2"
                  >
                    {isLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan...</>
                      : <><UserPlus className="w-4 h-4" /> Daftar Sekarang</>}
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    Akun baru otomatis sebagai <span className="text-blue-600 font-medium">Anggota</span>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
