import { useState, useRef, useEffect, Dispatch, SetStateAction, FormEvent } from 'react';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Check, 
  ChevronDown,
  Info,
  Calendar
} from 'lucide-react';
import { UserRole, Notifikasi } from '../types';

interface TopbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  notifications: Notifikasi[];
  setNotifications: Dispatch<SetStateAction<Notifikasi[]>>;
  userName: string;
  userNip: string;
  userFoto?: string;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onViewLetter: (id: string, type: 'Masuk' | 'Keluar') => void;
  lettersMasuk: any[];
  lettersKeluar: any[];
}

export default function Topbar({
  currentRole,
  setCurrentRole,
  activeTab,
  notifications,
  setNotifications,
  userName,
  userNip,
  userFoto,
  onLogout,
  onSearch,
  onViewLetter,
  lettersMasuk,
  lettersKeluar
}: TopbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications for current role or general target
  const roleNotifications = notifications.filter(
    n => !n.targetRole || n.targetRole === currentRole
  );
  
  const unreadCount = roleNotifications.filter(n => !n.dibaca).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(n => (!n.targetRole || n.targetRole === currentRole ? { ...n, dibaca: true } : n))
    );
  };

  const handleNotifClick = (notif: Notifikasi) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, dibaca: true } : n));
    setShowNotifMenu(false);
    
    // Attempt to match notification description to letters to open detail panel
    const numberMatch = notif.deskripsi.match(/["'](.*?)["']/);
    if (numberMatch && numberMatch[1]) {
      const term = numberMatch[1];
      const sm = lettersMasuk.find(l => l.nomorSurat === term || l.perihal.includes(term));
      const sk = lettersKeluar.find(l => l.nomorSurat === term || l.perihal.includes(term));
      if (sm) {
        onViewLetter(sm.id, 'Masuk');
      } else if (sk) {
        onViewLetter(sk.id, 'Keluar');
      }
    }
  };

  // Autocomplete search suggestions
  const searchSuggestions = searchQuery.trim() === '' ? [] : [
    ...lettersMasuk.filter(l => 
      l.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.perihal.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.asalSurat.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(l => ({ ...l, type: 'Masuk' })),
    ...lettersKeluar.filter(l => 
      l.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.perihal.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.tujuan.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(l => ({ ...l, type: 'Keluar' }))
  ].slice(0, 5);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSearchResults(false);
  };

  // Active label for breadcrumbs
  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'dashboard': return 'Beranda / Analitik Utama';
      case 'surat-masuk': return 'Manajemen Surat / Surat Masuk';
      case 'surat-keluar': return 'Manajemen Surat / Surat Keluar';
      case 'disposisi': return 'Tugas & Disposisi';
      case 'tracking': return 'Pelacakan Dokumen';
      case 'arsip': return 'Arsip Digital';
      case 'pengguna': return 'Manajemen Akses & Pengguna';
      default: return 'Sistem Persuratan Digital';
    }
  };

  return (
    <header className="h-16 fixed top-0 right-0 z-20 flex items-center justify-between px-6 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm" style={{ left: 'var(--sidebar-width, 260px)', transition: 'left 0.3s' }}>
      {/* Breadcrumb Info */}
      <div className="hidden sm:flex flex-col">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none mb-1">Sistem Persuratan Digital</span>
        <span className="text-sm font-bold text-slate-800 font-display tracking-tight leading-none">{getBreadcrumbLabel()}</span>
      </div>

      {/* Global Interactive Search */}
      <div className="flex-1 max-w-md mx-6 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              id="search-input-global"
              type="text"
              placeholder="Cari nomor surat, perihal, pengirim..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
                onSearch(e.target.value);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none text-xs placeholder-slate-400 transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </form>

        {/* Dynamic Search Suggestions popup */}
        {showSearchResults && searchSuggestions.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl z-50">
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold px-2">Hasil Pencarian Pintar</span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {searchSuggestions.map((item: any) => (
                <button
                  id={`search-suggestion-item-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    onViewLetter(item.id, item.type);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono mt-0.5 shrink-0 ${
                    item.type === 'Masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-teal-50 text-teal-700 border border-teal-100'
                  }`}>
                    {item.type}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-800 font-semibold truncate leading-tight">{item.perihal}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{item.nomorSurat} — {item.type === 'Masuk' ? item.asalSurat : item.tujuan}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Real-time local date metric */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50/50 border border-emerald-100/80 px-3 py-1.5 rounded-lg text-emerald-800 text-xs font-medium">
          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
          <span>28 Juni 2026, UTC</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications-toggle"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-950 rounded-lg border border-slate-200 relative transition-all"
            title="Notifikasi"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-mono font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 font-sans">Notifikasi ({unreadCount} baru)</span>
                {unreadCount > 0 && (
                  <button
                    id="btn-mark-all-read"
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {roleNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  roleNotifications.map((n) => (
                    <button
                      id={`notification-item-${n.id}`}
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-3 ${
                        !n.dibaca ? 'bg-emerald-50/40 border-l-4 border-emerald-500' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${!n.dibaca ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800">{n.judul}</p>
                          <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">{n.tanggal.split(' ')[1]}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.deskripsi}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown with Switch Role Demo */}
        <div className="relative" ref={profileRef}>
          <button
            id="btn-profile-toggle"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 px-2.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-all"
          >
            <img
              src={userFoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover border border-emerald-500/30"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">{userName.split(',')[0]}</span>
              <span className="text-[9px] font-mono text-emerald-600 font-bold tracking-wider uppercase">{currentRole}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50">
              {/* User header */}
              <div className="p-3 border-b border-slate-100 text-left">
                <p className="text-xs font-bold text-slate-800">{userName}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">NIP. {userNip}</p>
              </div>

              {/* ROLE SWITCHING (Demo Feature) */}
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl my-2 text-left">
                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-800">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Ganti Role (Demo Mode)</span>
                </div>
                <div className="space-y-1">
                  {(['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana'] as UserRole[]).map((r) => (
                    <button
                      id={`demo-switch-role-${r.toLowerCase().replace(' ', '-')}`}
                      key={r}
                      onClick={() => {
                        setCurrentRole(r);
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-semibold flex items-center justify-between transition-colors ${
                        currentRole === r 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span>{r}</span>
                      {currentRole === r && <Check className="h-3 w-3 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary links */}
              <div className="space-y-0.5">
                <button
                  id="btn-settings"
                  onClick={() => alert('Fitur Pengaturan sedang diintegrasikan di tahap backend.')}
                  className="w-full text-left px-3 py-2 text-xs font-sans text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span>Pengaturan Akun</span>
                </button>
                <button
                  id="btn-logout-dropdown"
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs font-sans text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-rose-500/70" />
                  <span>Keluar Sesi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
