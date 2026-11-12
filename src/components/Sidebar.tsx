import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  FileEdit, 
  Image as ImageIcon, 
  FolderArchive, 
  Settings, 
  Zap, 
  CloudCheck, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  materialsCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  materialsCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & Hub',
      sublabel: 'Ikhtisar & Akses Cepat',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'generator',
      label: 'Modul Ajar & 10 Perangkat',
      sublabel: 'Deep Learning 8-3-3-4',
      icon: Sparkles,
      badge: 'Utama',
    },
    {
      id: 'prompt_poster',
      label: 'Prompt Poster LKPD',
      sublabel: 'Generator Visual AI',
      icon: ImageIcon,
      badge: 'Visual',
    },
    {
      id: 'history',
      label: 'Riwayat & Dokumen Saya',
      sublabel: 'Database Supabase',
      icon: FolderArchive,
      badge: materialsCount > 0 ? `${materialsCount}` : null,
    },
    {
      id: 'settings',
      label: 'Pengaturan & Supabase',
      sublabel: 'Konfigurasi & Profil Guru',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-72 bg-[#faf8ff] border-r border-slate-200/80 z-40 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Section Title */}
          <div>
            <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu Administrasi
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-sm truncate leading-tight">{item.label}</span>
                      <span
                        className={`text-[11px] truncate leading-tight mt-0.5 ${
                          isActive ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Status & Supabase Storage Info Card */}
        <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          {/* Gemini Engine Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <Zap size={14} className="fill-amber-600 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-tight">Gemini 3.8 Flash</span>
                <span className="text-[10px] text-slate-400 leading-tight">Server-Side Active</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
              Optimal
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-amber-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <CloudCheck size={14} className="text-emerald-600" />
              <span>PostgreSQL RLS Aktif</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      </aside>
    </>
  );
};
