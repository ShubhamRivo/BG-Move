import { ConversionOptions, ResizeOptions, CompressionOptions, CompressionResult, BackgroundStyle } from '../types';
import { formatBytes, loadImageFromDataUrl } from './formatters';

/**
 * Convert an image Data URL to target format and quality
 */
export async function convertImage(
  sourceDataUrl: string,
  options: ConversionOptions
): Promise<{ blob: Blob; dataUrl: string; sizeBytes: number }> {
  const img = await loadImageFromDataUrl(sourceDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not initialize 2D Canvas context');

  // If converting to JPEG (which lacks alpha channel), fill background with color
  if (options.format === 'jpeg') {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType = options.format === 'png' ? 'image/png' : options.format === 'webp' ? 'image/webp' : 'image/jpeg';
  const quality = options.format === 'png' ? undefined : options.quality;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create Blob from canvas'));
          return;
        }
        const dataUrl = URL.createObjectURL(blob);
        resolve({
          blob,
          dataUrl,
          sizeBytes: blob.size,
        });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Resize an image to new dimensions
 */
export async function resizeImage(
  sourceDataUrl: string,
  options: ResizeOptions
): Promise<{ blob: Blob; dataUrl: string; sizeBytes: number; width: number; height: number }> {
  const img = await loadImageFromDataUrl(sourceDataUrl);
  const canvas = document.createElement('canvas');
  const targetWidth = Math.max(1, Math.round(options.width));
  const targetHeight = Math.max(1, Math.round(options.height));
  
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D Canvas context');

  // Configure smoothing
  ctx.imageSmoothingEnabled = options.smoothingQuality !== 'low';
  if (ctx.imageSmoothingEnabled) {
    ctx.imageSmoothingQuality = options.smoothingQuality === 'high' ? 'high' : 'medium';
  }

  // Handle format background if jpeg
  const mimeType = options.format === 'png' 
    ? 'image/png' 
    : options.format === 'webp' 
    ? 'image/webp' 
    : options.format === 'jpeg' 
    ? 'image/jpeg' 
    : 'image/png';

  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const quality = mimeType === 'image/png' ? undefined : options.quality;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create Blob from canvas'));
          return;
        }
        const dataUrl = URL.createObjectURL(blob);
        resolve({
          blob,
          dataUrl,
          sizeBytes: blob.size,
          width: targetWidth,
          height: targetHeight,
        });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Intelligent MB to KB Image Compressor
 * Uses multi-pass binary search over quality + proportional dimension scaling
 * to hit the desired target size without exceeding it.
 */
export async function compressToTargetSize(
  sourceDataUrl: string,
  originalSizeBytes: number,
  options: CompressionOptions,
  onProgress?: (progressPercent: number) => void
): Promise<CompressionResult> {
  const img = await loadImageFromDataUrl(sourceDataUrl);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;
  const targetBytes = options.targetSizeBytes;

  const mimeType = options.outputFormat === 'png' 
    ? 'image/png' 
    : options.outputFormat === 'webp' 
    ? 'image/webp' 
    : 'image/jpeg';

  let currentScale = 1.0;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.85;
  let iterations = 0;
  const maxIterations = 14;

  // Helper to test a canvas output
  const testCompression = async (scale: number, quality: number): Promise<Blob> => {
    const w = Math.max(1, Math.round(origW * scale));
    const h = Math.max(1, Math.round(origH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
        mimeType,
        mimeType === 'image/png' ? undefined : quality
      );
    });
  };

  // If format is PNG, PNG is lossless so we adjust scale directly
  if (mimeType === 'image/png') {
    let lowScale = 0.05;
    let highScale = 1.0;

    for (let i = 0; i < 8; i++) {
      iterations++;
      currentScale = (lowScale + highScale) / 2;
      onProgress?.(Math.round(((i + 1) / 8) * 100));
      const blob = await testCompression(currentScale, 1.0);
      
      if (blob.size <= targetBytes) {
        bestBlob = blob;
        // Try larger scale to get better quality
        lowScale = currentScale;
      } else {
        highScale = currentScale;
      }
    }

    if (!bestBlob) {
      // Scale down further
      bestBlob = await testCompression(0.1, 1.0);
      currentScale = 0.1;
    }
  } else {
    // For JPEG / WebP, we first optimize quality at full resolution
    let lowQ = 0.05;
    let highQ = 0.95;
    let fullResUnderTarget = false;

    for (let i = 0; i < 6; i++) {
      iterations++;
      const testQ = (lowQ + highQ) / 2;
      onProgress?.(Math.round((iterations / maxIterations) * 100));
      const blob = await testCompression(1.0, testQ);

      if (blob.size <= targetBytes) {
        bestBlob = blob;
        bestQuality = testQ;
        lowQ = testQ;
        fullResUnderTarget = true;
      } else {
        highQ = testQ;
      }
    }

    // If even lowest quality at 1.0 scale exceeds target, downscale dimensions
    if (!fullResUnderTarget || (bestBlob && bestBlob.size > targetBytes)) {
      let lowScale = 0.1;
      let highScale = 1.0;
      bestQuality = 0.75; // Keep good visual fidelity while scaling down

      for (let j = 0; j < 6; j++) {
        iterations++;
        currentScale = (lowScale + highScale) / 2;
        onProgress?.(Math.round((iterations / maxIterations) * 100));
        const blob = await testCompression(currentScale, bestQuality);

        if (blob.size <= targetBytes) {
          bestBlob = blob;
          lowScale = currentScale;
        } else {
          highScale = currentScale;
        }
      }
    }
  }

  // Fallback if still null
  if (!bestBlob) {
    bestBlob = await testCompression(0.3, 0.5);
    currentScale = 0.3;
    bestQuality = 0.5;
  }

  const finalWidth = Math.max(1, Math.round(origW * currentScale));
  const finalHeight = Math.max(1, Math.round(origH * currentScale));
  const dataUrl = URL.createObjectURL(bestBlob);
  const sizeBytes = bestBlob.size;
  const reductionPercentage = Math.round(((originalSizeBytes - sizeBytes) / originalSizeBytes) * 100);

  return {
    blob: bestBlob,
    dataUrl,
    sizeBytes,
    formattedSize: formatBytes(sizeBytes),
    reductionPercentage: Math.max(0, reductionPercentage),
    width: finalWidth,
    height: finalHeight,
    qualityUsed: Math.round(bestQuality * 100),
    iterations,
  };
}

/**
 * Composite a cutout transparent PNG with custom background
 * (solid color, gradient, blur of original, or uploaded image)
 */
export async function compositeBackground(
  cutoutDataUrl: string,
  originalDataUrl: string,
  style: BackgroundStyle
): Promise<{ blob: Blob; dataUrl: string }> {
  const cutoutImg = await loadImageFromDataUrl(cutoutDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = cutoutImg.naturalWidth || cutoutImg.width;
  canvas.height = cutoutImg.naturalHeight || cutoutImg.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D Canvas');

  // Render chosen background
  if (style.type === 'transparent') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if (style.type === 'color' && style.color) {
    ctx.fillStyle = style.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (style.type === 'gradient' && style.gradient) {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    // Parse CSS linear gradient colors roughly or apply predefined
    const colors = style.gradient.split(',');
    if (colors.length >= 2) {
      grad.addColorStop(0, colors[0].trim());
      grad.addColorStop(1, colors[1].trim());
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = style.gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else if (style.type === 'blur') {
    const origImg = await loadImageFromDataUrl(originalDataUrl);
    ctx.save();
    ctx.filter = `blur(${style.blurRadius || 16}px)`;
    // Draw slightly scaled to prevent transparent edge bleed
    ctx.drawImage(origImg, -20, -20, canvas.width + 40, canvas.height + 40);
    ctx.restore();
  } else if (style.type === 'custom-image' && style.customImageDataUrl) {
    const bgImg = await loadImageFromDataUrl(style.customImageDataUrl);
    // Draw background cover
    const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
    const x = (canvas.width - bgImg.width * scale) / 2;
    const y = (canvas.height - bgImg.height * scale) / 2;
    ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
  }

  // Draw cutout on top
  ctx.drawImage(cutoutImg, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to composite image'));
        resolve({
          blob,
          dataUrl: URL.createObjectURL(blob),
        });
      },
      style.type === 'transparent' ? 'image/png' : 'image/jpeg',
      0.95
    );
  });
}
