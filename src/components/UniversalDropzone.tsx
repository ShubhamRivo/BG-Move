import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, FileCheck, HelpCircle } from 'lucide-react';
import { SAMPLE_IMAGES, fetchSampleAsFile } from '../utils/sampleImages';
import { ImageFileState } from '../types';
import { formatBytes, loadImageFromFile } from '../utils/formatters';

interface UniversalDropzoneProps {
  onImageSelected: (imageState: ImageFileState) => void;
  activeToolName?: string;
  className?: string;
}

export const UniversalDropzone: React.FC<UniversalDropzoneProps> = ({
  onImageSelected,
  activeToolName = 'Image Tool',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i)) {
      setErrorMessage('Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25 MB limit. Please select a smaller image.');
      return;
    }

    try {
      const img = await loadImageFromFile(file);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      const dataUrl = img.src;

      const imageState: ImageFileState = {
        file,
        name: file.name,
        originalSize: file.size,
        formattedSize: formatBytes(file.size),
        type: file.type || 'image/jpeg',
        width,
        height,
        dataUrl,
        aspectRatio: width / (height || 1),
      };

      onImageSelected(imageState);
    } catch (err: any) {
      setErrorMessage('Failed to read and decode image: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Clipboard Paste (Ctrl+V / Cmd+V) Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          processFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSampleClick = async (sample: typeof SAMPLE_IMAGES[0]) => {
    setIsLoadingSample(sample.id);
    setErrorMessage(null);
    try {
      const file = await fetchSampleAsFile(sample.fullUrl, `${sample.id}.jpg`);
      await processFile(file);
    } catch (err: any) {
      setErrorMessage('Could not load sample: ' + (err.message || 'Network error'));
    } finally {
      setIsLoadingSample(null);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Upload Dropzone Container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative overflow-hidden cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center group
          ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 scale-[1.01] shadow-2xl animate-pulse-border'
              : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 shadow-lg backdrop-blur-md'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/bmp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Ambient Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {/* Main Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
            <UploadCloud className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Upload an image for <span className="text-indigo-600 dark:text-indigo-400">{activeToolName}</span>
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Drag and drop your file here, paste from clipboard <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">Ctrl+V</kbd>, or click to browse.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              JPG / JPEG
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
              PNG (Transparent)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300">
              WEBP
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium text-slate-400 dark:text-slate-500">
              Max 25 MB
            </span>
          </div>

          <button
            type="button"
            className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Select Image from Device
          </button>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Upload Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Test Sample Images */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Or Try A Sample Image Immediately
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            1-Click instant test
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSampleClick(sample);
              }}
              disabled={isLoadingSample !== null}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left transition-all hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {isLoadingSample === sample.id && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Loading...
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  {sample.category}
                </span>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {sample.title}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {sample.sizeLabel}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
