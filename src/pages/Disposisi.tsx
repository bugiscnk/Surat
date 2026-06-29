import { useState, Dispatch, SetStateAction, FormEvent } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  Plus, 
  UserCheck, 
  Calendar, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  Send,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { Disposisi, SuratMasuk, User, UserRole } from '../types';
import Modal from '../components/Modal';

interface DisposisiProps {
  disposisi: Disposisi[];
  setDisposisi: Dispatch<SetStateAction<Disposisi[]>>;
  suratMasuk: SuratMasuk[];
  setSuratMasuk: Dispatch<SetStateAction<SuratMasuk[]>>;
  users: User[];
  currentRole: UserRole;
  currentUserId: string;
  onAddAuditLog: (suratId: string, action: string, description: string) => void;
  disposisiFormOpenForLetterId: string | null;
  setDisposisiFormOpenForLetterId: (id: string | null) => void;
}

export default function DisposisiPage({
  disposisi,
  setDisposisi,
  suratMasuk,
  setSuratMasuk,
  users,
  currentRole,
  currentUserId,
  onAddAuditLog,
  disposisiFormOpenForLetterId,
  setDisposisiFormOpenForLetterId
}: DisposisiProps) {
  
  // State for completing a task
  const [selectedDispToComplete, setSelectedDispToComplete] = useState<Disposisi | null>(null);
  const [completeCatatan, setCompleteCatatan] = useState('');
  const [completeDokumen, setCompleteDokumen] = useState('');

  // State for Pimpinan form
  const [selectedPelaksanaIds, setSelectedPelaksanaIds] = useState<string[]>([]);
  const [instruksiText, setInstruksiText] = useState('');
  const [tenggatWaktuDate, setTenggatWaktuDate] = useState('');

  // Pelaksana filter
  const pelaksanaUsers = users.filter(u => u.role === 'Pelaksana' && u.status === 'Aktif');

  // Kanban Categories for Pimpinan
  // Columns:
  // 1. "Menunggu Disposisi": Incoming letters with status 'Diteruskan' (needs assignment)
  // 2. "Dalam Pengerjaan": Active dispositions (status 'Menunggu' or 'Sedang Dikerjakan')
  // 3. "Selesai": Completed dispositions (status 'Selesai')
  
  const waitingLetters = suratMasuk.filter(s => s.status === 'Diteruskan');
  const activeDisposisi = disposisi.filter(d => d.status === 'Menunggu' || d.status === 'Sedang Dikerjakan');
  const completedDisposisi = disposisi.filter(d => d.status === 'Selesai');

  // Submit Disposition from Pimpinan
  const handleCreateDisposition = (e: FormEvent) => {
    e.preventDefault();
    if (!disposisiFormOpenForLetterId) return;
    if (selectedPelaksanaIds.length === 0 || !instruksiText || !tenggatWaktuDate) {
      alert('Mohon isi semua data: Pilih minimal 1 pelaksana, ketik instruksi, dan pilih tenggat waktu.');
      return;
    }

    const targetLetter = suratMasuk.find(s => s.id === disposisiFormOpenForLetterId);
    if (!targetLetter) return;

    const newDisp: Disposisi = {
      id: `disp-${Date.now()}`,
      suratMasukId: disposisiFormOpenForLetterId,
      pengirimId: currentUserId,
      pelaksanaIds: selectedPelaksanaIds,
      instruksi: instruksiText,
      tenggatWaktu: tenggatWaktuDate,
      status: 'Menunggu',
      tanggalDisposisi: new Date().toISOString().split('T')[0]
    };

    // Update state
    setDisposisi(prev => [newDisp, ...prev]);
    // Change letter status to 'Didisposisikan'
    setSuratMasuk(prev => prev.map(s => s.id === disposisiFormOpenForLetterId ? { ...s, status: 'Didisposisikan' } : s));
    
    // Add Audit Log
    const pelaksanaNames = selectedPelaksanaIds.map(id => users.find(u => u.id === id)?.nama.split(',')[0]).join(', ');
    onAddAuditLog(
      disposisiFormOpenForLetterId,
      'Pembuatan Disposisi',
      `Kepala Dinas menerbitkan instruksi disposisi kepada pelaksana [${pelaksanaNames}] dengan tenggat ${tenggatWaktuDate}. Instruksi: "${instruksiText}"`
    );

    // Reset Form & Close Modal
    setSelectedPelaksanaIds([]);
    setInstruksiText('');
    setTenggatWaktuDate('');
    setDisposisiFormOpenForLetterId(null);
  };

  // Pelaksana: Start task (Pending -> In Progress)
  const handleStartTask = (dispId: string, suratId: string) => {
    setDisposisi(prev => prev.map(d => d.id === dispId ? { ...d, status: 'Sedang Dikerjakan' } : d));
    
    const userObj = users.find(u => u.id === currentUserId);
    const aktorNama = userObj ? userObj.nama : 'Pelaksana';

    onAddAuditLog(
      suratId,
      'Mulai Tindak Lanjut',
      `${aktorNama} mulai memproses tugas disposisi dan merubah status menjadi "Sedang Dikerjakan".`
    );
  };

  // Pelaksana: Complete task (In Progress -> Completed)
  const handleCompleteTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDispToComplete || !completeCatatan) {
      alert('Mohon ketik catatan laporan hasil tindak lanjut.');
      return;
    }

    const dispId = selectedDispToComplete.id;
    const suratId = selectedDispToComplete.suratMasukId;

    // Update Disposisi
    setDisposisi(prev => prev.map(d => d.id === dispId ? { 
      ...d, 
      status: 'Selesai',
      catatanBalasan: completeCatatan,
      dokumenBalasan: completeDokumen || 'Dokumen_Balasan_Selesai.pdf'
    } : d));

    // Check if ALL dispositions for this letter are completed. If yes, mark letter as Completed ('Selesai')
    const linkedDisps = disposisi.filter(d => d.suratMasukId === suratId && d.id !== dispId);
    const allOthersDone = linkedDisps.every(d => d.status === 'Selesai');

    if (allOthersDone) {
      setSuratMasuk(prev => prev.map(s => s.id === suratId ? { ...s, status: 'Selesai' } : s));
    }

    const userObj = users.find(u => u.id === currentUserId);
    const aktorNama = userObj ? userObj.nama : 'Pelaksana';

    // Add Audit Log
    onAddAuditLog(
      suratId,
      'Tugas Disposisi Selesai',
      `${aktorNama} telah merampungkan tugas disposisi. Laporan: "${completeCatatan}". Dokumen balasan terunggah: ${completeDokumen || 'Dokumen_Balasan_Selesai.pdf'}`
    );

    // Reset Form & Close Modal
    setSelectedDispToComplete(null);
    setCompleteCatatan('');
    setCompleteDokumen('');
  };

  // Toggle multi-select pelaksana
  const togglePelaksana = (id: string) => {
    setSelectedPelaksanaIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Determine user role visibility
  const isPimpinanView = currentRole === 'Pimpinan' || currentRole === 'Super Admin' || currentRole === 'Admin Persuratan';
  const isPelaksanaView = currentRole === 'Pelaksana';

  // Filter tasks for logged-in Pelaksana
  const myTasks = disposisi.filter(d => d.pelaksanaIds.includes(currentUserId));

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. VIEW PIMPINAN / ADMIN (Kanban style tracking) */}
      {/* ========================================================= */}
      {isPimpinanView && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Menunggu Disposisi (Letters in 'Diteruskan' status) */}
          <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-3xl flex flex-col h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <h4 className="text-sm font-bold text-slate-800">Menunggu Disposisi</h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg text-[10px] font-mono font-bold">
                {waitingLetters.length} Surat
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {waitingLetters.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-xs italic font-sans font-medium">
                  Selesai! Tidak ada surat masuk baru yang menunggu tindakan.
                </div>
              ) : (
                waitingLetters.map((letter) => (
                  <div 
                    key={letter.id} 
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 hover:border-emerald-500/30 transition-all cursor-pointer group"
                    onClick={() => {
                      if (currentRole === 'Pimpinan' || currentRole === 'Super Admin') {
                        setDisposisiFormOpenForLetterId(letter.id);
                      } else {
                        alert('Hanya Pimpinan yang dapat mengeluarkan instruksi disposisi.');
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 font-bold truncate max-w-[120px]">{letter.nomorSurat}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 font-mono font-bold">
                        {letter.klasifikasi}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-normal">{letter.perihal}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                      <span className="font-semibold">Dari: {letter.asalSurat.split(' ')[0]}</span>
                      {(currentRole === 'Pimpinan' || currentRole === 'Super Admin') && (
                        <span className="text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5">
                          Tindak lanjut <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Sedang Dikerjakan (Active Dispositions) */}
          <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-3xl flex flex-col h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <h4 className="text-sm font-bold text-slate-800">Sedang Diproses</h4>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-150 rounded-lg text-[10px] font-mono font-bold">
                {activeDisposisi.length} Disposisi
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {activeDisposisi.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-xs italic font-sans font-medium">
                  Belum ada disposisi yang aktif.
                </div>
              ) : (
                activeDisposisi.map((disp) => {
                  const linkedLetter = suratMasuk.find(s => s.id === disp.suratMasukId);
                  const pelaksanaNames = disp.pelaksanaIds.map(id => users.find(u => u.id === id)?.nama.split(',')[0]).join(', ');
                  
                  return (
                    <div 
                      key={disp.id} 
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider">Tenggat: {disp.tenggatWaktu}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          disp.status === 'Sedang Dikerjakan' ? 'bg-blue-50 text-blue-700 border-blue-150' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {disp.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-normal">{linkedLetter?.perihal || 'Perihal...'}</p>
                      <p className="text-xs text-slate-600 font-medium italic">"Instruksi: {disp.instruksi}"</p>
                      <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-500 font-semibold">Pelaksana: {pelaksanaNames}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 3: Selesai (Completed tasks) */}
          <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-3xl flex flex-col h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <h4 className="text-sm font-bold text-slate-800">Selesai Ditindak</h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg text-[10px] font-mono font-bold">
                {completedDisposisi.length} Selesai
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {completedDisposisi.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-xs italic font-sans font-medium">
                  Belum ada laporan penyelesaian disposisi.
                </div>
              ) : (
                completedDisposisi.map((disp) => {
                  const linkedLetter = suratMasuk.find(s => s.id === disp.suratMasukId);
                  const pelaksanaNames = disp.pelaksanaIds.map(id => users.find(u => u.id === id)?.nama.split(',')[0]).join(', ');
                  
                  return (
                    <div 
                      key={disp.id} 
                      className="p-4 bg-emerald-50/10 border border-emerald-500/10 rounded-2xl space-y-3 hover:border-emerald-500/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">Diselesaikan: {disp.tanggalDisposisi}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 font-mono font-bold">
                          Selesai
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-normal">{linkedLetter?.perihal || 'Perihal...'}</p>
                      
                      <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 border border-slate-200 font-medium">
                        <span className="font-bold text-emerald-700 text-[10px] block mb-1">Laporan Hasil:</span>
                        "{disp.catatanBalasan}"
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-semibold">Oleh: {pelaksanaNames}</span>
                        {disp.dokumenBalasan && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <FileCheck className="h-3.5 w-3.5 shrink-0" /> Doc OK
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VIEW PELAKSANA (List of tasks specifically assigned to NIP) */}
      {/* ========================================================= */}
      {isPelaksanaView && (
        <div className="space-y-4 text-left max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              <h4 className="font-display font-extrabold text-slate-800">Daftar Penugasan & Disposisi Saya</h4>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">Total Tugas: {myTasks.length} Instruksi</span>
          </div>

          <div className="space-y-4">
            {myTasks.length === 0 ? (
              <div className="bg-white border border-slate-200 shadow-sm p-12 rounded-3xl text-center text-slate-400 text-xs font-sans font-medium">
                Luar biasa! Tidak ada instruksi disposisi tertunda untuk profil Anda hari ini.
              </div>
            ) : (
              myTasks.map((task) => {
                const matchSurat = suratMasuk.find(s => s.id === task.suratMasukId);
                
                return (
                  <div 
                    key={task.id} 
                    className={`bg-white border p-6 rounded-3xl shadow-sm transition-all ${
                      task.status === 'Selesai' 
                        ? 'border-emerald-500/20 bg-emerald-50/10' 
                        : 'border-slate-200 hover:border-emerald-500/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Surat Referensi</span>
                        <h4 className="text-sm font-bold text-slate-800 mt-1">{matchSurat?.perihal || 'Perihal Surat...'}</h4>
                        <p className="text-xs font-mono text-emerald-600 font-bold mt-1">{matchSurat?.nomorSurat} — Dari: {matchSurat?.asalSurat}</p>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex items-center gap-2 self-start sm:self-auto font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                          task.status === 'Selesai' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                            : task.status === 'Sedang Dikerjakan'
                              ? 'bg-blue-55 text-blue-700 border-blue-150'
                              : 'bg-amber-50 text-amber-700 border-amber-150'
                        }`}>
                          {task.status}
                        </span>
                        {task.status !== 'Selesai' && (
                          <span className="text-rose-700 text-[10px] font-mono font-bold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-150">
                            <AlertCircle className="h-3 w-3" /> Tenggat: {task.tenggatWaktu}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: Instruction details */}
                      <div className="md:col-span-2 space-y-3">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Instruksi Pimpinan</span>
                        <p className="text-xs text-slate-700 leading-relaxed font-bold italic">"{task.instruksi}"</p>
                        
                        {task.status === 'Selesai' && task.catatanBalasan && (
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs mt-3">
                            <span className="font-bold text-emerald-700 block mb-1">Laporan Balasan Hasil Anda:</span>
                            "{task.catatanBalasan}"
                            {task.dokumenBalasan && (
                              <p className="text-[10px] text-emerald-600 font-mono font-bold mt-2 flex items-center gap-1">
                                <FileCheck className="h-3.5 w-3.5 shrink-0" /> File: {task.dokumenBalasan}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Functional Workflow buttons for active state */}
                      {task.status !== 'Selesai' && (
                        <div className="flex flex-col justify-center gap-2 self-center w-full">
                          
                          {task.status === 'Menunggu' && (
                            <button
                              id={`btn-start-task-${task.id}`}
                              onClick={() => handleStartTask(task.id, task.suratMasukId)}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                            >
                              <Clock className="h-4 w-4 shrink-0" />
                              <span>Mulai Dikerjakan</span>
                            </button>
                          )}

                          {task.status === 'Sedang Dikerjakan' && (
                            <button
                              id={`btn-complete-task-trigger-${task.id}`}
                              onClick={() => setSelectedDispToComplete(task)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              <span>Selesaikan Tugas</span>
                            </button>
                          )}

                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL FORMS */}
      {/* ========================================================= */}
      
      {/* Modal A: Pimpinan drafting a new Disposition */}
      <Modal
        isOpen={disposisiFormOpenForLetterId !== null}
        onClose={() => setDisposisiFormOpenForLetterId(null)}
        title="Formulir Instruksi Disposisi"
        size="md"
      >
        {disposisiFormOpenForLetterId && (
          <form onSubmit={handleCreateDisposition} className="space-y-5 text-left">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Perihal Surat Terpilih</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {suratMasuk.find(s => s.id === disposisiFormOpenForLetterId)?.perihal}
              </p>
            </div>

            {/* Select Executors (Multi-Select Checklist) */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">Pilih Pelaksana / Staff</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50">
                {pelaksanaUsers.map((u) => {
                  const isChecked = selectedPelaksanaIds.includes(u.id);
                  return (
                    <button
                      id={`checkbox-pelaksana-${u.id}`}
                      key={u.id}
                      type="button"
                      onClick={() => togglePelaksana(u.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                        isChecked 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                          : 'hover:bg-slate-200 text-slate-600 font-semibold'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        readOnly 
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3 w-3 shrink-0" 
                      />
                      <div className="min-w-0">
                        <p className="font-bold truncate text-slate-800">{u.nama.split(',')[0]}</p>
                        <p className="text-[9px] text-slate-500 font-semibold truncate">{u.jabatan}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction Notes */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Instruksi Catatan Disposisi</label>
              <textarea
                id="form-disp-instruksi"
                placeholder="Tulis perintah tindak lanjut resmi untuk pelaksana..."
                value={instruksiText}
                onChange={(e) => setInstruksiText(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Tenggat Waktu Tindak Lanjut</label>
              <input
                id="form-disp-tenggat"
                type="date"
                value={tenggatWaktuDate}
                onChange={(e) => setTenggatWaktuDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                id="btn-cancel-disp"
                type="button"
                onClick={() => setDisposisiFormOpenForLetterId(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-submit-disp"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Kirim Disposisi Resmi</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal B: Pelaksana uploading reports to complete a task */}
      <Modal
        isOpen={selectedDispToComplete !== null}
        onClose={() => setSelectedDispToComplete(null)}
        title="Laporan Penyelesaian Disposisi"
        size="md"
      >
        {selectedDispToComplete && (
          <form onSubmit={handleCompleteTaskSubmit} className="space-y-4 text-left">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Tugas Referensi</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                "{selectedDispToComplete.instruksi}"
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Catatan Laporan Hasil Tindak Lanjut</label>
              <textarea
                id="form-task-catatan"
                placeholder="Jelaskan langkah-langkah, hasil konfirmasi, atau tindak lanjut sukses yang telah Anda laksanakan..."
                value={completeCatatan}
                onChange={(e) => setCompleteCatatan(e.target.value)}
                rows={4}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Unggah Berkas Bukti Balasan (Simulasi)</label>
              <input
                id="form-task-file"
                type="text"
                placeholder="Masukkan nama file hasil lampiran (contoh: Laporan_Final_Rapat.pdf)"
                value={completeDokumen}
                onChange={(e) => setCompleteDokumen(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white font-semibold"
              />
              <span className="block text-[9px] text-slate-400 mt-1 font-semibold">Simulasi: Berkas yang dilaporkan akan terarsip resmi ke dalam dossier persuratan.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                id="btn-cancel-complete-task"
                type="button"
                onClick={() => setSelectedDispToComplete(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Kembali
              </button>
              <button
                id="btn-submit-complete-task"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Simpan & Selesaikan</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
