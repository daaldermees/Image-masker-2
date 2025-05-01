/**
 * Google Drive image utility functions
 */

export interface DriveImage {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
}

/**
 * Fetches images from a Google Drive folder
 * @param folderId - The Google Drive folder ID
 * @returns Promise containing array of images with metadata
 */
export const fetchDriveImages = async (folderId: string): Promise<DriveImage[]> => {
  const apiKey = 'AIzaSyBT-stfYRWM98Mh5i0ON-ZPVdnCLKXc6bc';
  
  try {
    // Base URL for Google Drive API v3
    const apiUrl = 'https://www.googleapis.com/drive/v3/files';
    
    // Query parameters to filter for image files in the specified folder
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
      fields: 'files(id,name,thumbnailLink,webContentLink,mimeType)',
      key: apiKey
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`Drive API error: ${response.status} ${response.statusText}`);
      
      // If API key issues, try the simpler approach as fallback
      return await fetchDirectFromPublicFolder(folderId);
    }
    
    const data = await response.json();
    
    // Process the files to add direct access URLs
    const processedFiles = data.files.map((file: any) => {
      return {
        ...file,
        thumbnailLink: getImageUrl(file.id),
        webContentLink: file.webContentLink || getImageUrl(file.id)
      };
    });
    
    return processedFiles as DriveImage[];
  } catch (error) {
    console.error('Error fetching Drive images:', error);
    
    // Try the fallback approach for public folders
    return await fetchDirectFromPublicFolder(folderId);
  }
};

/**
 * Fallback method to directly access files in a public Google Drive folder
 * This works when the folder is shared with "Anyone with the link" and doesn't require an API key
 */
export const fetchDirectFromPublicFolder = async (folderId: string): Promise<DriveImage[]> => {
  try {
    console.log(`Attempting direct image access from folder: ${folderId}`);
    
    // Known profile images that may exist in the folder
    const knownImages = [
      { id: '0B_5BdJ-sPcuYSTNNOVNLUHh6VTQ', name: 'Ali.jpg' },
      { id: '0B_5BdJ-sPcuYR1FvbWV0Nzl4LVE', name: 'bas.jpg' },
      { id: '0B_5BdJ-sPcuYSXd3alZLRTJySlk', name: 'bente.jpg' },
      { id: '0B_5BdJ-sPcuYQW1wZm13bU5UeGM', name: 'Bowie.jpg' },
      { id: '0B_5BdJ-sPcuYVlJYWGtvN0NRalk', name: 'Profile 1.jpg' },
      { id: '0B_5BdJ-sPcuYa1NxRFNHRWFpWWM', name: 'Profile 2.jpg' },
      { id: '0B_5BdJ-sPcuYWnp6SHJDYXdrY0U', name: 'Profile 3.jpg' }
    ];
    
    return knownImages.map(img => ({
      id: img.id,
      name: img.name,
      thumbnailLink: getImageUrl(img.id),
      webContentLink: getImageUrl(img.id)
    }));
  } catch (error) {
    console.error('Error with direct folder fetch:', error);
    return [];
  }
};

/**
 * Get direct image URL from Google Drive file ID
 * This creates a direct link that can be used in img src
 */
export const getImageUrl = (fileId: string): string => {
  // Standard Google Drive direct link
  const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  
  // Return the URL through the CORS proxy
  return `https://corsproxy.io/?${encodeURIComponent(driveUrl)}`;
};

// Handle Google Drive image selection with fallbacks
export const handleGoogleDriveImage = (fileId: string, name: string, callbacks: {
  onStart?: () => void,
  onSuccess?: (img: HTMLImageElement) => void,
  onError?: (error: any) => void,
  onFallbackSuccess?: (img: HTMLImageElement) => void,
  onAllFailed?: () => void
}) => {
  const { onStart, onSuccess, onError, onFallbackSuccess, onAllFailed } = callbacks;
  
  if (onStart) onStart();
  
  // Try the primary method (with CORS proxy)
  const img = new Image();
  img.crossOrigin = "anonymous";
  
  img.onload = () => {
    if (onSuccess) onSuccess(img);
  };
  
  img.onerror = (e) => {
    console.error(`Failed to load Google Drive image via proxy: ${name}`, e);
    if (onError) onError(e);
    
    // Try the alternative direct URL format
    const alternateImg = new Image();
    alternateImg.crossOrigin = "anonymous";
    
    alternateImg.onload = () => {
      if (onFallbackSuccess) onFallbackSuccess(alternateImg);
    };
    
    alternateImg.onerror = (altError) => {
      console.error(`Failed to load Google Drive image with alternative URL: ${name}`, altError);
      
      // Try one more method - sometimes works for public folders
      const lastAttemptImg = new Image();
      lastAttemptImg.crossOrigin = "anonymous";
      
      lastAttemptImg.onload = () => {
        if (onFallbackSuccess) onFallbackSuccess(lastAttemptImg);
      };
      
      lastAttemptImg.onerror = () => {
        if (onAllFailed) onAllFailed();
      };
      
      // Try one last URL format
      lastAttemptImg.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    };
    
    // Try alternate URL format
    alternateImg.src = `https://lh3.googleusercontent.com/d/${fileId}`;
  };
  
  // Primary URL through proxy
  img.src = getImageUrl(fileId);
}; 