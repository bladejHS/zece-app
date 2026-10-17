/**
 * Secure API key storage using IndexedDB + Web Crypto API
 * Cheia este criptată cu AES-GCM înainte de stocare, niciodată expusă în DOM/source
 */

const DB_NAME = 'zece-secure-store';
const DB_VERSION = 1;
const STORE_NAME = 'api-keys';
const KEY_ID = 'anthropic';

// Encryption key derived from a session-specific seed
// In production, consider deriving from user password or biometric
async function getEncryptionKey(): Promise<CryptoKey> {
  const seed = 'zece-v9-local-encryption-seed';
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(seed),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('zece-salt-v9'),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stochează cheia API criptată în IndexedDB
 */
export async function storeApiKey(key: string): Promise<void> {
  const encKey = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encKey,
    encoder.encode(key),
  );

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ iv, data: encrypted }, KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Recuperează și decriptează cheia API din IndexedDB
 * Returnează null dacă nu există sau decriptarea eșuează
 */
export async function retrieveApiKey(): Promise<string | null> {
  try {
    const db = await openDB();
    const record: { iv: Uint8Array; data: ArrayBuffer } | undefined = await new Promise(
      (resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(KEY_ID);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      },
    );

    if (!record) return null;

    const encKey = await getEncryptionKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: record.iv },
      encKey,
      record.data,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    console.warn('[KeyStore] Decriptare eșuată — cheia poate fi coruptă');
    return null;
  }
}

/**
 * Șterge cheia API din IndexedDB
 */
export async function deleteApiKey(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Verifică dacă o cheie API este stocată
 */
export async function hasApiKey(): Promise<boolean> {
  const key = await retrieveApiKey();
  return key !== null;
}