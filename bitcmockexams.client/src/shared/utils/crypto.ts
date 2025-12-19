// Lightweight AES-GCM encryption/decryption helpers using Web Crypto API
// NOTE: Client-side encryption only obfuscates data; do not treat as secure.

const VERSION = 'v1';
const SECRET_PASSPHRASE = 'bitc-review-suite-secret-2025'; // Static client-side passphrase
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12; // AES-GCM recommended IV size

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64(bytes: ArrayBuffer): string {
  const uint8 = new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
  return btoa(binary);
}

function fromBase64(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(salt: ArrayBuffer): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(SECRET_PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function getRandomBytes(length: number): ArrayBuffer {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return buf.buffer;
}

export async function encryptPayload(payload: unknown): Promise<string> {
  const salt = getRandomBytes(SALT_BYTES);
  const iv = getRandomBytes(IV_BYTES);
  const key = await deriveKey(salt);
  const data = textEncoder.encode(JSON.stringify(payload));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const token = [
    VERSION,
    toBase64(salt),
    toBase64(iv),
    toBase64(cipher),
  ].join(':');
  return token;
}

export async function decryptPayload(token: string): Promise<any | null> {
  try {
    const parts = token.split(':');
    if (parts.length !== 4) return null;
    const [ver, saltB64, ivB64, cipherB64] = parts;
    if (ver !== VERSION) return null;
    const salt = fromBase64(saltB64);
    const iv = fromBase64(ivB64);
    const cipher = fromBase64(cipherB64);
    const key = await deriveKey(salt);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    const json = textDecoder.decode(plain);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
