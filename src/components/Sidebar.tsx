import React from 'react';
import { 
  Home, 
  Inbox, 
  Send, 
  ClipboardList, 
  MapPin, 
  Archive, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Mail
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userName: string;
  userJabatan: string;
  userFoto?: string;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
}

export default function Sidebar({
  currentRole,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  userName,
  userJabatan,
  userFoto,
  onLogout
}: SidebarProps) {
  
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Beranda',
      icon: Home,
      roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana']
    },
    {
      id: 'surat-masuk',
      label: 'Surat Masuk',
      icon: Inbox,
      roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan']
    },
    {
      id: 'surat-keluar',
      label: 'Surat Keluar',
      icon: Send,
      roles: ['Super Admin', 'Admin Persuratan']
    },
    {
      id: 'disposisi',
      label: 'Disposisi',
      icon: ClipboardList,
      roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana']
    },
    {
      id: 'tracking',
      label: 'Pelacakan',
      icon: MapPin,
      roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana']
    },
    {
      id: 'arsip',
      label: 'Arsip',
      icon: Archive,
      roles: ['Super Admin', 'Admin Persuratan', 'Pimpinan', 'Pelaksana']
    },
    {
      id: 'pengguna',
      label: 'Pengguna',
      icon: Users,
      roles: ['Super Admin']
    }
  ];

  // Filter menu items based on current role
  const allowedMenuItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside 
      id="app-sidebar"
      className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <div className={`flex items-center gap-3 overflow-hidden transition-opacity ${collapsed ? 'justify-center w-full' : 'px-2'}`}>
          <div className="p-2 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Mail className="h-5 w-5 animate-pulse" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent tracking-wide whitespace-nowrap">
              SIPADIG
            </span>
          )}
        </div>
        {!collapsed && (
          <button 
            id="collapse-sidebar"
            onClick={() => setCollapsed(true)}
            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded transition-colors hidden md:block"
            title="Sembunyikan Menu"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {collapsed && (
          <button 
            id="expand-sidebar"
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-5 p-1 bg-emerald-600 text-white hover:bg-emerald-500 rounded-full border border-slate-200 shadow-md hidden md:block"
            title="Tampilkan Menu"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {allowedMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`menu-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative duration-200 ${
                isActive 
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-800 shadow-sm font-semibold' 
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50 font-medium'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
              }`} />
              {!collapsed && (
                <span className="font-sans text-sm tracking-wide">
                  {item.label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-xs text-white rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer (Profile / Logout) */}
      <div className="p-4 border-t border-slate-200 space-y-4">
        {!collapsed ? (
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
            <img 
              src={userFoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'} 
              alt={userName} 
              className="h-10 w-10 rounded-full border border-emerald-500/40 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-slate-800 truncate font-sans">{userName}</h4>
              <p className="text-[11px] text-slate-500 truncate font-mono uppercase tracking-wider">{currentRole}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center group relative">
            <img 
              src={userFoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'} 
              alt={userName} 
              className="h-10 w-10 rounded-full border border-emerald-500/40 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute left-full ml-3 p-3 bg-white border border-slate-200 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-md">
              <h4 className="text-xs font-semibold text-slate-800">{userName}</h4>
              <p className="text-[10px] text-emerald-600 font-mono uppercase tracking-wider">{currentRole}</p>
            </div>
          </div>
        )}

        <button
          id="btn-logout"
          onClick={onLogout}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 group relative ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-rose-500" />
          {!collapsed && <span className="text-sm font-medium">Keluar</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-xs text-rose-400 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Keluar
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
