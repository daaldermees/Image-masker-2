import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setFirstName, setLastName, setPhoneNumber, setImage, reset } from '../store/slices/emailSignatureSlice';
import { toast } from 'react-toastify';
import { convertCanvasToBlob } from '../utils/imageUtils';

const EmailSignatureGenerator: React.FC = () => {
  const dispatch = useDispatch();
  const { firstName, lastName, phoneNumber, image } = useSelector(
    (state: RootState) => state.emailSignature
  );
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFirstName(e.target.value));
  };
  
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setLastName(e.target.value));
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPhoneNumber(e.target.value));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          dispatch(setImage(event.target?.result as string));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCopyToClipboard = async () => {
    if (!canvasRef.current || !image) {
      toast.error('Please complete your signature before copying');
      return;
    }

    try {
      const blob = await convertCanvasToBlob(canvasRef.current);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast.success('Signature copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy signature to clipboard');
    }
  };
  
  const handleDownloadSignature = () => {
    if (!canvasRef.current || !image) {
      toast.error('Please complete your signature before downloading');
      return;
    }
    
    const link = document.createElement('a');
    link.download = `${firstName}-${lastName}-signature.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    toast.success('Signature downloaded!');
  };
  
  const handleReset = () => {
    dispatch(reset());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const renderSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Define dimensions
    const canvasWidth = 600;
    const canvasHeight = 200;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw profile image if exists
    if (image) {
      const img = new Image();
      img.onload = () => {
        // Image dimensions
        const imgSize = 120;
        const imgX = 30;
        const imgY = 40;
        
        // Draw circular profile image
        ctx.save();
        ctx.beginPath();
        ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
        
        // Draw name and details
        renderText();
      };
      img.src = image;
    } else {
      renderText();
    }
  };
  
  const renderText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Text positioning
    const textX = image ? 180 : 30;
    const textY = 70;
    
    // Name
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(`${firstName} ${lastName}`.trim() || 'Your Name', textX, textY);
    
    // Job title
    ctx.font = '18px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Software Engineer', textX, textY + 30);
    
    // Company
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#0066cc';
    ctx.fillText('Let\'s Train', textX, textY + 60);
    
    // Contact details
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(phoneNumber || 'Your Phone Number', textX, textY + 85);
    ctx.fillText('info@letstrain.com', textX, textY + 105);
  };
  
  // Render signature whenever inputs change
  React.useEffect(() => {
    renderSignature();
  }, [firstName, lastName, phoneNumber, image]);
  
  return (
    <div className="wide-grid">
      <div className="input-column">
        <h2>Email Signature Generator</h2>
        <p>Create your professional email signature</p>
        
        <div className="input-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={handleFirstNameChange}
            placeholder="Enter your first name"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={handleLastNameChange}
            placeholder="Enter your last name"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Enter your phone number"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="profileImage">Profile Image</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="profileImage"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="file-input"
            />
            <div className="file-upload-button">
              <span>Upload Image</span>
            </div>
            {image ? (
              <div className="image-preview">
                <img src={image} alt="Preview" />
              </div>
            ) : (
              <div className="no-image-preview">
                <span>No image selected</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="button-group">
          <button
            onClick={handleCopyToClipboard}
            disabled={!image}
            className="primary-button"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={handleDownloadSignature}
            disabled={!image}
            className="primary-button"
          >
            Download
          </button>
          <button
            onClick={handleReset}
            className="secondary-button"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="preview-column">
        <h3>Preview</h3>
        <div className="signature-preview">
          <canvas 
            ref={canvasRef} 
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              height: 'auto', 
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailSignatureGenerator; 