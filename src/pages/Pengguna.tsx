import React, { useState, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  User as UserIcon, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit2, 
  Key, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { User, UserRole } from '../types';
import Modal from '../components/Modal';

interface PenggunaProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
  onAddAuditLog: (action: string, description: string) => void;
}

export default function PenggunaPage({
  users,
  setUsers,
  currentUser,
  onAddAuditLog
}: PenggunaProps) {
  
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Pelaksana');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formPassword, setFormPassword] = useState('');

  // Rich feedback states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter users based on query
  const filteredUsers = users.filter(u => 
    u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nip.includes(searchQuery) ||
    u.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormNama('');
    setFormNip('');
    setFormJabatan('');
    setFormRole('Pelaksana');
    setFormStatus('Aktif');
    setFormPassword('');
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormNama(user.nama);
    setFormNip(user.nip);
    setFormJabatan(user.jabatan);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPassword(user.password || '123456');
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formNip.trim() || !formJabatan.trim()) {
      setFormError('Mohon isi kolom nama lengkap, NIP, dan nama jabatan.');
      return;
    }

    if (selectedUser) {
      // Editing
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? {
        ...u,
        nama: formNama.trim(),
        nip: formNip.trim(),
        jabatan: formJabatan.trim(),
        role: formRole,
        status: formStatus,
        password: formPassword || u.password || '123456'
      } : u));

      onAddAuditLog(
        'Pembaruan Akun Pegawai',
        `Memperbarui profil pegawai: ${formNama.trim()} (NIP: ${formNip.trim()}) sebagai ${formRole}.`
      );

      triggerToast(`Profil pegawai ${formNama.trim()} berhasil diperbarui!`, 'success');
    } else {
      // Adding new
      const newUser: User = {
        id: `user-${Date.now()}`,
        nama: formNama.trim(),
        nip: formNip.trim(),
        jabatan: formJabatan.trim(),
        role: formRole,
        status: formStatus,
        password: formPassword || '123456',
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?w=100&h=100&fit=crop&crop=faces`
      };

      setUsers(prev => [...prev, newUser]);

      onAddAuditLog(
        'Pendaftaran Akun Pegawai',
        `Mendaftarkan pegawai baru: ${newUser.nama} (NIP: ${newUser.nip}) dengan kewenangan ${newUser.role}.`
      );

      triggerToast(`Pegawai baru ${formNama.trim()} berhasil didaftarkan!`, 'success');
    }

    setIsAddEditModalOpen(false);
    setFormError(null);
  };

  const handleToggleStatus = (id: string, currentStatus: 'Aktif' | 'Nonaktif', nama: string) => {
    if (id === currentUser.id) {
      triggerToast('Anda tidak dapat menonaktifkan akun sendiri yang sedang aktif!', 'error');
      return;
    }

    const nextStatus = currentStatus === 'Aktif' ? 'Nonaktif' : 'Aktif';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    
    onAddAuditLog(
      'Ubah Status Akun',
      `Mengubah status keaktifan akun ${nama} menjadi ${nextStatus}.`
    );

    triggerToast(`Status akun ${nama} diubah menjadi ${nextStatus}.`, 'info');
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      triggerToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }
    setDeleteConfirmUser(user);
  };

  const confirmDeleteUser = () => {
    if (!deleteConfirmUser) return;
    const { id, nama } = deleteConfirmUser;

    setUsers(prev => prev.filter(u => u.id !== id));
    
    onAddAuditLog(
      'Penghapusan Akun Pegawai',
      `Menghapus akun pegawai ${nama} secara permanen dari basis data.`
    );

    triggerToast(`Akun pegawai ${nama} berhasil dihapus permanen.`, 'info');
    setDeleteConfirmUser(null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'Pimpinan': return 'bg-purple-50 text-purple-700 border-purple-150';
      case 'Admin Persuratan': return 'bg-blue-50 text-blue-700 border-blue-150';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Bar & Action Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-150 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="input-search-pegawai"
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
          />
        </div>

        {currentUser.role === 'Super Admin' && (
          <button
            id="btn-trigger-add-pegawai"
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/10 w-full md:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Daftarkan Pegawai Baru</span>
          </button>
        )}
      </div>

      {/* Grid List Pegawai */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150">
                <th className="py-3.5 px-6 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Pegawai / NIP</th>
                <th className="py-3.5 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Jabatan Pokok</th>
                <th className="py-3.5 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Tingkat Hak Akses</th>
                <th className="py-3.5 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Status Akun</th>
                <th className="py-3.5 px-6 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <UserIcon className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">Tidak ditemukan pegawai yang cocok dengan kata kunci.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-all">
                    {/* User Profile Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
                          alt={item.nama}
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100" 
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-[11px] leading-tight flex items-center gap-1.5">
                            {item.nama}
                            {item.id === currentUser.id && (
                              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono uppercase">
                                Anda
                              </span>
                            )}
                          </h4>
                          <span className="text-[9.5px] font-mono text-slate-400 mt-1 block">
                            NIP: {item.nip}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Jabatan */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                      {item.jabatan}
                    </td>

                    {/* Role Access Level */}
                    <td className="py-4 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor(item.role)}`}>
                        <Shield className="h-3 w-3 shrink-0" />
                        {item.role}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-3 text-center">
                      <button
                        id={`btn-toggle-user-status-${item.id}`}
                        onClick={() => handleToggleStatus(item.id, item.status, item.nama)}
                        disabled={currentUser.role !== 'Super Admin'}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          item.status === 'Aktif' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-150 hover:bg-rose-100'
                        } disabled:opacity-85 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
                        title="Klik untuk ubah status"
                      >
                        {item.status === 'Aktif' ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        {currentUser.role === 'Super Admin' && (
                          <button
                            id={`btn-edit-user-${item.id}`}
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                            title="Edit Akun"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        {currentUser.role === 'Super Admin' && (
                          <button
                            id={`btn-delete-user-${item.id}`}
                            onClick={() => handleDeleteUser(item)}
                            disabled={item.id === currentUser.id || item.id === 'user-3'} // Prevent deleting current logged-in user or Kepala Dinas in demo
                            className="p-1.5 text-rose-500/70 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Form */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setFormError(null);
        }}
        title={selectedUser ? 'Edit Profil Pegawai' : 'Tambah Akun Pegawai Baru'}
        size="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nama Lengkap & Gelar</label>
            <input
              id="form-user-nama"
              type="text"
              required
              placeholder="Contoh: Muhammad Yusuf, S.IP., M.Si."
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">NIP Pegawai Resmi</label>
              <input
                id="form-user-nip"
                type="text"
                required
                placeholder="Contoh: 199403152019011002"
                value={formNip}
                onChange={(e) => setFormNip(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nama Jabatan</label>
              <input
                id="form-user-jabatan"
                type="text"
                required
                placeholder="Contoh: Analis Organisasi Dinas"
                value={formJabatan}
                onChange={(e) => setFormJabatan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tingkat Hak Akses</label>
              <select
                id="form-user-role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="Pelaksana">Pelaksana (Menerima Disposisi)</option>
                <option value="Pimpinan">Pimpinan (Menerbitkan Disposisi)</option>
                <option value="Admin Persuratan">Admin Persuratan (Registrasi Surat)</option>
                <option value="Super Admin">Super Admin (Kendali Penuh)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Keaktifan Akun</label>
              <select
                id="form-user-status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif / Blokir</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Password Masuk Akun</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="form-user-password"
                type="text"
                placeholder={selectedUser ? "Kosongkan jika password tidak diubah (Default: 123456)" : "Ketik password login baru (Default: 123456)"}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              id="btn-cancel-user-form"
              type="button"
              onClick={() => {
                setIsAddEditModalOpen(false);
                setFormError(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-user-form"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              {selectedUser ? 'Simpan Pembaruan' : 'Simpan Pegawai Baru'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Custom Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmUser !== null}
        onClose={() => setDeleteConfirmUser(null)}
        title="Konfirmasi Hapus Pengawai"
        size="sm"
      >
        <div className="text-left space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus akun pegawai <strong className="text-slate-800">{deleteConfirmUser?.nama}</strong> ({deleteConfirmUser?.jabatan})? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              id="btn-cancel-delete-usr"
              onClick={() => setDeleteConfirmUser(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-delete-usr"
              onClick={confirmDeleteUser}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10"
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Action Feedback: Toast Notification */}
      {toast && (
        <div 
          id="toast-notification-usr"
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
            id="toast-close-btn-usr"
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
