/**
 * Email Signature Component
 * Uses local images from the assets/profile folder
 */
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setFirstName, 
  setLastName, 
  setPhoneNumber,
  setJobTitle,
  setImage
} from '../store/slices/emailSignatureSlice';
import toast, { Toaster } from 'react-hot-toast';

// Function to get label from filename (removes extension and capitalizes first letter)
const getLabelFromFilename = (filename: string): string => {
  // Remove the extension and path
  const nameOnly = filename.split('/').pop()?.split('.')[0] || filename;
  // Capitalize first letter
  return nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);
};

const EmailSignature: React.FC = () => {
  const dispatch = useDispatch();
  const { firstName, lastName, phoneNumber, jobTitle, website, address, image } = useSelector(
    (state: RootState) => state.emailSignature
  );
  
  const signatureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formattedPhone, setFormattedPhone] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [predefinedImages, setPredefinedImages] = useState<Array<{ id: string, src: string, label: string }>>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  
  // Function to load profile images
  const loadProfileImages = async () => {
    try {
      setIsLoadingImages(true);
      
      // Create a list of available profile images from assets folder
      const staticImages = [
        { id: 'ali', src: '/assets/profile/Ali.jpg', label: 'Ali' },
        { id: 'bas', src: '/assets/profile/bas.jpg', label: 'Bas' },
        { id: 'bente', src: '/assets/profile/bente.jpg', label: 'Bente' },
        { id: 'bowie', src: '/assets/profile/Bowie.jpg', label: 'Bowie' },
        { id: 'avatar', src: '/assets/profile/avatar.jpg', label: 'Avatar' },
      ];
      
      // Load previously uploaded images from localStorage
      let uploadedImages: Array<{ id: string, src: string, label: string }> = [];
      try {
        const storedImages = localStorage.getItem('emailSignatureUploadedImages');
        if (storedImages) {
          uploadedImages = JSON.parse(storedImages);
        }
      } catch (error) {
        console.error('Error loading images from localStorage:', error);
      }
      
      // Combine both lists
      const allImages = [...staticImages, ...uploadedImages];
      
      // Check which images actually exist by preloading them
      const validatedImages = await Promise.all(
        allImages.map(async (img) => {
          // Return a promise that resolves with the image if it loads, or null if it fails
          return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(img);
            image.onerror = () => {
              console.warn(`Failed to load image: ${img.label}`);
              resolve(null);
            };
            image.src = img.src;
          });
        })
      );
      
      // Filter out null results (failed to load)
      const availableImages = validatedImages.filter(Boolean) as Array<{ id: string, src: string, label: string }>;
      
      // Sort alphabetically by label
      availableImages.sort((a, b) => a.label.localeCompare(b.label));
      setPredefinedImages(availableImages);
    } catch (error) {
      console.error('Error loading profile images:', error);
      // Fallback to default images without validation
      setPredefinedImages([
        { id: 'ali', src: '/assets/profile/Ali.jpg', label: 'Ali' },
        { id: 'bas', src: '/assets/profile/bas.jpg', label: 'Bas' },
        { id: 'bente', src: '/assets/profile/bente.jpg', label: 'Bente' },
        { id: 'bowie', src: '/assets/profile/Bowie.jpg', label: 'Bowie' },
      ]);
    } finally {
      setIsLoadingImages(false);
    }
  };
  
  // Load profile images from the assets/profile folder
  useEffect(() => {
    loadProfileImages();
  }, []);
  
  // Format the phone number based on type (mobile or landline)
  useEffect(() => {
    if (!phoneNumber) {
      setFormattedPhone('');
      return;
    }
    
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.startsWith('06') || digits.startsWith('316')) {
      // Mobile number: 06 XXX XX XXX or +31 6 XXX XX XXX
      let formatted;
      if (digits.startsWith('316')) {
        formatted = '+31 6';
        const rest = digits.slice(3);
        if (rest.length > 0) formatted += ' ' + rest.slice(0, 3);
        if (rest.length > 3) formatted += ' ' + rest.slice(3, 5);
        if (rest.length > 5) formatted += ' ' + rest.slice(5);
      } else {
        formatted = '06';
        const rest = digits.slice(2);
        if (rest.length > 0) formatted += ' ' + rest.slice(0, 3);
        if (rest.length > 3) formatted += ' ' + rest.slice(3, 5);
        if (rest.length > 5) formatted += ' ' + rest.slice(5);
      }
      setFormattedPhone(formatted);
    } else {
      // Landline number: XXX XXX XX XX
      let formatted = '';
      if (digits.startsWith('31')) {
        formatted = '+31 ';
        const rest = digits.slice(2);
        if (rest.length > 0) formatted += rest.slice(0, 2);
        if (rest.length > 2) formatted += ' ' + rest.slice(2, 5);
        if (rest.length > 5) formatted += ' ' + rest.slice(5, 7);
        if (rest.length > 7) formatted += ' ' + rest.slice(7);
      } else if (digits.startsWith('0')) {
        formatted = '0';
        const rest = digits.slice(1);
        if (rest.length > 0) formatted += rest.slice(0, 2);
        if (rest.length > 2) formatted += ' ' + rest.slice(2, 5);
        if (rest.length > 5) formatted += ' ' + rest.slice(5, 7);
        if (rest.length > 7) formatted += ' ' + rest.slice(7);
      } else {
        formatted = digits.slice(0, 3);
        if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
        if (digits.length > 6) formatted += ' ' + digits.slice(6, 8);
        if (digits.length > 8) formatted += ' ' + digits.slice(8);
      }
      setFormattedPhone(formatted);
    }
  }, [phoneNumber]);
  
  // Handle predefined image selection
  const handleImageSelect = (index: number) => {
    setUploading(true);
    const selectedImage = predefinedImages[index];
    setSelectedImageIndex(index);
    
    // Load the selected image
    const img = new Image();
    img.onload = () => {
      setImagePreviewUrl(selectedImage.src);
      dispatch(setImage(selectedImage.src));
      toast.success(`Selected ${selectedImage.label}`);
      setUploading(false);
    };
    img.onerror = () => {
      toast.error(`Failed to load ${selectedImage.label}`);
      setUploading(false);
    };
    img.src = selectedImage.src;
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    handleFileUpload(file);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    handleFileUpload(file);
  };
  
  const handleFileUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Create an image element to check dimensions
      const img = new Image();
      img.onload = () => {
        // Save the image to localStorage for future use
        try {
          // Generate a unique ID for the image
          const id = `upload_${Date.now()}`;
          const filename = file.name.split('.')[0];
          const label = filename.charAt(0).toUpperCase() + filename.slice(1);
          
          // Create a new image object
          const newImage = {
            id,
            src: result,
            label
          };
          
          // Get existing uploaded images
          const storedImages = localStorage.getItem('emailSignatureUploadedImages');
          const uploadedImages = storedImages ? JSON.parse(storedImages) : [];
          
          // Add the new image
          uploadedImages.push(newImage);
          
          // Save back to localStorage (limit to last 5 uploaded images)
          localStorage.setItem(
            'emailSignatureUploadedImages', 
            JSON.stringify(uploadedImages.slice(-5))
          );
          
          // Update UI with the current image
          setImagePreviewUrl(result);
          dispatch(setImage(result));
          setSelectedImageIndex(null); // Clear any selected predefined image
          toast.success('Image uploaded successfully');
          
          // Add to the predefined images if it's not already in the list
          setPredefinedImages(prevImages => {
            // Check if this image already exists based on ID
            if (!prevImages.find(img => img.id === id)) {
              return [...prevImages, newImage];
            }
            return prevImages;
          });
        } catch (error) {
          console.error('Error saving uploaded image', error);
        }
        
        setUploading(false);
      };
      img.onerror = () => {
        toast.error('Failed to process image file');
        setUploading(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const validatePhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) {
      // Phone number is optional, so empty is valid
      setPhoneError(null);
      return true;
    }
    
    // Basic phone number validation - at least 10 digits for provided numbers
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError('Please enter a valid phone number (min. 10 digits)');
      return false;
    }
    setPhoneError(null);
    return true;
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setPhoneNumber(value));
    validatePhoneNumber(value);
  };
  
  const handleCopyToClipboard = async () => {
    if (!signatureRef.current) {
      toast.error('Cannot copy to clipboard. Signature not available.');
      return;
    }
    
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      toast.error('Please correct the phone number before copying.');
      return;
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Preparing signature...');
      
      // Get the HTML content
      let html = signatureRef.current.innerHTML;
      
      // Use the Clipboard API
      await navigator.clipboard.writeText(html);
      
      // Hide loading toast
      toast.dismiss(loadingToast);
      toast.success('Email signature HTML copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard.');
      console.error(err);
    }
  };
  
  // Check if all required fields are filled - phone is no longer required
  const isFormComplete = Boolean(firstName && lastName && jobTitle && (image || imagePreviewUrl) && (!phoneNumber || !phoneError));
  
  // Get placeholder or actual values
  const displayName = firstName || 'Your Name';
  const displayLastName = lastName || 'Last Name';
  const displayJobTitle = jobTitle || 'Your Job Title';
  const displayPhone = formattedPhone || '06 123 45 678';
  
  // Required field indicator style
  const requiredStyle = { color: 'red', marginLeft: '3px' };
  
  return (
    <>
      <h1>Email Signature Generator</h1>
      <p className="page-description">Create professional email signatures with your profile photo and contact information.</p>
      
      <div className="content-grid wide-grid">
        <div className="inputs-column">
          <div className="step" id="step1">Step 1: Enter your information</div>
          <div className="input-group">
            <label htmlFor="firstName">
              First Name<span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => dispatch(setFirstName(e.target.value))}
              placeholder="Enter your first name"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="lastName">
              Last Name<span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => dispatch(setLastName(e.target.value))}
              placeholder="Enter your last name"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="jobTitle">
              Job Title<span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => dispatch(setJobTitle(e.target.value))}
              placeholder="Enter your job title"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="phoneNumber">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter your phone number (optional)"
              className={phoneError ? 'error' : ''}
            />
            {phoneError && <div className="error-message" style={{ marginTop: '4px', fontSize: '0.85rem' }}>{phoneError}</div>}
          </div>
          
          <div className="step" id="step2">
            Step 2: Choose or upload a profile image<span style={requiredStyle}>*</span>
            <button 
              className="small blue"
              onClick={() => {
                setIsLoadingImages(true);
                setTimeout(() => {
                  // Trigger the effect to reload the images
                  setPredefinedImages([]);
                  loadProfileImages();
                }, 100);
              }}
              style={{ 
                marginLeft: '10px', 
                padding: '3px 8px', 
                fontSize: '12px',
                verticalAlign: 'middle'
              }}
              disabled={isLoadingImages}
            >
              {isLoadingImages ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {/* Profile image grid */}
          <div className="profile-image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {isLoadingImages ? (
              <div style={{ gridColumn: '1/-1', padding: '15px', textAlign: 'center', color: 'var(--dark-gray)' }}>
                Loading profile images...
              </div>
            ) : predefinedImages.length === 0 ? (
              <div style={{ gridColumn: '1/-1', padding: '15px', textAlign: 'center', color: 'var(--dark-gray)' }}>
                No profile images found. Please upload an image.
              </div>
            ) : (
              predefinedImages.map((img, index) => (
                <div
                  key={img.id}
                  onClick={() => handleImageSelect(index)}
                  style={{
                    border: selectedImageIndex === index ? '3px solid #4285f4' : '1px solid #ddd',
                    padding: '5px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedImageIndex === index ? '#e8f0fe' : 'white',
                    textAlign: 'center'
                  }}
                >
                  <img 
                    src={img.src}
                    alt={img.label}
                    style={{ 
                      width: '100%', 
                      height: '65px', 
                      objectFit: 'cover',
                      borderRadius: '3px'
                    }}
                    onError={(e) => {
                      console.error(`Error loading image thumbnail for ${img.id}`);
                      // Display a placeholder or error indicator
                      e.currentTarget.src = "https://placehold.co/100x100/e0e0e0/666666?text=Error";
                    }}
                  />
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>{img.label}</div>
                </div>
              ))
            )}
          </div>
          
          <div className="upload-section" style={{ marginBottom: '20px' }}>
            <div className="upload-separator" style={{ 
              textAlign: 'center',
              margin: '15px 0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span style={{ 
                display: 'inline-block',
                padding: '0 10px',
                position: 'relative',
                backgroundColor: 'white',
                zIndex: 1,
                color: 'var(--dark-gray)',
                fontWeight: 'bold'
              }}>OR Upload Your Own</span>
              <div style={{ 
                position: 'absolute',
                width: '100%',
                height: '1px',
                backgroundColor: 'var(--gray)',
                top: '50%',
                left: 0,
                zIndex: 0
              }}></div>
            </div>
            
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
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  id="uploadPreview"
                  style={{ display: 'block', maxHeight: '12rem' }}
                />
              ) : (
                <div>
                  <span className="upload-icon">📁</span>
                  <p>Drop an image here or click to select</p>
                  <p><small>(150px width recommended)</small></p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="preview-column">
          <div className="step" id="preview-step">Preview</div>
          <div className="email-signature-preview" style={{ marginTop: '15px', border: '1px solid #ddd', padding: '20px', backgroundColor: 'white' }}>
            <div id="emailSignature" ref={signatureRef}>
              <div style={{ fontFamily: 'Arial', color: '#000000', direction: 'ltr' }}>
                <div>Met vriendelijke groeten,</div>
                <div><br /></div>
                <table cellPadding="0" cellSpacing="0" style={{ color: 'rgb(0, 0, 0)', verticalAlign: 'baseline', fontFamily: 'Arial', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td height="8"></td>
                    </tr>
                    <tr>
                      <td>
                        <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: 'baseline', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ verticalAlign: 'top' }}>
                                <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: 'baseline', borderCollapse: 'collapse' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ textAlign: 'center' }}>
                                        <div style={{ position: 'relative', width: '150px', marginBottom: '25px' }}>
                                          {imagePreviewUrl || image ? (
                                            <img
                                              src={imagePreviewUrl || image || ''}
                                              width="150"
                                              style={{ 
                                                display: 'block', 
                                                maxWidth: '150px',
                                                borderRadius: '8px',
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'cover'
                                              }}
                                              alt="Profile"
                                            />
                                          ) : (
                                            <div style={{ 
                                              width: '150px', 
                                              height: '150px', 
                                              backgroundColor: '#e0e0e0', 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              justifyContent: 'center', 
                                              color: '#666',
                                              borderRadius: '8px'
                                            }}>
                                              Profile Image
                                            </div>
                                          )}
                                          <img
                                            src="http://meesdaalder.nl/gt-handtekening/GT_logo.png"
                                            width="134"
                                            style={{ 
                                              display: 'block', 
                                              position: 'absolute', 
                                              bottom: '-20px', 
                                              left: '8px',
                                              maxWidth: '134px'
                                            }}
                                            alt="Game Tailors Logo"
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td width="32"><div></div></td>
                              <td style={{ padding: '0', verticalAlign: 'middle' }}>
                                <h2 style={{ margin: '0', fontSize: '16px', color: 'rgb(36, 36, 36)' }}>
                                  {displayName} {displayLastName}
                                </h2>
                                <p style={{ margin: '0', color: 'rgb(36, 36, 36)', fontSize: '12px', lineHeight: '16px' }}>
                                  {displayJobTitle}
                                </p>
                                <table cellPadding="0" cellSpacing="0" style={{ width: '195px', verticalAlign: 'baseline' }}>
                                  <tbody>
                                    <tr>
                                      <td height="12"></td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: 'baseline' }}>
                                  <tbody>
                                    {phoneNumber && (
                                      <tr style={{ height: '24px', verticalAlign: 'middle' }}>
                                        <td width="24" style={{ verticalAlign: 'middle' }}>
                                          <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: 'baseline' }}>
                                            <tbody>
                                              <tr>
                                                <td style={{ textAlign: 'center' }}>
                                                  <img
                                                    src="https://meesdaalder.nl/gt-handtekening/call2-icon.png"
                                                    width="16"
                                                    style={{ display: 'block', maxWidth: '16px' }}
                                                    alt="Phone"
                                                  />
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                        <td style={{ padding: '0' }}>
                                          <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} style={{ textDecoration: 'none' }} target="_blank">
                                            <span style={{ fontSize: '12px', color: 'rgb(91, 91, 91)' }}>
                                              {displayPhone}
                                            </span>
                                          </a>
                                        </td>
                                      </tr>
                                    )}
                                    <tr style={{ height: '24px', verticalAlign: 'middle' }}>
                                      <td width="24" style={{ verticalAlign: 'middle' }}>
                                        <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: 'baseline' }}>
                                          <tbody>
                                            <tr>
                                              <td style={{ textAlign: 'center' }}>
                                                <img
                                                  src="https://meesdaalder.nl/gt-handtekening/internet-icon.png"
                                                  width="16"
                                                  style={{ display: 'block', maxWidth: '16px' }}
                                                  alt="Website"
                                                />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td style={{ padding: '0' }}>
                                        <a href="https://www.gametailors.com/" style={{ textDecoration: 'none' }} target="_blank">
                                          <span style={{ fontSize: '12px', color: 'rgb(91, 91, 91)' }}>
                                            www.gametailors.com
                                          </span>
                                        </a>
                                      </td>
                                    </tr>
                                    <tr style={{ height: '24px', verticalAlign: 'middle' }}>
                                      <td width="24" style={{ verticalAlign: 'middle' }}>
                                        <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: 'baseline' }}>
                                          <tbody>
                                            <tr>
                                              <td style={{ textAlign: 'center' }}>
                                                <img
                                                  src="https://meesdaalder.nl/gt-handtekening/location-icon.png"
                                                  width="16"
                                                  style={{ display: 'block', maxWidth: '16px' }}
                                                  alt="Location"
                                                />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td style={{ padding: '0' }}>
                                        <a href="https://www.google.com/maps?f=d&daddr=Game+Tailors+Delft&dirflg=d" style={{ textDecoration: 'none' }} target="_blank">
                                          <span style={{ fontSize: '12px', color: 'rgb(91, 91, 91)' }}>
                                            Schieweg 15Y-30, 2627AN Delft
                                          </span>
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table cellPadding="0" cellSpacing="0" style={{ width: '200px', verticalAlign: 'baseline', marginTop: '12px' }}>
                                  <tbody>
                                    <tr>
                                      <td>
                                        <table cellPadding="0" cellSpacing="0" style={{ display: 'inline-block', verticalAlign: 'baseline', borderCollapse: 'collapse' }}>
                                          <tbody>
                                            <tr style={{ height: '24px', verticalAlign: 'middle', backgroundColor: '#4493cf' }}>
                                              <td width="24" style={{ verticalAlign: 'middle', borderRadius: '8px 0 0 8px', paddingLeft: '8px' }}>
                                                <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: 'baseline' }}>
                                                  <tbody>
                                                    <tr>
                                                      <td style={{ textAlign: 'center' }}>
                                                        <img
                                                          src="https://meesdaalder.nl/gt-handtekening/point-icon.png"
                                                          width="16"
                                                          style={{ display: 'block', maxWidth: '16px' }}
                                                          alt="Schedule"
                                                        />
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                              <td style={{ padding: '8px 12px 8px 0', borderRadius: '0 8px 8px 0' }}>
                                                <a href="https://calendly.com/gametailors/videobellen" style={{ textDecoration: 'none' }} target="_blank">
                                                  <span style={{ fontSize: '12px', color: 'rgb(255, 255, 255)' }}>
                                                    Plan vrijblijvend gesprek
                                                  </span>
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
              <strong>How to use:</strong> Copy the HTML and paste it into your email client's signature settings.
            </p>
          </div>
              
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button
              onClick={handleCopyToClipboard}
              disabled={!isFormComplete || uploading}
              className="blue"
              data-tooltip="Please fill in all required fields and upload an image"
              style={{ width: '100%' }}
            >
              <span className="button-icon">{uploading ? '⏳' : '📋'}</span>
              {uploading ? 'Preparing signature...' : 'Copy Signature HTML'}
            </button>
          </div>
        </div>
      </div>
      
      <Toaster position="bottom-center" />
    </>
  );
};

export default EmailSignature; 