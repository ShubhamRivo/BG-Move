import React from 'react';
import { 
  Sparkles, ArrowRightLeft, Scaling, FileArchive, 
  Moon, Sun, ShieldCheck, Code, Layers 
} from 'lucide-react';
import { ToolType } from '../types';

interface HeaderProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenApiDocs: () => void;
  onOpenPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTool,
  onSelectTool,
  isDarkMode,
  onToggleDarkMode,
  onOpenApiDocs,
  onOpenPrivacy,
}) => {
  const tools = [
    { id: 'bg-remover' as ToolType, label: 'Background Remover', icon: Sparkles, color: 'text-indigo-500' },
    { id: 'converter' as ToolType, label: 'JPG ↔ PNG', icon: ArrowRightLeft, color: 'text-violet-500' },
    { id: 'resizer' as ToolType, label: 'Resize', icon: Scaling, color: 'text-cyan-500' },
    { id: 'compressor' as ToolType, label: 'Compress', icon: FileArchive, color: 'text-emerald-500' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-850 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          onClick={() => onSelectTool('bg-remover')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                BG Move <span className="text-indigo-600 dark:text-indigo-400">Tools</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              All-in-One Online Image Suite
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${tool.color}`} />
                {tool.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Privacy, API Docs & Dark Mode */}
        <div className="flex items-center gap-2">
          {/* Privacy Badge */}
          <button
            onClick={onOpenPrivacy}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-all"
            title="Privacy and Security Information"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% In-Browser</span>
          </button>

          {/* API & Developer Docs */}
          <button
            onClick={onOpenApiDocs}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="API & Model Integration Guide"
          >
            <Code className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">API Guide</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Tool Navigation Row */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tool.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
