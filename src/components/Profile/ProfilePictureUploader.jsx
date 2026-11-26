import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { uploadSingle } from '../../services/uploadService';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Round avatar with upload/remove buttons. Uploads the image to /api/upload and
 * then calls `onUpload(url)` so the parent can persist it on the profile.
 * `onUpload` may return a promise; the spinner stays until it settles.
 */
const ProfilePictureUploader = ({ currentPicture, onUpload, onDelete, name, userId, size = 'lg', className = '' }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentPicture || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => setPreview(currentPicture || null), [currentPicture]);

  const initial = (name || userId || 'U').trim().charAt(0).toUpperCase();
  const dims = size === 'sm' ? 'h-16 w-16 text-xl' : 'h-28 w-28 text-4xl';

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('Please choose a JPEG, PNG or WEBP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB');
      return;
    }
    setBusy(true);
    setError(null);
    const previous = preview;
    setPreview(URL.createObjectURL(file));
    try {
      const res = await uploadSingle(file);
      const url = res?.data?.url;
      if (!url) throw new Error('Upload did not return a file URL');
      await onUpload?.(url);
      setPreview(url);
    } catch (err) {
      setPreview(previous);
      setError(err?.message || 'Failed to upload image');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await onDelete?.();
      setPreview(null);
    } catch (err) {
      setError(err?.message || 'Failed to remove image');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <div className={`${dims} overflow-hidden rounded-full bg-brand-100 ring-4 ring-white shadow`}>
          {preview ? (
            <img src={preview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-semibold text-brand-800">{initial}</span>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/40 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          aria-label="Upload profile picture"
          className="absolute bottom-0 right-0 rounded-full bg-brand-600 p-2 text-white shadow hover:bg-brand-700 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
        </button>
        {preview && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            aria-label="Remove profile picture"
            className="absolute right-0 top-0 rounded-full bg-white p-1.5 text-rose-600 shadow ring-1 ring-slate-200 hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept={ACCEPTED.join(',')} onChange={handleFileChange} className="hidden" aria-label="Profile picture file" />
      {error && <p role="alert" className="mt-2 max-w-[14rem] text-center text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default ProfilePictureUploader;
