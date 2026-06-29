import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  ChevronDown, 
  User as UserIcon, 
  CheckCircle, 
  Info, 
  AlertCircle 
} from 'lucide-react';
import { User, UserRole, Notifikasi } from '../types';

interface TopbarProps {
  activeTab: string;
  currentUser: User;
  allUsers: User[];
  onChangeUser: (userId: string) => void;
  notifications: Notifikasi[];
  onMarkNotificationsAsRead: () => void;
}

export default function Topbar({ 
  activeTab, 
  currentUser, 
  allUsers, 
  onChangeUser,
  notifications,
  onMarkNotificationsAsRead
}: TopbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Analisis & Ringkasan';
      case 'surat-masuk': return 'Tata Kelola Surat Masuk';
      case 'surat-keluar': return 'Tata Kelola Surat Keluar';
      case 'disposisi': return 'Lembar Disposisi & Berkas Instruksi';
      case 'pengguna': return 'Manajemen Pegawai & Pengguna';
      case 'pengaturan': return 'Pengaturan & Integrasi Sistem';
      default: return 'Sistem Administrasi Digital';
    }
  };

  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser.id).length;
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);

  // Format date Indoneia
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-150 fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-20 shadow-sm shadow-slate-100/30">
      {/* Tab Title */}
      <div className="flex flex-col">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">{getPageTitle(activeTab)}</h2>
        <span className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
          <Calendar className="h-3 w-3 text-slate-300" />
          {formatDate()}
        </span>
      </div>

      {/* Top Bar Actions */}
      <div className="flex items-center gap-5">
        
        {/* Rapid Tester: Switch User Accent */}
        <div className="relative">
          <button
            id="topbar-user-switcher-btn"
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifDropdown(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
          >
            <UserIcon className="h-3.5 w-3.5 text-slate-500" />
            <span className="max-w-[120px] truncate">{currentUser.nama.split(',')[0]}</span>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-1 py-0.5 rounded-md uppercase">
              {currentUser.role}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-40 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Pilih Akun Simulasi</span>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Ubah pengguna simulasi untuk menguji batasan hak akses (Pimpinan, Pelaksana, dll.)</p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    id={`btn-switch-user-${u.id}`}
                    onClick={() => {
                      onChangeUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-all text-left ${
                      u.id === currentUser.id ? 'bg-slate-50/70 border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    <img 
                      src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
                      alt={u.nama} 
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{u.nama}</p>
                      <span className="text-[9px] font-medium text-slate-500 font-mono mt-0.5 block truncate">
                        {u.jabatan} • <strong className="text-emerald-600">{u.role}</strong>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="topbar-notif-btn"
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowUserDropdown(false);
              if (!showNotifDropdown && unreadCount > 0) {
                onMarkNotificationsAsRead();
              }
            }}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all relative cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-40 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Pemberitahuan</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md font-bold">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <Info className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-[10px]">Belum ada pemberitahuan baru.</p>
                  </div>
                ) : (
                  userNotifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`px-4 py-3 hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0 ${
                        !n.read ? 'bg-slate-50/70' : ''
                      }`}
                    >
                      <div className="flex gap-2.5">
                        <div className="mt-0.5">
                          {!n.read ? (
                            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 leading-snug">{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                            {new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
