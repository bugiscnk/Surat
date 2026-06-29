import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  FileCheck, 
  Users, 
  Settings, 
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
  userAvatar?: string;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  userName, 
  userAvatar, 
  onLogout 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana'] },
    { id: 'surat-masuk', label: 'Surat Masuk', icon: Inbox, roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana'] },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: Send, roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan'] },
    { id: 'disposisi', label: 'Lembar Disposisi', icon: FileCheck, roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana'] },
    { id: 'pengguna', label: 'Daftar Pegawai', icon: Users, roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen fixed top-0 left-0 flex flex-col justify-between border-r border-slate-800 shadow-xl z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-emerald-500 text-white h-9 w-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20">
            ✉️
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">E-DISPOSISI</h1>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold">TATA USAHA DIGITAL</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-3">
          <img 
            src={userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
            alt={userName} 
            className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate leading-tight">{userName}</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold truncate">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' 
                    : 'hover:bg-slate-800/75 hover:text-slate-150 text-slate-400'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/40 mb-3 flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-[9px] leading-relaxed text-slate-500 font-medium">
            Akses sistem tercatat penuh dalam modul Audit Trail.
          </span>
        </div>
        
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  );
}
