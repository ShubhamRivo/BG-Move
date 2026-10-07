import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowRightLeft, Scaling, FileArchive, 
  RotateCcw, Image as ImageIcon, ArrowLeft, Layers 
} from 'lucide-react';
import { ToolType, ImageFileState } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BackgroundRemover } from './components/BackgroundRemover';
import { ImageConverter } from './components/ImageConverter';
import { ImageResizer } from './components/ImageResizer';
import { ImageCompressor } from './components/ImageCompressor';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { PrivacyModal } from './components/PrivacyModal';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('bg-remover');
  const [loadedImage, setLoadedImage] = useState<ImageFileState | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bgmove_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Sync Dark Mode class with root HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bgmove_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bgmove_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleImageSelected = (image: ImageFileState) => {
    setLoadedImage(image);
    // Scroll smoothly to the workbench
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetImage = () => {
    setLoadedImage(null);
  };

  const toolsList = [
    { id: 'bg-remover' as ToolType, label: 'AI BG Remover', icon: Sparkles, color: 'text-indigo-500' },
    { id: 'converter' as ToolType, label: 'JPG ↔ PNG Converter', icon: ArrowRightLeft, color: 'text-violet-500' },
    { id: 'resizer' as ToolType, label: 'Image Resizer', icon: Scaling, color: 'text-cyan-500' },
    { id: 'compressor' as ToolType, label: 'MB to KB Compressor', icon: FileArchive, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <Header
        activeTool={activeTool}
        onSelectTool={(tool) => setActiveTool(tool)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenApiDocs={() => setIsApiModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {!loadedImage ? (
          /* Hero & Tool Selection */
          <Hero
            activeTool={activeTool}
            onSelectTool={(tool) => setActiveTool(tool)}
            onImageSelected={handleImageSelected}
          />
        ) : (
          /* Active Image Workbench */
          <div className="space-y-6">
            {/* Quick Workbench Switcher Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <button
                  onClick={handleResetImage}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 mr-2 shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Home
                </button>

                {toolsList.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tool.label}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-400 font-mono hidden md:block">
                {loadedImage.name}
              </div>
            </div>

            {/* Active Tool View */}
            {activeTool === 'bg-remover' && (
              <BackgroundRemover
                image={loadedImage}
                onReset={handleResetImage}
                onOpenApiDocs={() => setIsApiModalOpen(true)}
              />
            )}

            {activeTool === 'converter' && (
              <ImageConverter
                image={loadedImage}
                onReset={handleResetImage}
              />
            )}

            {activeTool === 'resizer' && (
              <ImageResizer
                image={loadedImage}
                onReset={handleResetImage}
              />
            )}

            {activeTool === 'compressor' && (
              <ImageCompressor
                image={loadedImage}
                onReset={handleResetImage}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTool={(tool) => {
          setActiveTool(tool);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenApiDocs={() => setIsApiModalOpen(true)}
      />

      {/* Modals */}
      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
