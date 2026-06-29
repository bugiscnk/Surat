import { useState, Dispatch, SetStateAction, FormEvent } from 'react';
import { Plus, Search, User, Shield, CheckCircle, XCircle, Trash2, Edit2, Key, Info } from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import Modal from '../components/Modal';

interface PenggunaProps {
  users: UserType[];
  setUsers: Dispatch<SetStateAction<UserType[]>>;
}

export default function PenggunaPage({ users, setUsers }: PenggunaProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Form Fields State
  const [formNama, setFormNama] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Pelaksana');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

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
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (user: UserType) => {
    setSelectedUser(user);
    setFormNama(user.nama);
    setFormNip(user.nip);
    setFormJabatan(user.jabatan);
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    if (!formNama || !formNip || !formJabatan) {
      alert('Mohon isi kolom nama lengkap, NIP, dan nama jabatan.');
      return;
    }

    if (selectedUser) {
      // Editing
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? {
        ...u,
        nama: formNama,
        nip: formNip,
        jabatan: formJabatan,
        role: formRole,
        status: formStatus
      } : u));
    } else {
      // Adding new
      const newUser: UserType = {
        id: `user-${Date.now()}`,
        nama: formNama,
        nip: formNip,
        jabatan: formJabatan,
        role: formRole,
        status: formStatus,
        foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop'
      };
      setUsers(prev => [...prev, newUser]);
    }

    setIsAddEditModalOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: 'Aktif' | 'Nonaktif') => {
    const nextStatus = currentStatus === 'Aktif' ? 'Nonaktif' : 'Aktif';
    if (confirm(`Apakah Anda yakin ingin merubah status pegawai ini menjadi ${nextStatus}?`)) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    }
  };

  const handleDeleteUser = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun pegawai ${nama}?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'Pimpinan': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Admin Persuratan': return 'bg-teal-50 text-teal-700 border-teal-150';
      default: return 'bg-blue-50 text-blue-700 border-blue-150';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      
      {/* Search and Action header */}
      <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <input
            id="search-input-pengguna"
            type="text"
            placeholder="Cari pegawai, NIP, jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2 pl-9 pr-4 rounded-xl text-xs focus:border-emerald-500/50 focus:outline-none transition-colors font-semibold"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <button
          id="btn-add-user-modal"
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer transition-all shrink-0 ml-auto sm:ml-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Akun Pegawai</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Pegawai</th>
                <th className="py-3 px-3">NIP Registrasi</th>
                <th className="py-3 px-3">Jabatan</th>
                <th className="py-3 px-3">Role Hak Akses</th>
                <th className="py-3 px-3 text-center font-bold">Status</th>
                <th className="py-3 px-3 text-right font-bold">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-semibold">
                    Pegawai tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Person */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.foto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop'} 
                          alt={item.nama} 
                          className="h-9 w-9 rounded-full object-cover border border-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-800 font-sans leading-none">{item.nama}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* NIP */}
                    <td className="py-4 px-3 font-mono text-emerald-600 font-bold whitespace-nowrap">{item.nip}</td>

                    {/* Jabatan */}
                    <td className="py-4 px-3 font-sans text-slate-600 truncate max-w-[160px]" title={item.jabatan}>{item.jabatan}</td>

                    {/* Access Role */}
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${getRoleBadgeColor(item.role)}`}>
                        {item.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 text-center">
                      <button
                        id={`btn-toggle-user-status-${item.id}`}
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          item.status === 'Aktif' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-150 hover:bg-rose-100'
                        }`}
                        title="Klik untuk ubah status aktif"
                      >
                        {item.status === 'Aktif' ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-edit-user-${item.id}`}
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit Pegawai"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`btn-delete-user-${item.id}`}
                          onClick={() => handleDeleteUser(item.id, item.nama)}
                          disabled={item.id === 'user-1' || item.id === 'user-3'} // Prevent deleting super admin or director in demo
                          className="p-1.5 text-rose-500/70 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedUser ? 'Edit Profil Pegawai' : 'Tambah Akun Pegawai Baru'}
        size="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
          
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nama Lengkap & Gelar</label>
            <input
              id="form-user-nama"
              type="text"
              placeholder="Contoh: Drs. Wahyu Hidayat, M.Si."
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nomor Induk Pegawai (NIP)</label>
            <input
              id="form-user-nip"
              type="text"
              placeholder="Contoh: 198501102008..."
              value={formNip}
              onChange={(e) => setFormNip(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nama Jabatan Struktural / Fungsional</label>
            <input
              id="form-user-jabatan"
              type="text"
              placeholder="Contoh: Kepala Subbagian Umum & Kepegawaian"
              value={formJabatan}
              onChange={(e) => setFormJabatan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Role Hak Akses</label>
              <select
                id="form-user-role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white font-bold"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin Persuratan">Admin Persuratan</option>
                <option value="Pimpinan">Pimpinan</option>
                <option value="Pelaksana">Pelaksana</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Status Akun</label>
              <select
                id="form-user-status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white font-bold"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Suspended</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              id="btn-cancel-user"
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-submit-user"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              <span>{selectedUser ? 'Simpan Perubahan' : 'Buat Akun Resmi'}</span>
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
