import { customAlphabet } from 'nanoid';

// No ambiguous characters (0/O, 1/I) — this gets read back to customers over the phone.
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generate = customAlphabet(alphabet, 5);

export function generateRefCode(): string {
  return `GSQ-${generate()}`;
}
