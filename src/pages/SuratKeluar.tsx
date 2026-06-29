import React, { useState, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  ArrowRight, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  X,
  FileText,
  Send,
  Inbox
} from 'lucide-react';
import { SuratKeluar, SifatSurat, KlasifikasiSurat, UserRole } from '../types';
import Modal from '../components/Modal';

interface SuratKeluarProps {
  suratKeluar: SuratKeluar[];
  setSuratKeluar: React.Dispatch<React.SetStateAction<SuratKeluar[]>>;
  currentRole: UserRole;
  onAddAuditLog: (action: string, description: string) => void;
}

export default function SuratKeluarPage({
  suratKeluar,
  setSuratKeluar,
  currentRole,
  onAddAuditLog
}: SuratKeluarProps) {
  
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
  const [newTujuan, setNewTujuan] = useState('');
  const [newPerihal, setNewPerihal] = useState('');
  const [newSifat, setNewSifat] = useState<SifatSurat>('Biasa');
  const [newKlasifikasi, setNewKlasifikasi] = useState<KlasifikasiSurat>('Umum');
  const [newTembusan, setNewTembusan] = useState('');
  const [newLampiranName, setNewLampiranName] = useState('');

  // Floating notifications & modal feedback states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmLetter, setDeleteConfirmLetter] = useState<SuratKeluar | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Determine permissions
  const canAddLetter = currentRole === 'Super Admin' || currentRole === 'Admin Persuratan';

  // Filtering data
  const filteredData = suratKeluar.filter((item) => {
    const matchesSearch = 
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSifat = filterSifat === 'Semua' || item.sifat === filterSifat;
    const matchesKlasifikasi = filterKlasifikasi === 'Semua' || item.klasifikasi === filterKlasifikasi;

    return matchesSearch && matchesSifat && matchesKlasifikasi;
  });

  const selectedLetter = suratKeluar.find(l => l.id === selectedLetterId);

  const handleAddLetter = (actionType: 'Draft' | 'Kirim') => {
    if (!newNoSurat.trim() || !newTujuan.trim() || !newPerihal.trim()) {
      setFormError('Mohon isi kolom nomor surat, tujuan surat, dan perihal.');
      return;
    }

    const newLetter: SuratKeluar = {
      id: `sk-${Date.now()}`,
      nomorSurat: newNoSurat.trim(),
      tanggalSurat: newTglSurat || new Date().toISOString().split('T')[0],
      tujuan: newTujuan.trim(),
      perihal: newPerihal.trim(),
      sifat: newSifat,
      klasifikasi: newKlasifikasi,
      status: actionType === 'Kirim' ? 'Dikirim' : 'Draft',
      tembusan: newTembusan.trim() || undefined,
      lampiran: newLampiranName.trim() || undefined,
      fileUrl: newLampiranName.trim() ? `${newLampiranName.trim().replace(/\s+/g, '_')}.pdf` : undefined
    };

    setSuratKeluar(prev => [...prev, newLetter]);
    setIsAddModalOpen(false);
    setFormError(null);

    // Add Audit Log
    onAddAuditLog(
      'Registrasi Surat Keluar',
      `Mendaftarkan surat keluar baru nomor ${newLetter.nomorSurat} ditujukan ke ${newLetter.tujuan}. Status: ${newLetter.status}`
    );

    triggerToast(
      actionType === 'Kirim' 
        ? `Surat keluar ${newLetter.nomorSurat} berhasil disimpan dan dikirim!`
        : `Surat draf ${newLetter.nomorSurat} berhasil disimpan!`,
      'success'
    );

    // Reset Form
    setNewNoSurat('');
    setNewTglSurat('');
    setNewTujuan('');
    setNewPerihal('');
    setNewSifat('Biasa');
    setNewKlasifikasi('Umum');
    setNewTembusan('');
    setNewLampiranName('');
  };

  const handleDeleteLetter = (letter: SuratKeluar) => {
    setDeleteConfirmLetter(letter);
  };

  const confirmDeleteLetter = () => {
    if (!deleteConfirmLetter) return;
    const { id, nomorSurat } = deleteConfirmLetter;

    setSuratKeluar(prev => prev.filter(l => l.id !== id));
    if (selectedLetterId === id) {
      setSelectedLetterId(null);
    }
    triggerToast(`Surat keluar draf nomor ${nomorSurat} berhasil dihapus.`, 'info');
    setDeleteConfirmLetter(null);
  };

  const handleSendLetter = (letter: SuratKeluar) => {
    setSuratKeluar(prev => prev.map(l => l.id === letter.id ? { ...l, status: 'Dikirim' } : l));
    
    onAddAuditLog(
      'Pengiriman Surat Keluar',
      `Mengubah status draf surat keluar nomor ${letter.nomorSurat} menjadi dikirim ke tujuan: ${letter.tujuan}.`
    );

    triggerToast(`Surat nomor ${letter.nomorSurat} berhasil dikirim ke tujuan!`, 'success');
  };

  const getSifatBadgeColor = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'Sangat Segera': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'Rahasia': return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'Penting': return 'bg-blue-50 text-blue-700 border-blue-150';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-150 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="input-search-surat-keluar"
            type="text"
            placeholder="Cari nomor, tujuan, perihal..."
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
              id="filter-sifat-select-sk"
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
              id="filter-klasifikasi-select-sk"
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
              id="btn-trigger-add-letter-keluar"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/10 ml-auto md:ml-0"
            >
              <Plus className="h-4 w-4" />
              <span>Registrasi Surat Keluar</span>
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
                  <th className="py-3 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">No. Surat / Tujuan</th>
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
                      <p className="text-xs">Tidak ditemukan surat keluar yang sesuai filter.</p>
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
                          {item.tujuan}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                          Tanggal Surat: {item.tanggalSurat}
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
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          item.status === 'Draft' 
                            ? 'bg-slate-100 text-slate-600 border-slate-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send/Kirim Button for draft letters */}
                          {item.status === 'Draft' && canAddLetter && (
                            <button
                              id={`btn-send-letter-${item.id}`}
                              onClick={() => handleSendLetter(item)}
                              className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-all border border-transparent hover:border-blue-150 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                              title="Kirim Resmi"
                            >
                              <span>Kirim</span>
                              <Send className="h-3 w-3" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {canAddLetter && (
                            <button
                              id={`btn-delete-sk-${item.id}`}
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
              <h3 className="text-xs font-bold text-slate-800">Detail Surat Keluar</h3>
              <button
                id="btn-close-detail-panel-sk"
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
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Instansi Tujuan</span>
                <p className="text-[11px] font-bold text-slate-700 mt-0.5 leading-relaxed">{selectedLetter.tujuan}</p>
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
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Status</span>
                  <p className="text-[10px] font-bold text-slate-700 mt-0.5">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedLetter.status === 'Draft' ? 'bg-slate-100 border-slate-200' : 'bg-emerald-50 border-emerald-150 text-emerald-700'
                    }`}>
                      {selectedLetter.status}
                    </span>
                  </p>
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

              {selectedLetter.tembusan && (
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Tembusan Kepada</span>
                  <p className="text-[10px] font-bold text-slate-600 mt-0.5 leading-relaxed">{selectedLetter.tembusan}</p>
                </div>
              )}

              {selectedLetter.lampiran && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-emerald-600" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Arsip Lampiran</span>
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

            {/* Actions */}
            {selectedLetter.status === 'Draft' && canAddLetter && (
              <div className="pt-4 border-t border-slate-100">
                <button
                  id="btn-detail-send-sk"
                  onClick={() => handleSendLetter(selectedLetter)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Surat ke Tujuan Resmi</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal: Add Outgoing Letter */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormError(null);
        }}
        title="Registrasi Surat Keluar Baru"
        size="md"
      >
        <div className="space-y-4 text-left">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nomor Surat Resmi</label>
            <input
              id="input-nomor-surat-keluar"
              type="text"
              required
              placeholder="Contoh: 090/512/DK/VI/2026"
              value={newNoSurat}
              onChange={(e) => setNewNoSurat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Lembaga / Instansi Tujuan</label>
            <input
              id="input-tujuan-surat-keluar"
              type="text"
              required
              placeholder="Contoh: Pimpinan Cabang Bank BPD"
              value={newTujuan}
              onChange={(e) => setNewTujuan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Perihal / Isi Ringkas Surat</label>
            <textarea
              id="input-perihal-surat-keluar"
              required
              rows={3}
              placeholder="Tulis ringkasan perihal isi pokok surat keluar..."
              value={newPerihal}
              onChange={(e) => setNewPerihal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tanggal Surat</label>
              <input
                id="input-tgl-surat-keluar"
                type="date"
                value={newTglSurat}
                onChange={(e) => setNewTglSurat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Sifat Surat</label>
              <select
                id="select-sifat-keluar"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Klasifikasi Arsip</label>
              <select
                id="select-klasifikasi-keluar"
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
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tembusan (Opsional)</label>
              <input
                id="input-tembusan-keluar"
                type="text"
                placeholder="Contoh: Sekretaris Daerah"
                value={newTembusan}
                onChange={(e) => setNewTembusan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Dokumen Lampiran / Draf Berkas (PDF)</label>
            <input
              id="input-lampiran-keluar"
              type="text"
              placeholder="Contoh: Proposal_Kerjasama_E_Surat.pdf"
              value={newLampiranName}
              onChange={(e) => setNewLampiranName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              id="btn-cancel-add-sk"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormError(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-draft-sk"
              onClick={() => handleAddLetter('Draft')}
              className="bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Simpan Sebagai Draf
            </button>
            <button
              id="btn-confirm-add-sk"
              onClick={() => handleAddLetter('Kirim')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              Simpan & Kirim Resmi
            </button>
          </div>
        </div>
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
            Apakah Anda yakin ingin menghapus draf surat keluar nomor <strong className="text-slate-800">{deleteConfirmLetter?.nomorSurat}</strong> ditujukan ke <strong className="text-slate-800">{deleteConfirmLetter?.tujuan}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              id="btn-cancel-delete-sk"
              onClick={() => setDeleteConfirmLetter(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-delete-sk"
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
          id="toast-notification-sk"
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
            id="toast-close-btn-sk"
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
