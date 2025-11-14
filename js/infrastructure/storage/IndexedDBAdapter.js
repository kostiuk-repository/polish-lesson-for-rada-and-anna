/**
 * IndexedDBAdapter
 * Future implementation for IndexedDB storage
 * Will provide offline-first data persistence
 */
export class IndexedDBAdapter {
  constructor(dbName = 'PolishLessonDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  /**
   * Check if IndexedDB is supported
   * @returns {boolean}
   */
  static isSupported() {
    return 'indexedDB' in window;
  }

  /**
   * Initialize the database
   * @returns {Promise<void>}
   */
  async init() {
    if (!IndexedDBAdapter.isSupported()) {
      console.warn('IndexedDB is not supported in this browser');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('words')) {
          db.createObjectStore('words', { keyPath: 'lemma' });
        }

        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id' });
        }

        console.log('IndexedDB schema upgraded to version', this.version);
      };
    });
  }

  /**
   * Store a lesson
   * @param {Object} lesson - Lesson data
   * @returns {Promise<void>}
   */
  async storeLesson(lesson) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['lessons'], 'readwrite');
      const store = transaction.objectStore('lessons');
      const request = store.put(lesson);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a lesson by ID
   * @param {string} lessonId
   * @returns {Promise<Object|null>}
   */
  async getLesson(lessonId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['lessons'], 'readonly');
      const store = transaction.objectStore('lessons');
      const request = store.get(lessonId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store a word
   * @param {Object} word - Word data
   * @returns {Promise<void>}
   */
  async storeWord(word) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      const request = store.put(word);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a word by lemma
   * @param {string} lemma
   * @returns {Promise<Object|null>}
   */
  async getWord(lemma) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const request = store.get(lemma);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data
   * @returns {Promise<void>}
   */
  async clearAll() {
    if (!this.db) return;

    const stores = ['lessons', 'words', 'progress'];
    const promises = stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    return Promise.all(promises);
  }
}
