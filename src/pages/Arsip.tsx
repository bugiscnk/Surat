import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, FileText, Download, Eye, Calendar, RefreshCcw } from 'lucide-react';
import { SuratMasuk, SuratKeluar, SifatSurat, KlasifikasiSurat } from '../types';

interface ArsipProps {
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  onViewLetter: (id: string, type: 'Masuk' | 'Keluar') => void;
}

export default function ArsipPage({ suratMasuk, suratKeluar, onViewLetter }: ArsipProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  
  // Advanced Filter Settings
  const [filterType, setFilterType] = useState<'Semua' | 'Masuk' | 'Keluar'>('Semua');
  const [filterSifat, setFilterSifat] = useState<string>('Semua');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState<string>('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination simulator
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Combine both incoming and outgoing into unified archive array
  const combinedArchive = [
    ...suratMasuk.map(l => ({ ...l, type: 'Masuk', asalTujuan: l.asalSurat, tanggal: l.tanggalTerima })),
    ...suratKeluar.map(l => ({ ...l, type: 'Keluar', asalTujuan: l.tujuan, tanggal: l.tanggalSurat }))
  ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Deep filter function
  const filteredArchive = combinedArchive.filter((item) => {
    // 1. Text Search matches No, Perihal, or Asal/Tujuan
    const matchesSearch = 
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asalTujuan.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Type Match
    const matchesType = filterType === 'Semua' || item.type === filterType;

    // 3. Sifat Match
    const matchesSifat = filterSifat === 'Semua' || item.sifat === filterSifat;

    // 4. Klasifikasi Match
    const matchesKlasifikasi = filterKlasifikasi === 'Semua' || item.klasifikasi === filterKlasifikasi;

    // 5. Date Range Match
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(item.tanggal) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(item.tanggal) <= new Date(endDate);
    }

    return matchesSearch && matchesType && matchesSifat && matchesKlasifikasi && matchesDate;
  });

  // Calculate pages
  const totalItems = filteredArchive.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredArchive.slice(startIndex, startIndex + itemsPerPage);

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
      case 'Dikirim': return 'bg-teal-50 text-teal-700 border-teal-150';
      case 'Didisposisikan': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'Diteruskan': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilterType('Semua');
    setFilterSifat('Semua');
    setFilterKlasifikasi('Semua');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      
      {/* Smart central search input banner */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl space-y-4">
        <div className="relative">
          <input
            id="smart-search-archive-input"
            type="text"
            placeholder="Pencarian Cerdas: Ketik kata kunci perihal, nomor registrasi, asal surat, atau instansi tujuan..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-xs sm:text-sm placeholder-slate-400 focus:border-emerald-500/50 focus:outline-none transition-colors font-medium"
          />
          <Search className="absolute left-4.5 top-4.5 h-5 w-5 text-emerald-600" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            id="btn-toggle-adv-filters"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-bold transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            <span>Saring Lanjutan & Klasifikasi</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          <button
            id="btn-reset-filters"
            onClick={resetAllFilters}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors font-bold"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Reset Saringan</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters panel */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Type */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Jenis Arsip</label>
              <select
                id="adv-filter-type"
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="Semua">Semua Surat</option>
                <option value="Masuk">Surat Masuk</option>
                <option value="Keluar">Surat Keluar</option>
              </select>
            </div>

            {/* Sifat */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Sifat Kerahasiaan</label>
              <select
                id="adv-filter-sifat"
                value={filterSifat}
                onChange={(e) => { setFilterSifat(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-semibold"
              >
                <option value="Semua">Semua Sifat</option>
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>

            {/* Klasifikasi */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Klasifikasi</label>
              <select
                id="adv-filter-klasifikasi"
                value={filterKlasifikasi}
                onChange={(e) => { setFilterKlasifikasi(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-semibold"
              >
                <option value="Semua">Semua Bidang</option>
                <option value="Umum">Umum</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Kepegawaian">Kepegawaian</option>
                <option value="Akademik">Akademik</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Mulai Tanggal</label>
              <input
                id="adv-filter-start-date"
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-semibold"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Sampai Tanggal</label>
              <input
                id="adv-filter-end-date"
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-semibold"
              />
            </div>

          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl overflow-hidden space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-3">Nomor Surat</th>
                <th className="py-3 px-3">Tanggal Registrasi</th>
                <th className="py-3 px-3">Asal / Tujuan</th>
                <th className="py-3 px-3">Perihal Arsip</th>
                <th className="py-3 px-3">Sifat</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs font-semibold">
                    Tidak ditemukan arsip surat yang sesuai dengan kriteria penyaringan lanjutan.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                        item.type === 'Masuk' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                          : 'bg-teal-50 text-teal-700 border-teal-150'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono text-emerald-600 font-bold whitespace-nowrap">{item.nomorSurat}</td>
                    <td className="py-4 px-3 whitespace-nowrap text-slate-500 font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.tanggal}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-sans font-bold text-slate-800 truncate max-w-[140px]" title={item.asalTujuan}>{item.asalTujuan}</td>
                    <td className="py-4 px-3 font-sans text-slate-600 truncate max-w-[220px]" title={item.perihal}>{item.perihal}</td>
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
                    <td className="py-4 px-3 text-right">
                      <button
                        id={`btn-view-archive-row-${item.id}`}
                        onClick={() => onViewLetter(item.id, item.type as 'Masuk' | 'Keluar')}
                        className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5 font-bold" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-sans text-slate-500 font-semibold">
            <span>Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} arsip</span>
            
            <div className="flex items-center gap-2">
              <button
                id="btn-archive-prev-page"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition-colors cursor-pointer font-bold"
              >
                Sebelumnya
              </button>
              <span className="font-mono font-bold text-slate-700">Halaman {currentPage} dari {totalPages}</span>
              <button
                id="btn-archive-next-page"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition-colors cursor-pointer font-bold"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
