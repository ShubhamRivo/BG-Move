import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, RotateCcw, Sparkles, Check, Sliders, Palette, 
  Layers, Image as ImageIcon, ShieldAlert, Cpu, Eye, Copy, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageFileState, BgRemovalResult, BackgroundStyle } from '../types';
import { removeBackgroundWithAI, ProgressState } from '../utils/aiBackgroundRemoval';
import { compositeBackground } from '../utils/imageProcessing';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { downloadFile, getStandardFilename } from '../utils/formatters';

interface BackgroundRemoverProps {
  image: ImageFileState;
  onReset: () => void;
  onOpenApiDocs?: () => void;
}

const PRESET_COLORS = [
  { name: 'Pure White', value: '#ffffff', border: true },
  { name: 'Studio Black', value: '#0f172a' },
  { name: 'Soft Studio Gray', value: '#e2e8f0', border: true },
  { name: 'Royal Indigo', value: '#4f46e5' },
  { name: 'Pastel Rose', value: '#fda4af' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Warm Amber', value: '#f59e0b' },
  { name: 'Sky Cyan', value: '#06b6d4' },
];

const PRESET_GRADIENTS = [
  { name: 'Sunset Glow', value: '#ff7e5f, #feb47b' },
  { name: 'Cyber Violet', value: '#8a2be2, #41006f' },
  { name: 'Ocean Breeze', value: '#00c6ff, #0072ff' },
  { name: 'Neon Lime', value: '#11998e, #38ef7d' },
  { name: 'Studio Minimal', value: '#f1f5f9, #cbd5e1' },
];

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({
  image,
  onReset,
  onOpenApiDocs,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState<ProgressState>({
    stage: 'init',
    percent: 10,
    message: 'Initializing neural engine...',
  });
  const [result, setResult] = useState<BgRemovalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Background Customization
  const [bgStyle, setBgStyle] = useState<BackgroundStyle>({ type: 'transparent' });
  const [blurRadius, setBlurRadius] = useState<number>(16);
  const [customColor, setCustomColor] = useState<string>('#ffffff');
  const [compositedUrl, setCompositedUrl] = useState<string | null>(null);
  const [isCompositing, setIsCompositing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Run AI Background Removal on mount / image change
  const startRemoval = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setCompositedUrl(null);

    try {
      const res = await removeBackgroundWithAI(image.dataUrl, (p) => {
        setProgress(p);
      });
      setResult(res);
      setCompositedUrl(res.dataUrl);

      // Joyful confetti for clean completion
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err: any) {
      setError(err.message || 'Background removal encountered an error.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    startRemoval();
  }, [image.dataUrl]);

  // Re-composite when background style changes
  useEffect(() => {
    if (!result) return;

    if (bgStyle.type === 'transparent') {
      setCompositedUrl(result.dataUrl);
      return;
    }

    const updateComposite = async () => {
      setIsCompositing(true);
      try {
        const comp = await compositeBackground(result.dataUrl, image.dataUrl, bgStyle);
        setCompositedUrl(comp.dataUrl);
      } catch (err) {
        console.error('Failed to composite background:', err);
      } finally {
        setIsCompositing(false);
      }
    };

    updateComposite();
  }, [bgStyle, result, image.dataUrl]);

  // Handle Download
  const handleDownload = async () => {
    if (!compositedUrl) return;

    const extension = bgStyle.type === 'transparent' ? 'png' : 'jpg';
    const filename = getStandardFilename(image.name, 'bgmove-removed', extension);

    try {
      const res = await fetch(compositedUrl);
      const blob = await res.blob();
      downloadFile(blob, filename);
    } catch {
      downloadFile(compositedUrl, filename);
    }
  };

  // Copy PNG to Clipboard
  const handleCopy = async () => {
    if (!compositedUrl) return;
    try {
      const res = await fetch(compositedUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgStyle({
          type: 'custom-image',
          customImageDataUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
              AI Background Remover
              {result && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
              {image.name} ({image.width} × {image.height}px · {image.formattedSize})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startRemoval}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Re-run removal"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            Re-process
          </button>
          <button
            onClick={onReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Upload New
          </button>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Before/After Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative min-h-[420px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-950 flex items-center justify-center">
            {/* Loading & Neural Progress State */}
            {isProcessing && (
              <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <h4 className="text-lg font-bold text-white tracking-wide">
                    Removing Background
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {progress.message}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {progress.percent}% Completed · Neural Segmentation
                </span>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="absolute inset-0 z-30 bg-rose-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-rose-400" />
                <h4 className="text-base font-bold text-white">Processing Issue</h4>
                <p className="text-xs text-rose-200 max-w-md">{error}</p>
                <button
                  onClick={startRemoval}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
                >
                  Retry Removal
                </button>
              </div>
            )}

            {/* Before / After Split Slider */}
            {result && compositedUrl && (
              <BeforeAfterSlider
                beforeImage={image.dataUrl}
                afterImage={compositedUrl}
                beforeLabel="Original"
                afterLabel={bgStyle.type === 'transparent' ? 'Cutout (PNG)' : 'New Background'}
                showCheckerboardAfter={bgStyle.type === 'transparent'}
                className="w-full h-full min-h-[420px]"
              />
            )}
          </div>

          {/* Engine & Privacy Tag */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>
                Engine:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {result?.engineUsed === 'imgly-ai' ? 'On-Device AI Neural Model (Wasm/WebGPU)' : 'Client-Side Smart Edge Matting'}
                </strong>
                {result?.processingTimeMs ? ` (${result.processingTimeMs}ms)` : ''}
              </span>
            </div>
            <button
              onClick={onOpenApiDocs}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Developer API & Model Details →
            </button>
          </div>
        </div>

        {/* Right Column: Background Replacement & Export Studio (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-500" />
                Background Studio
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Keep transparent or replace with solid colors, studio gradients, blur, or custom backdrops.
              </p>
            </div>

            {/* Background Style Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setBgStyle({ type: 'transparent' })}
                className={`py-2 rounded-xl transition-all ${
                  bgStyle.type === 'transparent'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Transparent
              </button>
              <button
                onClick={() => setBgStyle({ type: 'color', color: customColor })}
                className={`py-2 rounded-xl transition-all ${
                  bgStyle.type === 'color'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Color
              </button>
              <button
                onClick={() => setBgStyle({ type: 'gradient', gradient: PRESET_GRADIENTS[0].value })}
                className={`py-2 rounded-xl transition-all ${
                  bgStyle.type === 'gradient'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Gradient
              </button>
              <button
                onClick={() => setBgStyle({ type: 'blur', blurRadius: 18 })}
                className={`py-2 rounded-xl transition-all ${
                  bgStyle.type === 'blur'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Blur
              </button>
            </div>

            {/* Dynamic Controls based on selected tab */}
            <div className="min-h-[120px]">
              {bgStyle.type === 'transparent' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-checkerboard border border-slate-300 dark:border-slate-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Transparent Alpha PNG
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Zero background pixels. Ideal for e-commerce, graphic design, and UI stickers.
                    </p>
                  </div>
                </div>
              )}

              {bgStyle.type === 'color' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Preset Studio Colors:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.value}
                        onClick={() => {
                          setCustomColor(col.value);
                          setBgStyle({ type: 'color', color: col.value });
                        }}
                        style={{ backgroundColor: col.value }}
                        className={`w-9 h-9 rounded-xl transition-all hover:scale-110 flex items-center justify-center ${
                          col.border ? 'border border-slate-300 dark:border-slate-600' : ''
                        } ${bgStyle.color === col.value ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                        title={col.name}
                      >
                        {bgStyle.color === col.value && (
                          <Check
                            className={`w-4 h-4 ${
                              col.value === '#ffffff' || col.value === '#e2e8f0' || col.value === '#fda4af'
                                ? 'text-slate-900'
                                : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Custom Color:
                    </span>
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setBgStyle({ type: 'color', color: e.target.value });
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300 uppercase">
                      {customColor}
                    </span>
                  </div>
                </div>
              )}

              {bgStyle.type === 'gradient' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Studio Gradient Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_GRADIENTS.map((grad) => (
                      <button
                        key={grad.name}
                        onClick={() => setBgStyle({ type: 'gradient', gradient: grad.value })}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          bgStyle.gradient === grad.value
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div
                          className="w-full h-7 rounded-lg mb-1.5 shadow-inner"
                          style={{ background: `linear-gradient(135deg, ${grad.value})` }}
                        />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {grad.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bgStyle.type === 'blur' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Background Blur Radius</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{blurRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="2"
                    value={blurRadius}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBlurRadius(val);
                      setBgStyle({ type: 'blur', blurRadius: val });
                    }}
                    className="w-full accent-indigo-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Creates an authentic DSLR portrait bokeh effect by heavily blurring the original backdrop while keeping the subject crisp.
                  </p>
                </div>
              )}
            </div>

            {/* Custom Image Upload Option */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCustomBgUpload}
              />
              <button
                onClick={() => bgFileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                Upload Custom Background Scene
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownload}
                disabled={isProcessing || !result}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download {bgStyle.type === 'transparent' ? 'Transparent PNG' : 'Image'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopy}
                  disabled={isProcessing || !result}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={onReset}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
