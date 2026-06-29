import React, { useState, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Inbox, 
  Trash2, 
  CheckCircle, 
  ArrowRight, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import { SuratMasuk, SifatSurat, KlasifikasiSurat, UserRole } from '../types';
import Modal from '../components/Modal';

interface SuratMasukProps {
  suratMasuk: SuratMasuk[];
  setSuratMasuk: React.Dispatch<React.SetStateAction<SuratMasuk[]>>;
  currentRole: UserRole;
  onAddAuditLog: (action: string, description: string) => void;
  onTriggerNotification: (userId: string, title: string, message: string) => void;
}

export default function SuratMasukPage({
  suratMasuk,
  setSuratMasuk,
  currentRole,
  onAddAuditLog,
  onTriggerNotification
}: SuratMasukProps) {
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSifat, setFilterSifat] = useState<string>('Semua');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState<string>('Semua');

  // Selected letter for viewing details
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

  // New letter form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNoSurat, setNewNoSurat] = useState('');
  const [newTglSurat, setNewTglSurat] = useState('');
  const [newTglTerima, setNewTglTerima] = useState('');
  const [newAsal, setNewAsal] = useState('');
  const [newPerihal, setNewPerihal] = useState('');
  const [newSifat, setNewSifat] = useState<SifatSurat>('Biasa');
  const [newKlasifikasi, setNewKlasifikasi] = useState<KlasifikasiSurat>('Umum');
  const [newLampiranName, setNewLampiranName] = useState('');

  // Floating notifications & modal feedback states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmLetter, setDeleteConfirmLetter] = useState<SuratMasuk | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Determine permissions
  const canAddLetter = currentRole === 'Super Admin' || currentRole === 'Admin Persuratan';

  // Filtering data
  const filteredData = suratMasuk.filter((item) => {
    const matchesSearch = 
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asalSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSifat = filterSifat === 'Semua' || item.sifat === filterSifat;
    const matchesKlasifikasi = filterKlasifikasi === 'Semua' || item.klasifikasi === filterKlasifikasi;

    return matchesSearch && matchesSifat && matchesKlasifikasi;
  });

  const selectedLetter = suratMasuk.find(l => l.id === selectedLetterId);

  const handleAddLetter = (e: FormEvent) => {
    e.preventDefault();
    if (!newNoSurat.trim() || !newAsal.trim() || !newPerihal.trim()) {
      setFormError('Mohon isi kolom nomor surat resmi, asal surat, dan perihal.');
      return;
    }

    const newLetter: SuratMasuk = {
      id: `sm-${Date.now()}`,
      nomorSurat: newNoSurat.trim(),
      tanggalSurat: newTglSurat || new Date().toISOString().split('T')[0],
      tanggalTerima: newTglTerima || new Date().toISOString().split('T')[0],
      asalSurat: newAsal.trim(),
      perihal: newPerihal.trim(),
      sifat: newSifat,
      klasifikasi: newKlasifikasi,
      status: 'Draft',
      lampiran: newLampiranName.trim() || undefined,
      fileUrl: newLampiranName.trim() ? `${newLampiranName.trim().replace(/\s+/g, '_')}.pdf` : undefined
    };

    setSuratMasuk(prev => [...prev, newLetter]);
    setIsAddModalOpen(false);
    setFormError(null);

    // Add Audit Log
    onAddAuditLog(
      'Registrasi Surat Masuk',
      `Mendaftarkan surat masuk baru nomor ${newLetter.nomorSurat} dari ${newLetter.asalSurat}.`
    );

    triggerToast(`Surat masuk nomor ${newLetter.nomorSurat} berhasil didaftarkan!`, 'success');

    // Reset Form
    setNewNoSurat('');
    setNewTglSurat('');
    setNewTglTerima('');
    setNewAsal('');
    setNewPerihal('');
    setNewSifat('Biasa');
    setNewKlasifikasi('Umum');
    setNewLampiranName('');
  };

  const handleDeleteLetter = (letter: SuratMasuk) => {
    setDeleteConfirmLetter(letter);
  };

  const confirmDeleteLetter = () => {
    if (!deleteConfirmLetter) return;
    const { id, nomorSurat } = deleteConfirmLetter;

    setSuratMasuk(prev => prev.filter(l => l.id !== id));
    if (selectedLetterId === id) {
      setSelectedLetterId(null);
    }
    triggerToast(`Surat nomor ${nomorSurat} berhasil dihapus permanen.`, 'info');
    setDeleteConfirmLetter(null);
  };

  const handleForwardToLeader = (letter: SuratMasuk) => {
    setSuratMasuk(prev => prev.map(l => l.id === letter.id ? { ...l, status: 'Diteruskan' } : l));
    
    // Log audit trail
    onAddAuditLog(
      'Meneruskan Surat',
      `Meneruskan surat masuk nomor ${letter.nomorSurat} ke Pimpinan (Kepala Dinas) untuk instruksi disposisi.`
    );

    // Notify Pimpinan
    onTriggerNotification(
      'user-3', // Kepala Dinas
      'Surat Masuk Baru Diteruskan',
      `Surat dari ${letter.asalSurat} dengan perihal "${letter.perihal}" telah diteruskan ke meja Anda.`
    );

    triggerToast(`Surat nomor ${letter.nomorSurat} berhasil diteruskan ke Kepala Dinas!`, 'success');
  };

  const getSifatBadgeColor = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'Sangat Segera': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'Rahasia': return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'Penting': return 'bg-blue-50 text-blue-700 border-blue-150';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Diteruskan': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'Disposisi': return 'bg-purple-50 text-purple-700 border-purple-150';
      case 'Selesai': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      default: return 'bg-slate-150 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-150 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="input-search-surat-masuk"
            type="text"
            placeholder="Cari nomor, asal, perihal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sifat filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Sifat:</span>
            <select
              id="filter-sifat-select"
              value={filterSifat}
              onChange={(e) => setFilterSifat(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="Semua">Semua Sifat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Rahasia">Rahasia</option>
              <option value="Sangat Segera">Sangat Segera</option>
            </select>
          </div>

          {/* Klasifikasi filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Klasifikasi:</span>
            <select
              id="filter-klasifikasi-select"
              value={filterKlasifikasi}
              onChange={(e) => setFilterKlasifikasi(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="Semua">Semua Klasifikasi</option>
              <option value="Umum">Umum</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Kepegawaian">Kepegawaian</option>
              <option value="Hukum">Hukum</option>
              <option value="Sarpras">Sarpras</option>
            </select>
          </div>

          {/* Add Letter Button */}
          {canAddLetter && (
            <button
              id="btn-trigger-add-letter-masuk"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/10 ml-auto md:ml-0"
            >
              <Plus className="h-4 w-4" />
              <span>Registrasi Surat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Table Grid + Detail View Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Table Listing */}
        <div className={`bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm transition-all duration-300 ${selectedLetterId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150">
                  <th className="py-3 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">No. Surat / Pengirim</th>
                  <th className="py-3 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Perihal</th>
                  <th className="py-3 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Sifat / Klasifikasi</th>
                  <th className="py-3 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="py-3 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Inbox className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs">Tidak ditemukan surat masuk yang sesuai filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedLetterId(item.id)}
                      className={`hover:bg-slate-50/50 transition-all cursor-pointer ${
                        selectedLetterId === item.id ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 text-[11px] hover:text-emerald-600 transition-colors">
                          {item.nomorSurat}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate max-w-[180px] md:max-w-[240px] mt-0.5">
                          {item.asalSurat}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                          Terima: {item.tanggalTerima}
                        </span>
                      </td>
                      <td className="py-4 px-3 hidden md:table-cell">
                        <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
                          {item.perihal}
                        </p>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSifatBadgeColor(item.sifat)}`}>
                            {item.sifat}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {item.klasifikasi}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Forward/Diteruskan Button */}
                          {item.status === 'Draft' && canAddLetter && (
                            <button
                              id={`btn-forward-letter-${item.id}`}
                              onClick={() => handleForwardToLeader(item)}
                              className="text-emerald-600 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-150 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                              title="Teruskan ke Pimpinan"
                            >
                              <span>Teruskan</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {canAddLetter && (
                            <button
                              id={`btn-delete-row-${item.id}`}
                              onClick={() => handleDeleteLetter(item)}
                              className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                              title="Hapus"
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

        {/* Detail Viewer Panel */}
        {selectedLetterId && selectedLetter && (
          <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800">Lembar Informasi Surat</h3>
              <button
                id="btn-close-detail-panel"
                onClick={() => setSelectedLetterId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Nomor Surat Resmi</span>
                <p className="text-xs font-black text-slate-800 mt-0.5">{selectedLetter.nomorSurat}</p>
              </div>

              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Asal Pengirim</span>
                <p className="text-[11px] font-bold text-slate-700 mt-0.5 leading-relaxed">{selectedLetter.asalSurat}</p>
              </div>

              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Perihal Surat</span>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedLetter.perihal}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Tanggal Surat</span>
                  <p className="text-[10px] font-bold text-slate-700 mt-0.5">{selectedLetter.tanggalSurat}</p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Diterima Agen</span>
                  <p className="text-[10px] font-bold text-slate-700 mt-0.5">{selectedLetter.tanggalTerima}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Sifat Surat</span>
                  <p className="mt-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSifatBadgeColor(selectedLetter.sifat)}`}>
                      {selectedLetter.sifat}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Klasifikasi Arsip</span>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1">{selectedLetter.klasifikasi}</p>
                </div>
              </div>

              {selectedLetter.lampiran && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-emerald-600" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Berkas Terlampir</span>
                      <p className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]">{selectedLetter.lampiran}</p>
                    </div>
                  </div>
                  <a
                    href={`#`}
                    onClick={(e) => { e.preventDefault(); alert(`Membuka berkas: ${selectedLetter.lampiran}`); }}
                    className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    Buka File
                  </a>
                </div>
              )}
            </div>

            {/* Action inside Detail View */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              {selectedLetter.status === 'Draft' && canAddLetter && (
                <button
                  id="btn-detail-forward"
                  onClick={() => handleForwardToLeader(selectedLetter)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
                >
                  <span>Teruskan ke Kepala Dinas</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              {selectedLetter.status === 'Diteruskan' && (
                <div className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold">Menunggu Pimpinan mendisposisikan surat ini.</span>
                </div>
              )}
              {selectedLetter.status === 'Disposisi' && (
                <div className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-purple-700 font-bold">Surat Telah Didisposisikan ke Pelaksana.</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modal: Add Incoming Letter */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormError(null);
        }}
        title="Daftarkan Surat Masuk Baru"
        size="md"
      >
        <form onSubmit={handleAddLetter} className="space-y-4 text-left">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nomor Surat Resmi</label>
            <input
              id="input-nomor-surat-masuk"
              type="text"
              required
              placeholder="Contoh: 045.2/1023/BAPPEDA/2026"
              value={newNoSurat}
              onChange={(e) => setNewNoSurat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Asal Surat / Pengirim Resmi</label>
            <input
              id="input-asal-surat-masuk"
              type="text"
              required
              placeholder="Contoh: Dinas Sosial Provinsi Sulawesi Selatan"
              value={newAsal}
              onChange={(e) => setNewAsal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Perihal Isi Ringkas Surat</label>
            <textarea
              id="input-perihal-surat-masuk"
              required
              rows={3}
              placeholder="Tulis ringkasan perihal isi pokok surat..."
              value={newPerihal}
              onChange={(e) => setNewPerihal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tanggal Surat</label>
              <input
                id="input-tgl-surat-masuk"
                type="date"
                value={newTglSurat}
                onChange={(e) => setNewTglSurat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tanggal Terima</label>
              <input
                id="input-tgl-terima-masuk"
                type="date"
                value={newTglTerima}
                onChange={(e) => setNewTglTerima(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Sifat Surat</label>
              <select
                id="select-sifat-masuk"
                value={newSifat}
                onChange={(e) => setNewSifat(e.target.value as SifatSurat)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Rahasia">Rahasia</option>
                <option value="Sangat Segera">Sangat Segera</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Klasifikasi Arsip</label>
              <select
                id="select-klasifikasi-masuk"
                value={newKlasifikasi}
                onChange={(e) => setNewKlasifikasi(e.target.value as KlasifikasiSurat)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="Umum">Umum</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Kepegawaian">Kepegawaian</option>
                <option value="Hukum">Hukum</option>
                <option value="Sarpras">Sarpras</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Berkas / Lampiran Fisik (PDF)</label>
            <input
              id="input-lampiran-masuk"
              type="text"
              placeholder="Contoh: Surat_Rapat_Koordinasi.pdf"
              value={newLampiranName}
              onChange={(e) => setNewLampiranName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              id="btn-cancel-add-letter"
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormError(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-add-letter"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              Simpan Registrasi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Custom Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmLetter !== null}
        onClose={() => setDeleteConfirmLetter(null)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="text-left space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus surat masuk nomor <strong className="text-slate-800">{deleteConfirmLetter?.nomorSurat}</strong> dari <strong className="text-slate-800">{deleteConfirmLetter?.asalSurat}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              id="btn-cancel-delete"
              onClick={() => setDeleteConfirmLetter(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-delete"
              onClick={confirmDeleteLetter}
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
          id="toast-notification"
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
            id="toast-close-btn"
            onClick={() => setToast(null)} 
            className="ml-2 text-slate-400 hover:text-slate-600 animate-fade-in"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
