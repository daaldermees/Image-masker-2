import React, { useRef } from 'react';
import { Button } from './Button';

interface FileUploadButtonProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  buttonText?: string;
  className?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelected,
  accept = '*/*',
  buttonText = 'Upload File',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
      />
      <Button onClick={handleClick}>
        {buttonText}
      </Button>
    </div>
  );
};

export default FileUploadButton; 