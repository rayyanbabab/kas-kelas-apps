import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Camera, Image as ImageIcon, Check, Sparkles, RefreshCw, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  // Curated student & professional avatars
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
  // Vector/Illustration avatars
  'https://api.dicebear.com/7.x/bottts/svg?seed=kasku1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=kasku2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=aneka',
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser } = useApp();
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentUser.avatar);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar terlalu besar (Maksimal 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & scale to square 300x300 canvas for fast performance
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedPhoto(dataUrl);
        } else {
          setSelectedPhoto(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    setErrorMsg('');
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMsg('Format file tidak didukung. Harap masukkan file gambar.');
    }
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedPhoto(customUrlInput.trim());
    setCustomUrlInput('');
  };

  const handleSave = () => {
    updateUser(currentUser.id, { avatar: selectedPhoto });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;
    setSelectedPhoto(defaultAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center space-x-2">
              <Camera className="w-5 h-5 text-[#2563EB]" />
              <span>Ganti Foto Profil</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {currentUser.name} • Role: {currentUser.role.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Photo Preview Circle */}
        <div className="py-6 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 my-5 space-y-3">
          <div className="relative group">
            <img
              src={selectedPhoto}
              alt={currentUser.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-[#2563EB]/20"
              onError={(e) => {
                // Fallback image on broken URL
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
              title="Unggah Foto dari Komputer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <p className="font-black text-slate-900 text-sm">{currentUser.name}</p>
            <p className="text-xs text-slate-500 font-medium">Pratinjau Foto Profil Aktif</p>
          </div>
        </div>

        {/* Method Tabs */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Foto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preset'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilih Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link URL</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-xs text-rose-700 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: Upload from Device */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#2563EB] bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-[#2563EB] hover:bg-slate-50'
              }`}
            >
              <div className="p-3 bg-blue-50 text-[#2563EB] rounded-2xl inline-block mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Klik atau Seret Foto Anda ke Sini
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Mendukung format JPG, PNG, WEBP (Maksimal 5MB)
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Presets */}
        {activeTab === 'preset' && (
          <div className="space-y-3">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Pilih dari Koleksi Avatar Rekomendasi:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-52 overflow-y-auto p-1">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhoto(url)}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                    selectedPhoto === url
                      ? 'border-[#2563EB] ring-2 ring-blue-500 scale-105 shadow-md'
                      : 'border-slate-200 hover:border-slate-400 hover:scale-105'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  {selectedPhoto === url && (
                    <div className="absolute inset-0 bg-[#2563EB]/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Web URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Tempel Tautan URL Gambar:
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="https://contoh.com/foto-saya.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Terapkan
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Pastikan tautan dapat diakses secara publik (HTTPS).
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100 gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSuccess}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md shadow-blue-200 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>TERSAMPAN!</span>
                </>
              ) : (
                <>
                  <span>SIMPAN FOTO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
