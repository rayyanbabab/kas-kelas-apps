import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, QrCode, ShieldCheck, Download, Camera } from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';

interface MemberQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberQrModal: React.FC<MemberQrModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, classGroup } = useApp();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-slate-100 text-center space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">ID KARTU DIGITAL KAS</span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Digital Card Preview */}
          <div className="bg-[#2563EB] text-white p-6 rounded-3xl shadow-xl space-y-4 border border-white/20 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-black text-sm tracking-tight uppercase">Class Fund</p>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">{classGroup.name}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider">
                VERIFIED
              </span>
            </div>

            {/* Profile Avatar & Member Info */}
            <div className="flex items-center justify-center space-x-3 bg-white/10 p-2.5 rounded-2xl border border-white/15">
              <div className="relative group">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute -bottom-1 -right-1 p-1 bg-[#1E293B] text-white rounded-full border border-white"
                  title="Ganti Foto"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="text-left">
                <p className="font-black text-sm text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">
                  Role: {currentUser.role}
                </p>
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="text-[10px] text-amber-200 hover:text-white underline font-bold cursor-pointer"
                >
                  Ubah Foto
                </button>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentUser.memberQrCode}`}
                alt="QR Code Member"
                className="w-32 h-32 mx-auto"
              />
            </div>

            <div>
              <p className="font-mono text-xs text-blue-100 font-bold uppercase tracking-widest">{currentUser.memberQrCode}</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Tunjukkan QR Code ini kepada Bendahara saat setor tunai untuk pencatatan instan.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#1E293B] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md cursor-pointer"
          >
            TUTUP
          </button>
        </div>
      </div>

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </>
  );
};
