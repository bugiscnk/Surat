import React, { useState } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  Building, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Info,
  Database,
  Save
} from 'lucide-react';
import { User, SuratMasuk, SuratKeluar, Disposisi } from '../types';
import Modal from '../components/Modal';

interface PengaturanProps {
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  suratMasuk: SuratMasuk[];
  setSuratMasuk: React.Dispatch<React.SetStateAction<SuratMasuk[]>>;
  suratKeluar: SuratKeluar[];
  setSuratKeluar: React.Dispatch<React.SetStateAction<SuratKeluar[]>>;
  disposisi: Disposisi[];
  setDisposisi: React.Dispatch<React.SetStateAction<Disposisi[]>>;
  onAddAuditLog: (action: string, description: string) => void;
  onRestoreDefaults: () => void;
}

export default function PengaturanPage({
  currentUser,
  users,
  setUsers,
  suratMasuk,
  setSuratMasuk,
  suratKeluar,
  setSuratKeluar,
  disposisi,
  setDisposisi,
  onAddAuditLog,
  onRestoreDefaults
}: PengaturanProps) {

  // Department settings state (mocked local save)
  const [instansiNama, setInstansiNama] = useState('Dinas Perpustakaan & Kearsipan Daerah');
  const [instansiAlamat, setInstansiAlamat] = useState('Jl. Jenderal Sudirman No. 142, Kota Makassar');
  const [instansiEmail, setInstansiEmail] = useState('dispusip@prov.go.id');
  const [instansiTelepon, setInstansiTelepon] = useState('(0411) 852964');

  // Confirmation Modals states
  const [showConfirmDeleteUsers, setShowConfirmDeleteUsers] = useState(false);
  const [showConfirmDeleteDocs, setShowConfirmDeleteDocs] = useState(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Save Department Settings Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAuditLog(
      'Ubah Profil Instansi',
      `Memperbarui profil instansi menjadi: ${instansiNama}`
    );
    triggerToast('Konfigurasi profil instansi berhasil disimpan!', 'success');
  };

  // 2. Action: HAPUS SEMUA USER (except active user)
  const handleClearAllUsers = () => {
    // Keep only the current logged-in user to prevent lockouts
    const remainingUsers = [currentUser];
    setUsers(remainingUsers);
    
    onAddAuditLog(
      'Hapus Masal Akun Pegawai',
      `Mengeksekusi pembersihan masal akun pegawai. Seluruh akun kecuali ${currentUser.nama} berhasil dihapus.`
    );

    triggerToast('Seluruh data pegawai berhasil dihapus permanen!', 'success');
    setShowConfirmDeleteUsers(false);
  };

  // 3. Action: HAPUS SEMUA DOKUMEN (Incoming, Outgoing, Dispositions)
  const handleClearAllDocuments = () => {
    setSuratMasuk([]);
    setSuratKeluar([]);
    setDisposisi([]);

    onAddAuditLog(
      'Hapus Masal Dokumen Persuratan',
      'Mengeksekusi pembersihan masal dokumen surat masuk, surat keluar, dan lembar disposisi secara permanen.'
    );

    triggerToast('Seluruh data surat masuk, surat keluar, dan disposisi berhasil dikosongkan!', 'success');
    setShowConfirmDeleteDocs(false);
  };

  // 4. Action: Restore Default Data
  const handleRestoreDefaultDemo = () => {
    onRestoreDefaults();
    
    onAddAuditLog(
      'Pemulihan Data Bawaan',
      'Memulihkan seluruh database ke pengaturan awal / demo instansi.'
    );

    triggerToast('Database demo berhasil dipulihkan secara penuh!', 'success');
    setShowConfirmRestore(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Intro info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex gap-3.5 items-start">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-800">Area Sensitif Kendali Administratif</h4>
          <p className="text-[10px] text-amber-700 leading-relaxed">
            Halaman ini memberikan akses penuh untuk mereset data operasional kantor. Seluruh tindakan pembersihan akan dicatat dalam Audit Trail demi keamanan data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3.5 flex items-center gap-2">
            <Building className="h-4.5 w-4.5 text-emerald-600" />
            <h3 className="text-xs font-black text-slate-800">Identitas Instansi Pemerintah</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Nama Dinas / Satker</label>
              <input
                id="input-instansi-nama"
                type="text"
                required
                value={instansiNama}
                onChange={(e) => setInstansiNama(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Alamat Kantor Resmi</label>
              <input
                id="input-instansi-alamat"
                type="text"
                required
                value={instansiAlamat}
                onChange={(e) => setInstansiAlamat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Email Instansi</label>
                <input
                  id="input-instansi-email"
                  type="email"
                  required
                  value={instansiEmail}
                  onChange={(e) => setInstansiEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Nomor Telepon / Fax</label>
                <input
                  id="input-instansi-telp"
                  type="text"
                  required
                  value={instansiTelepon}
                  onChange={(e) => setInstansiTelepon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                id="btn-save-instansi-profile"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/10"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Identitas</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Reset Actions & Clear Database (requested features!) */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3.5 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-rose-600" />
            <h3 className="text-xs font-black text-slate-800">Manajemen Database & Reset</h3>
          </div>

          <div className="space-y-4">
            
            {/* Delete All Users Section */}
            <div className="p-4 bg-rose-50/20 border border-rose-100 rounded-2xl space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-rose-600 uppercase tracking-wider font-extrabold">Data Pegawai</span>
                <h4 className="text-xs font-bold text-slate-800">Kosongkan Semua User</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Menghapus seluruh akun pegawai yang terdaftar di sistem, menyisakan hanya akun Anda saat ini untuk keamanan akses.
                </p>
              </div>
              <button
                id="btn-delete-all-users"
                onClick={() => setShowConfirmDeleteUsers(true)}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>HAPUS SEMUA USER</span>
              </button>
            </div>

            {/* Delete All Documents Section */}
            <div className="p-4 bg-rose-50/20 border border-rose-100 rounded-2xl space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-rose-600 uppercase tracking-wider font-extrabold">Data Dokumen & Disposisi</span>
                <h4 className="text-xs font-bold text-slate-800">Kosongkan Semua Dokumen</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Menghapus seluruh berkas surat masuk, surat keluar, draf naskah dinas, serta riwayat disposisi instruksi pelaksana.
                </p>
              </div>
              <button
                id="btn-delete-all-documents"
                onClick={() => setShowConfirmDeleteDocs(true)}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>HAPUS SEMUA DOKUMEN</span>
              </button>
            </div>

            {/* Restore Default Data (Super Convenient for testing!) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold">Alat Bantu Pengujian</span>
                <h4 className="text-xs font-bold text-slate-800">Pulihkan Data Bawaan (Demo)</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Mengembalikan data surat masuk, surat keluar, disposisi, dan pengguna bawaan demo instansi secara instan.
                </p>
              </div>
              <button
                id="btn-restore-defaults"
                onClick={() => setShowConfirmRestore(true)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Pulihkan Database Demo</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Confirmation Modal: Delete Users */}
      <Modal
        isOpen={showConfirmDeleteUsers}
        onClose={() => setShowConfirmDeleteUsers(false)}
        title="KONFIRMASI: Hapus Semua User?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong className="text-rose-600">SELURUH AKUN USER</strong> pegawai yang terdaftar di instansi? 
          </p>
          <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-[10px] text-rose-700 font-semibold">
            Tindakan ini menyisakan hanya profil Anda saat ini ({currentUser.nama}) untuk menjamin Anda tidak terkunci keluar dari aplikasi.
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="btn-cancel-clear-users"
              onClick={() => setShowConfirmDeleteUsers(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-execute-clear-users"
              onClick={handleClearAllUsers}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10"
            >
              Ya, Hapus Semua User
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Delete Documents */}
      <Modal
        isOpen={showConfirmDeleteDocs}
        onClose={() => setShowConfirmDeleteDocs(false)}
        title="KONFIRMASI: Hapus Semua Dokumen?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong className="text-rose-600">SELURUH DOKUMEN & LEMBAR DISPOSISI</strong> secara permanen?
          </p>
          <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-[10px] text-rose-700 font-semibold">
            Semua catatan Surat Masuk, Surat Keluar, dan penugasan lembar disposisi akan di-wipe habis dari database.
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="btn-cancel-clear-docs"
              onClick={() => setShowConfirmDeleteDocs(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-execute-clear-docs"
              onClick={handleClearAllDocuments}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10"
            >
              Ya, Hapus Semua Dokumen
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Restore defaults */}
      <Modal
        isOpen={showConfirmRestore}
        onClose={() => setShowConfirmRestore(false)}
        title="KONFIRMASI: Pulihkan Database Demo?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Tindakan ini akan menimpa seluruh kondisi database saat ini dengan susunan <strong className="text-emerald-600">DATA SET BAWAAN DEMO</strong> instansi yang lengkap. Lanjutkan?
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="btn-cancel-restore"
              onClick={() => setShowConfirmRestore(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-execute-restore"
              onClick={handleRestoreDefaultDemo}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              Ya, Pulihkan Demo
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Action Feedback: Toast Notification */}
      {toast && (
        <div 
          id="toast-notification-set"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : toast.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
          ) : (
            <Info className="h-4.5 w-4.5 text-blue-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button 
            id="toast-close-btn-set"
            onClick={() => setToast(null)} 
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
