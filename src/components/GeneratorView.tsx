import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCcw, 
  Save, 
  BookOpen, 
  Layers, 
  Check, 
  HelpCircle, 
  Flame, 
  Sliders, 
  ChevronDown,
  Info,
  Clock,
  School,
  UserCheck
} from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import { TeacherUser, TeachingMaterial, GeneratorParams } from '../types';
import { 
  PERANGKAT_AJAR_LIST, 
  SUBJECT_OPTIONS, 
  PHASE_OPTIONS, 
  LEARNING_MODELS, 
  DEEP_LEARNING_DIMENSIONS,
  QUICK_TEMPLATES 
} from '../constants';

interface GeneratorViewProps {
  user: TeacherUser | null;
  initialCategory?: string;
  onSaveMaterial: (material: Omit<TeachingMaterial, 'id' | 'created_at'>) => Promise<TeachingMaterial | null>;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  user,
  initialCategory = 'Modul Ajar / RPP (Deep Learning 8-3-3-4)',
  onSaveMaterial,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [subject, setSubject] = useState<string>('Ilmu Pengetahuan Alam (IPA)');
  const [phase, setPhase] = useState<string>('Fase D (Kelas 7-9 SMP)');
  const [grade, setGrade] = useState<string>('Kelas VIII');
  const [topic, setTopic] = useState<string>('Struktur Sel Hewan & Tumbuhan dan Pengamatan Mikroskop');
  const [duration, setDuration] = useState<string>('2 x 40 Menit (1 Pertemuan)');
  const [learningModel, setLearningModel] = useState<string>('Problem-Based Learning (PBL)');
  const [studentCharacteristics, setStudentCharacteristics] = useState<string>(
    'Peserta didik heterogen dengan minat tinggi pada observasi visual & praktikum kelompok.'
  );
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([
    'Penalaran Kritis & Problem Solving',
    'Kolaborasi & Gotong Royong',
    'Kreativitas & Inovasi',
  ]);
  const [customNotes, setCustomNotes] = useState<string>(
    'Sertakan panduan kerja mikroskop yang ramah pemula, analogi sel dengan pabrik, dan rubrik asesmen 4 level.'
  );

  // Output states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDoc, setGeneratedDoc] = useState<{
    title: string;
    content: string;
    category: string;
    subject: string;
    phase: string;
    grade: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toggle dimension checkbox
  const handleToggleDimension = (dim: string) => {
    if (selectedDimensions.includes(dim)) {
      setSelectedDimensions(selectedDimensions.filter((d) => d !== dim));
    } else {
      setSelectedDimensions([...selectedDimensions, dim]);
    }
  };

  // Load preset template
  const handleLoadTemplate = (tpl: (typeof QUICK_TEMPLATES)[0]) => {
    setSelectedCategory(tpl.category);
    setSubject(tpl.subject);
    setPhase(tpl.phase);
    setGrade(tpl.grade);
    setTopic(tpl.topic);
    setDuration(tpl.duration);
    setLearningModel(tpl.learningModel);
    setSelectedDimensions(tpl.dimensions);
    setCustomNotes(tpl.notes);

    setToastMessage(`Template "${tpl.title}" berhasil dimuat.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Trigger Gemini generation via server-side endpoint
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          subject,
          phase,
          grade,
          topic,
          duration,
          learningModel,
          studentCharacteristics,
          deepLearningDimensions: selectedDimensions,
          customNotes,
          teacherName: user?.name || 'Ibu Siti Nurhaliza, M.Pd',
          schoolName: user?.school || 'SMP Negeri 1 Nusantara',
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        const newDoc = {
          title: data.title || `${selectedCategory}: ${subject} - ${topic}`,
          content: data.text,
          category: selectedCategory,
          subject,
          phase,
          grade,
        };
        setGeneratedDoc(newDoc);

        // Auto save to database
        handleAutoSave(newDoc);

        // Celebration confetti!
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore if canvas not supported
        }

        setToastMessage('Dokumen berhasil digenerate & tersimpan ke Supabase!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error generating document:', err);
      setToastMessage('Terjadi kesalahan saat memproses generator. Coba beberapa saat lagi.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-save helper
  const handleAutoSave = async (doc: typeof generatedDoc) => {
    if (!doc) return;
    setIsSaving(true);
    try {
      await onSaveMaterial({
        user_id: user?.id || 'user-001-siti',
        title: doc.title,
        category: doc.category,
        phase: doc.phase,
        grade: doc.grade,
        subject: doc.subject,
        topic,
        content: doc.content,
      });
    } catch (e) {
      console.error('Auto save failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async (updatedContent: string) => {
    if (!generatedDoc) return;
    setIsSaving(true);
    try {
      await onSaveMaterial({
        user_id: user?.id || 'user-001-siti',
        title: generatedDoc.title,
        category: generatedDoc.category,
        phase: generatedDoc.phase,
        grade: generatedDoc.grade,
        subject: generatedDoc.subject,
        topic,
        content: updatedContent,
      });
      setToastMessage('Perubahan berhasil diperbarui di Supabase database.');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Generator Perangkat Ajar & Modul Deep Learning
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sintesis standar Kurikulum Merdeka & Framework 8-3-3-4 dengan bimbingan Gemini AI.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Contoh Cepat:</span>
          {QUICK_TEMPLATES.map((tpl, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadTemplate(tpl)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors"
            >
              {tpl.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Console: Generator Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-5">
          {/* 1. Component Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center justify-between">
              <span>1. Komponen Perangkat Ajar</span>
              <span className="text-[10px] text-indigo-600 font-semibold lowercase">10 Komponen Terakreditasi</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PERANGKAT_AJAR_LIST.map((item) => (
                <option key={item.id} value={item.category}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Mata Pelajaran & Fase / Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Mata Pelajaran
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {SUBJECT_OPTIONS.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Jenjang / Fase
              </label>
              <select
                value={phase}
                onChange={(e) => {
                  setPhase(e.target.value);
                  const opt = PHASE_OPTIONS.find((p) => p.value === e.target.value);
                  if (opt) setGrade(opt.grade);
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {PHASE_OPTIONS.map((p, i) => (
                  <option key={i} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Topik & Alokasi Waktu */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Topik / Materi Pokok
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Ekosistem, Aljabar Linear, Teks Narasi..."
                className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Alokasi Waktu
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="2 x 40 Menit (1 Pertemuan)"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Model Pembelajaran
                </label>
                <select
                  value={learningModel}
                  onChange={(e) => setLearningModel(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {LEARNING_MODELS.map((m, i) => (
                    <option key={i} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Integrasi 8 Dimensi Pembelajaran Mendalam */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Integrasi 8 Dimensi (Deep Learning)
              </label>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {selectedDimensions.length} Dipilih
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {DEEP_LEARNING_DIMENSIONS.map((dim, idx) => {
                const isChecked = selectedDimensions.includes(dim);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleDimension(dim)}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60 font-medium'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 text-white ${
                        isChecked ? 'bg-indigo-600' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check size={11} className="stroke-[3]" />}
                    </div>
                    <span className="line-clamp-2 leading-tight">{dim}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Karakteristik Murid & Catatan Diferensiasi */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Catatan Pembelajaran & Diferensiasi (Opsional)
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Tambahkan kebutuhan murid, media laboratorium spesifik, atau rubrik khusus..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Big Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isGenerating || !topic.trim()
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/30 active:scale-98'
            }`}
          >
            <Sparkles size={18} className={isGenerating ? 'animate-spin text-amber-300' : 'text-amber-300 fill-amber-300'} />
            <span>
              {isGenerating ? 'Menyusun Perangkat Ajar dengan Gemini AI...' : 'Generate Perangkat Ajar Otomatis'}
            </span>
          </button>
        </div>

        {/* Right Console: Live Document Preview Sheet (7 Cols) */}
        <div className="lg:col-span-7 h-[850px] sticky top-20">
          {generatedDoc ? (
            <DocumentPreview
              title={generatedDoc.title}
              category={generatedDoc.category}
              phase={generatedDoc.phase}
              grade={generatedDoc.grade}
              subject={generatedDoc.subject}
              content={generatedDoc.content}
              onSaveToSupabase={handleManualSave}
              isSaving={isSaving}
            />
          ) : (
            /* Placeholder when no document generated yet */
            <div className="h-full bg-white rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles size={32} className="text-indigo-600" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-slate-900">
                  Pratinjau Lembar A4 Siap Muncul di Sini
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Pilih komponen di sebelah kiri dan klik tombol <strong>"Generate Perangkat Ajar Otomatis"</strong>. Dokumen berstandar Kurikulum Merdeka & Deep Learning 8-3-3-4 akan tersusun lengkap dan siap dicetak/diekspor ke Word.
                </p>
              </div>

              {/* Informative Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-4 text-left">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block">8 Dimensi</span>
                  <span className="text-xs font-semibold text-slate-800">Profil Pelajar Pancasila</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-teal-600 uppercase block">3 Pengalaman</span>
                  <span className="text-xs font-semibold text-slate-800">Mindful, Meaningful, Joyful</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block">4 Langkah</span>
                  <span className="text-xs font-semibold text-slate-800">Pahami, Alami, Maknai, Terapkan</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
