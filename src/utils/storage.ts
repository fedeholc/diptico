const DB_NAME = "DipticoDB";
const STORE_NAME = "images";
const DB_VERSION = 1;

export interface StoredImage {
  id: string;
  blob: Blob;
  name: string;
}

export type StoredDiptych = {
  starred: boolean;
  leftIdx: number;
  rightIdx: number;
};

export type UISettings = {
  gridLayout?: "horizontal" | "vertical";
  diptychs?: StoredDiptych[];
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const saveImage = async (id: string, blob: Blob, name: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, blob, name });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getImages = async (): Promise<StoredImage[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const clearImages = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// LocalStorage helpers for UI state
export const saveUISettings = (settings: UISettings) => {
  localStorage.setItem("diptico_settings", JSON.stringify(settings));
};

export const getUISettings = (): UISettings | null => {
  const settings = localStorage.getItem("diptico_settings");
  if (!settings) return null;

  try {
    return JSON.parse(settings) as UISettings;
  } catch {
    return null;
  }
};
