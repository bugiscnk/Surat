import React, { useState } from 'react';
import { Mail, ShieldCheck, ArrowRight, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

export default function Login({ onLogin, users }: LoginProps) {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemoUser, setSelectedDemoUser] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip.trim()) {
      setError('NIP atau Username tidak boleh kosong.');
      return;
    }

    const matchedUser = users.find(u => u.nip === nip && u.status === 'Aktif');
    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      setError('NIP tidak terdaftar atau akun dinonaktifkan. (Gunakan Fitur Demo di bawah untuk masuk cepat)');
    }
  };

  const handleDemoLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep text-slate-800 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Animated Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] animate-glow-1 z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] animate-glow-2 z-0" />

      {/* Login Box */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-500/10 mb-4">
            <Mail className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-900">
            SIPERDI
          </h2>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">Sistem Persuratan Digital</p>
          <p className="text-slate-500 text-xs mt-3">Silakan masuk menggunakan NIP resmi instansi Anda.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">NIP Pegawai</label>
            <div className="relative">
              <input
                id="login-nip-input"
                type="text"
                placeholder="Contoh: 19880415..."
                value={nip}
                onChange={(e) => {
                  setNip(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-inner"
              />
              <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Kata Sandi</label>
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-inner"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <button
                id="btn-toggle-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 group transition-all duration-300 mt-6 cursor-pointer"
          >
            <span>Masuk Sistem</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* DEMO BYPASS SECTION (User requested and crucial for testing) */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-left">
          <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Demo / Sandbox Login</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
            Aplikasi ini berjalan dalam mode demo frontend. Pilih salah satu profil siap pakai di bawah untuk masuk instan sesuai role masing-masing:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {users.map((u) => (
              <button
                id={`demo-login-${u.id}`}
                key={u.id}
                type="button"
                onClick={() => handleDemoLogin(u.id)}
                className="text-left p-2.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-350 rounded-xl transition-all flex flex-col gap-0.5 shadow-sm"
              >
                <span className="text-[10px] font-bold text-slate-700 truncate">{u.nama.split(',')[0]}</span>
                <span className="text-[9px] font-mono text-emerald-600 font-bold tracking-wide uppercase truncate">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
