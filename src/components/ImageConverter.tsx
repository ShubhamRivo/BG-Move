import React, { useState, useEffect } from 'react';
import { 
  Download, RotateCcw, ArrowRightLeft, Check, Sparkles, 
  Layers, HardDrive, FileType, Sliders, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageFileState, ConversionOptions } from '../types';
import { convertImage } from '../utils/imageProcessing';
import { formatBytes, downloadFile, getStandardFilename } from '../utils/formatters';

interface ImageConverterProps {
  image: ImageFileState;
  onReset: () => void;
}

export const ImageConverter: React.FC<ImageConverterProps> = ({
  image,
  onReset,
}) => {
  // Determine default target format opposite of source
  const isSourcePng = image.type.includes('png') || image.name.toLowerCase().endsWith('.png');
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>(isSourcePng ? 'jpeg' : 'png');
  const [quality, setQuality] = useState<number>(0.92); // 92% default for high visual fidelity
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff'); // for JPEG fallback
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedResult, setConvertedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    sizeBytes: number;
  } | null>(null);

  const performConversion = async () => {
    setIsProcessing(true);
    try {
      const options: ConversionOptions = {
        format: targetFormat,
        quality,
        backgroundColor,
      };
      const res = await convertImage(image.dataUrl, options);
      setConvertedResult(res);
    } catch (err) {
      console.error('Conversion failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    performConversion();
  }, [image.dataUrl, targetFormat, quality, backgroundColor]);

  const handleDownload = () => {
    if (!convertedResult) return;
    const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
    const filename = getStandardFilename(image.name, 'bgmove-converted', extension);
    downloadFile(convertedResult.blob, filename);

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.85 },
    });
  };

  // Calculate size differences
  const sizeDiffBytes = convertedResult ? convertedResult.sizeBytes - image.originalSize : 0;
  const isSmaller = sizeDiffBytes < 0;
  const percentageDiff = image.originalSize > 0 && convertedResult 
    ? Math.abs(Math.round((sizeDiffBytes / image.originalSize) * 100))
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
              JPG ↔ PNG ↔ WEBP Converter
              {convertedResult && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Converted
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Source: <strong className="text-slate-700 dark:text-slate-300">{image.name}</strong> ({image.formattedSize})
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
        {/* Left Column: Visual Preview & Size Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Converted Output Preview
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                .{targetFormat === 'jpeg' ? 'JPG' : targetFormat.toUpperCase()}
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center relative border border-slate-200 dark:border-slate-800">
              <div className={`w-full h-full flex items-center justify-center ${targetFormat === 'png' ? 'bg-checkerboard' : 'bg-slate-900'}`}>
                {convertedResult ? (
                  <img
                    src={convertedResult.dataUrl}
                    alt="Converted output"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
                )}
              </div>
            </div>

            {/* Metrics Comparison Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block">Original Size</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {image.formattedSize}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {image.type.split('/')[1]?.toUpperCase() || 'ORIGINAL'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block">Converted Size</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {convertedResult ? formatBytes(convertedResult.sizeBytes) : '...'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {targetFormat === 'jpeg' ? 'JPEG' : targetFormat.toUpperCase()}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block">Difference</span>
                <span className={`text-sm font-bold font-mono ${isSmaller ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isSmaller ? `-${percentageDiff}%` : `+${percentageDiff}%`}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {isSmaller ? 'Smaller file' : 'Larger file'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Conversion Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-500" />
                Format & Quality Settings
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose output format and fine-tune compression levels.
              </p>
            </div>

            {/* Format Selection Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Target Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTargetFormat('png')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                    targetFormat === 'png'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm">PNG</div>
                  <span className="text-[10px] font-normal opacity-75">Lossless + Alpha</span>
                </button>

                <button
                  onClick={() => setTargetFormat('jpeg')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                    targetFormat === 'jpeg'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm">JPG / JPEG</div>
                  <span className="text-[10px] font-normal opacity-75">High Compact</span>
                </button>

                <button
                  onClick={() => setTargetFormat('webp')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                    targetFormat === 'webp'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm">WEBP</div>
                  <span className="text-[10px] font-normal opacity-75">Modern Web</span>
                </button>
              </div>
            </div>

            {/* Quality Slider (for JPG & WEBP) */}
            {targetFormat !== 'png' ? (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Image Quality</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Smallest Size (10%)</span>
                  <span>Balanced (80-92%)</span>
                  <span>Max Quality (100%)</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-300">
                ✨ PNG uses lossless compression. Every pixel is preserved with 100% mathematical fidelity.
              </div>
            )}

            {/* Background Fill color for PNG -> JPG */}
            {targetFormat === 'jpeg' && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Background Fill Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0"
                    />
                    <span className="font-mono text-[11px] text-slate-500 uppercase">{backgroundColor}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Since JPEG doesn't support transparency, any transparent areas will be filled with this color (defaults to clean white).
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownload}
                disabled={isProcessing || !convertedResult}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download {targetFormat === 'jpeg' ? 'JPG' : targetFormat.toUpperCase()} ({convertedResult ? formatBytes(convertedResult.sizeBytes) : '...'})
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
