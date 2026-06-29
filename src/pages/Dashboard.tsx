import { Inbox, Send, ClipboardCopy, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { SuratMasuk, SuratKeluar, Disposisi, SifatSurat, User } from '../types';

interface DashboardProps {
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  disposisi: Disposisi[];
  users: User[];
  onNavigate: (tab: string) => void;
  onViewLetter: (id: string, type: 'Masuk' | 'Keluar') => void;
}

export default function Dashboard({
  suratMasuk,
  suratKeluar,
  disposisi,
  users,
  onNavigate,
  onViewLetter
}: DashboardProps) {
  
  // Calculate analytics
  const totalMasuk = suratMasuk.length;
  const totalKeluar = suratKeluar.length;
  
  const disposisiAktifCount = disposisi.filter(d => d.status === 'Menunggu' || d.status === 'Sedang Dikerjakan').length;
  const disposisiSelesaiCount = disposisi.filter(d => d.status === 'Selesai').length;

  // Get 5 latest incoming letters
  const latestSuratMasuk = [...suratMasuk]
    .sort((a, b) => new Date(b.tanggalTerima).getTime() - new Date(a.tanggalTerima).getTime())
    .slice(0, 5);

  // Get urgent active dispositions (e.g., sorted by deadline closest)
  const urgentDisposisi = disposisi
    .filter(d => d.status === 'Menunggu' || d.status === 'Sedang Dikerjakan')
    .sort((a, b) => new Date(a.tenggatWaktu).getTime() - new Date(b.tenggatWaktu).getTime())
    .slice(0, 4);

  // Calculate stats for Classification
  const classificationStats = {
    Umum: suratMasuk.filter(s => s.klasifikasi === 'Umum').length,
    Keuangan: suratMasuk.filter(s => s.klasifikasi === 'Keuangan').length,
    Kepegawaian: suratMasuk.filter(s => s.klasifikasi === 'Kepegawaian').length,
    Akademik: suratMasuk.filter(s => s.klasifikasi === 'Akademik').length,
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

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Surat Masuk */}
        <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md p-6 rounded-3xl flex items-center justify-between group relative overflow-hidden transition-all duration-300">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Surat Masuk</span>
            <h3 className="text-3xl font-display font-extrabold text-slate-900 group-hover:scale-105 transition-transform duration-300 leading-none">{totalMasuk}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="text-emerald-600 font-bold font-mono">↑ 100%</span>
              <span>Terarsip digital</span>
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 relative z-10">
            <Inbox className="h-6 w-6" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        {/* Card 2: Surat Keluar */}
        <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md p-6 rounded-3xl flex items-center justify-between group relative overflow-hidden transition-all duration-300">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Surat Keluar</span>
            <h3 className="text-3xl font-display font-extrabold text-slate-900 group-hover:scale-105 transition-transform duration-300 leading-none">{totalKeluar}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="text-teal-600 font-bold font-mono">↑ 80%</span>
              <span>Terregistrasi keluar</span>
            </p>
          </div>
          <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 relative z-10">
            <Send className="h-6 w-6" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors" />
        </div>

        {/* Card 3: Disposisi Aktif */}
        <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md p-6 rounded-3xl flex items-center justify-between group relative overflow-hidden transition-all duration-300">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Disposisi Aktif</span>
            <h3 className="text-3xl font-display font-extrabold text-slate-900 group-hover:scale-105 transition-transform duration-300 leading-none">{disposisiAktifCount}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="text-amber-600 font-bold font-mono">{disposisiAktifCount} tugas</span>
              <span>Sedang dipantau</span>
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 relative z-10">
            <Clock className="h-6 w-6" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
        </div>

        {/* Card 4: Disposisi Selesai */}
        <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md p-6 rounded-3xl flex items-center justify-between group relative overflow-hidden transition-all duration-300">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Tugas Selesai</span>
            <h3 className="text-3xl font-display font-extrabold text-slate-900 group-hover:scale-105 transition-transform duration-300 leading-none">{disposisiSelesaiCount}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="text-emerald-600 font-bold font-mono">↑ Selesai</span>
              <span>Tindak lanjut sukses</span>
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 relative z-10">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>

      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left widget: Weekly letters trend (CSS Visual Bar Chart) */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 font-display">Tren Registrasi Surat Mingguan</h4>
              <p className="text-xs text-slate-400">Jumlah surat masuk dan keluar 5 hari terakhir.</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Masuk</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-600 font-bold">
                <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse" />
                <span>Keluar</span>
              </div>
            </div>
          </div>

          {/* Graphical Proportional Bars */}
          <div className="h-64 flex items-end justify-between px-4 pt-4 border-b border-slate-100 font-sans">
            {[
              { day: 'Sen', masuk: 3, keluar: 1 },
              { day: 'Sel', masuk: 2, keluar: 2 },
              { day: 'Rab', masuk: 4, keluar: 0 },
              { day: 'Kam', masuk: 1, keluar: 1 },
              { day: 'Jum', masuk: 2, keluar: 1 },
            ].map((dayData, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 w-1/5">
                <div className="flex items-end gap-2 h-44">
                  {/* Masuk Bar */}
                  <div className="relative group flex flex-col items-center">
                    <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-800 text-[10px] text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded transition-all duration-200 whitespace-nowrap z-10">
                      {dayData.masuk} Surat
                    </span>
                    <div 
                      style={{ height: `${dayData.masuk * 28}px` }} 
                      className="w-4 sm:w-6 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg shadow-lg shadow-emerald-500/15 cursor-pointer hover:from-emerald-400 hover:to-emerald-300 transition-all duration-300"
                    />
                  </div>
                  {/* Keluar Bar */}
                  <div className="relative group flex flex-col items-center">
                    <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-800 text-[10px] text-teal-300 font-mono font-bold px-1.5 py-0.5 rounded transition-all duration-200 whitespace-nowrap z-10">
                      {dayData.keluar} Surat
                    </span>
                    <div 
                      style={{ height: `${dayData.keluar * 28}px` }} 
                      className="w-4 sm:w-6 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg shadow-lg shadow-teal-500/15 cursor-pointer hover:from-teal-400 hover:to-teal-300 transition-all duration-300"
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-semibold font-mono">{dayData.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right widget: Classification Distribution Ratio */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 font-display">Klasifikasi Arsip Surat</h4>
            <p className="text-xs text-slate-400">Distribusi berdasarkan bidang administrasi.</p>
          </div>

          {/* Simple Ratio Bars */}
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {Object.entries(classificationStats).map(([key, value]) => {
              const maxVal = Math.max(...Object.values(classificationStats)) || 1;
              const percentage = Math.round((value / totalMasuk) * 100) || 0;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 font-sans">{key}</span>
                    <span className="text-slate-500 font-mono">{value} surat ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(value / maxVal) * 100}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Total Klasifikasi: {totalMasuk} Dokumen</span>
          </div>
        </div>

      </div>

      {/* Tables Section: Latest letters and urgent dispositions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Latest Letters list */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 font-display">Surat Masuk Terbaru</h4>
            <button 
              id="dashboard-go-surat-masuk"
              onClick={() => onNavigate('surat-masuk')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Semua Surat</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono font-bold">
                  <th className="py-3 px-2">Nomor Surat</th>
                  <th className="py-3 px-2">Pengirim</th>
                  <th className="py-3 px-2">Perihal</th>
                  <th className="py-3 px-2">Sifat</th>
                  <th className="py-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestSuratMasuk.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-emerald-600 font-bold whitespace-nowrap">{item.nomorSurat}</td>
                    <td className="py-3.5 px-2 font-sans text-slate-800 truncate max-w-[120px]">{item.asalSurat}</td>
                    <td className="py-3.5 px-2 font-sans text-slate-600 truncate max-w-[180px]" title={item.perihal}>{item.perihal}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getSifatBadgeColor(item.sifat)}`}>
                        {item.sifat}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        id={`btn-view-sm-dash-${item.id}`}
                        onClick={() => onViewLetter(item.id, 'Masuk')}
                        className="text-emerald-600 hover:text-emerald-700 font-bold"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Urgent Active Dispositions */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 font-display">Disposisi Mendesak</h4>
            <button 
              id="dashboard-go-disposisi"
              onClick={() => onNavigate('disposisi')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Semua Tugas</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {urgentDisposisi.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tidak ada disposisi aktif yang mendesak.
              </div>
            ) : (
              urgentDisposisi.map((item) => {
                const matchSurat = suratMasuk.find(s => s.id === item.suratMasukId);
                const pelaksanaNames = item.pelaksanaIds.map(id => users.find(u => u.id === id)?.nama.split(',')[0]).join(', ');
                
                return (
                  <div 
                    key={item.id} 
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 hover:border-emerald-500/25 hover:bg-emerald-50/10 transition-all cursor-pointer shadow-sm"
                    onClick={() => {
                      if (matchSurat) onViewLetter(matchSurat.id, 'Masuk');
                    }}
                  >
                    <div className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg shrink-0 mt-0.5">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-rose-600 font-bold uppercase tracking-wider">Tenggat: {item.tenggatWaktu}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          item.status === 'Menunggu' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-1.5 truncate">{matchSurat?.perihal || 'Perihal surat...'}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">Pelaksana: {pelaksanaNames}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
