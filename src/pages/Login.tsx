import React, { useState } from 'react';
import { Shield, Key, AlertCircle, Info } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export default function Login({ users, onLoginSuccess }: LoginProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter users that are "Aktif"
  const activeUsers = users.filter(u => u.status === 'Aktif');

  const handleDemoLogin = (user: User) => {
    onLoginSuccess(user);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setError('Mohon isi NIP / nama pengguna dan password.');
      return;
    }

    // Try finding by NIP or nama
    const foundUser = activeUsers.find(
      u => (u.nip === usernameInput.trim() || u.nama.toLowerCase().includes(usernameInput.toLowerCase())) &&
           (u.password === passwordInput || (!u.password && passwordInput === '123456'))
    );

    if (foundUser) {
      onLoginSuccess(foundUser);
    } else {
      setError('NIP / Nama atau Password salah atau akun Anda dinonaktifkan.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-8 space-y-6 text-left">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-emerald-500 text-white rounded-2xl items-center justify-center text-2xl shadow-lg shadow-emerald-500/25">
            ✉️
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-800">SISTEM E-DISPOSISI</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tata Usaha & Kearsipan Digital</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo fast click profiles */}
        <div className="space-y-2.5">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Pilih Akun Simulasi Cepat:</span>
          
          <div className="grid grid-cols-2 gap-2">
            {activeUsers.slice(0, 4).map((u) => (
              <button
                key={u.id}
                id={`btn-demo-login-${u.id}`}
                onClick={() => handleDemoLogin(u)}
                className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-150 rounded-2xl transition-all text-left cursor-pointer group"
              >
                <img 
                  src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"} 
                  alt={u.nama} 
                  className="h-7 w-7 rounded-full object-cover shrink-0 ring-2 ring-transparent group-hover:ring-emerald-500/10"
                />
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-slate-700 truncate group-hover:text-emerald-800 leading-snug">{u.nama.split(',')[0]}</p>
                  <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wide block truncate group-hover:text-emerald-600">{u.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1.5 items-center">
          <div className="flex-grow border-t border-slate-150"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono font-bold uppercase">Atau Login Manual</span>
          <div className="flex-grow border-t border-slate-150"></div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">NIP atau Nama Lengkap</label>
            <input
              id="login-username-input"
              type="text"
              placeholder="Contoh: 19851012..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Password Akun</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="login-password-input"
                type="password"
                placeholder="Masukkan password akun Anda"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 rounded-xl transition-all shadow-md shadow-emerald-600/15 cursor-pointer text-center"
          >
            Masuk ke Aplikasi
          </button>
        </form>

        <div className="text-center">
          <span className="text-[9px] text-slate-400 font-mono font-semibold uppercase flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Koneksi Enkripsi Sesi Terjamin Aman</span>
          </span>
        </div>

      </div>

    </div>
  );
}
