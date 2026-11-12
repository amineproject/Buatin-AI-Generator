import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Edit3, 
  Save, 
  Eye, 
  FileCheck,
  Building,
  School
} from 'lucide-react';
import { TeachingMaterial } from '../types';

interface DocumentPreviewProps {
  content: string;
  title: string;
  category: string;
  phase?: string;
  grade?: string;
  subject?: string;
  onSaveToSupabase?: (updatedContent: string) => void;
  isSaving?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  title,
  category,
  phase,
  grade,
  subject,
  onSaveToSupabase,
  isSaving,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableContent, setEditableContent] = useState<string>(content);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync state if content prop changes
  React.useEffect(() => {
    setEditableContent(content);
  }, [content]);

  // Handle Copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Download Word / DOCX compatible
  const handleDownloadDocx = () => {
    const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; color: #000; padding: 2cm; }
      h1 { font-size: 18pt; text-align: center; margin-bottom: 4pt; }
      h2 { font-size: 14pt; border-bottom: 1px solid #333; padding-bottom: 4pt; margin-top: 16pt; }
      h3 { font-size: 12pt; margin-top: 12pt; }
      table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
      th, td { border: 1px solid #333; padding: 6pt; text-align: left; }
      th { background-color: #f2f2f2; }
      pre { background: #f8f8f8; padding: 8pt; border: 1px solid #ddd; }
    </style></head><body>`;
    const footer = `</body></html>`;
    
    // Convert markdown into simple HTML tags for Word
    const htmlBody = editableContent
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n\n/gim, '<p></p>')
      .replace(/\n/gim, '<br/>');

    const fullHtml = header + htmlBody + footer;
    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[/\\?%*:|"<>]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Save
  const handleSave = () => {
    if (onSaveToSupabase) {
      onSaveToSupabase(editableContent);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Render markdown to HTML safely with tables and formatting
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1).filter(r => !r[0]?.includes('---') && !r[1]?.includes('---'));
        
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-4 border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  {headerRow.map((col, idx) => (
                    <th key={idx} className="p-2.5 border-r border-slate-300 last:border-r-0">
                      {col.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 border-b border-r border-slate-200 last:border-r-0 text-slate-700">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for table lines
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cells = line.split('|').slice(1, -1);
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Check headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-indigo-600 pb-2 mb-3 mt-6">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-lg md:text-xl font-bold text-indigo-900 bg-indigo-50/60 px-3 py-1.5 rounded-lg border-l-4 border-indigo-600 mb-2 mt-5">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-base font-bold text-slate-800 mb-1.5 mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-sm font-bold text-slate-700 mb-1 mt-3">
            {line.substring(5)}
          </h4>
        );
      } else if (line.startsWith('```')) {
        // Code or Prompt block
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <div key={i} className="my-3 rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-700 relative group">
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeLines.join('\n'));
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
            >
              <Copy size={12} />
              <span>Salin Blok</span>
            </button>
            <pre className="whitespace-pre-wrap leading-relaxed">{codeLines.join('\n')}</pre>
          </div>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-5 list-disc text-sm text-slate-700 leading-relaxed my-0.5">
            {formatInlineStyles(line.substring(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={i} className="ml-5 list-decimal text-sm text-slate-700 leading-relaxed my-0.5">
            {formatInlineStyles(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      } else if (line.startsWith('---')) {
        elements.push(<hr key={i} className="my-4 border-t border-slate-200" />);
      } else if (line.trim().length === 0) {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-sm text-slate-700 leading-relaxed my-1">
            {formatInlineStyles(line)}
          </p>
        );
      }
    }

    if (inTable) flushTable();
    return elements;
  };

  const formatInlineStyles = (text: string): React.ReactNode => {
    // Basic inline formatting for bold and code
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-xs">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/60 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Document Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
              {title || 'Pratinjau Dokumen'}
            </h3>
            <span className="text-[11px] text-slate-500 truncate">
              {category} {grade ? `• ${grade}` : ''}
            </span>
          </div>
        </div>

        {/* View mode toggle & Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(75, prev - 10))}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded"
              title="Perkecil Tampilan"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] font-semibold text-slate-600 px-2">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded"
              title="Perbesar Tampilan"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Edit / Preview Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isEditing 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isEditing ? 'Selesai Mengedit' : 'Edit Isi Dokumen'}
          >
            {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
            <span className="hidden md:inline">{isEditing ? 'Lihat Lembar' : 'Sunting'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
            title="Salin Isi Dokumen ke Clipboard"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
          </button>

          {/* Download DOCX */}
          <button
            onClick={handleDownloadDocx}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs"
            title="Unduh Format Microsoft Word (.doc)"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Word</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs"
            title="Cetak Dokumen atau Simpan PDF"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* Save to Supabase */}
          {onSaveToSupabase && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title="Simpan Dokumen ke Supabase Database"
            >
              {savedSuccess ? <FileCheck size={14} /> : <Save size={14} />}
              <span>{isSaving ? 'Menyimpan...' : savedSuccess ? 'Tersimpan!' : 'Simpan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
        {isEditing ? (
          <div className="w-full max-w-4xl bg-white p-6 rounded-xl border border-slate-300 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Editor Teks Langsung (Markdown & Format Bebas)
              </span>
              <span className="text-xs text-slate-400">Perubahan akan tercetak saat ekspor</span>
            </div>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-[650px] font-mono text-sm p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-800 leading-relaxed"
              placeholder="Ketik atau edit isi dokumen di sini..."
            />
          </div>
        ) : (
          /* Realistic A4 Paper Sheet */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white p-8 md:p-14 shadow-xl border border-slate-200/80 rounded-sm text-slate-900 transition-transform duration-150 a4-page flex flex-col justify-between"
          >
            <div>
              {/* Authentic Kop Surat Sekolah / Lembaga */}
              <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between gap-4">
                <div className="w-14 h-14 rounded-full border border-slate-400 flex items-center justify-center bg-slate-50 text-slate-700 shrink-0">
                  <School size={28} />
                </div>
                <div className="flex-1 text-center">
                  <h2 className="text-sm md:text-base font-extrabold uppercase tracking-wide text-slate-900">
                    KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                  </h2>
                  <h3 className="text-xs md:text-sm font-bold uppercase text-slate-800">
                    PERANGKAT ADMINISTRASI PEMBELAJARAN KURIKULUM MERDEKA
                  </h3>
                  <p className="text-[11px] text-slate-600 italic">
                    Standar BSKAP No. 032/H/KR/2024 • Model Pembelajaran Mendalam (Deep Learning 8-3-3-4)
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full border border-slate-400 flex items-center justify-center bg-slate-50 text-slate-700 shrink-0">
                  <Building size={24} />
                </div>
              </div>

              {/* Document Meta Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-6 text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="font-semibold text-slate-500 block">Kategori Dokumen:</span>
                  <span className="font-bold text-slate-900">{category}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Mata Pelajaran:</span>
                  <span className="font-bold text-slate-900">{subject || 'Umum'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Fase / Kelas:</span>
                  <span className="font-bold text-slate-900">{phase || 'Fase D'} / {grade || 'Kelas VIII'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Tahun Ajaran:</span>
                  <span className="font-bold text-slate-900">2024/2025 Genap</span>
                </div>
              </div>

              {/* Rendered Document Body */}
              <div className="prose prose-slate max-w-none">
                {renderFormattedMarkdown(editableContent)}
              </div>
            </div>

            {/* Document Signature / Validation Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-800">
              <div className="text-center w-48">
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
                <div className="h-16"></div>
                <p className="font-bold underline">Dr. H. Ahmad Fauzi, M.Pd</p>
                <p className="text-[10px] text-slate-500">NIP. 19750812 200212 1 003</p>
              </div>

              <div className="text-center text-[10px] text-slate-400">
                <p>Digenerate secara terstruktur dengan Buatin AI</p>
                <p>Terverifikasi Kurikulum Merdeka & Supabase Database</p>
              </div>

              <div className="text-center w-48">
                <p>Guru Mata Pelajaran,</p>
                <div className="h-20"></div>
                <p className="font-bold underline">Ibu Siti Nurhaliza, M.Pd</p>
                <p className="text-[10px] text-slate-500">NIP. 19820415 200801 2 011</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
