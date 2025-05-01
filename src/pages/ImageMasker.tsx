import { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import {
  setImage,
  setSelectedMaskId,
  setBackgroundColor,
  setOffset,
  setZoom,
  setFlipH,
  setFlipV,
  setError,
  setHasTransparency,
  masks
} from '../store/slices/imageMaskerSlice'
import { applyMask, checkImageTransparency } from '../utils/imageMasker'
import ColorPicker from '../components/ColorPicker'
import toast, { Toaster } from 'react-hot-toast'

const ImageMasker = () => {
  const dispatch = useDispatch()
  const { 
    image: imageUrl, 
    selectedMaskId, 
    backgroundColor, 
    offsetX,
    offsetY,
    zoom,
    flipH,
    flipV,
    isProcessing,
    error,
    hasTrasparency
  } = useSelector(
    (state: RootState) => state.imageMasker
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartY, setDragStartY] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [imageFileSize, setImageFileSize] = useState<string | null>(null)
  const [userHasDragged, setUserHasDragged] = useState(false)

  // Brand color options for background
  const colorOptions = [
    { value: '#ffffff', label: 'White' },
    { value: '#4493cf', label: 'Blue' },  // --blue
    { value: '#5cbd74', label: 'Green' }, // --green
    { value: '#f15e60', label: 'Red' },   // --red
    { value: '#f9f9f9', label: 'Light Gray' } // --light-gray
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      dispatch(setError('Please select an image file'))
      toast.error('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      dispatch(setImage(result))
      setPreview(result)
      
      // Reset position and zoom
      dispatch(setOffset({ x: 0, y: 0 }))
      dispatch(setZoom(1))
      dispatch(setFlipH(1))
      dispatch(setFlipV(1))
      
      // Load the image for canvas processing
      const img = new Image()
      img.onload = () => {
        setImageObj(img)
        setIsInitialLoad(true)
        setUserHasDragged(false)
        
        // Check for transparency
        const hasTransparency = checkImageTransparency(img)
        dispatch(setHasTransparency(hasTransparency))
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      dispatch(setError('Please select an image file'))
      toast.error('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      dispatch(setImage(result))
      setPreview(result)
      
      // Reset position and zoom
      dispatch(setOffset({ x: 0, y: 0 }))
      dispatch(setZoom(1))
      dispatch(setFlipH(1))
      dispatch(setFlipV(1))
      
      // Load the image for canvas processing
      const img = new Image()
      img.onload = () => {
        setImageObj(img)
        setIsInitialLoad(true)
        setUserHasDragged(false)
        
        // Check for transparency
        const hasTransparency = checkImageTransparency(img)
        dispatch(setHasTransparency(hasTransparency))
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDownload = () => {
    if (!canvasRef.current || !imageObj) {
      toast.error('Please upload an image first')
      return
    }
    
    const link = document.createElement('a')
    link.download = 'masked-image.png'
    link.href = canvasRef.current.toDataURL('image/png')
    
    // Calculate file size
    fetch(link.href)
      .then(res => res.blob())
      .then(blob => {
        const size = blob.size;
        const fileSizeKB = (size / 1024).toFixed(1);
        const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
        
        if (size < 1024 * 1024) {
          setImageFileSize(`${fileSizeKB} KB`);
        } else {
          setImageFileSize(`${fileSizeMB} MB`);
        }
      });
    
    link.click()
    toast.success('Image downloaded successfully')
  }
  
  const handleCopyToClipboard = async () => {
    if (!canvasRef.current || !imageObj) {
      toast.error('Please upload an image first')
      return
    }
    
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvasRef.current!.toBlob((blob) => resolve(blob!))
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
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      
      toast.success('Image copied to clipboard')
    } catch (err) {
      console.error('Failed to copy image:', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  // Handle mouse events for image positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || !imageObj) return
    e.preventDefault()
    setIsDragging(true)
    setDragStartX(e.clientX - offsetX)
    setDragStartY(e.clientY - offsetY)
    setIsInitialLoad(false) // Disable autoFit once user starts dragging
    setUserHasDragged(true) // Mark that user has manually dragged the image
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current || !imageObj) return
    e.preventDefault()
    const newOffsetX = e.clientX - dragStartX
    const newOffsetY = e.clientY - dragStartY
    dispatch(setOffset({ x: newOffsetX, y: newOffsetY }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    dispatch(setZoom(Math.min(zoom + 0.1, 3)))
    setIsInitialLoad(false) // Disable autoFit once user zooms
  }

  const handleZoomOut = () => {
    dispatch(setZoom(Math.max(zoom - 0.1, 0.1)))
    setIsInitialLoad(false) // Disable autoFit once user zooms
  }

  const handleFlipH = () => {
    dispatch(setFlipH(flipH * -1))
    setIsInitialLoad(false) // Disable autoFit once user flips
  }

  const handleFlipV = () => {
    dispatch(setFlipV(flipV * -1))
    setIsInitialLoad(false) // Disable autoFit once user flips
  }

  const handleReset = () => {
    dispatch(setOffset({ x: 0, y: 0 }))
    dispatch(setZoom(1))
    dispatch(setFlipH(1))
    dispatch(setFlipV(1))
    setIsInitialLoad(true) // Re-enable autoFit on reset
    setUserHasDragged(false) // Reset the drag tracking
  }

  // When mask changes, trigger a reset of position and zoom
  const handleMaskSelect = (maskId: string) => {
    dispatch(setSelectedMaskId(maskId))
    // Reset position and zoom for new mask
    dispatch(setOffset({ x: 0, y: 0 }))
    dispatch(setZoom(1))
    dispatch(setFlipH(1))
    dispatch(setFlipV(1))
    setIsInitialLoad(true) // Re-enable autoFit when mask changes
    setUserHasDragged(false) // Reset the drag tracking
  }

  // Apply mask when parameters change
  useEffect(() => {
    if (!canvasRef.current || !imageObj) return

    try {
      // Use autoFit only on initial load, reset, or mask change, and not when the user has dragged
      applyMask({
        canvas: canvasRef.current,
        image: imageObj,
        selectedMaskId,
        backgroundColor,
        offsetX,
        offsetY,
        zoom,
        flipH,
        flipV,
        autoFit: isInitialLoad && !userHasDragged
      })
    } catch (err) {
      console.error('Error applying mask:', err)
      dispatch(setError('Failed to apply mask'))
      toast.error('Failed to apply mask to image')
    }
  }, [imageObj, selectedMaskId, backgroundColor, offsetX, offsetY, zoom, flipH, flipV, isInitialLoad, userHasDragged, dispatch])

  return (
    <>
      <h1>Image Masker</h1>
      <p className="page-description">Apply custom shapes to your images to create perfectly masked profile pictures or thumbnails.</p>
      
      <div className="content-grid wide-grid">
        <div className="inputs-column">
          <div className="step" id="step1">Step 1: Upload an image</div>
          <div 
            id="uploadZone" 
            className={dragOver ? 'dragover' : ''}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              id="imageInput"
              onChange={handleFileChange}
            />
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                id="uploadPreview"
                style={{ display: 'block', maxHeight: '12rem' }}
              />
            ) : (
              <div>
                <span className="upload-icon">📁</span>
                <p>Drop an image here or click to select</p>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="step" id="step2">Step 2: Choose a mask shape</div>
          <div className="mask-grid">
            {masks.map((mask) => (
              <div 
                key={mask.id}
                className={`mask-option ${selectedMaskId === mask.id ? 'selected' : ''}`}
                onClick={() => handleMaskSelect(mask.id)}
              >
                <div 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${mask.w}' height='${mask.h}' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${mask.w} ${mask.h}'%3E%3Cpath d='${mask.path}' fill='%23ccc'/%3E%3C/svg%3E")`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '100px',
                    height: '100px',
                    margin: '0 auto'
                  }}
                />
                <div className="mask-label">
                  {mask.label}
                  {mask.tooltip && (
                    <span className="info-icon">
                      ℹ️
                      <div className="tooltip-content">
                        {mask.tooltip.text}
                        <ul>
                          {mask.tooltip.uses.map((use, index) => (
                            <li key={index}>{use}</li>
                          ))}
                        </ul>
                      </div>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="step" id="step3">Step 3: Adjust image position</div>
          <div className="controls">
            <button onClick={handleZoomIn} disabled={!imageObj} data-tooltip="Please upload an image first">
              🔍+ Zoom In
            </button>
            <button onClick={handleZoomOut} disabled={!imageObj} data-tooltip="Please upload an image first">
              🔍- Zoom Out
            </button>
            <button onClick={handleFlipH} disabled={!imageObj} data-tooltip="Please upload an image first">
              ↔️ Flip Horizontal
            </button>
            <button onClick={handleFlipV} disabled={!imageObj} data-tooltip="Please upload an image first">
              ↕️ Flip Vertical
            </button>
            <button onClick={handleReset} disabled={!imageObj} data-tooltip="Please upload an image first">
              🔄 Reset Position
            </button>
          </div>

          {hasTrasparency && (
            <div className="bg-options">
              <h3>Background Color</h3>
              <ColorPicker
                colors={[
                  { value: '#FFFFFF', label: 'White' },
                  { value: '#F5F5F5', label: 'Light Gray' },
                  { value: '#DEEBFF', label: 'Light Blue' },
                  { value: '#FFE9E0', label: 'Light Pink' },
                  { value: '#F0F5EA', label: 'Light Green' },
                ]}
                selectedColor={backgroundColor}
                onChange={(color) => dispatch(setBackgroundColor(color))}
                label="Background Color"
              />
            </div>
          )}
        </div>
        
        <div className="preview-column">
          <div className="step" id="preview-step">Preview</div>
          {imageObj ? (
            <div 
              className="mask-preview"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab', marginTop: '15px' }}
            >
              <canvas
                ref={canvasRef}
                id="previewCanvas"
                width="600"
                height="400"
              />
            </div>
          ) : (
            <div className="empty-preview" style={{ marginTop: '15px' }}>
              <span className="empty-preview-icon">🖼️</span>
              <h3>No Image Selected</h3>
              <p>Upload an image to see the preview here</p>
            </div>
          )}

          <p className="hint" style={{ textAlign: 'center', margin: '15px 0' }}>
            Drag to reposition the image. Use the controls to zoom and flip the mask.
          </p>

          <div className="preview-actions">
            <button
              onClick={handleDownload}
              disabled={!imageObj}
              className="green"
              data-tooltip="Please upload an image first"
            >
              <span className="button-icon">⬇️</span>
              Download
            </button>
            <button
              onClick={handleCopyToClipboard}
              disabled={!imageObj}
              className="blue"
              data-tooltip="Please upload an image first"
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

      <Toaster position="bottom-center" />
    </>
  )
}

export default ImageMasker 