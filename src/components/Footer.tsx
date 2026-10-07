import React from 'react';
import { Layers, Heart, ShieldCheck, Sparkles, ArrowRightLeft, Scaling, FileArchive } from 'lucide-react';
import { ToolType } from '../types';

interface FooterProps {
  onSelectTool: (tool: ToolType) => void;
  onOpenPrivacy: () => void;
  onOpenApiDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTool,
  onOpenPrivacy,
  onOpenApiDocs,
}) => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                BG Move <span className="text-indigo-600 dark:text-indigo-400">Tools</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              BG Move Tools provides free, ultra-fast, and secure online image utilities. Remove backgrounds with AI, convert between JPG, PNG, and WEBP formats, resize image dimensions, and compress photos from MB to KB without losing clarity.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side Private Processing</span>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Image Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTool('bg-remover')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  AI Background Remover
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('converter')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-violet-500" />
                  JPG ↔ PNG Converter
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('resizer')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <Scaling className="w-3.5 h-3.5 text-cyan-500" />
                  Image Resizer & Scaler
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTool('compressor')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <FileArchive className="w-3.5 h-3.5 text-emerald-500" />
                  MB to KB Compressor
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Security & Docs
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenApiDocs}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  API & Neural Model Guide
                </button>
              </li>
              <li>
                <a
                  href="#root"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Back to Top ↑
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} BG Move Tools. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for fast, zero-lag image editing.
          </p>
        </div>
      </div>
    </footer>
  );
};
