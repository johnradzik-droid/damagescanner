import type { Inspection } from "./types";

const DB_NAME = "susq-damage-scanner";
const DB_VERSION = 1;
const STORE = "inspections";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    tx.oncomplete = () => db.close();
    tx.onabort = () => db.close();
  });
}

export async function listInspections(): Promise<Inspection[]> {
  const rows = await withStore("readonly", (store) => store.getAll());
  return (rows as Inspection[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  const row = await withStore("readonly", (store) => store.get(id));
  return row as Inspection | undefined;
}

export async function saveInspection(inspection: Inspection): Promise<void> {
  const next: Inspection = { ...inspection, updatedAt: new Date().toISOString() };
  await withStore("readwrite", (store) => store.put(next));
}

export async function deleteInspection(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}
