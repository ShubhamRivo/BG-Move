export type ToolType = 'bg-remover' | 'converter' | 'resizer' | 'compressor';

export interface ImageFileState {
  file: File;
  name: string;
  originalSize: number; // in bytes
  formattedSize: string;
  type: string;
  width: number;
  height: number;
  dataUrl: string;
  aspectRatio: number;
}

export interface BgRemovalResult {
  dataUrl: string;
  blob: Blob;
  processingTimeMs: number;
  engineUsed: 'imgly-ai' | 'smart-matting' | 'api-server';
}

export interface ConversionOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.1 to 1.0 (for jpeg/webp)
  backgroundColor?: string; // used when converting transparent PNG to JPG
}

export interface ResizeOptions {
  width: number;
  height: number;
  lockAspectRatio: boolean;
  format: 'png' | 'jpeg' | 'webp' | 'original';
  quality: number;
  smoothingQuality: 'high' | 'medium' | 'low';
}

export interface CompressionOptions {
  targetSizeBytes: number; // e.g. 200 * 1024
  targetSizeUnit: 'KB' | 'MB';
  targetSizeValue: number;
  outputFormat: 'jpeg' | 'webp' | 'png';
  maxQuality: number;
  minQuality: number;
}

export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  sizeBytes: number;
  formattedSize: string;
  reductionPercentage: number;
  width: number;
  height: number;
  qualityUsed: number;
  iterations: number;
}

export interface BackgroundStyle {
  type: 'transparent' | 'color' | 'gradient' | 'blur' | 'custom-image';
  color?: string;
  gradient?: string;
  blurRadius?: number;
  customImageDataUrl?: string;
}
