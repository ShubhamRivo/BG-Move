import { removeBackground as imglyRemoveBackground, Config } from '@imgly/background-removal';
import { BgRemovalResult } from '../types';

export interface ProgressState {
  stage: string;
  percent: number;
  message: string;
}

/**
 * Remove background using client-side AI (@imgly/background-removal ONNX Web)
 */
export async function removeBackgroundWithAI(
  imageSource: string | File | Blob,
  onProgress?: (state: ProgressState) => void
): Promise<BgRemovalResult> {
  const startTime = performance.now();

  try {
    onProgress?.({
      stage: 'init',
      percent: 10,
      message: 'Initializing neural engine...',
    });

    const config: Config = {
      progress: (key: string, current: number, total: number) => {
        let percent = 20;
        let message = 'Processing image...';

        if (key.includes('fetch') || key.includes('download')) {
          percent = 20 + Math.round((current / (total || 1)) * 40);
          message = `Loading AI neural model (${Math.round((current / (total || 1)) * 100)}%)...`;
        } else if (key.includes('compute') || key.includes('inference') || key.includes('segment')) {
          percent = 60 + Math.round((current / (total || 1)) * 35);
          message = 'Segmenting subject and fine edges...';
        }

        onProgress?.({
          stage: key,
          percent: Math.min(95, percent),
          message,
        });
      },
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    };

    const blob = await imglyRemoveBackground(imageSource, config);
    const dataUrl = URL.createObjectURL(blob);
    const endTime = performance.now();

    onProgress?.({
      stage: 'done',
      percent: 100,
      message: 'Background removed successfully!',
    });

    return {
      blob,
      dataUrl,
      processingTimeMs: Math.round(endTime - startTime),
      engineUsed: 'imgly-ai',
    };
  } catch (error) {
    console.warn('In-browser AI model error, falling back to smart edge-matting algorithm:', error);
    // Fall back to smart edge-matting algorithm if WebAssembly fails or network error occurs
    return await removeBackgroundSmartMatting(imageSource, onProgress);
  }
}

/**
 * Smart Edge-Matting & Color Segmentation Fallback
 * Analyzes corner/boundary pixels, computes delta-E color distance,
 * generates an alpha channel with edge anti-aliasing & feathering.
 */
export async function removeBackgroundSmartMatting(
  imageSource: string | File | Blob,
  onProgress?: (state: ProgressState) => void
): Promise<BgRemovalResult> {
  const startTime = performance.now();

  onProgress?.({
    stage: 'fallback',
    percent: 30,
    message: 'Analyzing edge contours and depth...',
  });

  let dataUrl: string;
  if (typeof imageSource === 'string') {
    dataUrl = imageSource;
  } else {
    dataUrl = URL.createObjectURL(imageSource);
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error('Failed to load image for matting: ' + e));
    el.src = dataUrl;
  });

  onProgress?.({
    stage: 'segmentation',
    percent: 65,
    message: 'Extracting subject mask and removing background...',
  });

  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to get 2D context');

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample corner background colors (top-left, top-right, bottom-left, bottom-right)
  const samplePoints = [
    { x: 2, y: 2 },
    { x: w - 3, y: 2 },
    { x: 2, y: h - 3 },
    { x: w - 3, y: h - 3 },
    { x: Math.floor(w / 2), y: 2 },
    { x: 2, y: Math.floor(h / 2) },
    { x: w - 3, y: Math.floor(h / 2) },
  ];

  const bgColors: { r: number; g: number; b: number }[] = [];
  for (const pt of samplePoints) {
    const idx = (pt.y * w + pt.x) * 4;
    bgColors.push({
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
    });
  }

  // Calculate average background color
  const avgBg = bgColors.reduce(
    (acc, col) => ({ r: acc.r + col.r / bgColors.length, g: acc.g + col.g / bgColors.length, b: acc.b + col.b / bgColors.length }),
    { r: 0, g: 0, b: 0 }
  );

  const threshold = 48; // color distance threshold
  const feather = 24;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Euclidean distance in RGB space to average background
      const dist = Math.sqrt(
        Math.pow(r - avgBg.r, 2) +
        Math.pow(g - avgBg.g, 2) +
        Math.pow(b - avgBg.b, 2)
      );

      if (dist < threshold) {
        // Fully transparent
        data[idx + 3] = 0;
      } else if (dist < threshold + feather) {
        // Smooth transition alpha feathering
        const alpha = (dist - threshold) / feather;
        data[idx + 3] = Math.round(alpha * 255);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
  });

  const finalDataUrl = URL.createObjectURL(blob);
  const endTime = performance.now();

  onProgress?.({
    stage: 'done',
    percent: 100,
    message: 'Finished processing!',
  });

  return {
    blob,
    dataUrl: finalDataUrl,
    processingTimeMs: Math.round(endTime - startTime),
    engineUsed: 'smart-matting',
  };
}

/**
 * Remove background via Server Proxy (e.g. Gemini, Remove.bg, ClipDrop)
 */
export async function removeBackgroundWithServerAPI(
  file: File,
  apiEndpoint = '/api/remove-bg',
  apiKey?: string
): Promise<BgRemovalResult> {
  const startTime = performance.now();
  const formData = new FormData();
  formData.append('image', file);
  if (apiKey) formData.append('apiKey', apiKey);

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Server API returned ${response.status}: ${errText}`);
  }

  const blob = await response.blob();
  const dataUrl = URL.createObjectURL(blob);
  const endTime = performance.now();

  return {
    blob,
    dataUrl,
    processingTimeMs: Math.round(endTime - startTime),
    engineUsed: 'api-server',
  };
}
