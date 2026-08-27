import { useCallback, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { ImagePlus, X } from 'lucide-react';

interface DropzoneItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'compressing' | 'done' | 'error';
  sizeLabel: string;
}

interface ImageDropzoneProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageDropzone({ onChange, maxFiles = 6, error }: ImageDropzoneProps) {
  const [items, setItems] = useState<DropzoneItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const emitChange = useCallback(
    (next: DropzoneItem[]) => {
      onChange(next.map((it) => it.file));
    },
    [onChange]
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const incomingArr = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
      setItems((prev) => {
        const room = maxFiles - prev.length;
        const toAdd: DropzoneItem[] = incomingArr.slice(0, Math.max(0, room)).map((file) => ({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: 'compressing',
          sizeLabel: formatBytes(file.size),
        }));
        const next = [...prev, ...toAdd];
        emitChange(next);

        toAdd.forEach((item) => {
          imageCompression(item.file, {
            maxWidthOrHeight: 1600,
            maxSizeMB: 2,
            useWebWorker: true,
            onProgress: (p: number) => {
              setItems((cur) => cur.map((c) => (c.id === item.id ? { ...c, progress: p } : c)));
            },
          })
            .then((compressed) => {
              setItems((cur) => {
                const updated = cur.map((c) =>
                  c.id === item.id
                    ? { ...c, file: compressed, progress: 100, status: 'done' as const, sizeLabel: formatBytes(compressed.size) }
                    : c
                );
                emitChange(updated);
                return updated;
              });
            })
            .catch(() => {
              setItems((cur) => {
                const updated = cur.map((c) => (c.id === item.id ? { ...c, status: 'error' as const, progress: 100 } : c));
                emitChange(updated);
                return updated;
              });
            });
        });

        return next;
      });
    },
    [emitChange, maxFiles]
  );

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      emitChange(next);
      return next;
    });
  };

  const atLimit = items.length >= maxFiles;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!atLimit) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (!atLimit) addFiles(e.dataTransfer.files);
        }}
        onClick={() => !atLimit && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-disabled={atLimit}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !atLimit) inputRef.current?.click();
        }}
        className={`flex flex-col items-center justify-center rounded border-2 border-dashed px-6 py-10 text-center transition-colors ${
          atLimit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${dragActive ? 'border-moss bg-moss/5' : 'border-moss/25'}`}
      >
        <ImagePlus className="text-moss" size={28} aria-hidden />
        <p className="mt-3 text-sm text-slate">Drag photos here, or tap to choose</p>
        <p className="mt-1 font-mono text-xs text-slate/50">
          JPEG, PNG or WEBP &middot; up to {maxFiles} photos
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          aria-label="Choose photos"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded border border-moss/20 bg-forest-deep">
              <img src={item.previewUrl} alt="" className="aspect-[4/3] w-full object-cover" />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest-deep/90 text-cream"
              >
                <X size={13} />
              </button>
              <div className="bg-forest-deep px-2 py-1.5">
                <p className="font-mono text-[10px] text-cream/70">{item.sizeLabel}</p>
                {item.status === 'compressing' && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-cream/20">
                    <div className="h-full bg-moss transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                {item.status === 'error' && (
                  <p className="mt-1 font-mono text-[10px] text-red-300">Couldn&apos;t compress — using original</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
