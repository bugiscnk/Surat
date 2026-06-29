import React, { useState, FormEvent } from 'react';
import { 
  Inbox, 
  User as UserIcon, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Send, 
  CheckCircle2, 
  FileCheck,
  X,
  Info,
  FileText,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { Disposisi, SuratMasuk, User, UserRole } from '../types';
import Modal from '../components/Modal';

interface DisposisiProps {
  disposisi: Disposisi[];
  setDisposisi: React.Dispatch<React.SetStateAction<Disposisi[]>>;
  suratMasuk: SuratMasuk[];
  setSuratMasuk: React.Dispatch<React.SetStateAction<SuratMasuk[]>>;
  users: User[];
  currentUserId: string;
  currentRole: UserRole;
  onAddAuditLog: (action: string, description: string) => void;
  onTriggerNotification: (userId: string, title: string, message: string) => void;
}

export default function DisposisiPage({
  disposisi,
  setDisposisi,
  suratMasuk,
  setSuratMasuk,
  users,
  currentUserId,
  currentRole,
  onAddAuditLog,
  onTriggerNotification
}: DisposisiProps) {

  // Multi-tab design: Tugas Disposisi vs Pusat Berkas Disposisi
  const [activeSubTab, setActiveSubTab] = useState<'tugas' | 'berkas'>('tugas');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Modal form states
  const [disposisiFormOpenForLetterId, setDisposisiFormOpenForLetterId] = useState<string | null>(null);
  const [selectedPelaksanaIds, setSelectedPelaksanaIds] = useState<string[]>([]);
  const [instruksiText, setInstruksiText] = useState('');
  const [tenggatWaktuDate, setTenggatWaktuDate] = useState('');

  // Pelaksana Response / Complete Task states
  const [selectedDispToComplete, setSelectedDispToComplete] = useState<Disposisi | null>(null);
  const [completeCatatan, setCompleteCatatan] = useState('');
  const [completeDokumen, setCompleteDokumen] = useState('');

  // Selected item details
  const [selectedDispDetailsId, setSelectedDispDetailsId] = useState<string | null>(null);

  // Custom feedback states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [pimpinanFormError, setPimpinanFormError] = useState<string | null>(null);
  const [pelaksanaFormError, setPelaksanaFormError] = useState<string | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Pelaksana user filtering
  const pelaksanaUsers = users.filter(u => u.role === 'Pelaksana' && u.status === 'Aktif');

  // Helper: Get user details
  const getUserById = (id: string) => users.find(u => u.id === id);

  // Helper: Get letter details
  const getLetterById = (id: string) => suratMasuk.find(l => l.id === id);

  // 1. Pimpinan: Create Disposition
  const handleCreateDisposition = (e: FormEvent) => {
    e.preventDefault();
    if (!disposisiFormOpenForLetterId) return;
    if (selectedPelaksanaIds.length === 0 || !instruksiText.trim() || !tenggatWaktuDate) {
      setPimpinanFormError('Mohon isi semua data: Pilih minimal 1 pelaksana, ketik instruksi, dan pilih tenggat waktu.');
      return;
    }

    const newDisp: Disposisi = {
      id: `disp-${Date.now()}`,
      suratMasukId: disposisiFormOpenForLetterId,
      pengirimId: currentUserId,
      pelaksanaIds: selectedPelaksanaIds,
      instruksi: instruksiText.trim(),
      tenggatWaktu: tenggatWaktuDate,
      status: 'Menunggu',
      tanggalDisposisi: new Date().toISOString().split('T')[0]
    };

    setDisposisi(prev => [...prev, newDisp]);

    // Update Surat Masuk status to 'Disposisi'
    setSuratMasuk(prev => prev.map(s => s.id === disposisiFormOpenForLetterId ? { ...s, status: 'Disposisi' } : s));

    // Audit Log & Notifications
    const pelaksanaNames = selectedPelaksanaIds.map(pid => getUserById(pid)?.nama || '').join(', ');
    onAddAuditLog(
      'Penerbitan Disposisi',
      `Menerbitkan instruksi disposisi kepada pelaksana [${pelaksanaNames}] dengan tenggat ${tenggatWaktuDate}. Instruksi: "${instruksiText}"`
    );

    // Send notifications to all assigned pelaksana
    selectedPelaksanaIds.forEach(pid => {
      onTriggerNotification(
        pid,
        'Tugas Disposisi Baru',
        `Pimpinan memberi instruksi disposisi perihal "${getLetterById(disposisiFormOpenForLetterId)?.perihal || ''}"`
      );
    });

    triggerToast('Disposisi berhasil diterbitkan ke Pelaksana!', 'success');
    setPimpinanFormError(null);

    // Reset Form & Close Modal
    setSelectedPelaksanaIds([]);
    setInstruksiText('');
    setTenggatWaktuDate('');
    setDisposisiFormOpenForLetterId(null);
  };

  // 2. Pelaksana: Accept/Process Task (Menunggu -> Sedang Dikerjakan)
  const handleStartTask = (dispId: string) => {
    const disp = disposisi.find(d => d.id === dispId);
    if (!disp) return;

    setDisposisi(prev => prev.map(d => d.id === dispId ? { ...d, status: 'Sedang Dikerjakan' } : d));

    const aktorNama = getUserById(currentUserId)?.nama || 'Pelaksana';
    onAddAuditLog(
      'Mulai Tindak Lanjut',
      `${aktorNama} mulai memproses tugas disposisi dan merubah status menjadi "Sedang Dikerjakan".`
    );

    // Notify Pimpinan
    onTriggerNotification(
      disp.pengirimId,
      'Disposisi Mulai Diproses',
      `Tugas disposisi surat ${getLetterById(disp.suratMasukId)?.nomorSurat} sedang dikerjakan oleh ${aktorNama}.`
    );

    triggerToast('Tugas disposisi mulai dikerjakan!', 'info');
  };

  // 3. Pelaksana: Submit Completed Form
  const handleCompleteTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDispToComplete || !completeCatatan.trim()) {
      setPelaksanaFormError('Mohon ketik catatan laporan hasil tindak lanjut.');
      return;
    }

    const dispId = selectedDispToComplete.id;
    setDisposisi(prev => prev.map(d => d.id === dispId ? { 
      ...d, 
      status: 'Selesai',
      catatanBalasan: completeCatatan.trim(),
      dokumenBalasan: completeDokumen.trim() || 'Dokumen_Balasan_Selesai.pdf'
    } : d));

    // Also update associated SuratMasuk to 'Selesai' if all linked dispositions are finished
    const associatedLetterId = selectedDispToComplete.suratMasukId;
    setSuratMasuk(prev => prev.map(s => s.id === associatedLetterId ? { ...s, status: 'Selesai' } : s));

    const aktorNama = getUserById(currentUserId)?.nama || 'Pelaksana';
    
    // Audit log
    onAddAuditLog(
      'Penyelesaian Tugas Disposisi',
      `${aktorNama} telah merampungkan tugas disposisi. Laporan: "${completeCatatan}". Dokumen balasan terunggah: ${completeDokumen || 'Dokumen_Balasan_Selesai.pdf'}`
    );

    // Notify Pimpinan
    onTriggerNotification(
      selectedDispToComplete.pengirimId,
      'Tindak Lanjut Disposisi Selesai',
      `${aktorNama} telah merampungkan instruksi disposisi perihal "${getLetterById(associatedLetterId)?.perihal || ''}".`
    );

    triggerToast('Tindak lanjut disposisi berhasil diselesaikan!', 'success');
    setPelaksanaFormError(null);

    // Reset Form & Close Modal
    setSelectedDispToComplete(null);
    setCompleteCatatan('');
    setCompleteDokumen('');
  };

  // Filter Dispositions for the list
  const filteredDispositions = disposisi.filter(item => {
    const letter = getLetterById(item.suratMasukId);
    if (!letter) return false;

    // Search query matched with letter metadata or instruction
    const matchesSearch = 
      letter.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.asalSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instruksi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;

    // Visibility mapping based on role
    let isVisible = false;
    if (currentRole === 'Super Admin' || currentRole === 'Admin Persuratan') {
      isVisible = true; // All visibility
    } else if (currentRole === 'Pimpinan') {
      isVisible = item.pengirimId === currentUserId; // Dispositions created by this boss
    } else if (currentRole === 'Pelaksana') {
      isVisible = item.pelaksanaIds.includes(currentUserId); // Dispositions sent to this staff
    }

    return matchesSearch && matchesStatus && isVisible;
  });

  // Get all unique Letters that have been dispositioned
  const lettersInDisposition = suratMasuk.filter(s => s.status === 'Disposisi' || s.status === 'Selesai');

  // Filtered Letters for "Pusat Berkas Disposisi"
  const filteredBerkas = lettersInDisposition.filter(letter => {
    // Check if the current user has visibility to at least one linked disposition
    const linkedDisps = disposisi.filter(d => d.suratMasukId === letter.id);
    const hasAccess = currentRole === 'Super Admin' || currentRole === 'Admin Persuratan' ||
      (currentRole === 'Pimpinan' && linkedDisps.some(d => d.pengirimId === currentUserId)) ||
      (currentRole === 'Pelaksana' && linkedDisps.some(d => d.pelaksanaIds.includes(currentUserId)));

    if (!hasAccess) return false;

    const matchesSearch = 
      letter.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.asalSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (letter.lampiran && letter.lampiran.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const selectedDispDetail = disposisi.find(d => d.id === selectedDispDetailsId);

  return (
    <div className="space-y-6">
      
      {/* Search and Tab Selection Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-150 pb-0.5 gap-6">
          <button
            id="tab-disposisi-tugas"
            onClick={() => {
              setActiveSubTab('tugas');
              setSearchQuery('');
            }}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'tugas' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Alur Disposisi & Tugas</span>
            {activeSubTab === 'tugas' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-in fade-in duration-300" />
            )}
          </button>

          <button
            id="tab-disposisi-berkas"
            onClick={() => {
              setActiveSubTab('berkas');
              setSearchQuery('');
            }}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'berkas' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Pusat Berkas Disposisi</span>
            {activeSubTab === 'berkas' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-in fade-in duration-300" />
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-search-disposisi"
              type="text"
              placeholder={activeSubTab === 'tugas' ? "Cari nomor surat, pelaksana, instruksi..." : "Cari nama file, nomor surat, perihal..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>

          {activeSubTab === 'tugas' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Status Tugas:</span>
              <select
                id="filter-status-disposisi"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:border-emerald-500 outline-none transition-all cursor-pointer"
              >
                <option value="Semua">Semua Progres</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Sedang Dikerjakan">Sedang Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          )}

          {/* Rapid Action shortcut for boss */}
          {currentRole === 'Pimpinan' && activeSubTab === 'tugas' && (
            <div className="text-xs text-slate-500 font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-150 flex items-center gap-1">
              <Info className="h-4 w-4 shrink-0" />
              <span>Gunakan halaman <strong>Surat Masuk</strong> untuk menerbitkan disposisi baru.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Conditional view based on activeSubTab */}
      {activeSubTab === 'tugas' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Dispositions List Table */}
          <div className={`bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm transition-all duration-300 ${selectedDispDetailsId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150">
                    <th className="py-3 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Referensi Surat</th>
                    <th className="py-3 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Instruksi Pimpinan</th>
                    <th className="py-3 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Tenggat Waktu</th>
                    <th className="py-3 px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="py-3 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDispositions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <FileCheck className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs">Belum ada catatan disposisi yang terdaftar.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDispositions.map((item) => {
                      const letter = getLetterById(item.suratMasukId);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedDispDetailsId(item.id)}
                          className={`hover:bg-slate-50/50 transition-all cursor-pointer ${
                            selectedDispDetailsId === item.id ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-800 text-[11px]">
                              {letter?.nomorSurat}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium truncate max-w-[150px] mt-0.5">
                              {letter?.asalSurat}
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                              Disposisi: {item.tanggalDisposisi}
                            </span>
                          </td>
                          <td className="py-4 px-3">
                            <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed max-w-[280px]">
                              {item.instruksi}
                            </p>
                            <span className="text-[9px] text-emerald-600 font-bold block mt-1 truncate">
                              Ke: {item.pelaksanaIds.map(pid => getUserById(pid)?.nama.split(',')[0]).join(', ')}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className="text-[10px] font-bold text-slate-700 font-mono">
                              {item.tenggatWaktu}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              item.status === 'Menunggu'
                                ? 'bg-amber-50 text-amber-700 border-amber-150 animate-pulse'
                                : item.status === 'Sedang Dikerjakan'
                                  ? 'bg-blue-50 text-blue-700 border-blue-150'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                            }`}>
                              {item.status === 'Sedang Dikerjakan' ? 'Sedang Diproses' : item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Pelaksana action: Start processing task */}
                              {item.status === 'Menunggu' && currentRole === 'Pelaksana' && (
                                <button
                                  id={`btn-start-task-${item.id}`}
                                  onClick={() => handleStartTask(item.id)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-blue-600/10"
                                >
                                  <span>Proses</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}

                              {/* Pelaksana action: Submit completed response reports */}
                              {item.status === 'Sedang Dikerjakan' && currentRole === 'Pelaksana' && (
                                <button
                                  id={`btn-trigger-complete-${item.id}`}
                                  onClick={() => setSelectedDispToComplete(item)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/10"
                                >
                                  <span>Laporkan</span>
                                  <Send className="h-3 w-3" />
                                </button>
                              )}

                              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                                #{item.id.split('-')[1]}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details side viewer panel */}
          {selectedDispDetailsId && selectedDispDetail && (() => {
            const letter = getLetterById(selectedDispDetail.suratMasukId);
            return (
              <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4 animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800">Detail Disposisi & Berkas</h3>
                  <button
                    id="btn-close-detail-panel-disp"
                    onClick={() => setSelectedDispDetailsId(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Surat Terkait</span>
                    <p className="text-xs font-black text-slate-800 mt-0.5">{letter?.nomorSurat}</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{letter?.asalSurat}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Instruksi Kepala Dinas</span>
                    <p className="text-[11px] font-semibold text-slate-700 bg-amber-50/40 border border-amber-100 p-3 rounded-xl mt-1 leading-relaxed">
                      "{selectedDispDetail.instruksi}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Tanggal Disposisi</span>
                      <p className="text-[10px] font-bold text-slate-700 mt-0.5">{selectedDispDetail.tanggalDisposisi}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Tenggat Penyelesaian</span>
                      <p className="text-[10px] font-bold text-rose-600 mt-0.5 font-mono">{selectedDispDetail.tenggatWaktu}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Pelaksana Terpilih</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedDispDetail.pelaksanaIds.map(pid => {
                        const u = getUserById(pid);
                        return (
                          <span key={pid} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            <UserIcon className="h-3 w-3 text-slate-500" />
                            {u?.nama.split(',')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attachment physical document of incoming letter */}
                  {letter?.lampiran && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[130px]">{letter.lampiran}</span>
                      </div>
                      <button
                        onClick={() => alert(`Membuka berkas: ${letter.lampiran}`)}
                        className="text-[9px] font-extrabold bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 px-2 py-1 rounded-lg"
                      >
                        Buka
                      </button>
                    </div>
                  )}

                  {/* Reply from pelaksana (Balasan / Hasil laporan) */}
                  {selectedDispDetail.status === 'Selesai' && (
                    <div className="border-t border-slate-100 pt-3.5 space-y-2">
                      <span className="text-[9px] font-mono text-emerald-600 uppercase tracking-wider font-extrabold block">Laporan Tindak Lanjut Pelaksana</span>
                      <p className="text-[11px] font-semibold text-slate-600 bg-emerald-50/20 border border-emerald-100 p-3 rounded-xl leading-relaxed">
                        "{selectedDispDetail.catatanBalasan}"
                      </p>
                      {selectedDispDetail.dokumenBalasan && (
                        <div className="flex items-center justify-between bg-emerald-50/10 border border-emerald-100/50 p-2.5 rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[140px]">{selectedDispDetail.dokumenBalasan}</span>
                          </div>
                          <button
                            onClick={() => alert(`Membuka berkas balasan: ${selectedDispDetail.dokumenBalasan}`)}
                            className="text-[9px] font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-2 py-1 rounded-lg"
                          >
                            Buka Laporan
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })()}

        </div>
      ) : (
        /* Pusat Berkas Disposisi View (NEW!) */
        <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm p-6 text-left space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800">Daftar Arsip & Berkas yang di-Disposisi</h3>
              <p className="text-[10px] text-slate-400 mt-1">Daftar seluruh dokumen lampiran surat resmi yang sedang atau telah melalui proses lembar disposisi pimpinan.</p>
            </div>
            <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <span>{filteredBerkas.length} Berkas Fisik</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBerkas.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                <Inbox className="h-10 w-10 text-slate-200 mx-auto mb-2.5" />
                <p className="text-xs font-bold">Belum ada berkas surat yang di-disposisi.</p>
                <p className="text-[10px] mt-1">Berkas akan tampil di sini setelah surat masuk diteruskan dan didelegasikan oleh Kepala Dinas.</p>
              </div>
            ) : (
              filteredBerkas.map((letter) => {
                const linkedDisps = disposisi.filter(d => d.suratMasukId === letter.id);
                return (
                  <div 
                    key={letter.id}
                    className="border border-slate-150 hover:border-emerald-500/40 hover:shadow-md rounded-2xl p-4.5 transition-all bg-slate-50/50 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          {letter.klasifikasi}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">
                          {letter.tanggalTerima}
                        </span>
                      </div>
                      
                      <h4 className="text-[11px] font-black text-slate-800 leading-snug line-clamp-1">
                        {letter.nomorSurat}
                      </h4>
                      
                      <p className="text-[10px] text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                        {letter.perihal}
                      </p>
                      
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold block">Instruksi Pimpinan Terkait:</span>
                        {linkedDisps.map(disp => (
                          <div key={disp.id} className="text-[10px] text-slate-600 font-medium bg-white border border-slate-150 p-2 rounded-xl">
                            <p className="line-clamp-2 leading-relaxed italic">"{disp.instruksi}"</p>
                            <span className="text-[9px] font-bold text-slate-400 mt-1 block font-mono">
                              Oleh: Kepala Dinas &bull; Status: {disp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4.5 w-4.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">
                          {letter.lampiran || 'Unduhan_Arsip.pdf'}
                        </span>
                      </div>
                      <button
                        onClick={() => alert(`Membuka berkas digital: ${letter.lampiran || 'Unduhan_Arsip.pdf'}`)}
                        className="text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        Lihat Berkas
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: Pimpinan Creates Disposition */}
      {disposisiFormOpenForLetterId && (() => {
        const letter = getLetterById(disposisiFormOpenForLetterId);
        return (
          <Modal
            isOpen={disposisiFormOpenForLetterId !== null}
            onClose={() => {
              setDisposisiFormOpenForLetterId(null);
              setPimpinanFormError(null);
            }}
            title="Terbitkan Lembar Disposisi"
            size="md"
          >
            {disposisiFormOpenForLetterId && (
              <form onSubmit={handleCreateDisposition} className="space-y-5 text-left">
                {pimpinanFormError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{pimpinanFormError}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Perihal Surat Terpilih</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {letter?.perihal}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    No: {letter?.nomorSurat} &bull; Pengirim: {letter?.asalSurat}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">Pilih Pelaksana Penerima Tugas (Bisa multi-pilih)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                    {pelaksanaUsers.map(user => {
                      const isSelected = selectedPelaksanaIds.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPelaksanaIds(prev => prev.filter(id => id !== user.id));
                            } else {
                              setSelectedPelaksanaIds(prev => [...prev, user.id]);
                            }
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all text-xs font-bold cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate">{user.nama.split(',')[0]}</p>
                            <span className="text-[9px] font-mono text-slate-400 block">{user.jabatan}</span>
                          </div>
                          {isSelected && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Instruksi Pokok / Arahan Pimpinan</label>
                  <textarea
                    id="input-instruksi-disposisi"
                    required
                    rows={4}
                    placeholder="Tulis instruksi tindak lanjut dengan bahasa yang jelas, lugas, dan terperinci..."
                    value={instruksiText}
                    onChange={(e) => setInstruksiText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tenggat Waktu Penyelesaian</label>
                  <input
                    id="input-tenggat-disposisi"
                    type="date"
                    required
                    value={tenggatWaktuDate}
                    onChange={(e) => setTenggatWaktuDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="btn-cancel-create-disp"
                    type="button"
                    onClick={() => {
                      setDisposisiFormOpenForLetterId(null);
                      setPimpinanFormError(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-confirm-create-disp"
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
                  >
                    Terbitkan Disposisi
                  </button>
                </div>
              </form>
            )}
          </Modal>
        );
      })()}

      {/* Modal: Pelaksana Submits Response Reports */}
      <Modal
        isOpen={selectedDispToComplete !== null}
        onClose={() => {
          setSelectedDispToComplete(null);
          setPelaksanaFormError(null);
        }}
        title="Laporkan Hasil Tindak Lanjut"
        size="md"
      >
        {selectedDispToComplete && (
          <form onSubmit={handleCompleteTaskSubmit} className="space-y-4 text-left">
            {pelaksanaFormError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{pelaksanaFormError}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Tugas Referensi</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {getLetterById(selectedDispToComplete.suratMasukId)?.perihal}
              </p>
              <p className="text-[10px] text-slate-500 italic mt-1 bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg">
                "Instruksi: {selectedDispToComplete.instruksi}"
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Catatan Balasan / Laporan Hasil Penyelesaian</label>
              <textarea
                id="input-catatan-balasan"
                required
                rows={5}
                placeholder="Tuliskan poin-poin penting laporan hasil kegiatan atau koordinasi yang telah dirampungkan sesuai arahan..."
                value={completeCatatan}
                onChange={(e) => setCompleteCatatan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Nama Berkas Bukti Dukung (PDF/Doc)</label>
              <input
                id="input-dokumen-balasan"
                type="text"
                placeholder="Contoh: Berita_Acara_Hasil_Tindak_Lanjut.pdf"
                value={completeDokumen}
                onChange={(e) => setCompleteDokumen(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                id="btn-cancel-complete-task"
                type="button"
                onClick={() => {
                  setSelectedDispToComplete(null);
                  setPelaksanaFormError(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-complete-task"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
              >
                Kirim Laporan Resmi
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Floating Action Feedback: Toast Notification */}
      {toast && (
        <div 
          id="toast-notification-disp"
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
            id="toast-close-btn-disp"
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
