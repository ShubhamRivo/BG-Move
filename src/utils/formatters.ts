/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Trigger browser file download from Blob or DataURL
 */
export function downloadFile(source: Blob | string, filename: string): void {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  if (typeof source !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Generate standardized filenames for tools
 */
export function getStandardFilename(
  originalName: string,
  prefix: 'bgmove-removed' | 'bgmove-converted' | 'bgmove-resized' | 'bgmove-compressed',
  extension: string
): string {
  // Strip original extension
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const sanitized = baseName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 25);
  return `${prefix}_${sanitized}.${extension.replace('.', '')}`;
}

/**
 * Convert file to Image Object
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to decode image: ' + err));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Load Image element from Data URL
 */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image from URL: ' + err));
    img.src = dataUrl;
  });
}
