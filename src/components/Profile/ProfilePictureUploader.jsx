import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { updateProfile } from '../../services/authService';

const ProfilePictureUploader = ({ 
  currentPicture, 
  onUpload, 
  onDelete, 
  userId,
  className = '' 
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentPicture);
  const [error, setError] = useState(null);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // In a real implementation, we would upload the file to a server
      // For now, we'll just simulate the upload and call the onUpload callback
      // In a complete implementation, this would be replaced with actual API call
      setTimeout(() => {
        onUpload && onUpload(file);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    setPreview(null);
    onDelete && onDelete();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative inline-block">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {preview ? (
            <img 
              src={preview} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
              <span className="text-white text-4xl font-bold">
                {userId ? userId.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={triggerFileUpload}
          disabled={isUploading}
          className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
        
        {preview && (
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

export default ProfilePictureUploader;