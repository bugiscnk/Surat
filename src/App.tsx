import { useState, useEffect, CSSProperties } from 'react';
import { mockUsers, mockSuratMasuk, mockSuratKeluar, mockDisposisi, mockAuditTrail, mockNotifikasi } from './data';
import { User, UserRole, SuratMasuk, SuratKeluar, Disposisi, AuditTrail, Notifikasi } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SuratMasukPage from './pages/SuratMasuk';
import SuratKeluarPage from './pages/SuratKeluar';
import DisposisiPage from './pages/Disposisi';
import TrackingPage from './pages/Tracking';
import ArsipPage from './pages/Arsip';
import PenggunaPage from './pages/Pengguna';

export default function App() {
  // Session authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');

  // Application-wide reactive state initialized with Indonesian mock datasets
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>(mockSuratMasuk);
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>(mockSuratKeluar);
  const [disposisi, setDisposisi] = useState<Disposisi[]>(mockDisposisi);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>(mockAuditTrail);
  const [notifications, setNotifications] = useState<Notifikasi[]>(mockNotifikasi);

  // Layout & Routing State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // High fidelity linked viewing state
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [disposisiFormOpenForLetterId, setDisposisiFormOpenForLetterId] = useState<string | null>(null);

  // Sync role with currentUser role on login
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser]);

  // Handle Login Session
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Add Audit log for logging in
    const loginLog: AuditTrail = {
      id: `audit-${Date.now()}`,
      suratId: 'AUTH',
      jenisSurat: 'Masuk',
      tanggal: new Date().toISOString().replace('T', ' ').slice(0, 16),
      aksi: 'Login Sesi',
      aktor: user.nama,
      deskripsi: `Pegawai ${user.nama} (NIP. ${user.nip}) berhasil melakukan autentikasi masuk ke dalam sistem dengan hak akses ${user.role}.`
    };
    setAuditTrail(prev => [loginLog, ...prev]);
  };

  // Handle Logout Session
  const handleLogout = () => {
    if (currentUser) {
      const logoutLog: AuditTrail = {
        id: `audit-${Date.now()}`,
        suratId: 'AUTH',
        jenisSurat: 'Masuk',
        tanggal: new Date().toISOString().replace('T', ' ').slice(0, 16),
        aksi: 'Logout Sesi',
        aktor: currentUser.nama,
        deskripsi: `Pegawai ${currentUser.nama} keluar sesi secara aman.`
      };
      setAuditTrail(prev => [logoutLog, ...prev]);
    }
    setCurrentUser(null);
    setSelectedLetterId(null);
    setDisposisiFormOpenForLetterId(null);
    setActiveTab('dashboard');
  };

  // Switch role during demo simulation
  const handleDemoRoleSwitch = (role: UserRole) => {
    setCurrentRole(role);
    // Create audit event
    if (currentUser) {
      const log: AuditTrail = {
        id: `audit-${Date.now()}`,
        suratId: 'DEMO',
        jenisSurat: 'Masuk',
        tanggal: new Date().toISOString().replace('T', ' ').slice(0, 16),
        aksi: 'Switch Role Demo',
        aktor: currentUser.nama,
        deskripsi: `Simulasi: Merubah hak akses aktif ke [${role}] untuk keperluan peninjauan visual.`
      };
      setAuditTrail(prev => [log, ...prev]);

      // Redirect if current active tab is restricted for the new role
      if (role === 'Pelaksana' && (activeTab === 'surat-masuk' || activeTab === 'surat-keluar' || activeTab === 'pengguna')) {
        setActiveTab('dashboard');
      } else if (role === 'Pimpinan' && (activeTab === 'surat-keluar' || activeTab === 'pengguna')) {
        setActiveTab('dashboard');
      } else if (role === 'Admin Persuratan' && activeTab === 'pengguna') {
        setActiveTab('dashboard');
      }
    }
  };

  // Add customized audit trail events
  const handleAddAuditLog = (suratId: string, action: string, description: string) => {
    const newLog: AuditTrail = {
      id: `audit-${Date.now()}`,
      suratId,
      jenisSurat: suratId.startsWith('sm') ? 'Masuk' : 'Keluar',
      tanggal: new Date().toISOString().replace('T', ' ').slice(0, 16),
      aksi: action,
      aktor: currentUser ? currentUser.nama : 'Sistem Otomatis',
      deskripsi: description
    };
    setAuditTrail(prev => [newLog, ...prev]);

    // Send mock notification to other roles
    if (action.includes('Registrasi') || action.includes('Tindak Lanjut') || action.includes('Disposisi')) {
      const targetRole: UserRole = action.includes('Disposisi') 
        ? 'Pelaksana' 
        : action.includes('Registrasi') 
          ? 'Pimpinan' 
          : 'Pimpinan';

      const newNotif: Notifikasi = {
        id: `notif-${Date.now()}`,
        judul: action,
        deskripsi: description,
        tanggal: new Date().toISOString().replace('T', ' ').slice(0, 16),
        dibaca: false,
        targetRole
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // Cross-page jump action: Jump to letter detail dossier immediately
  const handleViewLetterDossier = (id: string, type: 'Masuk' | 'Keluar') => {
    setSelectedLetterId(id);
    if (type === 'Masuk') {
      setActiveTab('surat-masuk');
    } else {
      setActiveTab('surat-keluar');
    }
  };

  // Cross-page jump action: trigger a disposition from dossier details
  const handleTriggerDisposisiForm = (suratMasukId: string) => {
    setActiveTab('disposisi');
    setDisposisiFormOpenForLetterId(suratMasukId);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  // Render current active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            suratMasuk={suratMasuk}
            suratKeluar={suratKeluar}
            disposisi={disposisi}
            users={users}
            onNavigate={setActiveTab}
            onViewLetter={handleViewLetterDossier}
          />
        );
      case 'surat-masuk':
        return (
          <SuratMasukPage
            suratMasuk={suratMasuk}
            setSuratMasuk={setSuratMasuk}
            disposisi={disposisi}
            onAddAuditLog={handleAddAuditLog}
            currentRole={currentRole}
            users={users}
            auditTrail={auditTrail}
            onTriggerDisposisiForm={handleTriggerDisposisiForm}
            selectedLetterIdForViewing={selectedLetterId}
            setSelectedLetterIdForViewing={setSelectedLetterId}
          />
        );
      case 'surat-keluar':
        return (
          <SuratKeluarPage
            suratKeluar={suratKeluar}
            setSuratKeluar={setSuratKeluar}
            onAddAuditLog={handleAddAuditLog}
            currentRole={currentRole}
            auditTrail={auditTrail}
          />
        );
      case 'disposisi':
        return (
          <DisposisiPage
            disposisi={disposisi}
            setDisposisi={setDisposisi}
            suratMasuk={suratMasuk}
            setSuratMasuk={setSuratMasuk}
            users={users}
            currentRole={currentRole}
            currentUserId={currentUser.id}
            onAddAuditLog={handleAddAuditLog}
            disposisiFormOpenForLetterId={disposisiFormOpenForLetterId}
            setDisposisiFormOpenForLetterId={setDisposisiFormOpenForLetterId}
          />
        );
      case 'tracking':
        return (
          <TrackingPage
            suratMasuk={suratMasuk}
            suratKeluar={suratKeluar}
            auditTrail={auditTrail}
            selectedLetterIdFromGlobal={selectedLetterId}
            setSelectedLetterIdFromGlobal={setSelectedLetterId}
          />
        );
      case 'arsip':
        return (
          <ArsipPage
            suratMasuk={suratMasuk}
            suratKeluar={suratKeluar}
            onViewLetter={handleViewLetterDossier}
          />
        );
      case 'pengguna':
        return (
          <PenggunaPage
            users={users}
            setUsers={setUsers}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500 text-xs">Modul sedang dipersiapkan.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep text-slate-800 flex font-sans antialiased overflow-x-hidden">
      {/* Background radial soft glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-0 animate-glow-1" />
      <div className="fixed bottom-[-25%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[150px] pointer-events-none z-0 animate-glow-2" />

      {/* Persistent adaptation variable for CSS sidebar widths */}
      <div 
        style={{ 
          '--sidebar-width': sidebarCollapsed ? '80px' : '260px' 
        } as CSSProperties}
        className="w-full min-h-screen flex"
      >
        {/* Adaptable navigation side rail */}
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            // Auto close details panel when moving across tabs
            setSelectedLetterId(null);
            setDisposisiFormOpenForLetterId(null);
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          userName={currentUser.nama}
          userJabatan={currentUser.jabatan}
          userFoto={currentUser.foto}
          onLogout={handleLogout}
        />

        {/* Content canvas container */}
        <div 
          className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300"
          style={{ 
            paddingLeft: sidebarCollapsed ? '80px' : '260px' 
          }}
        >
          {/* Header context menu */}
          <Topbar
            currentRole={currentRole}
            setCurrentRole={handleDemoRoleSwitch}
            activeTab={activeTab}
            notifications={notifications}
            setNotifications={setNotifications}
            userName={currentUser.nama}
            userNip={currentUser.nip}
            userFoto={currentUser.foto}
            onLogout={handleLogout}
            onSearch={(query) => {
              // Direct smart search results to feed
              console.log('Searching global term: ', query);
            }}
            onViewLetter={handleViewLetterDossier}
            lettersMasuk={suratMasuk}
            lettersKeluar={suratKeluar}
          />

          {/* Active module view viewport */}
          <main className="flex-1 p-6 mt-16 overflow-y-auto relative z-10">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
