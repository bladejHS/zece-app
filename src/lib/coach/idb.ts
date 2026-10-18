/* IndexedDB minimal: o bază „zece-coach" cu două depozite cheie → valoare. */

const DB = 'zece-coach';
export type StoreName = 'vault' | 'queue';

let dbP: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  return (dbP ??= new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('vault');
      r.result.createObjectStore('queue', { autoIncrement: true });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => { dbP = null; rej(r.error ?? new Error('IndexedDB indisponibil')); };
  }));
}

function req<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((res, rej) => {
    const r = fn(db.transaction(store, mode).objectStore(store));
    r.onsuccess = () => res(r.result as T);
    r.onerror = () => rej(r.error ?? new Error('IndexedDB'));
  }));
}

export const idbGet = <T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> => req(store, 'readonly', (s) => s.get(key));
export const idbPut = (store: StoreName, value: unknown, key?: IDBValidKey): Promise<IDBValidKey> =>
  req(store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key)));
export const idbDel = (store: StoreName, key: IDBValidKey): Promise<void> => req(store, 'readwrite', (s) => s.delete(key));

export function idbEntries<T>(store: StoreName): Promise<[IDBValidKey, T][]> {
  return Promise.all([
    req<IDBValidKey[]>(store, 'readonly', (s) => s.getAllKeys()),
    req<T[]>(store, 'readonly', (s) => s.getAll()),
  ]).then(([ks, vs]) => ks.map((k, i) => [k, vs[i] as T]));
}
