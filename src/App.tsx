import React, { useState, useEffect } from 'react';
import { 
  mockUsers, 
  mockSuratMasuk, 
  mockSuratKeluar, 
  mockDisposisi, 
  mockAuditTrail, 
  mockNotifikasi 
} from './data';
import { User, SuratMasuk, SuratKeluar, Disposisi, AuditTrail, Notifikasi } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import SuratMasukPage from './pages/SuratMasuk';
import SuratKeluarPage from './pages/SuratKeluar';
import DisposisiPage from './pages/Disposisi';
import PenggunaPage from './pages/Pengguna';
import PengaturanPage from './pages/Pengaturan';
import Login from './pages/Login';

export default function App() {
  // 1. Core Databases states with localStorage persistence
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('e_disposisi_users');
    return local ? JSON.parse(local) : mockUsers;
  });

  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>(() => {
    const local = localStorage.getItem('e_disposisi_surat_masuk');
    return local ? JSON.parse(local) : mockSuratMasuk;
  });

  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>(() => {
    const local = localStorage.getItem('e_disposisi_surat_keluar');
    return local ? JSON.parse(local) : mockSuratKeluar;
  });

  const [disposisi, setDisposisi] = useState<Disposisi[]>(() => {
    const local = localStorage.getItem('e_disposisi_disposisi');
    return local ? JSON.parse(local) : mockDisposisi;
  });

  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>(() => {
    const local = localStorage.getItem('e_disposisi_audit_trail');
    return local ? JSON.parse(local) : mockAuditTrail;
  });

  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>(() => {
    const local = localStorage.getItem('e_disposisi_notifikasi');
    return local ? JSON.parse(local) : mockNotifikasi;
  });

  // Session & UI States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const local = localStorage.getItem('e_disposisi_current_user');
    return local ? JSON.parse(local) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 2. Synchronize with localStorage on change
  useEffect(() => {
    localStorage.setItem('e_disposisi_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('e_disposisi_surat_masuk', JSON.stringify(suratMasuk));
  }, [suratMasuk]);

  useEffect(() => {
    localStorage.setItem('e_disposisi_surat_keluar', JSON.stringify(suratKeluar));
  }, [suratKeluar]);

  useEffect(() => {
    localStorage.setItem('e_disposisi_disposisi', JSON.stringify(disposisi));
  }, [disposisi]);

  useEffect(() => {
    localStorage.setItem('e_disposisi_audit_trail', JSON.stringify(auditTrail));
  }, [auditTrail]);

  useEffect(() => {
    localStorage.setItem('e_disposisi_notifikasi', JSON.stringify(notifikasi));
  }, [notifikasi]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('e_disposisi_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('e_disposisi_current_user');
    }
  }, [currentUser]);

  // 3. Helper Action: Append log entry to audit trail
  const handleAddAuditLog = (action: string, description: string) => {
    if (!currentUser) return;
    const newEntry: AuditTrail = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      namaUser: currentUser.nama,
      action,
      description
    };
    setAuditTrail(prev => [...prev, newEntry]);
  };

  // 4. Helper Action: Trigger in-app notify
  const handleTriggerNotification = (userId: string, title: string, message: string) => {
    const newNotif: Notifikasi = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifikasi(prev => [...prev, newNotif]);
  };

  // 5. Helper Action: Mark user notifications as read
  const handleMarkNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifikasi(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
  };

  // 6. Action: Reset to defaults
  const handleRestoreDefaults = () => {
    setUsers(mockUsers);
    setSuratMasuk(mockSuratMasuk);
    setSuratKeluar(mockSuratKeluar);
    setDisposisi(mockDisposisi);
    setAuditTrail(mockAuditTrail);
    setNotifikasi(mockNotifikasi);
    
    // Also reset active user to their updated template if found, or keep active
    if (currentUser) {
      const updatedMatch = mockUsers.find(u => u.id === currentUser.id);
      if (updatedMatch) {
        setCurrentUser(updatedMatch);
      }
    }
  };

  // 7. Change active logged-in user simulation
  const handleChangeSimulationUser = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      // Auto-switch tabs if the target role is restricted in the current page
      if (selected.role === 'Pelaksana' && ['surat-keluar', 'pengguna'].includes(activeTab)) {
        setActiveTab('dashboard');
      } else if (selected.role === 'Admin Persuratan' && ['pengaturan'].includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      handleAddAuditLog('Keluar Aplikasi', `Pegawai ${currentUser.nama} keluar dari aplikasi secara aman.`);
    }
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Log audit
    const entry: AuditTrail = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      namaUser: user.nama,
      action: 'Masuk Aplikasi',
      description: `Pegawai ${user.nama} berhasil login ke dalam sistem digital.`
    };
    setAuditTrail(prev => [...prev, entry]);
  };

  // If session is absent, render login
  if (!currentUser) {
    return <Login users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={currentUser.role} 
        userName={currentUser.nama} 
        userAvatar={currentUser.avatar}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div className="flex-1 pl-64 pt-16 min-h-screen flex flex-col">
        {/* Top Header */}
        <Topbar 
          activeTab={activeTab} 
          currentUser={currentUser} 
          allUsers={users} 
          onChangeUser={handleChangeSimulationUser}
          notifications={notifikasi}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        />

        {/* Dynamic Route Rendering */}
        <main className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              suratMasuk={suratMasuk} 
              suratKeluar={suratKeluar} 
              disposisi={disposisi} 
              users={users} 
              auditTrail={auditTrail}
              setActiveTab={setActiveTab}
              currentRole={currentUser.role}
            />
          )}

          {activeTab === 'surat-masuk' && (
            <SuratMasukPage 
              suratMasuk={suratMasuk}
              setSuratMasuk={setSuratMasuk}
              currentRole={currentUser.role}
              onAddAuditLog={handleAddAuditLog}
              onTriggerNotification={handleTriggerNotification}
            />
          )}

          {activeTab === 'surat-keluar' && (
            <SuratKeluarPage 
              suratKeluar={suratKeluar}
              setSuratKeluar={setSuratKeluar}
              currentRole={currentUser.role}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'disposisi' && (
            <DisposisiPage 
              disposisi={disposisi}
              setDisposisi={setDisposisi}
              suratMasuk={suratMasuk}
              setSuratMasuk={setSuratMasuk}
              users={users}
              currentUserId={currentUser.id}
              currentRole={currentUser.role}
              onAddAuditLog={handleAddAuditLog}
              onTriggerNotification={handleTriggerNotification}
            />
          )}

          {activeTab === 'pengguna' && (
            <PenggunaPage 
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanPage 
              currentUser={currentUser}
              users={users}
              setUsers={setUsers}
              suratMasuk={suratMasuk}
              setSuratMasuk={setSuratMasuk}
              suratKeluar={suratKeluar}
              setSuratKeluar={setSuratKeluar}
              disposisi={disposisi}
              setDisposisi={setDisposisi}
              onAddAuditLog={handleAddAuditLog}
              onRestoreDefaults={handleRestoreDefaults}
            />
          )}
        </main>
      </div>
    </div>
  );
}
