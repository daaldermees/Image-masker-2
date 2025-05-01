/**
 * Quote Generator Component
 * Uses images from Google Drive and predefined local profile images
 * 
 * This component displays quotes with profile images that can be
 * selected from local assets or loaded from Google Drive.
 */
import { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import {
  setQuote,
  setAuthor,
  setQuoteColor,
  setContainerColor,
  setPersonBgColor,
  setUseBgColor,
  setProcessing,
  setError,
} from '../store/slices/quoteGeneratorSlice'
import { renderQuote } from '../utils/quoteGenerator'
import ColorPicker from '../components/ColorPicker'
import toast, { Toaster } from 'react-hot-toast'
import { fetchDriveImages, getImageUrl, handleGoogleDriveImage } from '../utils/googleDrive'
import { BiDownload, BiCopy, BiImage } from 'react-icons/bi'

// Define predefined local profile images
const predefinedProfileImages = [
  { id: 'ali', src: '/assets/profile/Ali.jpg', name: 'Ali' },
  { id: 'bas', src: '/assets/profile/bas.jpg', name: 'Bas' },
  { id: 'bente', src: '/assets/profile/bente.jpg', name: 'Bente' },
  { id: 'bowie', src: '/assets/profile/Bowie.jpg', name: 'Bowie' },
  { id: 'profile1', src: '/assets/profile/profile1.jpg', name: 'Profile 1' },
  { id: 'profile2', src: '/assets/profile/profile2.jpg', name: 'Profile 2' },
  { id: 'profile3', src: '/assets/profile/profile3.jpg', name: 'Profile 3' },
];

// Google Drive folder ID for profile images
const DRIVE_FOLDER_ID = '1LyHZkCBQljn4_fsxeS5TBV6tOnkTnhjW'

const QuoteGenerator = () => {
  const dispatch = useDispatch()
  const {
    quote,
    author,
    quoteColor,
    containerColor,
    personBgColor,
    useBgColor,
    isProcessing,
    error,
  } = useSelector((state: RootState) => state.quoteGenerator)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFileSize, setImageFileSize] = useState<string | null>(null)
  const [driveImages, setDriveImages] = useState<{ id: string, name: string, thumbnailLink: string, webContentLink: string }[]>([])
  const [loadingDriveImages, setLoadingDriveImages] = useState(false)
  const [driveImagesError, setDriveImagesError] = useState<string | null>(null)
  const [manualFileId, setManualFileId] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [selectedProfileImageIndex, setSelectedProfileImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch Google Drive images when component mounts
  useEffect(() => {
    const loadDriveImages = async () => {
      try {
        setLoadingDriveImages(true)
        setDriveImagesError(null)
        const images = await fetchDriveImages(DRIVE_FOLDER_ID)
        setDriveImages(images)
      } catch (error) {
        console.error("Error loading Drive images:", error)
        setDriveImagesError("Failed to load images from Google Drive")
        toast.error("Failed to load images from Google Drive")
      } finally {
        setLoadingDriveImages(false)
      }
    }
    
    loadDriveImages()
  }, [])

  const handleQuoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = event.target.value.split('\n')
    if (lines.length <= 3) {
      dispatch(setQuote(event.target.value))
    }
  }

  // Handle Google Drive image selection
  const handleDriveImageSelect = (fileId: string, name: string) => {
    // Use our helper with multiple fallbacks
    handleGoogleDriveImage(fileId, name, {
      onStart: () => {
        toast.loading(`Loading image: ${name}...`, { id: 'imageLoading' });
      },
      onSuccess: (img) => {
        setImage(img);
        setImageLoaded(true);
        checkTransparency(img);
        
        // Dismiss loading toast and show success
        toast.dismiss('imageLoading');
        toast.success(`Selected "${name}" from Google Drive`);
      },
      onError: (e) => {
        dispatch(setError('Failed to load Drive image, trying another method...'));
        
        // Toast is kept open to show we're still trying
        toast.loading('Trying alternative method...', { id: 'imageLoading' });
      },
      onFallbackSuccess: (img) => {
        setImage(img);
        setImageLoaded(true);
        checkTransparency(img);
        
        // Dismiss loading toast and show success
        toast.dismiss('imageLoading');
        toast.success(`Loaded "${name}" with alternative method`);
      },
      onAllFailed: () => {
        toast.dismiss('imageLoading');
        toast.error(`Could not load "${name}". Please try another image.`);
      }
    });
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    
    // Create a temporary canvas for the download
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d', { alpha: true })
    
    if (!tempCtx) return
    
    // Set dimensions
    tempCanvas.width = canvasRef.current.width
    tempCanvas.height = canvasRef.current.height
    
    // Make sure we have transparency support
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Re-render the quote with transparency
    if (image && imageLoaded) {
      renderQuote({
        canvas: tempCanvas,
        image,
        quote,
        author,
        quoteColor,
        containerColor: 'rgba(255,255,255,0)', // Transparent background
        personBgColor,
        useBgColor,
        lineHeight: 1.1,
        transparent: true
      })
      
      // Create download link (delay slightly to allow rendering to complete)
      setTimeout(() => {
        const link = document.createElement('a')
        link.download = 'quote.png'
        
        // Use PNG format with alpha channel
        link.href = tempCanvas.toDataURL('image/png')
        
        // Calculate file size
        fetch(link.href)
          .then(res => res.blob())
          .then(blob => {
            const size = blob.size
            const fileSizeKB = (size / 1024).toFixed(1)
            const fileSizeMB = (size / (1024 * 1024)).toFixed(2)
            
            if (size < 1024 * 1024) {
              setImageFileSize(`${fileSizeKB} KB`)
            } else {
              setImageFileSize(`${fileSizeMB} MB`)
            }
          })
        
        link.click()
        toast.success("Image downloaded successfully!")
      }, 100)
    } else {
      toast.error("Please select a profile image first")
    }
  }

  const handleCopy = async () => {
    if (!canvasRef.current || !imageLoaded) {
      toast.error("Please select a profile image first");
      return;
    }
    
    try {
      dispatch(setProcessing(true))
      const blob = await new Promise<Blob>(resolve => 
        canvasRef.current!.toBlob(blob => resolve(blob!))
      )
      
      // Calculate file size
      const size = blob.size;
      const fileSizeKB = (size / 1024).toFixed(1);
      const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
      
      if (size < 1024 * 1024) {
        setImageFileSize(`${fileSizeKB} KB`);
      } else {
        setImageFileSize(`${fileSizeMB} MB`);
      }
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      toast.success("Image copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy image:", err)
      dispatch(setError("Failed to copy image"))
      toast.error("Failed to copy image")
    } finally {
      dispatch(setProcessing(false))
    }
  }

  const checkTransparency = (img: HTMLImageElement) => {
    const temp = document.createElement("canvas")
    temp.width = img.width
    temp.height = img.height
    const tmpCtx = temp.getContext("2d")
    if (!tmpCtx) return

    tmpCtx.drawImage(img, 0, 0)
    const data = tmpCtx.getImageData(0, 0, temp.width, temp.height).data
    const hasAlpha = pixelHasTransparency(data)
    
    dispatch(setUseBgColor(hasAlpha))
  }

  const pixelHasTransparency = (data: Uint8ClampedArray) => {
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true
    }
    return false
  }

  // Render the canvas when parameters change
  useEffect(() => {
    if (!canvasRef.current) return
    
    if (image && imageLoaded) {
      renderQuote({
        canvas: canvasRef.current,
        image,
        quote,
        author,
        quoteColor,
        containerColor,
        personBgColor,
        useBgColor,
        lineHeight: 1.1, // Reduced line height for quotes
      })
    } else {
      // Render with default background if no image
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const canvasWidth = 701;
        const canvasHeight = Math.round(canvasWidth * 0.32); // Increased from 0.24 to 0.32 (33% taller)
        canvasRef.current.width = canvasWidth;
        canvasRef.current.height = canvasHeight;
        
        // Fill with container color
        ctx.fillStyle = containerColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw quote text
        const lines = quote.split('\n');
        const fontSize = 32;
        ctx.font = fontSize + "px 'Barlow Semi Condensed'";
        
        const lineHeight = fontSize * 1.1; // Reduced line height
        
        // Calculate total text height including author if present
        const totalTextHeight = (lines.length * lineHeight) + 
                            (author ? lineHeight * 0.8 : 0); // Reduced spacing
        
        // Vertically center all content
        let y = (canvasHeight - totalTextHeight) / 2 + fontSize;
        
        // Draw quote text
        ctx.fillStyle = "#333";
        lines.forEach((line, index) => {
          const text = line;
          ctx.fillText(text, 120, y);
          y += lineHeight;
          
          // Add closing quote to last line
          if (index === lines.length - 1) {
            const metrics = ctx.measureText(text);
            ctx.fillStyle = quoteColor;
            ctx.font = "bold " + fontSize + "px 'Barlow Semi Condensed'";
            ctx.fillText('"', 120 + metrics.width + 5, y - lineHeight);
          }
        });
        
        // Draw opening quote mark
        ctx.fillStyle = quoteColor;
        ctx.font = "bold " + fontSize + "px 'Barlow Semi Condensed'";
        ctx.fillText('"', 100, (canvasHeight - totalTextHeight) / 2 + fontSize);
        
        // Draw author
        if (author) {
          y += lineHeight * 0.05; // Even less spacing between quote and author
          ctx.font = "20px 'Barlow'";
          ctx.fillStyle = "#666";
          ctx.fillText(author, 120, y);
        }
      }
    }
  }, [
    image,
    imageLoaded,
    quote,
    author,
    quoteColor,
    containerColor,
    personBgColor,
    useBgColor,
  ])

  // Load a default image on component mount
  useEffect(() => {
    // Only load the default image if no predefined image is selected
    const defaultImg = new Image()
    defaultImg.crossOrigin = "anonymous"
    defaultImg.onload = () => {
      setImageLoaded(true)
      checkTransparency(defaultImg)
    }
    defaultImg.onerror = () => {
      console.error("Error loading default image")
    }
    // Use a placeholder image service
    defaultImg.src = "https://placehold.co/150x150/e0e0e0/666666?text=Profile"
  }, [])

  // Function to manually add a Drive file
  const handleManualFileAdd = () => {
    if (!manualFileId.trim()) {
      toast.error("Please enter a valid file ID");
      return;
    }
    
    // Extract file ID from various Google Drive URL formats
    let fileId = manualFileId.trim();
    
    // Handle full URLs
    if (fileId.includes('drive.google.com')) {
      // Extract ID from /d/ID/ or id=ID formats
      const idMatch = fileId.match(/\/d\/([^/]+)\//) || fileId.match(/id=([^&]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      } else {
        toast.error("Could not extract file ID from the URL");
        return;
      }
    }
    
    // Use our helper with multiple fallbacks
    handleGoogleDriveImage(fileId, "Manual Image", {
      onStart: () => {
        toast.loading("Loading image...", { id: 'manualLoading' });
      },
      onSuccess: (img) => {
        setImage(img);
        setImageLoaded(true);
        checkTransparency(img);
        
        // Dismiss loading toast and show success
        toast.dismiss('manualLoading');
        toast.success("Manual image loaded successfully");
        setManualFileId(''); // Clear the input
      },
      onError: (e) => {
        dispatch(setError('Failed to load Drive image, trying another method...'));
        
        // Toast is kept open to show we're still trying
        toast.loading('Trying alternative method...', { id: 'manualLoading' });
      },
      onFallbackSuccess: (img) => {
        setImage(img);
        setImageLoaded(true);
        checkTransparency(img);
        
        // Dismiss loading toast and show success
        toast.dismiss('manualLoading');
        toast.success("Image loaded with alternative method");
        setManualFileId(''); // Clear the input
      },
      onAllFailed: () => {
        toast.dismiss('manualLoading');
        toast.error("Could not load image. Make sure the file is public and is an image.");
      }
    });
  };

  // Handle local profile image selection
  const handleProfileImageSelect = (index: number) => {
    // Clear previous selected image
    setSelectedProfileImageIndex(index);
    
    // Load the selected image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setImageLoaded(true);
      checkTransparency(img);
      toast.success(`Selected "${predefinedProfileImages[index].name}"`);
    };
    img.onerror = () => {
      toast.error('Failed to load the selected profile image');
      setImage(null);
      setSelectedProfileImageIndex(null);
    };
    img.src = predefinedProfileImages[index].src;
  };

  // Reset selected profile image when uploading a custom image
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clear the selected profile image index when uploading a custom image
    setSelectedProfileImageIndex(null);
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        setImage(img);
        setImageLoaded(true);
        checkTransparency(img);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <h1>Quote Generator</h1>
      <p className="page-description">Create branded quotes with your profile image that can be easily shared on social media.</p>

      <div className="content-grid wide-grid">
        <div className="inputs-column">
          <div className="step" id="step1">Step 1: Choose a profile image</div>
          
          {/* Predefined Profile Images */}
          <div className="profile-images-grid" style={{ marginBottom: '15px' }}>
            {predefinedProfileImages.map((profile, index) => (
              <div
                key={profile.id}
                className={`profile-image-container ${selectedProfileImageIndex === index ? 'selected' : ''}`}
                onClick={() => handleProfileImageSelect(index)}
              >
                <img 
                  src={profile.src}
                  alt={profile.name}
                  title={profile.name}
                  className="profile-image-item"
                  onError={(e) => {
                    console.error(`Error loading profile image: ${profile.name}`);
                    e.currentTarget.src = `https://placehold.co/100x100/e0e0e0/666666?text=${encodeURIComponent(profile.name)}`;
                  }}
                />
                <div className="profile-image-name">{profile.name}</div>
              </div>
            ))}
          </div>
          
          {/* Upload Separator */}
          <div className="upload-section" style={{ marginBottom: '20px' }}>
            <div className="upload-separator">
              <span>OR Upload Your Own</span>
            </div>
          </div>
          
          {/* Google Drive Images */}
          <div className="drive-section">
            <div className="drive-section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.39 8.5L3.77 13h7.23l2.62-4.5H6.39zm-.85-1.5l2.62-4.5h7.23L13.23 7H5.54zM2 8.5L4.62 13 7.5 8.5 4.62 4 2 8.5z"/>
              </svg>
              Select Profile Image from Google Drive
            </div>
            
            {loadingDriveImages && (
              <div className="drive-loading-indicator">
                <p>Loading images from Google Drive...</p>
                <div className="loading-spinner"></div>
              </div>
            )}
            
            {driveImagesError && (
              <div className="drive-error-message">
                <p>{driveImagesError}</p>
                <p>Make sure your Google Drive folder is shared with "Anyone with the link" view permission.</p>
                <button 
                  className="blue small"
                  onClick={() => setShowManualInput(!showManualInput)}
                  style={{ marginTop: '10px' }}
                >
                  {showManualInput ? 'Hide' : 'Enter File ID Manually'}
                </button>
                
                {showManualInput && (
                  <div className="manual-file-input" style={{ marginTop: '10px' }}>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Enter Google Drive file ID or URL"
                        value={manualFileId}
                        onChange={(e) => setManualFileId(e.target.value)}
                      />
                      <button 
                        className="green small"
                        onClick={handleManualFileAdd}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      You can paste the full Google Drive URL or just the file ID
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!loadingDriveImages && driveImages.length === 0 && !driveImagesError && (
              <div style={{ padding: '10px', color: 'var(--dark-gray)' }}>
                No images found in the Google Drive folder.
                <button 
                  className="blue small"
                  onClick={() => setShowManualInput(!showManualInput)}
                  style={{ marginTop: '10px', display: 'block' }}
                >
                  {showManualInput ? 'Hide' : 'Enter File ID Manually'}
                </button>
                
                {showManualInput && (
                  <div className="manual-file-input" style={{ marginTop: '10px' }}>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Enter Google Drive file ID or URL"
                        value={manualFileId}
                        onChange={(e) => setManualFileId(e.target.value)}
                      />
                      <button 
                        className="green small"
                        onClick={handleManualFileAdd}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      You can paste the full Google Drive URL or just the file ID
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {driveImages.length > 0 && (
              <div className="drive-images-grid">
                {driveImages.map((img) => (
                  <div
                    key={img.id}
                    className="drive-image-container"
                    onClick={() => handleDriveImageSelect(img.id, img.name)}
                  >
                    <img 
                      src={getImageUrl(img.id)}
                      alt={img.name}
                      title={img.name}
                      className="drive-image-item"
                      onError={(e) => {
                        console.error(`Error loading image thumbnail: ${img.name}`);
                        e.currentTarget.src = `https://lh3.googleusercontent.com/d/${img.id}`;
                        e.currentTarget.onerror = () => {
                          e.currentTarget.src = `https://placehold.co/100x100/e0e0e0/666666?text=${encodeURIComponent(img.name)}`;
                          e.currentTarget.onerror = null;
                        };
                      }}
                    />
                    <div className="drive-image-name">{img.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="step" id="step2">Step 2: Enter quote text</div>
          <div className="quote-input">
            <label htmlFor="quoteText">Quote Text (max 3 lines)</label>
            <textarea
              id="quoteText"
              value={quote}
              onChange={handleQuoteChange}
              rows={3}
            />
          </div>

          <div className="input-group">
            <label htmlFor="authorName">Author</label>
            <input
              type="text"
              id="authorName"
              value={author}
              onChange={(e) => dispatch(setAuthor(e.target.value))}
            />
          </div>

          <div className="step" id="step3">Step 3: Style your quote</div>
          <div className="style-options" id="styleOptions">
            <ColorPicker
              colors={[
                { value: '#FFFFFF', label: 'White' },
                { value: '#F5F5F5', label: 'Light Gray' }
              ]}
              selectedColor={containerColor}
              onChange={(color) => dispatch(setContainerColor(color))}
              label="Quote Background Color"
            />

            <ColorPicker
              colors={[
                { value: '#4493cf', label: 'Brand Blue' },
                { value: '#5cbd74', label: 'Brand Green' },
                { value: '#f15e60', label: 'Brand Red' },
                { value: '#fed84f', label: 'Brand Yellow' },
                { value: '#000000', label: 'Black' }
              ]}
              selectedColor={quoteColor}
              onChange={(color) => dispatch(setQuoteColor(color))}
              label="Quote Marks Color"
            />

            {useBgColor && (
              <ColorPicker
                colors={[
                  { value: '#FFFFFF', label: 'White' },
                  { value: '#F5F5F5', label: 'Light Gray' }
                ]}
                selectedColor={personBgColor}
                onChange={(color) => dispatch(setPersonBgColor(color))}
                label="Profile Image Background"
              />
            )}
          </div>
        </div>
        
        <div className="preview-column">
          <div className="step" id="preview-step">Preview</div>
          <div className="quote-preview" id="quotePreview" style={{ marginTop: '15px' }}>
            <canvas
              ref={canvasRef}
              id="previewCanvas"
              width="701"
              height="224"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          
          <div className="preview-actions" style={{ marginTop: '15px' }}>
            <button
              id="downloadPng"
              className="green"
              onClick={handleDownload}
              disabled={isProcessing || !image}
              data-tooltip="Please select a profile image first"
            >
              <span className="button-icon">⬇️</span>
              Download PNG
            </button>
            <button
              id="copyPng"
              className="blue"
              onClick={handleCopy}
              disabled={isProcessing || !image}
              data-tooltip="Please select a profile image first"
            >
              <span className="button-icon">📋</span>
              Copy to Clipboard
            </button>
          </div>
          
          {imageFileSize && (
            <p className="file-size" style={{ textAlign: 'center', margin: '10px 0', fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
              File size: {imageFileSize}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Toaster position="bottom-center" />
    </>
  )
}

export default QuoteGenerator 