import React from 'react';
import { 
  Sparkles, ArrowRightLeft, Scaling, FileArchive, 
  ShieldCheck, Zap, Layers, CheckCircle2 
} from 'lucide-react';
import { ToolType, ImageFileState } from '../types';
import { UniversalDropzone } from './UniversalDropzone';

interface HeroProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onImageSelected: (image: ImageFileState) => void;
}

export const Hero: React.FC<HeroProps> = ({
  activeTool,
  onSelectTool,
  onImageSelected,
}) => {
  const toolCards = [
    {
      id: 'bg-remover' as ToolType,
      title: 'AI Background Remover',
      badge: 'Neural AI',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
      description: 'Remove backgrounds cleanly with high precision. Preserves hair, fine edges, and subject depth.',
      icon: Sparkles,
      iconBg: 'from-indigo-600 to-indigo-500',
      features: ['Transparent PNG output', 'Before/After slider', 'Solid & Gradient backdrops'],
    },
    {
      id: 'converter' as ToolType,
      title: 'JPG ↔ PNG Converter',
      badge: 'Format Switcher',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
      description: 'Instant lossless and lossy conversion between JPG, PNG, and modern WEBP formats.',
      icon: ArrowRightLeft,
      iconBg: 'from-violet-600 to-purple-500',
      features: ['Quality factor controls', 'Background fill for JPG', 'Live size comparison'],
    },
    {
      id: 'resizer' as ToolType,
      title: 'Image Resizer',
      badge: 'Pixel Scaler',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300',
      description: 'Resize dimensions in pixels with locked aspect ratio and popular social media presets.',
      icon: Scaling,
      iconBg: 'from-cyan-600 to-blue-500',
      features: ['Aspect ratio lock', 'Instagram/YouTube presets', 'High-quality bicubic filter'],
    },
    {
      id: 'compressor' as ToolType,
      title: 'MB to KB Compressor',
      badge: 'Smart Shrink',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
      description: 'Intelligently compress photos down to specific target sizes (50KB, 100KB, 500KB, 1MB).',
      icon: FileArchive,
      iconBg: 'from-emerald-600 to-teal-500',
      features: ['Target size presets', 'Custom KB/MB selection', 'Fidelity preserving optimization'],
    },
  ];

  const activeToolObj = toolCards.find((t) => t.id === activeTool) || toolCards[0];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Intro */}
      <div className="text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Next-Gen Browser-Powered Image Utility</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Powerful Online <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Image Tools for Creators
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Remove backgrounds with AI, convert between JPG & PNG, resize dimensions, and compress photos from MB to KB. Free, fast, and 100% private.
        </p>

        {/* Privacy Highlight Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Your images are processed securely in your browser. No files are uploaded or stored.</span>
        </div>
      </div>

      {/* Universal Upload Dropzone */}
      <UniversalDropzone
        activeToolName={activeToolObj.title}
        onImageSelected={onImageSelected}
      />

      {/* Feature Cards Grid */}
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Available Image Tools
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Select a tool to start
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {toolCards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeTool === card.id;

            return (
              <div
                key={card.id}
                onClick={() => onSelectTool(card.id)}
                className={`group relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-indigo-500/20 -translate-y-1'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-xs'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.iconBg} text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {card.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
