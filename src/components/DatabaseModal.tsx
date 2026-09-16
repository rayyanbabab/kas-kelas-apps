import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Server, ExternalLink, X, Copy, Check } from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const { dbStatus, isLoading, refreshData, resetDemoData } = useApp();
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText('DATABASE_URL="postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async () => {
    if (window.confirm('Apakah Anda yakin ingin me-reset data di Neon Database ke data standar awal?')) {
      setIsResetting(true);
      await resetDemoData();
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Status Database Neon</h2>
              <p className="text-xs text-emerald-100 font-medium">Serverless PostgreSQL (neon.tech)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              dbStatus.connected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {dbStatus.connected ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {dbStatus.connected ? 'Terhubung ke Neon PostgreSQL' : 'Mode Fallback / Belum Terhubung'}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    dbStatus.connected
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {dbStatus.connected ? 'ONLINE CLOUD' : 'LOCAL FALLBACK'}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                {dbStatus.message}
              </p>
              {dbStatus.version && (
                <p className="text-[11px] font-mono mt-1 text-emerald-700">
                  Engine: {dbStatus.version}
                </p>
              )}
            </div>
          </div>

          {/* Setup Guide if not connected */}
          {!dbStatus.connected && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cara Menghubungkan Neon DB:</span>
                </h4>
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <span>Buka neon.tech</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
                <li>Buat database baru di <b>neon.tech</b> (Gratis).</li>
                <li>Salin <b>Connection String</b> (Postgres URL).</li>
                <li>Buka file <b>.env</b> di root folder proyek ini.</li>
                <li>Tempelkan ke variabel <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded font-mono text-[11px]">DATABASE_URL</code>.</li>
              </ol>

              <div className="mt-2 bg-slate-900 text-slate-200 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between">
                <span className="truncate pr-2">DATABASE_URL=&quot;postgresql://...&quot;</span>
                <button
                  onClick={handleCopyEnv}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                  title="Salin Template"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={() => refreshData()}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Menyinkronkan...' : 'Cek Koneksi / Refresh'}</span>
            </button>

            {dbStatus.connected && (
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 font-bold text-xs transition-colors cursor-pointer"
              >
                {isResetting ? 'Mereset...' : 'Reset & Seed Ulang'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
