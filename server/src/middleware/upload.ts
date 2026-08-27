import multer from 'multer';

const MAX_MB = Number(process.env.MAX_UPLOAD_MB) || 5;

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new Error('UNSUPPORTED_FILE_TYPE'));
    return;
  }
  cb(null, true);
}

export const uploadQuoteImages = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 6 },
  fileFilter,
}).array('images', 6);

export const uploadCarImages = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 10 },
  fileFilter,
}).array('images', 10);

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47];

function isWebp(buf: Buffer): boolean {
  return buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
}

function hasSignature(buf: Buffer, signature: number[]): boolean {
  return buf.length >= signature.length && signature.every((byte, i) => buf[i] === byte);
}

/** Reads real file bytes (not the client-supplied mimetype) and flags a mismatch. */
export function verifyMagicBytes(files: Express.Multer.File[]): string | null {
  for (const file of files) {
    const buf = file.buffer;
    const isValid = hasSignature(buf, JPEG) || hasSignature(buf, PNG) || isWebp(buf);
    if (!isValid) return file.originalname;
  }
  return null;
}
