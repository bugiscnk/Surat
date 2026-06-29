import { useState, Dispatch, SetStateAction } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  ArrowRight,
  History,
  Send,
  Info
} from 'lucide-react';
import { SuratKeluar, SifatSurat, KlasifikasiSurat, UserRole, User } from '../types';
import Modal from '../components/Modal';
import Timeline from '../components/Timeline';

interface SuratKeluarProps {
  suratKeluar: SuratKeluar[];
  setSuratKeluar: Dispatch<SetStateAction<SuratKeluar[]>>;
  onAddAuditLog: (suratId: string, action: string, description: string) => void;
  currentRole: UserRole;
  auditTrail: any[];
}

export default function SuratKeluarPage({
  suratKeluar,
  setSuratKeluar,
  onAddAuditLog,
  currentRole,
  auditTrail
}: SuratKeluarProps) {
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSifat, setFilterSifat] = useState<string>('Semua');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Selected letter for viewing
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

  // New letter form modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNoSurat, setNewNoSurat] = useState('');
  const [newTglSurat, setNewTglSurat] = useState('');
  const [newTujuan, setNewTujuan] = useState('');
  const [newPerihal, setNewPerihal] = useState('');
  const [newSifat, setNewSifat] = useState<SifatSurat>('Biasa');
  const [newKlasifikasi, setNewKlasifikasi] = useState<KlasifikasiSurat>('Umum');
  const [newTembusan, setNewTembusan] = useState('');
  const [newLampiranName, setNewLampiranName] = useState('');

  // Filtering data
  const filteredData = suratKeluar.filter((item) => {
    const matchesSearch = 
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSifat = filterSifat === 'Semua' || item.sifat === filterSifat;
    const matchesKlasifikasi = filterKlasifikasi === 'Semua' || item.klasifikasi === filterKlasifikasi;
    const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;

    return matchesSearch && matchesSifat && matchesKlasifikasi && matchesStatus;
  });

  const selectedLetter = suratKeluar.find(l => l.id === selectedLetterId);

  const handleAddLetter = (actionType: 'Draft' | 'Kirim') => {
    if (!newNoSurat || !newTujuan || !newPerihal) {
      alert('Mohon isi kolom nomor surat, tujuan surat, dan perihal.');
      return;
    }

    const newLetter: SuratKeluar = {
      id: `sk-${Date.now()}`,
      nomorSurat: newNoSurat,
      tanggalSurat: newTglSurat || new Date().toISOString().split('T')[0],
      tujuan: newTujuan,
      perihal: newPerihal,
      sifat: newSifat,
      klasifikasi: newKlasifikasi,
      status: actionType === 'Kirim' ? 'Dikirim' : 'Draft',
      tembusan: newTembusan || undefined,
      lampiran: newLampiranName || undefined
    };

    setSuratKeluar(prev => [newLetter, ...prev]);
    setIsAddModalOpen(false);

    // Add Audit Log
    onAddAuditLog(
      newLetter.id,
      actionType === 'Kirim' ? 'Registrasi & Pengiriman' : 'Registrasi Draf Keluar',
      `Mendaftarkan surat keluar baru nomor ${newLetter.nomorSurat} ditujukan ke ${newLetter.tujuan}. Status: ${newLetter.status}`
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

  const handleDeleteLetter = (id: string, nomor: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus draf surat keluar nomor ${nomor}?`)) {
      setSuratKeluar(prev => prev.filter(l => l.id !== id));
      if (selectedLetterId === id) {
        setSelectedLetterId(null);
      }
    }
  };

  const handleSendLetter = (letter: SuratKeluar) => {
    setSuratKeluar(prev => prev.map(l => l.id === letter.id ? { ...l, status: 'Dikirim' } : l));
    onAddAuditLog(
      letter.id,
      'Pengiriman Resmi',
      `Surat resmi Keluar nomor ${letter.nomorSurat} telah berhasil dikirimkan ke tujuan: ${letter.tujuan}.`
    );
  };

  const getSifatBadgeColor = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'Penting': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'Rahasia': return 'bg-pink-50 text-pink-700 border-pink-150';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-150';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Dikirim': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const canAddLetter = currentRole === 'Super Admin' || currentRole === 'Admin Persuratan';

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-3xl space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            id="search-input-surat-keluar"
            type="text"
            placeholder="Cari surat keluar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2 pl-9 pr-4 rounded-xl text-xs focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans font-bold">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Saring:</span>
          </div>

          <select
            id="filter-sk-sifat"
            value={filterSifat}
            onChange={(e) => setFilterSifat(e.target.value)}
            className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors font-semibold"
          >
            <option value="Semua">Semua Sifat</option>
            <option value="Biasa">Biasa</option>
            <option value="Penting">Penting</option>
            <option value="Rahasia">Rahasia</option>
          </select>

          <select
            id="filter-sk-klasifikasi"
            value={filterKlasifikasi}
            onChange={(e) => setFilterKlasifikasi(e.target.value)}
            className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors font-semibold"
          >
            <option value="Semua">Semua Klasifikasi</option>
            <option value="Umum">Umum</option>
            <option value="Keuangan">Keuangan</option>
            <option value="Kepegawaian">Kepegawaian</option>
            <option value="Akademik">Akademik</option>
          </select>

          <select
            id="filter-sk-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors font-semibold"
          >
            <option value="Semua">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Dikirim">Dikirim</option>
          </select>

          {canAddLetter && (
            <button
              id="btn-add-surat-keluar"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer transition-all shrink-0 ml-auto md:ml-0"
            >
              <Plus className="h-4 w-4" />
              <span>Registrasi Surat Keluar</span>
            </button>
          )}

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Table List */}
        <div className={`bg-white border border-slate-200 shadow-sm p-6 rounded-3xl overflow-hidden transition-all ${selectedLetter ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Nomor Surat</th>
                  <th className="py-3 px-3">Tanggal Surat</th>
                  <th className="py-3 px-3">Tujuan Surat</th>
                  <th className="py-3 px-3">Perihal</th>
                  <th className="py-3 px-3">Sifat</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Tidak ditemukan surat keluar yang cocok dengan kriteria saringan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedLetterId === item.id ? 'bg-emerald-50/40' : ''
                      }`}
                      onClick={() => setSelectedLetterId(item.id)}
                    >
                      <td className="py-4 px-3 font-mono text-emerald-600 font-bold whitespace-nowrap">{item.nomorSurat}</td>
                      <td className="py-4 px-3 font-sans text-slate-500 whitespace-nowrap">{item.tanggalSurat}</td>
                      <td className="py-4 px-3 font-sans font-bold text-slate-800 truncate max-w-[140px]" title={item.tujuan}>{item.tujuan}</td>
                      <td className="py-4 px-3 font-sans text-slate-600 truncate max-w-[200px]" title={item.perihal}>{item.perihal}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getSifatBadgeColor(item.sifat)}`}>
                          {item.sifat}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-view-sk-${item.id}`}
                            onClick={() => setSelectedLetterId(item.id)}
                            className="text-emerald-600 hover:text-emerald-700 font-bold text-xs whitespace-nowrap"
                          >
                            Detail
                          </button>
                          {canAddLetter && (
                            <button
                              id={`btn-delete-sk-${item.id}`}
                              onClick={() => handleDeleteLetter(item.id, item.nomorSurat)}
                              className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-all"
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

        {/* Right: Side Panel dossier detail */}
        {selectedLetter && (
          <div className="bg-white border border-slate-200 shadow-lg p-6 rounded-3xl space-y-6 animate-in slide-in-from-right-10 duration-300 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h4 className="font-display font-extrabold text-sm text-emerald-700">Dossier Surat Keluar</h4>
              <button 
                id="btn-close-sk-dossier"
                onClick={() => setSelectedLetterId(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Tutup dossier
              </button>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Nomor Surat Resmi</span>
                <p className="text-sm font-mono font-bold text-slate-800">{selectedLetter.nomorSurat}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Perihal</span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">{selectedLetter.perihal}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Tanggal Surat</span>
                  <p className="text-xs text-slate-600 font-semibold">{selectedLetter.tanggalSurat}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Tujuan Penerima</span>
                  <p className="text-xs text-slate-600 font-bold">{selectedLetter.tujuan}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Klasifikasi</span>
                  <p className="text-xs text-slate-600 font-semibold">{selectedLetter.klasifikasi}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Tembusan</span>
                  <p className="text-xs text-slate-500 font-semibold italic truncate max-w-[120px]">{selectedLetter.tembusan || '-'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Sifat Sifat</span>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getSifatBadgeColor(selectedLetter.sifat)}`}>
                    {selectedLetter.sifat}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Send button if still in Draft */}
            {selectedLetter.status === 'Draft' && canAddLetter && (
              <button
                id="btn-send-sk-dossier"
                onClick={() => handleSendLetter(selectedLetter)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Kirim Surat Resmi</span>
              </button>
            )}

            {/* Deep Activity Timeline */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-1 text-slate-500 font-bold">
                <History className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Timeline Pengiriman</span>
              </div>
              <Timeline auditTrail={auditTrail} suratId={selectedLetter.id} />
            </div>

          </div>
        )}

      </div>

      {/* Modal: Add Outgoing Letter */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Registrasi Surat Keluar Baru"
        size="md"
      >
        <div className="space-y-4 text-left">
          
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nomor Surat Resmi</label>
            <input
              id="form-sk-no"
              type="text"
              placeholder="Contoh: 900/182/SPD/2026"
              value={newNoSurat}
              onChange={(e) => setNewNoSurat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tanggal Surat Keluar</label>
            <input
              id="form-sk-tgl"
              type="date"
              value={newTglSurat}
              onChange={(e) => setNewTglSurat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tujuan Instansi Penerima</label>
            <input
              id="form-sk-tujuan"
              type="text"
              placeholder="Contoh: Badan Pengelola Keuangan Daerah"
              value={newTujuan}
              onChange={(e) => setNewTujuan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Perihal Surat</label>
            <input
              id="form-sk-perihal"
              type="text"
              placeholder="Contoh: Laporan Realisasi Penggunaan Anggaran..."
              value={newPerihal}
              onChange={(e) => setNewPerihal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Sifat Surat</label>
              <select
                id="form-sk-sifat"
                value={newSifat}
                onChange={(e) => setNewSifat(e.target.value as SifatSurat)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Klasifikasi</label>
              <select
                id="form-sk-klasifikasi"
                value={newKlasifikasi}
                onChange={(e) => setNewKlasifikasi(e.target.value as KlasifikasiSurat)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
              >
                <option value="Umum">Umum</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Kepegawaian">Kepegawaian</option>
                <option value="Akademik">Akademik</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tembusan Kepada</label>
            <input
              id="form-sk-tembusan"
              type="text"
              placeholder="Contoh: Kepala Subbagian Keuangan, Bidang IT (opsional)"
              value={newTembusan}
              onChange={(e) => setNewTembusan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
            />
          </div>

          {/* Lampiran */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nama Lampiran (Mock PDF)</label>
            <input
              id="form-sk-lampiran"
              type="text"
              placeholder="Masukkan nama berkas lampiran jika ada"
              value={newLampiranName}
              onChange={(e) => setNewLampiranName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              id="btn-sk-save-draft"
              type="button"
              onClick={() => handleAddLetter('Draft')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Simpan Draft
            </button>
            <button
              id="btn-sk-save-send"
              type="button"
              onClick={() => handleAddLetter('Kirim')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              <Send className="h-4 w-4" />
              <span>Registrasi & Kirim Resmi</span>
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}
