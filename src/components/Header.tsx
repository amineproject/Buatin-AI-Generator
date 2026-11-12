import React, { useState } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  RefreshCw, 
  Database, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Check, 
  BookOpen,
  Award
} from 'lucide-react';
import { TeacherUser } from '../types';

interface HeaderProps {
  user: TeacherUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickCreate: () => void;
  onSyncSupabase: () => void;
  isSyncing: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onQuickCreate,
  onSyncSupabase,
  isSyncing,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [syncedRecently, setSyncedRecently] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSyncClick = () => {
    onSyncSupabase();
    setSyncedRecently(true);
    setTimeout(() => setSyncedRecently(false), 2500);
  };

  return (
    <header className="sticky top-0 left-0 right-0 h-16 bg-[#faf8ff]/90 backdrop-blur-xl border-b border-slate-200/80 z-40 flex items-center justify-between px-4 lg:px-8">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <BookOpen size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-indigo-700 tracking-tight font-['Plus_Jakarta_Sans']">
              Buatin
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              <Sparkles size={11} className="text-amber-500 fill-amber-500" />
              Kurikulum Merdeka & Deep Learning
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Supabase status badge */}
        <button
          onClick={handleSyncClick}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-800 text-xs font-medium transition-all cursor-pointer shadow-xs"
          title="Klik untuk menyinkronkan status data ke Supabase PostgreSQL"
        >
          <span className={`w-2 h-2 rounded-full ${syncedRecently ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`}></span>
          <Database size={13} className="text-emerald-600" />
          <span>{isSyncing ? 'Menyinkronkan...' : syncedRecently ? 'Tersinkronkan!' : 'Supabase Terhubung'}</span>
          <RefreshCw size={12} className={`text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>

        {/* Quick Create CTA */}
        <button
          onClick={onQuickCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/30 active:scale-95"
        >
          <PlusCircle size={16} />
          <span>Buat Cepat</span>
        </button>

        {/* Profile Card / Login Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white">
                {user.name.charAt(0)}
              </div>
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[150px] leading-tight">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {user.role}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Akun Pendidik
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-1">{user.school}</p>
                </div>
                <div className="px-2 py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <User size={14} className="text-slate-500" />
                    <span>Ganti / Kelola Akun</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            <User size={14} />
            <span>Masuk / Daftar</span>
          </button>
        )}
      </div>
    </header>
  );
};
