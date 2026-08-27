import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function useBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Persists an uploaded image and returns its URL.
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is configured (production);
 * otherwise falls back to local disk under server/uploads (local/Docker dev).
 */
export async function storeImage(buffer: Buffer, mimetype: string, prefix: string, subdir?: string): Promise<string> {
  const ext = EXT_BY_MIME[mimetype] ?? 'jpg';
  const filename = `${prefix}-${nanoid(8)}.${ext}`;

  if (useBlob()) {
    const key = subdir ? `${subdir}/${filename}` : filename;
    const blob = await put(key, buffer, { access: 'public', contentType: mimetype, addRandomSuffix: true });
    return blob.url;
  }

  const dir = subdir ? path.join(UPLOAD_DIR, subdir) : UPLOAD_DIR;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return subdir ? `/uploads/${subdir}/${filename}` : `/uploads/${filename}`;
}
