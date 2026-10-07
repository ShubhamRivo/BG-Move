export interface SampleImage {
  id: string;
  title: string;
  category: 'Portrait' | 'Product' | 'Animal' | 'Landscape';
  thumbnailUrl: string;
  fullUrl: string;
  description: string;
  sizeLabel: string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'portrait-1',
    title: 'Model Portrait',
    category: 'Portrait',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    description: 'Fine curly hair detail on studio background - test edge preservation',
    sizeLabel: '1200 × 1600 · 480 KB',
  },
  {
    id: 'product-sneaker',
    title: 'Nike Sneaker',
    category: 'Product',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
    description: 'Crisp e-commerce red shoe on solid background - ideal for product cutouts',
    sizeLabel: '1200 × 800 · 320 KB',
  },
  {
    id: 'animal-cat',
    title: 'Fluffy Golden Cat',
    category: 'Animal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=85',
    description: 'Detailed fur contours and whiskers - tests fine alpha segmentation',
    sizeLabel: '1200 × 800 · 410 KB',
  },
  {
    id: 'landscape-mountain',
    title: 'High-Res Mountain',
    category: 'Landscape',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=90',
    description: 'Ultra HD 4K landscape photo - ideal for Resizing & MB to KB compression',
    sizeLabel: '2400 × 1600 · 3.2 MB',
  },
];

/**
 * Load a remote image URL into a local File object so it can be processed
 */
export async function fetchSampleAsFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error(`Failed to fetch sample image (${response.status})`);
  const blob = await response.blob();
  const extension = blob.type.split('/')[1] || 'jpg';
  const name = filename.includes('.') ? filename : `${filename}.${extension}`;
  return new File([blob], name, { type: blob.type || 'image/jpeg' });
}
