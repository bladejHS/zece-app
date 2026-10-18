/* Ce s-a întâmplat cât antrenorul AI nu a fost disponibil (întrebări, adaptări făcute după reguli, feedback),
   păstrat în IndexedDB. La revenirea online, aplicația trimite totul antrenorului AI să verifice. */
import { idbDel, idbEntries, idbPut } from './idb.ts';

export type QueueItem =
  | { kind: 'chat'; t: string; question: string; localAnswer: string }
  | { kind: 'adj'; t: string; day: string; w: number; d: number; rules: string }
  | { kind: 'feedback'; t: string; data: Record<string, unknown> };

export async function add(item: QueueItem): Promise<void> {
  await idbPut('queue', item);
}

export async function all(): Promise<{ id: IDBValidKey; item: QueueItem }[]> {
  try {
    return (await idbEntries<QueueItem>('queue')).map(([id, item]) => ({ id, item }));
  } catch {
    return [];
  }
}

export async function remove(id: IDBValidKey): Promise<void> {
  await idbDel('queue', id);
}
