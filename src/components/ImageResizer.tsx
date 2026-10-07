import React, { useState, useEffect } from 'react';
import { 
  Download, RotateCcw, Scaling, Lock, Unlock, Check, 
  Sparkles, Maximize2, Sliders, Smartphone, Monitor, Video 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageFileState, ResizeOptions } from '../types';
import { resizeImage } from '../utils/imageProcessing';
import { formatBytes, downloadFile, getStandardFilename } from '../utils/formatters';

interface ImageResizerProps {
  image: ImageFileState;
  onReset: () => void;
}

const PRESET_RESOLUTIONS = [
  { label: 'Instagram Square (1:1)', width: 1080, height: 1080, icon: Smartphone },
  { label: 'Instagram Story / Reel (9:16)', width: 1080, height: 1920, icon: Smartphone },
  { label: 'YouTube Thumbnail (16:9)', width: 1280, height: 720, icon: Video },
  { label: 'Full HD 1080p', width: 1920, height: 1080, icon: Monitor },
  { label: 'Ultra HD 4K', width: 3840, height: 2160, icon: Monitor },
  { label: 'Avatar / Profile (1:1)', width: 600, height: 600, icon: Smartphone },
  { label: 'LinkedIn Banner', width: 1584, height: 396, icon: Monitor },
];

export const ImageResizer: React.FC<ImageResizerProps> = ({
  image,
  onReset,
}) => {
  const [targetWidth, setTargetWidth] = useState<number>(image.width);
  const [targetHeight, setTargetHeight] = useState<number>(image.height);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [scalePercentage, setScalePercentage] = useState<number>(100);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [smoothingQuality, setSmoothingQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [quality, setQuality] = useState<number>(0.92);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedResult, setResizedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    sizeBytes: number;
    width: number;
    height: number;
  } | null>(null);

  const aspectRatio = image.width / (image.height || 1);

  // Update width handler with aspect ratio lock
  const handleWidthChange = (w: number) => {
    const val = Math.max(1, Math.min(10000, Math.round(w || 1)));
    setTargetWidth(val);
    if (lockAspectRatio) {
      setTargetHeight(Math.max(1, Math.round(val / aspectRatio)));
    }
    setScalePercentage(Math.round((val / image.width) * 100));
  };

  // Update height handler with aspect ratio lock
  const handleHeightChange = (h: number) => {
    const val = Math.max(1, Math.min(10000, Math.round(h || 1)));
    setTargetHeight(val);
    if (lockAspectRatio) {
      setTargetWidth(Math.max(1, Math.round(val * aspectRatio)));
    }
    setScalePercentage(Math.round((val / image.height) * 100));
  };

  // Update via Scale Percentage slider
  const handlePercentageChange = (pct: number) => {
    setScalePercentage(pct);
    const newW = Math.max(1, Math.round((image.width * pct) / 100));
    const newH = Math.max(1, Math.round((image.height * pct) / 100));
    setTargetWidth(newW);
    setTargetHeight(newH);
  };

  // Apply Preset
  const handleApplyPreset = (preset: typeof PRESET_RESOLUTIONS[0]) => {
    setLockAspectRatio(false);
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setScalePercentage(Math.round((preset.width / image.width) * 100));
  };

  const performResize = async () => {
    setIsProcessing(true);
    try {
      const options: ResizeOptions = {
        width: targetWidth,
        height: targetHeight,
        lockAspectRatio,
        format,
        quality,
        smoothingQuality,
      };
      const res = await resizeImage(image.dataUrl, options);
      setResizedResult(res);
    } catch (err) {
      console.error('Resize error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    performResize();
  }, [targetWidth, targetHeight, format, quality, smoothingQuality]);

  const handleDownload = () => {
    if (!resizedResult) return;
    const extension = format === 'jpeg' ? 'jpg' : format;
    const filename = getStandardFilename(image.name, 'bgmove-resized', extension);
    downloadFile(resizedResult.blob, filename);

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.85 },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Scaling className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
              Image Resizer & Scaler
              {resizedResult && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Resized
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Original: <strong className="text-slate-700 dark:text-slate-300 font-mono">{image.width} × {image.height} px</strong> ({image.formattedSize})
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Upload New Image
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Preview & Dimension Stats (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resized Dimensions Preview
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                {targetWidth} × {targetHeight} px
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center relative border border-slate-200 dark:border-slate-800">
              <div className="w-full h-full flex items-center justify-center bg-slate-900 p-2">
                {resizedResult ? (
                  <img
                    src={resizedResult.dataUrl}
                    alt="Resized output"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="animate-spin w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full" />
                )}
              </div>
            </div>

            {/* Metrics Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block">Original Dimensions</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {image.width} × {image.height}
                </span>
                <span className="text-[10px] text-slate-500 block">Aspect {aspectRatio.toFixed(2)}:1</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block">New Dimensions</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                  {targetWidth} × {targetHeight}
                </span>
                <span className="text-[10px] text-slate-500 block">Scaled {scalePercentage}%</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block">Estimated File Size</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {resizedResult ? formatBytes(resizedResult.sizeBytes) : '...'}
                </span>
                <span className="text-[10px] text-slate-500 block">{format.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Resize Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-500" />
                Custom Dimensions
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter pixel values or select a social media preset.
              </p>
            </div>

            {/* Width & Height Inputs */}
            <div className="grid grid-cols-11 gap-2 items-center">
              <div className="col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Lock Aspect Ratio Button */}
              <div className="col-span-1 flex justify-center pt-5">
                <button
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`p-2 rounded-xl transition-all ${
                    lockAspectRatio
                      ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                  title={lockAspectRatio ? 'Aspect Ratio Locked (Proportional)' : 'Aspect Ratio Unlocked'}
                >
                  {lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>

              <div className="col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Scale percentage quick buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Scale Percentage</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{scalePercentage}%</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePercentageChange(pct)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scalePercentage === pct
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Social Media & Preset Dimensions */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Quick Platform Presets
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {PRESET_RESOLUTIONS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 text-left flex items-center justify-between text-xs transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <preset.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        {preset.label}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 shrink-0 ml-2">
                      {preset.width} × {preset.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      format === fmt
                        ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {fmt === 'jpeg' ? 'JPG' : fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownload}
                disabled={isProcessing || !resizedResult}
                className="w-full py-3.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Resized Image ({targetWidth} × {targetHeight}px)
              </button>

              <button
                onClick={onReset}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
