import { useState, Dispatch, SetStateAction } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  ExternalLink, 
  Trash2, 
  ArrowRight,
  ClipboardList,
  History,
  Info
} from 'lucide-react';
import { SuratMasuk, SifatSurat, KlasifikasiSurat, UserRole, User, Disposisi } from '../types';
import Modal from '../components/Modal';
import Timeline from '../components/Timeline';

interface SuratMasukProps {
  suratMasuk: SuratMasuk[];
  setSuratMasuk: Dispatch<SetStateAction<SuratMasuk[]>>;
  disposisi: Disposisi[];
  onAddAuditLog: (suratId: string, action: string, description: string) => void;
  currentRole: UserRole;
  users: User[];
  auditTrail: any[];
  onTriggerDisposisiForm: (suratMasukId: string) => void;
  selectedLetterIdForViewing: string | null;
  setSelectedLetterIdForViewing: (id: string | null) => void;
}

export default function SuratMasukPage({
  suratMasuk,
  setSuratMasuk,
  disposisi,
  onAddAuditLog,
  currentRole,
  users,
  auditTrail,
  onTriggerDisposisiForm,
  selectedLetterIdForViewing,
  setSelectedLetterIdForViewing
}: SuratMasukProps) {
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSifat, setFilterSifat] = useState<string>('Semua');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // New letter form modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNoSurat, setNewNoSurat] = useState('');
  const [newTglSurat, setNewTglSurat] = useState('');
  const [newTglTerima, setNewTglTerima] = useState('');
  const [newAsal, setNewAsal] = useState('');
  const [newPerihal, setNewPerihal] = useState('');
  const [newSifat, setNewSifat] = useState<SifatSurat>('Biasa');
  const [newKlasifikasi, setNewKlasifikasi] = useState<KlasifikasiSurat>('Umum');
  const [newLampiranName, setNewLampiranName] = useState('');

  // Filtering data
  const filteredData = suratMasuk.filter((item) => {
    const matchesSearch = 
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asalSurat.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSifat = filterSifat === 'Semua' || item.sifat === filterSifat;
    const matchesKlasifikasi = filterKlasifikasi === 'Semua' || item.klasifikasi === filterKlasifikasi;
    const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;

    return matchesSearch && matchesSifat && matchesKlasifikasi && matchesStatus;
  });

  const selectedLetter = suratMasuk.find(l => l.id === selectedLetterIdForViewing);

  const handleAddLetter = (actionType: 'Draft' | 'Teruskan') => {
    if (!newNoSurat || !newAsal || !newPerihal) {
      alert('Mohon isi kolom nomor surat, asal surat, dan perihal.');
      return;
    }

    const newLetter: SuratMasuk = {
      id: `sm-${Date.now()}`,
      nomorSurat: newNoSurat,
      tanggalSurat: newTglSurat || new Date().toISOString().split('T')[0],
      tanggalTerima: newTglTerima || new Date().toISOString().split('T')[0],
      asalSurat: newAsal,
      perihal: newPerihal,
      sifat: newSifat,
      klasifikasi: newKlasifikasi,
      status: actionType === 'Teruskan' ? 'Diteruskan' : 'Draft',
      lampiran: newLampiranName || undefined
    };

    setSuratMasuk(prev => [newLetter, ...prev]);
    setIsAddModalOpen(false);

    // Add Audit Log
    onAddAuditLog(
      newLetter.id,
      actionType === 'Teruskan' ? 'Registrasi & Penerusan' : 'Registrasi Draft',
      `Mendaftarkan surat masuk baru nomor ${newLetter.nomorSurat} dari ${newLetter.asalSurat}. Status: ${newLetter.status}`
    );

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

  const handleDeleteLetter = (id: string, nomor: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus surat nomor ${nomor}?`)) {
      setSuratMasuk(prev => prev.filter(l => l.id !== id));
      if (selectedLetterIdForViewing === id) {
        setSelectedLetterIdForViewing(null);
      }
    }
  };

  const handleForwardToLeader = (letter: SuratMasuk) => {
    setSuratMasuk(prev => prev.map(l => l.id === letter.id ? { ...l, status: 'Diteruskan' } : l));
    onAddAuditLog(
      letter.id,
      'Diteruskan ke Pimpinan',
      `Meneruskan surat Nomor ${letter.nomorSurat} dari draft menuju disposisi Pimpinan.`
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
      case 'Selesai': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Didisposisikan': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'Diteruskan': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
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
            id="search-input-surat-masuk"
            type="text"
            placeholder="Cari surat masuk..."
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
            id="filter-sifat-select"
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
            id="filter-klasifikasi-select"
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
            id="filter-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors font-semibold"
          >
            <option value="Semua">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Diteruskan">Diteruskan</option>
            <option value="Didisposisikan">Didisposisikan</option>
            <option value="Selesai">Selesai</option>
          </select>

          {canAddLetter && (
            <button
              id="btn-add-surat-masuk"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer transition-all shrink-0 ml-auto md:ml-0"
            >
              <Plus className="h-4 w-4" />
              <span>Daftarkan Surat</span>
            </button>
          )}

        </div>
      </div>

      {/* Main Content Layout (Table + details panel on select) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Table List */}
        <div className={`bg-white border border-slate-200 shadow-sm p-6 rounded-3xl overflow-hidden transition-all ${selectedLetter ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Nomor Surat</th>
                  <th className="py-3 px-3">Tanggal Terima</th>
                  <th className="py-3 px-3">Pengirim / Asal</th>
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
                      Tidak ditemukan surat masuk yang cocok dengan kriteria saringan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedLetterIdForViewing === item.id ? 'bg-emerald-50/40' : ''
                      }`}
                      onClick={() => setSelectedLetterIdForViewing(item.id)}
                    >
                      <td className="py-4 px-3 font-mono text-emerald-600 font-bold whitespace-nowrap">{item.nomorSurat}</td>
                      <td className="py-4 px-3 font-sans text-slate-500 whitespace-nowrap">{item.tanggalTerima}</td>
                      <td className="py-4 px-3 font-sans font-bold text-slate-800 truncate max-w-[140px]" title={item.asalSurat}>{item.asalSurat}</td>
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
                            id={`btn-details-row-${item.id}`}
                            onClick={() => setSelectedLetterIdForViewing(item.id)}
                            className="text-emerald-600 hover:text-emerald-700 font-bold text-xs whitespace-nowrap"
                          >
                            Detail
                          </button>
                          {canAddLetter && (
                            <button
                              id={`btn-delete-row-${item.id}`}
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

        {/* Right: Selected Letter Side Panel Dossier */}
        {selectedLetter && (
          <div className="bg-white border border-slate-200 shadow-lg p-6 rounded-3xl space-y-6 animate-in slide-in-from-right-10 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h4 className="font-display font-extrabold text-sm text-emerald-700">Dossier Surat Masuk</h4>
              <button 
                id="btn-close-dossier"
                onClick={() => setSelectedLetterIdForViewing(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Tutup dossier
              </button>
            </div>

            {/* Core Info */}
            <div className="space-y-4 text-left">
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
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Asal Pengirim</span>
                  <p className="text-xs text-slate-600 font-semibold">{selectedLetter.asalSurat}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Klasifikasi</span>
                  <p className="text-xs text-slate-600 font-semibold">{selectedLetter.klasifikasi}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Lampiran File</span>
                  {selectedLetter.lampiran ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="text-xs text-emerald-600 font-bold truncate max-w-[120px]" title={selectedLetter.lampiran}>
                        {selectedLetter.lampiran}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-0.5">Tidak ada file</p>
                  )}
                </div>
              </div>
            </div>

            {/* Inline Action Buttons based on state */}
            {selectedLetter.status === 'Draft' && canAddLetter && (
              <button
                id="btn-forward-leader-dossier"
                onClick={() => handleForwardToLeader(selectedLetter)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all"
              >
                <span>Teruskan ke Pimpinan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {selectedLetter.status === 'Diteruskan' && currentRole === 'Pimpinan' && (
              <button
                id="btn-add-disposisi-dossier"
                onClick={() => onTriggerDisposisiForm(selectedLetter.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Buat Disposisi Surat</span>
              </button>
            )}

            {/* List Linked Dispositions */}
            {disposisi.filter(d => d.suratMasukId === selectedLetter.id).length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-3 text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Disposisi Terkait</span>
                {disposisi.filter(d => d.suratMasukId === selectedLetter.id).map(d => {
                  const executorNames = d.pelaksanaIds.map(id => users.find(u => u.id === id)?.nama.split(',')[0]).join(', ');
                  return (
                    <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">Tenggat: {d.tenggatWaktu}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          d.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-slate-700 font-bold italic">"{d.instruksi}"</p>
                      <p className="text-[10px] text-slate-500">Pelaksana: {executorNames}</p>
                      {d.catatanBalasan && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">Balasan:</span> {d.catatanBalasan}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Deep Activity Timeline */}
            <div className="border-t border-slate-100 pt-4 space-y-3 text-left">
              <div className="flex items-center gap-1 text-slate-500 font-bold">
                <History className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Timeline Pelacakan</span>
              </div>
              <Timeline auditTrail={auditTrail} suratId={selectedLetter.id} />
            </div>

          </div>
        )}

      </div>

      {/* Modal: Add Incoming Letter */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Daftarkan Surat Masuk Baru"
        size="md"
      >
        <div className="space-y-4 text-left">
          
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nomor Surat Resmi</label>
            <input
              id="form-sm-no"
              type="text"
              placeholder="Contoh: 045.2/210/DISDIK/2026"
              value={newNoSurat}
              onChange={(e) => setNewNoSurat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tanggal Surat</label>
              <input
                id="form-sm-tgl-surat"
                type="date"
                value={newTglSurat}
                onChange={(e) => setNewTglSurat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tanggal Terima</label>
              <input
                id="form-sm-tgl-terima"
                type="date"
                value={newTglTerima}
                onChange={(e) => setNewTglTerima(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Pengirim / Asal Surat</label>
            <input
              id="form-sm-asal"
              type="text"
              placeholder="Contoh: Dinas Pendidikan Provinsi"
              value={newAsal}
              onChange={(e) => setNewAsal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Perihal Surat</label>
            <input
              id="form-sm-perihal"
              type="text"
              placeholder="Contoh: Undangan Rapat Koordinasi Kurikulum..."
              value={newPerihal}
              onChange={(e) => setNewPerihal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Sifat Surat</label>
              <select
                id="form-sm-sifat"
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
                id="form-sm-klasifikasi"
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

          {/* Lampiran file simulation */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Dokumen Lampiran (Mock PDF)</label>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500/40 transition-colors bg-slate-50 relative">
              <input
                id="form-sm-lampiran-input"
                type="text"
                placeholder="Masukkan nama file (contoh: Lampiran_Resmi.pdf)"
                value={newLampiranName}
                onChange={(e) => setNewLampiranName(e.target.value)}
                className="w-full bg-transparent border-none text-slate-800 text-xs text-center focus:outline-none placeholder-slate-400 font-semibold"
              />
              <span className="block text-[9px] text-slate-400 mt-1 font-medium">Simulasi Unggah: Ketik nama file untuk menambahkan lampiran mockup.</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              id="btn-save-draft"
              type="button"
              onClick={() => handleAddLetter('Draft')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Simpan Draft
            </button>
            <button
              id="btn-save-forward"
              type="button"
              onClick={() => handleAddLetter('Teruskan')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              <span>Teruskan ke Pimpinan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}
