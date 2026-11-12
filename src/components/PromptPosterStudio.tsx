import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Image as ImageIcon, 
  Layers, 
  Palette, 
  Sliders, 
  ExternalLink,
  Save,
  BookOpen,
  Info,
  Maximize2
} from 'lucide-react';
import { TeacherUser, TeachingMaterial } from '../types';
import { SUBJECT_OPTIONS, PHASE_OPTIONS } from '../constants';

interface PromptPosterStudioProps {
  user: TeacherUser | null;
  onSaveMaterial: (material: Omit<TeachingMaterial, 'id' | 'created_at'>) => Promise<TeachingMaterial | null>;
}

export const PromptPosterStudio: React.FC<PromptPosterStudioProps> = ({
  user,
  onSaveMaterial,
}) => {
  const [subject, setSubject] = useState<string>('Ilmu Pengetahuan Alam (IPA)');
  const [phase, setPhase] = useState<string>('Fase D (Kelas 7-9 SMP)');
  const [grade, setGrade] = useState<string>('Kelas VIII');
  const [topic, setTopic] = useState<string>('Anatomi Organ Sistem Pencernaan & Enzim Manusia');
  const [stylePreset, setStylePreset] = useState<string>('vector-infographic');
  const [aspectRatio, setAspectRatio] = useState<string>('3:4');
  const [colorTheme, setColorTheme] = useState<string>('smart-indigo');
  const [customInstructions, setCustomInstructions] = useState<string>(
    'Beri ruang kosong bergaris untuk catatan siswa, label organ cerna (lambung, usus, hati), dan tabel pengamatan nutrisi.'
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [englishPrompt, setEnglishPrompt] = useState<string>(
    `Educational scientific worksheet poster illustration of human digestive system anatomy, soft pastel pedagogical colors with smart indigo (#3B52DF) and fresh teal (#0D9488) accents, labeled organs with clean callouts, Kurikulum Merdeka SMP grade 8 science worksheet style, highly detailed vector aesthetic with bright modern classroom lighting, designated header banner for 'Judul Praktikum', numbered step-by-step activity flow 1 to 4, blank data observation table, high resolution, 8k, aspect ratio 3:4. --ar 3:4 --style raw --v 6.1`
  );
  const [indonesianPrompt, setIndonesianPrompt] = useState<string>(
    `Poster infografis edukasi Lembar Kerja Siswa (LKPD) materi sistem pencernaan manusia untuk IPA SMP Kelas VIII. Ilustrasi vektor datar modern yang bersih, memuat bagan organ tubuh lengkap dengan penunjuk label, kolom langkah kerja praktikum uji enzim, dan tabel hasil pengamatan. Menggunakan palet warna biru indigo edukatif dan hijau toska segar. Format portrait rapi tanpa watermark.`
  );
  const [pedagogicalGuide, setPedagogicalGuide] = useState<string>(
    `Gunakan gambar hasil prompt ini sebagai sampul atau lembar aktivitas utama LKPD. Siswa dapat mengisi label organ secara langsung dan mencatat hasil uji makanan berprotein/glukosa pada tabel yang tersedia.`
  );

  const [copiedType, setCopiedType] = useState<'en' | 'id' | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Style Presets
  const STYLE_OPTIONS = [
    {
      id: 'vector-infographic',
      label: 'Vector Educational Infographic',
      desc: 'Vektor datar modern, garis tegas, palet pastel ramah siswa.',
    },
    {
      id: '3d-clay-render',
      label: '3D Pedagogical Clay & Glass',
      desc: 'Visual 3D lembut, kedalaman ruang taktil, warna cerah.',
    },
    {
      id: 'scientific-cross-section',
      label: 'Realistic Diagram & Cross Section',
      desc: 'Potongan anatomi akurat, label teknis, standar lab sains.',
    },
    {
      id: 'flat-classroom-story',
      label: 'Joyful Narrative Classroom Illustration',
      desc: 'Siswa Indonesia aktif berkolaborasi dan bereksperimen.',
    },
  ];

  // Aspect Ratios
  const ASPECT_RATIOS = [
    { value: '3:4', label: '3:4 (Portrait LKPD A4)' },
    { value: '1:1', label: '1:1 (Persegi / Kartu Soal)' },
    { value: '16:9', label: '16:9 (Slide Presentasi)' },
    { value: '4:5', label: '4:5 (Poster Dinding)' },
  ];

  const handleCopy = (text: string, type: 'en' | 'id') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Prompt Poster LKPD',
          subject,
          phase,
          grade,
          topic,
          customNotes: `Gaya: ${stylePreset}. Rasio: ${aspectRatio}. Catatan: ${customInstructions}`,
          teacherName: user?.name,
          schoolName: user?.school,
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        // Parse the returned response
        const text = data.text;
        
        // Extract English prompt
        const enMatch = text.match(/```text\n([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
        if (enMatch && enMatch[1]) {
          setEnglishPrompt(enMatch[1].trim());
        } else {
          setEnglishPrompt(text.substring(0, 300));
        }

        // Set full output
        setPedagogicalGuide(text);

        try {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Prompt generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToHistory = async () => {
    setIsSaving(true);
    try {
      const fullContent = `# PROMPT POSTER LKPD: ${subject} - ${topic}

## PROMPT BAHASA INGGRIS (MIDJOURNEY / DALL-E 3)
\`\`\`text
${englishPrompt}
\`\`\`

## PROMPT BAHASA INDONESIA (CANVA MAGIC MEDIA)
\`\`\`text
${indonesianPrompt}
\`\`\`

## PANDUAN PEDAGOGIS & CETAK
${pedagogicalGuide}`;

      await onSaveMaterial({
        user_id: user?.id || 'user-001-siti',
        title: `Prompt Poster LKPD: ${subject} (${topic})`,
        category: 'Prompt Poster LKPD',
        phase,
        grade,
        subject,
        topic,
        content: fullContent,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving prompt', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Studio Generator Prompt Poster LKPD
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hasilkan prompt visual presisi dwibahasa (Inggris & Indonesia) siap tempel di Canva Magic Media, Midjourney, DALL-E, & Imagen.
          </p>
        </div>

        <button
          onClick={handleSaveToHistory}
          disabled={isSaving}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
            saveSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
          }`}
        >
          {saveSuccess ? <Check size={16} /> : <Save size={16} />}
          <span>{isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan di Supabase!' : 'Simpan Prompt ke Riwayat'}</span>
        </button>
      </div>

      {/* Grid: Form Parameters (5 cols) & Live Visual Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Console */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Parameter Visual Poster
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold border border-teal-200">
              Prompt Engineering V6
            </span>
          </div>

          {/* Subject & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Mata Pelajaran
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {SUBJECT_OPTIONS.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Fase / Jenjang
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {PHASE_OPTIONS.map((p, i) => (
                  <option key={i} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic / Object Focus */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
              Topik & Objek Visual Poster
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Reaksi Fotosintesis Tumbuhan, Struktur Sel Hewan..."
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Style Presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-2">
              Pilih Gaya Ilustrasi Visual
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setStylePreset(style.id)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    stylePreset === style.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{style.label}</span>
                    {stylePreset === style.id && <Check size={14} className="text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-2">
              Rasio Aspek Gambar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => setAspectRatio(ar.value)}
                  className={`py-2 px-2.5 rounded-lg text-center text-xs font-bold border transition-colors cursor-pointer ${
                    aspectRatio === ar.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ar.value}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Details */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
              Komponen Khusus pada Poster
            </label>
            <textarea
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Sertakan nomor langkah 1-4, ruang catatan kosong, ikon mikroskop..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Generate CTA */}
          <button
            onClick={handleGeneratePrompt}
            disabled={isGenerating || !topic.trim()}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isGenerating || !topic.trim()
                ? 'bg-teal-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 shadow-teal-600/30 active:scale-98'
            }`}
          >
            <Sparkles size={18} className={isGenerating ? 'animate-spin text-amber-300' : 'text-amber-300 fill-amber-300'} />
            <span>
              {isGenerating ? 'Merancang Prompt Visual AI...' : 'Susun Prompt Poster LKPD'}
            </span>
          </button>
        </div>

        {/* Right: Dual Prompt Output & Mock Visual Sheet (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Output Card 1: English Prompt for Midjourney / DALL-E */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                  Bahasa Inggris (Global AI)
                </span>
                <span className="text-xs text-slate-500">Midjourney v6 • DALL-E 3 • Imagen 3</span>
              </div>
              <button
                onClick={() => handleCopy(englishPrompt, 'en')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  copiedType === 'en'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {copiedType === 'en' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedType === 'en' ? 'Tersalin!' : 'Salin Prompt English'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-indigo-200 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
              <p className="whitespace-pre-wrap">{englishPrompt}</p>
            </div>
          </div>

          {/* Output Card 2: Indonesian Prompt for Canva Magic Media */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold text-[11px] border border-teal-200">
                  Bahasa Indonesia (Canva & Bing)
                </span>
                <span className="text-xs text-slate-500">Canva Magic Media • Bing Creator</span>
              </div>
              <button
                onClick={() => handleCopy(indonesianPrompt, 'id')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  copiedType === 'id'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {copiedType === 'id' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedType === 'id' ? 'Tersalin!' : 'Salin Prompt Indonesia'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 text-slate-800 font-mono text-xs leading-relaxed border border-slate-200">
              <p className="whitespace-pre-wrap">{indonesianPrompt}</p>
            </div>
          </div>

          {/* Interactive Mock Layout Preview (Simulates Generated LKPD Poster) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Simulasi Tampilan Lembar LKPD dengan Poster Visual
                </h3>
                <p className="text-xs text-slate-500">
                  Tata letak integratif lembar kerja peserta didik siap cetak di kelas.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Format A4
              </span>
            </div>

            {/* Poster Mock Canvas */}
            <div className="border border-slate-300 rounded-xl p-5 bg-gradient-to-b from-slate-50 to-white shadow-inner flex flex-col gap-4">
              {/* Poster Header */}
              <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    LEMBAR KERJA PESERTA DIDIK (LKPD) • {subject}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {topic}
                  </h4>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <p>Nama: .......................................</p>
                  <p>Kelas: {grade} • Kelompok: .......</p>
                </div>
              </div>

              {/* Central Instructional Poster Illustration Banner */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-teal-900 text-white p-5 shadow-sm min-h-[140px] flex items-center justify-between">
                <div className="max-w-md z-10">
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] uppercase mb-1.5">
                    Infografis Pembelajaran Mendalam
                  </span>
                  <p className="text-sm font-bold leading-tight">
                    Diagram Alur Observasi & Analisis Komparatif
                  </p>
                  <p className="text-xs text-indigo-200 mt-1">
                    Amati struktur visual, diskusikan fungsi dengan rekan sekelompok, dan catat temuan.
                  </p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
                  <ImageIcon size={36} className="text-teal-300" />
                </div>
              </div>

              {/* 4 Steps Activities Bar */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">1</span>
                  <p className="text-[10px] font-bold text-slate-800">Orientasi</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">2</span>
                  <p className="text-[10px] font-bold text-slate-800">Observasi</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">3</span>
                  <p className="text-[10px] font-bold text-slate-800">Analisis Data</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">4</span>
                  <p className="text-[10px] font-bold text-slate-800">Kesimpulan</p>
                </div>
              </div>

              {/* Mock Student Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border-r border-slate-200">No</th>
                      <th className="p-2 border-r border-slate-200">Objek Pengamatan</th>
                      <th className="p-2 border-r border-slate-200">Karakteristik & Ciri</th>
                      <th className="p-2">Fungsi Utama</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200">
                      <td className="p-2 border-r border-slate-200">1</td>
                      <td className="p-2 border-r border-slate-200">Sampel Bagian A</td>
                      <td className="p-2 border-r border-slate-200 italic text-slate-400">Isian siswa...</td>
                      <td className="p-2 italic text-slate-400">Isian siswa...</td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50/50">
                      <td className="p-2 border-r border-slate-200">2</td>
                      <td className="p-2 border-r border-slate-200">Sampel Bagian B</td>
                      <td className="p-2 border-r border-slate-200 italic text-slate-400">Isian siswa...</td>
                      <td className="p-2 italic text-slate-400">Isian siswa...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
