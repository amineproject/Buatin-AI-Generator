import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Copy, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Check, 
  FileText,
  Sparkles,
  Layers,
  FileCode,
  Tag
} from 'lucide-react';
import { TeachingMaterial } from '../types';

interface HistoryViewProps {
  materials: TeachingMaterial[];
  onOpenDocument: (material: TeachingMaterial) => void;
  onDeleteMaterial: (id: string) => Promise<void>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  materials,
  onOpenDocument,
  onDeleteMaterial,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered materials
  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      m.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleCopyContent = (mat: TeachingMaterial) => {
    navigator.clipboard.writeText(mat.content);
    setCopiedId(mat.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokumen ini dari riwayat Supabase?')) {
      setDeletingId(id);
      try {
        await onDeleteMaterial(id);
      } finally {
        setDeletingId(null);
      }
    }
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

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Riwayat & Dokumen Saya
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seluruh berkas perangkat ajar tersimpan dengan aman pada database Supabase (PostgreSQL).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-teal-600" />
            <span>{materials.length} Dokumen Tersimpan</span>
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, topik, atau mata pelajaran..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs sm:text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="Modul Ajar">Modul Ajar / Deep Learning</option>
            <option value="Prompt Poster">Prompt Poster LKPD</option>
            <option value="ATP">Alur Tujuan Pembelajaran (ATP)</option>
            <option value="CP">Capaian Pembelajaran (CP)</option>
            <option value="Asesmen">Asesmen & Rubrik</option>
            <option value="Bahan Ajar">Bahan Ajar</option>
          </select>
        </div>
      </div>

      {/* Documents Grid / List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <FolderArchive size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada dokumen ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Coba sesuaikan kata kunci pencarian atau buat dokumen baru melalui generator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[11px] font-bold">
                    {mat.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {mat.id.substring(0, 10)}
                  </span>
                </div>

                {/* Card Title */}
                <h3
                  onClick={() => onOpenDocument(mat)}
                  className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                >
                  {mat.title}
                </h3>

                {/* Subject & Topic */}
                <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{mat.subject}</span>
                    <span>•</span>
                    <span>{mat.phase}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Topik: {mat.topic}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Date & Quick Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">
                  {new Date(mat.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenDocument(mat)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                    title="Buka Pratinjau Dokumen"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleCopyContent(mat)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                    title="Salin Isi Dokumen"
                  >
                    {copiedId === mat.id ? (
                      <Check size={15} className="text-teal-600" />
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
                  <button
                    onClick={() => handleDelete(mat.id)}
                    disabled={deletingId === mat.id}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
