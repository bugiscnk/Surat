import React from 'react';
import { 
  Inbox, 
  Send, 
  FileCheck, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { SuratMasuk, SuratKeluar, Disposisi, User, AuditTrail } from '../types';

interface DashboardProps {
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  disposisi: Disposisi[];
  users: User[];
  auditTrail: AuditTrail[];
  setActiveTab: (tab: string) => void;
  currentRole: string;
}

export default function Dashboard({ 
  suratMasuk, 
  suratKeluar, 
  disposisi, 
  users, 
  auditTrail,
  setActiveTab,
  currentRole
}: DashboardProps) {

  // Calculate stats
  const totalMasuk = suratMasuk.length;
  const totalKeluar = suratKeluar.length;
  const totalDisp = disposisi.length;
  const totalUsers = users.length;

  const pendingDisp = disposisi.filter(d => d.status === 'Menunggu').length;
  const progressDisp = disposisi.filter(d => d.status === 'Sedang Dikerjakan').length;
  const completedDisp = disposisi.filter(d => d.status === 'Selesai').length;

  // Chart data: count letters by classification
  const classifications = ['Umum', 'Keuangan', 'Kepegawaian', 'Hukum', 'Sarpras'];
  const chartData = classifications.map(c => {
    return {
      name: c,
      'Surat Masuk': suratMasuk.filter(s => s.klasifikasi === c).length,
      'Surat Keluar': suratKeluar.filter(s => s.klasifikasi === c).length,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex items-center justify-between border border-slate-700/50">
        <div className="space-y-1.5 z-10 max-w-lg">
          <span className="text-[10px] font-mono uppercase bg-emerald-500 text-slate-900 font-extrabold px-2.5 py-1 rounded-full">
            E-Disposisi Terintegrasi
          </span>
          <h2 className="text-xl font-extrabold tracking-tight">Selamat Datang di Portal Tata Usaha Digital</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kelola persuratan dinas, pelacakan draf, penerbitan instruksi disposisi instansi, dan pelaporan hasil kerja pelaksana secara real-time.
          </p>
        </div>
        <div className="hidden md:flex text-6xl select-none mr-4">
          🏢
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Surat Masuk Card */}
        <div 
          onClick={() => setActiveTab('surat-masuk')}
          className="bg-white rounded-2xl p-5 border border-slate-150 hover:border-emerald-500/30 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Surat Masuk</span>
            <h3 className="text-2xl font-black text-slate-800">{totalMasuk}</h3>
            <span className="text-[10px] text-slate-500 font-medium block">Teregistrasi di arsip</span>
          </div>
          <div className="h-11 w-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Inbox className="h-5 w-5" />
          </div>
        </div>

        {/* Surat Keluar Card */}
        <div 
          onClick={() => {
            if (['Super Admin', 'Admin Persuratan', 'Pimpinan'].includes(currentRole)) {
              setActiveTab('surat-keluar');
            }
          }}
          className="bg-white rounded-2xl p-5 border border-slate-150 hover:border-blue-500/30 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Surat Keluar</span>
            <h3 className="text-2xl font-black text-slate-800">{totalKeluar}</h3>
            <span className="text-[10px] text-slate-500 font-medium block">Pengiriman & draf</span>
          </div>
          <div className="h-11 w-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Send className="h-5 w-5" />
          </div>
        </div>

        {/* Disposisi Card */}
        <div 
          onClick={() => setActiveTab('disposisi')}
          className="bg-white rounded-2xl p-5 border border-slate-150 hover:border-purple-500/30 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Lembar Disposisi</span>
            <h3 className="text-2xl font-black text-slate-800">{totalDisp}</h3>
            <span className="text-[10px] text-amber-600 font-semibold block">{pendingDisp + progressDisp} Butuh Tindakan</span>
          </div>
          <div className="h-11 w-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Pegawai Card */}
        <div 
          onClick={() => {
            if (['Super Admin', 'Admin Persuratan', 'Pimpinan'].includes(currentRole)) {
              setActiveTab('pengguna');
            }
          }}
          className="bg-white rounded-2xl p-5 border border-slate-150 hover:border-indigo-500/30 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Daftar Pegawai</span>
            <h3 className="text-2xl font-black text-slate-800">{totalUsers}</h3>
            <span className="text-[10px] text-slate-500 font-medium block">Akun aktif terdaftar</span>
          </div>
          <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Charts and Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Letter Flow Charts */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-150 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">Distribusi Surat Berdasarkan Klasifikasi</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">STATISTIK KLASIFIKASI</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    fontSize: '11px'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Surat Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Surat Keluar" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disposisi Task Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-150 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-800">Status Tugas Disposisi</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">PROGRES KERJA</span>
            </div>

            <div className="space-y-3">
              {/* Menunggu */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 bg-amber-500 rounded-full" />
                  <span className="text-[11px] font-semibold text-slate-600">Menunggu Tindakan</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{pendingDisp}</span>
              </div>

              {/* Sedang Dikerjakan */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <span className="text-[11px] font-semibold text-slate-600">Sedang Diproses</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{progressDisp}</span>
              </div>

              {/* Selesai */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                  <span className="text-[11px] font-semibold text-slate-600">Selesai & Dilaporkan</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{completedDisp}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <button
              id="dashboard-view-disposisi-shortcut"
              onClick={() => setActiveTab('disposisi')}
              className="text-[11px] font-bold text-purple-600 hover:text-purple-700 transition-all cursor-pointer inline-flex items-center gap-1"
            >
              Buka Lembar Disposisi &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Audit Trail Timeline */}
      <div className="bg-white rounded-2xl p-5 border border-slate-150">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800">Riwayat Aktivitas Log (Audit Trail)</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold">REAL-TIME LOG</span>
        </div>

        <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
          {auditTrail.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileSpreadsheet className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs">Belum ada riwayat aktivitas tercatat.</p>
            </div>
          ) : (
            auditTrail.slice().reverse().map((item) => (
              <div key={item.id} className="flex gap-4 group text-left">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 bg-slate-400 rounded-full group-hover:bg-emerald-500 transition-all mt-1.5" />
                  <div className="w-[1px] bg-slate-200 grow group-last:bg-transparent mt-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-800">{item.action}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="text-[9px] font-medium text-slate-400 block mt-0.5">
                    Oleh: {item.namaUser}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
