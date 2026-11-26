import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ImagePlus, X } from 'lucide-react';
import { Card, Button } from '../../components/Ui/kit';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Image picker with previews. Validates type/size before handing files back.
 * `files` is an array of File; `onChange(files)`; `onError(message)`.
 */
export function PhotoPicker({ files, onChange, onError, max = 5, label = 'Add photos', disabled }) {
  const inputRef = useRef(null);
  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const pick = (e) => {
    const chosen = Array.from(e.target.files || []);
    e.target.value = '';
    const bad = chosen.find((f) => !ACCEPTED.includes(f.type) || f.size > MAX_BYTES);
    if (bad) {
      onError?.(`${bad.name}: only JPEG, PNG or WEBP images up to 5 MB are allowed`);
      return;
    }
    const next = [...files, ...chosen].slice(0, max);
    if (files.length + chosen.length > max) onError?.(`You can attach up to ${max} photos`);
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {previews.map((p, i) => (
          <div key={p.url} className="relative h-20 w-20 overflow-hidden rounded-lg ring-1 ring-slate-200">
            <img src={p.url} alt={`Selected photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              disabled={disabled}
              onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-0.5 text-white hover:bg-slate-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {files.length < max && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            {label}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} multiple={max > 1} className="hidden" onChange={pick} aria-label={label} />
    </div>
  );
}

/** Confirmation shown after a service request is submitted. */
export function RequestSubmitted({ title, request, children, onAnother }) {
  return (
    <Card>
      <div className="flex flex-col items-center px-4 py-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {request?.request_number && (
          <p className="mt-1 text-sm text-slate-500">
            Reference <span className="font-mono font-medium text-slate-700">{request.request_number}</span>
          </p>
        )}
        <div className="mt-3 max-w-md text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/dashboard/farmer/my-service-requests" className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
            View my requests
          </Link>
          {onAnother && <Button variant="secondary" onClick={onAnother}>Submit another</Button>}
        </div>
      </div>
    </Card>
  );
}

