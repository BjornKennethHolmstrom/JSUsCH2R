const DB_NAME = 'JSUsCH2R';
const STORE_NAME = 'scheduleLibrary';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject("IndexedDB initialization failed");
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const clearIndexedDB = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
    console.log('IndexedDB cleared');
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
  }
};

export const saveToIndexedDB = async (data) => {
  if (!data) return null;
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      ...data,
      updatedAt: new Date().toISOString()
    });

    request.onerror = () => reject("Error saving to IndexedDB");
    request.onsuccess = () => resolve(request.result);
  });
};

export const getFromIndexedDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject("Error reading from IndexedDB");
    request.onsuccess = () => {
      const data = request.result;
      // Return the most recent entry if any exist
      resolve(data.length > 0 ? data.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0] : null);
    };
  });
};
