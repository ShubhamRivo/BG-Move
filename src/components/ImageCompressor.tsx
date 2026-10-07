import React, { useState, useEffect } from 'react';
import { 
  Download, RotateCcw, FileArchive, Check, Sparkles, 
  TrendingDown, Sliders, Zap, AlertCircle, Eye 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageFileState, CompressionOptions, CompressionResult } from '../types';
import { compressToTargetSize } from '../utils/imageProcessing';
import { formatBytes, downloadFile, getStandardFilename } from '../utils/formatters';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface ImageCompressorProps {
  image: ImageFileState;
  onReset: () => void;
}

const PRESET_TARGETS = [
  { label: '50 KB', value: 50, unit: 'KB' as const, bytes: 50 * 1024, tag: 'Ultra Small' },
  { label: '100 KB', value: 100, unit: 'KB' as const, bytes: 100 * 1024, tag: 'Web Optimal' },
  { label: '200 KB', value: 200, unit: 'KB' as const, bytes: 200 * 1024, tag: 'High Quality' },
  { label: '300 KB', value: 300, unit: 'KB' as const, bytes: 300 * 1024, tag: 'Crisp' },
  { label: '500 KB', value: 500, unit: 'KB' as const, bytes: 500 * 1024, tag: 'HD Photo' },
  { label: '1 MB', value: 1, unit: 'MB' as const, bytes: 1024 * 1024, tag: 'Print / Banner' },
];

export const ImageCompressor: React.FC<ImageCompressorProps> = ({
  image,
  onReset,
}) => {
  // Select initial target smaller than original size
  const defaultTarget = PRESET_TARGETS.find((p) => p.bytes < image.originalSize) || PRESET_TARGETS[1];
  const [selectedPresetBytes, setSelectedPresetBytes] = useState<number>(defaultTarget.bytes);
  const [customValue, setCustomValue] = useState<number>(defaultTarget.value);
  const [customUnit, setCustomUnit] = useState<'KB' | 'MB'>(defaultTarget.unit);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [format, setFormat] = useState<'jpeg' | 'webp' | 'png'>('jpeg');

  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [viewMode, setViewMode] = useState<'slider' | 'single'>('slider');

  const currentTargetBytes = isCustom 
    ? (customUnit === 'MB' ? customValue * 1024 * 1024 : customValue * 1024)
    : selectedPresetBytes;

  const performCompression = async () => {
    setIsCompressing(true);
    setProgressPercent(10);
    try {
      const options: CompressionOptions = {
        targetSizeBytes: Math.max(5 * 1024, currentTargetBytes),
        targetSizeUnit: customUnit,
        targetSizeValue: customValue,
        outputFormat: format,
        maxQuality: 0.98,
        minQuality: 0.05,
      };

      const res = await compressToTargetSize(
        image.dataUrl,
        image.originalSize,
        options,
        (pct) => setProgressPercent(pct)
      );

      setResult(res);
    } catch (err) {
      console.error('Compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  useEffect(() => {
    performCompression();
  }, [selectedPresetBytes, isCustom, customValue, customUnit, format]);

  const handleDownload = () => {
    if (!result) return;
    const extension = format === 'jpeg' ? 'jpg' : format;
    const filename = getStandardFilename(image.name, 'bgmove-compressed', extension);
    downloadFile(result.blob, filename);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.85 },
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
              MB to KB Image Compressor
              {result && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Reduced by {result.reductionPercentage}%
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Original Size: <strong className="text-slate-700 dark:text-slate-300 font-mono">{image.formattedSize}</strong> ({image.width} × {image.height}px)
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
        {/* Left Column: Visual Quality Inspector & Before/After (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Quality Inspector
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'slider' ? 'single' : 'slider')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {viewMode === 'slider' ? 'Split Slider' : 'Result View'}
                </button>
              </div>
            </div>

            {/* Interactive Preview View */}
            <div className="min-h-[360px] rounded-2xl overflow-hidden bg-slate-950 relative flex items-center justify-center border border-slate-200 dark:border-slate-800">
              {isCompressing ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-3 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Compressing & Optimizing Pixels...</p>
                    <p className="text-xs text-slate-400">Binary search quality optimization</p>
                  </div>
                </div>
              ) : result ? (
                viewMode === 'slider' ? (
                  <BeforeAfterSlider
                    beforeImage={image.dataUrl}
                    afterImage={result.dataUrl}
                    beforeLabel={`Original (${image.formattedSize})`}
                    afterLabel={`Compressed (${result.formattedSize})`}
                    showCheckerboardAfter={false}
                    className="w-full h-full min-h-[360px]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 bg-slate-900">
                    <img
                      src={result.dataUrl}
                      alt="Compressed result"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                )
              ) : null}
            </div>

            {/* Compression Efficiency Card */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-400 block">Original</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {image.formattedSize}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{image.width} × {image.height}</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">Compressed</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {result.formattedSize}
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 block">{result.width} × {result.height}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-400 block">Saved Space</span>
                  <span className="text-sm font-bold text-emerald-500 font-mono flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {result.reductionPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">{formatBytes(image.originalSize - result.sizeBytes)}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-400 block">Quality Level</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {result.qualityUsed}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">{result.iterations} passes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Compression Target Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-500" />
                Select Target File Size
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a target size preset or type custom KB/MB values.
              </p>
            </div>

            {/* Target Size Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_TARGETS.map((preset) => {
                const isSelected = !isCustom && selectedPresetBytes === preset.bytes;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedPresetBytes(preset.bytes);
                      setCustomValue(preset.value);
                      setCustomUnit(preset.unit);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-sm font-bold font-mono">{preset.label}</div>
                    <span className="text-[10px] text-slate-400 block truncate">{preset.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Target Size Selector */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Custom Target Size
                </label>
                <button
                  onClick={() => setIsCustom(true)}
                  className={`text-[11px] font-semibold ${isCustom ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {isCustom ? '● Custom Active' : 'Use Custom'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="10000"
                  value={customValue}
                  onChange={(e) => {
                    setIsCustom(true);
                    setCustomValue(Math.max(1, parseInt(e.target.value) || 1));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 150"
                />

                <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                  <button
                    onClick={() => {
                      setIsCustom(true);
                      setCustomUnit('KB');
                    }}
                    className={`px-3 py-2 text-xs font-bold ${
                      customUnit === 'KB' && isCustom
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    KB
                  </button>
                  <button
                    onClick={() => {
                      setIsCustom(true);
                      setCustomUnit('MB');
                    }}
                    className={`px-3 py-2 text-xs font-bold ${
                      customUnit === 'MB' && isCustom
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    MB
                  </button>
                </div>
              </div>
            </div>

            {/* Format Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Output Compression Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFormat('jpeg')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    format === 'jpeg'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  JPG (Best)
                </button>
                <button
                  onClick={() => setFormat('webp')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    format === 'webp'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  WEBP
                </button>
                <button
                  onClick={() => setFormat('png')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    format === 'png'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PNG
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownload}
                disabled={isCompressing || !result}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Compressed Image ({result ? result.formattedSize : '...'})
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
