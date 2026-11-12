/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GeneratorView } from './components/GeneratorView';
import { PromptPosterStudio } from './components/PromptPosterStudio';
import { HistoryView } from './components/HistoryView';
import { DocumentPreview } from './components/DocumentPreview';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { TeacherUser, TeachingMaterial } from './types';
import { X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [user, setUser] = useState<TeacherUser | null>({
    id: 'user-001-siti',
    email: 'siti.nurhaliza@guru.belajar.id',
    name: 'Ibu Siti Nurhaliza, M.Pd',
    role: 'Guru IPA SMP',
    school: 'SMP Negeri 1 Nusantara',
    created_at: new Date().toISOString(),
  });

  const [selectedDocument, setSelectedDocument] = useState<TeachingMaterial | null>(null);
  const [generatorCategory, setGeneratorCategory] = useState<string>('Modul Ajar / RPP (Deep Learning 8-3-3-4)');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Fetch materials on component mount
  const fetchMaterials = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (data.success && data.materials) {
        setMaterials(data.materials);
      }
    } catch (e) {
      console.error('Failed to fetch materials', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Save new material to Supabase database
  const handleSaveMaterial = async (
    materialData: Omit<TeachingMaterial, 'id' | 'created_at'>
  ): Promise<TeachingMaterial | null> => {
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData),
      });
      const data = await res.json();
      if (data.success && data.material) {
        setMaterials((prev) => [data.material, ...prev]);
        return data.material;
      }
    } catch (e) {
      console.error('Failed to save material', e);
    }
    return null;
  };

  // Update existing material
  const handleUpdateMaterial = async (id: string, updatedContent: string) => {
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent }),
      });
      const data = await res.json();
      if (data.success && data.material) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === id ? data.material : m))
        );
        if (selectedDocument?.id === id) {
          setSelectedDocument(data.material);
        }
      }
    } catch (e) {
      console.error('Failed to update material', e);
    }
  };

  // Delete material from Supabase
  const handleDeleteMaterial = async (id: string) => {
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete material', e);
    }
  };

  // Select component from dashboard
  const handleSelectComponent = (categoryId: string) => {
    // Map card id to full name
    const categoryMap: Record<string, string> = {
      'cp': 'Capaian Pembelajaran (CP)',
      'tp': 'Tujuan Pembelajaran (TP)',
      'atp': 'Alur Tujuan Pembelajaran (ATP)',
      'prota': 'Program Tahunan (Prota)',
      'promes': 'Program Semester (Promes)',
      'modul-deep-learning': 'Modul Ajar / RPP (Deep Learning 8-3-3-4)',
      'bahan-ajar': 'Bahan Ajar & Media Pembelajaran',
      'lkpd': 'LKPD (Lembar Kerja Peserta Didik)',
      'asesmen': 'Instrumen Asesmen (Diagnostik, Formatif, Sumatif + Rubrik)',
      'administrasi': 'Pengolahan Nilai & Administrasi Pendukung',
    };

    setGeneratorCategory(categoryMap[categoryId] || 'Modul Ajar / RPP (Deep Learning 8-3-3-4)');
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Application Header */}
      <Header
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => setUser(null)}
        onQuickCreate={() => {
          setGeneratorCategory('Modul Ajar / RPP (Deep Learning 8-3-3-4)');
          setActiveTab('generator');
        }}
        onSyncSupabase={fetchMaterials}
        isSyncing={isSyncing}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'settings') {
              setSettingsModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          materialsCount={materials.length}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-72 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              materials={materials}
              onSelectComponent={handleSelectComponent}
              onOpenPromptPoster={() => setActiveTab('prompt_poster')}
              onOpenHistory={() => setActiveTab('history')}
              onOpenDocument={(doc) => setSelectedDocument(doc)}
              onSyncSupabase={fetchMaterials}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'generator' && (
            <GeneratorView
              user={user}
              initialCategory={generatorCategory}
              onSaveMaterial={handleSaveMaterial}
            />
          )}

          {activeTab === 'prompt_poster' && (
            <PromptPosterStudio
              user={user}
              onSaveMaterial={handleSaveMaterial}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              materials={materials}
              onOpenDocument={(doc) => setSelectedDocument(doc)}
              onDeleteMaterial={handleDeleteMaterial}
            />
          )}
        </main>
      </div>

      {/* Full Document View / Print Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
          <div className="w-full max-w-5xl h-[94vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedDocument(null)}
              className="absolute top-3.5 right-4 z-50 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Tutup Pratinjau"
            >
              <X size={18} />
            </button>

            {/* Document Preview Component inside Modal */}
            <div className="flex-1 h-full overflow-hidden">
              <DocumentPreview
                title={selectedDocument.title}
                category={selectedDocument.category}
                phase={selectedDocument.phase}
                grade={selectedDocument.grade}
                subject={selectedDocument.subject}
                content={selectedDocument.content}
                onSaveToSupabase={(updatedContent) =>
                  handleUpdateMaterial(selectedDocument.id, updatedContent)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          fetchMaterials();
        }}
      />
    </div>
  );
}
