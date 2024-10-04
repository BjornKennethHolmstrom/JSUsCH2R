const DB_NAME = 'JSUsCH2R';
const STORE_NAME = 'scheduleLibrary';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject("IndexedDB initialization failed");
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
  });
};

export const saveToIndexedDB = async (data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data);

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
    request.onsuccess = () => resolve(request.result);
  });
};
