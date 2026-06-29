import { CheckCircle2, FileText, ArrowRight, UserCheck, CheckSquare, Clock } from 'lucide-react';
import { AuditTrail } from '../types';

interface TimelineProps {
  auditTrail: AuditTrail[];
  suratId: string;
}

export default function Timeline({ auditTrail, suratId }: TimelineProps) {
  const filteredEvents = auditTrail
    .filter(event => event.suratId === suratId)
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  if (filteredEvents.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs font-sans">
        Belum ada riwayat aktivitas untuk surat ini.
      </div>
    );
  }

  const getIcon = (action: string) => {
    const lowercase = action.toLowerCase();
    if (lowercase.includes('registrasi')) return FileText;
    if (lowercase.includes('teruskan') || lowercase.includes('kirim')) return ArrowRight;
    if (lowercase.includes('disposisi')) return UserCheck;
    if (lowercase.includes('status') || lowercase.includes('tindak lanjut')) return CheckSquare;
    if (lowercase.includes('selesai') || lowercase.includes('penyelesaian')) return CheckCircle2;
    return Clock;
  };

  return (
    <div className="relative pl-6 border-l border-slate-800 space-y-6 py-2">
      {filteredEvents.map((event, index) => {
        const Icon = getIcon(event.aksi);
        const isLatest = index === filteredEvents.length - 1;

        return (
          <div key={event.id} className="relative">
            {/* Timeline Marker (Circle Icon) */}
            <span className={`absolute -left-[37px] top-1.5 p-1.5 rounded-full border flex items-center justify-center transition-all ${
              isLatest 
                ? 'bg-indigo-600 text-white border-indigo-500 ring-4 ring-indigo-500/20' 
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              <Icon className="h-4 w-4 shrink-0" />
            </span>

            {/* Event Details */}
            <div className={`p-4 rounded-2xl transition-all border ${
              isLatest 
                ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border-indigo-500/30 shadow-md' 
                : 'bg-slate-900/30 border-slate-800/60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-200">{event.aksi}</span>
                <span className="text-[10px] font-mono text-slate-500">{event.tanggal}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{event.deskripsi}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Aktor:</span>
                <span className="text-[10px] text-indigo-400 font-medium">{event.aktor}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
