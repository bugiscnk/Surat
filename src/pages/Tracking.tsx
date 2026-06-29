import { useState } from 'react';
import { Search, MapPin, Inbox, Send, ChevronRight, CheckCircle2, History } from 'lucide-react';
import { SuratMasuk, SuratKeluar, AuditTrail, SifatSurat } from '../types';
import Timeline from '../components/Timeline';

interface TrackingProps {
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  auditTrail: AuditTrail[];
  selectedLetterIdFromGlobal: string | null;
  setSelectedLetterIdFromGlobal: (id: string | null) => void;
}

export default function TrackingPage({
  suratMasuk,
  suratKeluar,
  auditTrail,
  selectedLetterIdFromGlobal,
  setSelectedLetterIdFromGlobal
}: TrackingProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetterType, setSelectedLetterType] = useState<'Masuk' | 'Keluar'>('Masuk');

  // Find selected letter
  const selectedLetter = selectedLetterType === 'Masuk' 
    ? suratMasuk.find(l => l.id === selectedLetterIdFromGlobal) 
    : suratKeluar.find(l => l.id === selectedLetterIdFromGlobal);

  // Search input change helper
  const allLettersForSelection = [
    ...suratMasuk.map(l => ({ ...l, type: 'Masuk' })),
    ...suratKeluar.map(l => ({ ...l, type: 'Keluar' }))
  ].filter(l => 
    l.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.perihal.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      case 'Dikirim': return 'bg-teal-50 text-teal-700 border-teal-150';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left: Interactive Quick Finder Directory */}
        <div className="w-full md:w-80 shrink-0 space-y-4">
          <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-3xl space-y-4">
            <h4 className="font-display font-extrabold text-sm text-slate-800">Cari Surat Terdaftar</h4>
            
            <div className="relative">
              <input
                id="search-input-tracking"
                type="text"
                placeholder="No. surat atau perihal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2 pl-9 pr-4 rounded-xl text-xs focus:border-emerald-500/50 focus:outline-none transition-colors font-medium"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {allLettersForSelection.length === 0 ? (
                <p className="text-center text-slate-400 text-[11px] py-8 font-medium">Surat tidak ditemukan.</p>
              ) : (
                allLettersForSelection.map((item) => (
                  <button
                    id={`btn-select-track-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setSelectedLetterIdFromGlobal(item.id);
                      setSelectedLetterType(item.type as 'Masuk' | 'Keluar');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all text-xs border ${
                      selectedLetterIdFromGlobal === item.id 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      item.type === 'Masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-teal-50 text-teal-700 border border-teal-100'
                    }`}>
                      {item.type === 'Masuk' ? <Inbox className="h-3.5 w-3.5 font-bold" /> : <Send className="h-3.5 w-3.5 font-bold" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate leading-tight">{item.perihal}</p>
                      <p className="text-[9px] font-mono text-slate-400 font-bold mt-1 truncate">{item.nomorSurat}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Graphic Progress flow map node tree */}
        <div className="flex-1">
          {selectedLetter ? (
            <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl space-y-6">
              
              {/* Core header panel summary */}
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">Sedang Dilacak ({selectedLetterType})</span>
                  <h3 className="text-base font-extrabold text-slate-800 leading-snug">{selectedLetter.perihal}</h3>
                  <p className="text-xs font-mono text-slate-400 font-bold mt-1">{selectedLetter.nomorSurat}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSifatBadgeColor(selectedLetter.sifat)}`}>
                    {selectedLetter.sifat}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(selectedLetter.status)}`}>
                    Status: {selectedLetter.status}
                  </span>
                </div>
              </div>

              {/* Graphical Progress flow chart */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-slate-600 border-b border-slate-100 pb-3">
                  <MapPin className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
                  <h4 className="font-sans font-bold text-sm text-slate-800">Peta Progress Aliran Berkas</h4>
                </div>

                {/* Vertical graphical progression */}
                <div className="p-2 sm:p-4">
                  <Timeline auditTrail={auditTrail} suratId={selectedLetter.id} />
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 shadow-sm p-16 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[400px]">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-full text-emerald-600">
                <History className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-slate-800">Pelacakan Berkas Digital</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mx-auto font-semibold">
                  Pilih salah satu surat resmi di panel kiri atau ketik nomor surat di kotak pencarian untuk melihat progress alur disposisi, pengiriman, dan tindak lanjut pegawai secara visual.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
