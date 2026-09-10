import type { Inspection } from "./types";

const DB_NAME = "susq-damage-scanner";
const DB_VERSION = 1;
const STORE = "inspections";
const LS_KEY = "lotscan:inspections-v1";
const IDB_TIMEOUT_MS = 1800;

interface Backend {
  list(): Promise<Inspection[]>;
  get(id: string): Promise<Inspection | undefined>;
  save(row: Inspection): Promise<void>;
  remove(id: string): Promise<void>;
}

let backendPromise: Promise<Backend> | null = null;

function sortRows(rows: Inspection[]): Inspection[] {
  return [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("storage_timeout")), ms);
  });
}

function readLocal(): Inspection[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Inspection[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: Inspection[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

const localBackend: Backend = {
  async list() {
    return sortRows(readLocal());
  },
  async get(id) {
    return readLocal().find((row) => row.id === id);
  },
  async save(row) {
    const rows = readLocal().filter((item) => item.id !== row.id);
    rows.push(row);
    writeLocal(rows);
  },
  async remove(id) {
    writeLocal(readLocal().filter((row) => row.id !== id));
  },
};

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB missing"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    request.onblocked = () => reject(new Error("IndexedDB blocked"));
  });
}

function idbBackend(db: IDBDatabase): Backend {
  function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = fn(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB aborted"));
    });
  }

  return {
    async list() {
      const rows = (await withStore("readonly", (store) => store.getAll())) as Inspection[];
      return sortRows(rows);
    },
    async get(id) {
      return (await withStore("readonly", (store) => store.get(id))) as Inspection | undefined;
    },
    async save(row) {
      await withStore("readwrite", (store) => store.put(row));
    },
    async remove(id) {
      await withStore("readwrite", (store) => store.delete(id));
    },
  };
}

async function createBackend(): Promise<Backend> {
  try {
    const db = await Promise.race([openIndexedDb(), timeout(IDB_TIMEOUT_MS)]);
    return idbBackend(db);
  } catch {
    return localBackend;
  }
}

function backend(): Promise<Backend> {
  if (!backendPromise) backendPromise = createBackend();
  return backendPromise;
}

export async function listInspections(): Promise<Inspection[]> {
  return (await backend()).list();
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  return (await backend()).get(id);
}

export async function saveInspection(inspection: Inspection): Promise<void> {
  const next: Inspection = { ...inspection, updatedAt: new Date().toISOString() };
  try {
    await (await backend()).save(next);
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("This phone is out of storage for photos. Delete an old inspection and try again.");
    }
    throw error;
  }
}

export async function deleteInspection(id: string): Promise<void> {
  await (await backend()).remove(id);
}
