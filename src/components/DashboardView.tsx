import React, { useState } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  RefreshCw, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Download, 
  Eye, 
  Search, 
  SlidersHorizontal, 
  Layers, 
  Clock, 
  Zap, 
  CheckCheck,
  ChevronRight,
  BookOpen,
  Target,
  GitMerge,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  Image as ImageIcon
} from 'lucide-react';
import { TeacherUser, TeachingMaterial, PhaseType } from '../types';
import { PERANGKAT_AJAR_LIST } from '../constants';

interface DashboardViewProps {
  user: TeacherUser | null;
  materials: TeachingMaterial[];
  onSelectComponent: (categoryId: string) => void;
  onOpenPromptPoster: () => void;
  onOpenHistory: () => void;
  onOpenDocument: (material: TeachingMaterial) => void;
  onSyncSupabase: () => void;
  isSyncing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  materials,
  onSelectComponent,
  onOpenPromptPoster,
  onOpenHistory,
  onOpenDocument,
  onSyncSupabase,
  isSyncing,
}) => {
  const [phaseFilter, setPhaseFilter] = useState<PhaseType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter 10 Perangkat Ajar based on phase
  const filteredComponents = PERANGKAT_AJAR_LIST.filter((comp) => {
    if (phaseFilter === 'all') return true;
    return comp.phase === 'all' || comp.phase === phaseFilter;
  });

  // Filter recent documents
  const filteredMaterials = materials.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  const handleCopyMaterial = (mat: TeachingMaterial) => {
    navigator.clipboard.writeText(mat.content);
    setCopiedId(mat.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadDoc = (mat: TeachingMaterial) => {
    const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${mat.title}</title>
    <style>body { font-family: 'Times New Roman', serif; line-height: 1.5; padding: 2cm; }</style></head><body>`;
    const footer = `</body></html>`;
    const htmlBody = mat.content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\n\n/gim, '<p></p>')
      .replace(/\n/gim, '<br/>');

    const blob = new Blob(['\ufeff' + header + htmlBody + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mat.title.replace(/[/\\?%*:|"<>]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper icon renderer
  const renderComponentIcon = (id: string) => {
    switch (id) {
      case 'cp': return <BookOpen size={18} />;
      case 'tp': return <Target size={18} />;
      case 'atp': return <GitMerge size={18} />;
      case 'prota': return <Calendar size={18} />;
      case 'promes': return <CalendarDays size={18} />;
      case 'modul-deep-learning': return <Sparkles size={18} />;
      case 'bahan-ajar': return <BookOpen size={18} />;
      case 'lkpd': return <FileText size={18} />;
      case 'asesmen': return <CheckSquare size={18} />;
      case 'administrasi': return <BarChart3 size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      {/* Welcome Banner matching PRD & Reference */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 md:p-8 text-white shadow-lg shadow-indigo-600/15">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 bottom-0 w-48 h-48 rounded-full bg-amber-400/15 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Tahun Ajaran 2024/2025 Genap
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/80 text-amber-50 text-xs font-bold shadow-xs">
                <Sparkles size={13} className="fill-amber-200 text-amber-200" />
                Framework 8-3-3-4
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Selamat Datang, {user?.name || 'Ibu Siti Nurhaliza, M.Pd'}
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-normal">
              Susun seluruh administrasi pembelajaran Kurikulum Merdeka & Pembelajaran Mendalam (Deep Learning) secara instan, terverifikasi, dan otomatis tersimpan di database Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              onClick={onSyncSupabase}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs sm:text-sm font-semibold transition-all border border-white/20 active:scale-95"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Supabase'}</span>
            </button>
            <button
              onClick={() => onSelectComponent('modul-deep-learning')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <Sparkles size={15} className="text-amber-500 fill-amber-500" />
              <span>Mulai Buat Modul</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Hero Section: Fast Creator & Quick Selector */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Alur Cepat Satu Ketukan
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Mulai Buat Perangkat Ajar Baru
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full self-start md:self-auto">
            <CheckCircle2 size={15} className="text-teal-600" />
            <span>Standar BSKAP Kemendikbudristek No. 032/H/KR/2024</span>
          </div>
        </div>

        {/* Quick Selector 4 Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Modul Ajar Deep Learning */}
          <button
            onClick={() => onSelectComponent('modul-deep-learning')}
            className="group flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all duration-200 text-left border border-slate-200/80 hover:border-indigo-600 hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 group-hover:bg-white group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
              <Sparkles size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold truncate group-hover:text-white text-slate-900">
                  Modul Deep Learning
                </span>
              </div>
              <span className="text-xs text-slate-500 group-hover:text-indigo-100 line-clamp-2 mt-0.5">
                Sintaks 8 Dimensi, 3 Pengalaman, & 4 Asesmen terstruktur.
              </span>
            </div>
          </button>

          {/* Card 2: Prompt Poster LKPD */}
          <button
            onClick={onOpenPromptPoster}
            className="group flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all duration-200 text-left border border-slate-200/80 hover:border-indigo-600 hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 group-hover:bg-white group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
              <ImageIcon size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold truncate group-hover:text-white text-slate-900">
                  Prompt Poster LKPD
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold group-hover:bg-white group-hover:text-indigo-700">
                  AI
                </span>
              </div>
              <span className="text-xs text-slate-500 group-hover:text-indigo-100 line-clamp-2 mt-0.5">
                Visual instruksional siap render Canva, Midjourney & DALL-E.
              </span>
            </div>
          </button>

          {/* Card 3: Asesmen & Rubrik */}
          <button
            onClick={() => onSelectComponent('asesmen')}
            className="group flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all duration-200 text-left border border-slate-200/80 hover:border-indigo-600 hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-white group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
              <CheckSquare size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate group-hover:text-white text-slate-900">
                Asesmen & Rubrik
              </span>
              <span className="text-xs text-slate-500 group-hover:text-indigo-100 line-clamp-2 mt-0.5">
                Instrumen Diagnostik, Formatif, dan Sumatif otomatis HOTS.
              </span>
            </div>
          </button>

          {/* Card 4: Bahan Ajar Interaktif */}
          <button
            onClick={() => onSelectComponent('bahan-ajar')}
            className="group flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all duration-200 text-left border border-slate-200/80 hover:border-indigo-600 hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 group-hover:bg-white group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
              <BookOpen size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate group-hover:text-white text-slate-900">
                Bahan Ajar Interaktif
              </span>
              <span className="text-xs text-slate-500 group-hover:text-indigo-100 line-clamp-2 mt-0.5">
                Ringkasan materi kontekstual, glosarium & studi kasus.
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Quick Stats Cards with Visual Micro-metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dokumen Tersimpan</span>
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {materials.length}
              </span>
              <span className="text-xs font-bold text-teal-700">+4 pekan ini</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span className="text-xs text-slate-500">Tersinkronisasi Supabase Real-time</span>
            </div>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="pt-1">
            <svg className="w-full h-6 text-teal-600" fill="none" viewBox="0 0 100 24">
              <path d="M0 20 L20 18 L40 12 L60 15 L80 6 L100 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              <path d="M0 20 L20 18 L40 12 L60 15 L80 6 L100 2 V24 H0 Z" fill="currentColor" fillOpacity="0.1"></path>
            </svg>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Komponen Kurikulum</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">10 / 10</span>
              <span className="text-xs text-indigo-600 font-bold">100% Lengkap</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">CP, TP, ATP, Modul, LKPD & Rubrik terintegrasi</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Efisiensi Guru</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">~14 Jam</span>
              <span className="text-xs text-amber-700 font-bold">Dihemat / Pekan</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Reduksi waktu ketik administrasi manual 78%</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-amber-700 text-xs font-medium">
            <Sparkles size={14} className="text-amber-500" />
            <span>Fokus ke interaksi bermakna di kelas</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Infrastruktur AI Engine</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-indigo-600 flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">Gemini 3.8 Flash</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-semibold border border-teal-200">
                Latensi Rendah
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200">
                Konteks Panjang
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Pedagogi Kurikulum Merdeka</span>
            <CheckCheck size={14} className="text-teal-600" />
          </div>
        </div>
      </section>

      {/* 10 Komponen Kurikulum Merdeka & Deep Learning Cards with Functional Filter */}
      <section className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Daftar 10 Perangkat Ajar Kurikulum Merdeka
              </h2>
              <p className="text-xs text-slate-500">
                Pilih komponen yang ingin dibuat untuk memicu generator otomatis.
              </p>
            </div>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setPhaseFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  phaseFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Semua Fase
              </button>
              <button
                onClick={() => setPhaseFilter('sd')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  phaseFilter === 'sd'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Fase A–C (SD)
              </button>
              <button
                onClick={() => setPhaseFilter('smp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  phaseFilter === 'smp'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Fase D (SMP)
              </button>
              <button
                onClick={() => setPhaseFilter('sma')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  phaseFilter === 'sma'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Fase E–F (SMA/SMK)
              </button>
            </div>

            <button
              onClick={() => setPhaseFilter('all')}
              className="hidden sm:inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Active Indicator & Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 -mt-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="text-slate-800">
              Filter aktif: {phaseFilter === 'all' ? 'Semua Jenjang' : phaseFilter.toUpperCase()}
            </span>
          </div>
          <span>Menampilkan {filteredComponents.length} dari 10 perangkat ajar</span>
        </div>

        {/* 10 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredComponents.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectComponent(item.id)}
              className="group p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between min-h-[145px] cursor-pointer border border-slate-200/80 shadow-xs hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`w-8 h-8 rounded-lg ${item.badgeBg} ${item.colorClass} flex items-center justify-center shrink-0`}>
                  {renderComponentIcon(item.id)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                    {item.phaseLabel}
                  </span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                </div>
              </div>

              <div className="flex flex-col mt-3">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase Strip: Visual LKPD Inspiration */}
      <section className="rounded-2xl bg-slate-50 p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Pratinjau Hasil Desain Visual LKPD
            </h3>
            <p className="text-xs text-slate-500">
              Contoh media ilustratif yang dihasilkan melalui prompt instruksional terintegrasi Buatin.
            </p>
          </div>
          <button
            onClick={onOpenPromptPoster}
            className="text-indigo-600 font-bold text-xs sm:text-sm hover:underline flex items-center gap-1"
          >
            <span>Buka Studio Visual</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Visual 1 */}
          <div className="group relative rounded-xl overflow-hidden bg-slate-800 shadow-sm h-48 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"
              alt="Anatomi Sel"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                IPA Fase D (SMP)
              </span>
              <span className="text-sm font-bold">
                Anatomi Sel Hewan, Tumbuhan & Mikroskop
              </span>
              <span className="text-[11px] text-slate-300 mt-0.5">
                Vektor edukatif siap tempel di lembar kerja
              </span>
            </div>
          </div>

          {/* Visual 2 */}
          <div className="group relative rounded-xl overflow-hidden bg-slate-800 shadow-sm h-48 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
              alt="Fotosintesis"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Sains Terapan SD/SMP
              </span>
              <span className="text-sm font-bold">
                Mekanisme Fotosintesis & Klorofil
              </span>
              <span className="text-[11px] text-slate-300 mt-0.5">
                Diagram alur reaksi cahaya & stomata
              </span>
            </div>
          </div>

          {/* Visual 3 */}
          <div className="group relative rounded-xl overflow-hidden bg-slate-800 shadow-sm h-48 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"
              alt="Kolaborasi Siswa"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                Deep Learning Stage 2
              </span>
              <span className="text-sm font-bold">
                Aktivitas Eksperimen & Uji Laboratorium
              </span>
              <span className="text-[11px] text-slate-300 mt-0.5">
                Ilustrasi siswa Indonesia berkolaborasi aktif
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Documents Table & Synced Hub */}
      <section className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Riwayat Dokumen Terbaru
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                Supabase PostgreSQL
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Dokumen pembelajaran yang tersimpan di akun Anda dan siap disalin atau dicetak.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi atau topik..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 rounded-l-lg">NAMA PERANGKAT AJAR</th>
                <th className="py-3 px-4">MATA PELAJARAN & KELAS</th>
                <th className="py-3 px-4">KOMPONEN</th>
                <th className="py-3 px-4">STATUS SUPABASE</th>
                <th className="py-3 px-4">WAKTU SIMPAN</th>
                <th className="py-3 px-4 text-right rounded-r-lg">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada dokumen yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMaterials.slice(0, 5).map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText size={15} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{mat.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {mat.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {mat.subject} {mat.grade ? `(${mat.grade})` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {mat.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-teal-700 font-semibold text-[11px]">
                        <CheckCircle2 size={13} className="text-teal-600" />
                        <span>Tersimpan RLS</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(mat.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onOpenDocument(mat)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleCopyMaterial(mat)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                          title="Salin Isi Dokumen"
                        >
                          {copiedId === mat.id ? (
                            <CheckCheck size={15} className="text-teal-600" />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(mat)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                          title="Unduh Format Microsoft Word"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Link */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400">
            Menampilkan {Math.min(5, filteredMaterials.length)} dari {materials.length} dokumen tersimpan.
          </span>
          <button
            onClick={onOpenHistory}
            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
          >
            <span>Buka Seluruh Dokumen Saya</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};
