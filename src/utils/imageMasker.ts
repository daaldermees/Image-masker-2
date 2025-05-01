import { MaskDefinition, masks } from '../store/slices/imageMaskerSlice';

export interface MaskOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  selectedMaskId: string;
  backgroundColor: string;
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
  flipH?: number;
  flipV?: number;
  autoFit?: boolean;
}

// Calculates the zoom level needed to make the image cover the mask area
export const calculateCoverZoom = (image: HTMLImageElement, mask: MaskDefinition): number => {
  const imageAspect = image.width / image.height;
  const maskAspect = mask.w / mask.h;
  
  // If image is wider than the mask, scale based on height (and vice versa)
  if (imageAspect > maskAspect) {
    return mask.h / image.height;
  } else {
    return mask.w / image.width;
  }
};

export const applyMask = (options: MaskOptions): void => {
  const { 
    canvas, 
    image, 
    selectedMaskId, 
    backgroundColor,
    offsetX = 0,
    offsetY = 0,
    zoom = 1,
    flipH = 1,
    flipV = 1,
    autoFit = false
  } = options;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Find the selected mask
  const selectedMask = masks.find(mask => mask.id === selectedMaskId) || masks[0];
  
  // Set canvas dimensions based on mask aspect ratio
  const aspectRatio = selectedMask.h / selectedMask.w;
  const canvasWidth = 600; // Fixed width for preview
  const canvasHeight = canvasWidth * aspectRatio;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Clear canvas with white (transparent) background
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Calculate center for transformations
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Apply mask with flipping
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(flipH, flipV); // Apply flip to the mask
  ctx.translate(-centerX, -centerY);
  
  const scaleX = canvasWidth / selectedMask.w;
  const scaleY = canvasHeight / selectedMask.h;
  
  // Create mask path
  ctx.scale(scaleX, scaleY);
  const maskPath = new Path2D(selectedMask.path);
  
  // Fill the mask with the background color
  ctx.fillStyle = backgroundColor;
  ctx.fill(maskPath);
  
  // Set up for clipping
  ctx.clip(maskPath);
  ctx.restore();
  
  // Apply image transformations
  ctx.save();
  
  // Apply the clipping mask again with flipping
  ctx.translate(centerX, centerY);
  ctx.scale(flipH, flipV); // Apply flip to the mask again for clipping
  ctx.translate(-centerX, -centerY);
  ctx.scale(scaleX, scaleY);
  ctx.clip(new Path2D(selectedMask.path));
  
  // Reset transform for image drawing
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  // Apply image transformations (no flipping applied to image)
  ctx.translate(centerX, centerY);
  
  // Calculate zoom level
  let finalZoom = zoom;
  if (autoFit) {
    // Scale image to fit mask
    const coverZoom = calculateCoverZoom(image, selectedMask) * Math.max(scaleX, scaleY) * 1.1; // Add 10% extra to ensure full coverage
    finalZoom = coverZoom;
  }
  
  // Calculate the scaled image dimensions
  const scaledWidth = image.width * finalZoom;
  const scaledHeight = image.height * finalZoom;
  
  // Draw the image with positioning
  ctx.drawImage(
    image, 
    -scaledWidth / 2 + offsetX, 
    -scaledHeight / 2 + offsetY, 
    scaledWidth, 
    scaledHeight
  );
  
  ctx.restore();
};

// Helper function to check image transparency
export const checkImageTransparency = (image: HTMLImageElement): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Check if any pixel has alpha < 255
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] < 255) {
      return true;
    }
  }
  
  return false;
};

// Helper function to generate mask preview images
export const createMaskPreview = (mask: MaskDefinition, size: number = 100): string => {
  const canvas = document.createElement('canvas');
  const ratio = mask.h / mask.w;
  canvas.width = size;
  canvas.height = size * ratio;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Draw mask shape
  ctx.fillStyle = '#ccc';
  const path = new Path2D(mask.path);
  ctx.scale(canvas.width / mask.w, canvas.height / mask.h);
  ctx.fill(path);
  
  return canvas.toDataURL('image/png');
}; 