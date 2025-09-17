export class StorageService {
  constructor() {
    this.prefix = 'polishApp_';
    this.version = '1.0.0';
    this.isAvailable = this.checkAvailability();
    
    this.init();
  }

  init() {
    if (!this.isAvailable) {
      console.warn('LocalStorage недоступен, будет использоваться временное хранение');
      this.fallbackStorage = new Map();
    }

    this.migrateData();
    this.setupEventListeners();
    
    console.log('✅ StorageService инициализирован');
  }

  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  migrateData() {
    const currentVersion = this.get('app_version');
    if (!currentVersion || currentVersion !== this.version) {
      this.performMigration(currentVersion);
      this.set('app_version', this.version);
    }
  }

  performMigration(fromVersion) {
    console.log(`Миграция данных с версии ${fromVersion || 'неизвестно'} на ${this.version}`);
    
    // Здесь можно добавить логику миграции данных между версиями
    if (!fromVersion) {
      // Первый запуск - инициализируем базовые данные
      this.initializeDefaults();
    }
  }

  initializeDefaults() {
    const defaults = {
      user_preferences: {
        language: 'ru',
        theme: 'light',
        showTranslations: true,
        autoPlay: false,
        speechRate: 0.8,
        exerciseDifficulty: 'medium'
      },
      lesson_progress: {},
      word_bookmarks: [],
      word_notes: {},
      word_progress: {},
      study_list: [],
      user_events: [],
      exercise_results: {},
      study_statistics: {
        totalStudyTime: 0,
        lessonsCompleted: 0,
        wordsLearned: 0,
        exercisesCompleted: 0,
        streakDays: 0,
        lastStudyDate: null
      }
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (!this.get(key)) {
        this.set(key, value);
      }
    });
  }

  setupEventListeners() {
    // Слушаем изменения в localStorage из других вкладок
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.prefix)) {
        this.handleStorageChange(e);
      }
    });

    // Сохраняем данные перед закрытием страницы
    window.addEventListener('beforeunload', () => {
      this.saveBeforeUnload();
    });
  }

  handleStorageChange(event) {
    const key = event.key.replace(this.prefix, '');
    console.log(`Storage изменен в другой вкладке: ${key}`);
    
    // Можно добавить логику синхронизации между вкладками
  }

  saveBeforeUnload() {
    // Сохраняем важные данные перед закрытием
    this.updateStudySession();
  }

  // Базовые методы работы с хранилищем

  /**
   * Сохраняет значение в хранилище
   * @param {string} key - ключ
   * @param {any} value - значение
   */
  set(key, value) {
    const fullKey = this.prefix + key;
    
    try {
      if (this.isAvailable) {
        localStorage.setItem(fullKey, JSON.stringify({
          value,
          timestamp: Date.now(),
          version: this.version
        }));
      } else {
        this.fallbackStorage.set(fullKey, value);
      }
    } catch (error) {
      console.error('Ошибка сохранения в storage:', error);
      // Fallback для случая переполнения localStorage
      this.handleStorageError(error, key, value);
    }
  }

  /**
   * Получает значение из хранилища
   * @param {string} key - ключ
   * @param {any} defaultValue - значение по умолчанию
   * @returns {any}
   */
  get(key, defaultValue = null) {
    const fullKey = this.prefix + key;
    
    try {
      if (this.isAvailable) {
        const item = localStorage.getItem(fullKey);
        if (item) {
          const parsed = JSON.parse(item);
          return parsed.value !== undefined ? parsed.value : defaultValue;
        }
      } else {
        return this.fallbackStorage.get(fullKey) || defaultValue;
      }
    } catch (error) {
      console.error('Ошибка чтения из storage:', error);
    }
    
    return defaultValue;
  }

  /**
   * Удаляет значение из хранилища
   * @param {string} key - ключ
   */
  remove(key) {
    const fullKey = this.prefix + key;
    
    if (this.isAvailable) {
      localStorage.removeItem(fullKey);
    } else {
      this.fallbackStorage.delete(fullKey);
    }
  }

  /**
   * Проверяет существование ключа
   * @param {string} key - ключ
   * @returns {boolean}
   */
  has(key) {
    const fullKey = this.prefix + key;
    
    if (this.isAvailable) {
      return localStorage.getItem(fullKey) !== null;
    } else {
      return this.fallbackStorage.has(fullKey);
    }
  }

  /**
   * Очищает все данные приложения
   */
  clear() {
    if (this.isAvailable) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      this.fallbackStorage.clear();
    }
  }

  // Методы для работы с пользовательскими настройками

  /**
   * Устанавливает пользовательскую настройку
   * @param {string} key - ключ настройки
   * @param {any} value - значение
   */
  setUserPreference(key, value) {
    const preferences = this.get('user_preferences', {});
    preferences[key] = value;
    this.set('user_preferences', preferences);
  }

  /**
   * Получает пользовательскую настройку
   * @param {string} key - ключ настройки
   * @param {any} defaultValue - значение по умолчанию
   * @returns {any}
   */
  getUserPreference(key, defaultValue = null) {
    const preferences = this.get('user_preferences', {});
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  // Методы для работы с прогрессом уроков

  /**
   * Обновляет прогресс урока
   * @param {string} lessonId - ID урока
   * @param {Object} progressData - данные прогресса
   */
  updateLessonProgress(lessonId, progressData) {
    const allProgress = this.get('lesson_progress', {});
    
    allProgress[lessonId] = {
      ...allProgress[lessonId],
      ...progressData,
      lastUpdate: Date.now()
    };
    
    this.set('lesson_progress', allProgress);
    this.updateStudyStatistics('lesson', progressData);
  }

  /**
   * Получает прогресс урока
   * @param {string} lessonId - ID урока
   * @returns {Object}
   */
  getLessonProgress(lessonId) {
    const allProgress = this.get('lesson_progress', {});
    return allProgress[lessonId] || {};
  }

  /**
   * Получает общий прогресс по всем урокам
   * @returns {Object}
   */
  getOverallProgress() {
    const allProgress = this.get('lesson_progress', {});
    const lessons = Object.values(allProgress);
    
    const stats = {
      totalLessons: lessons.length,
      completedLessons: lessons.filter(l => l.completed).length,
      startedLessons: lessons.filter(l => l.started).length,
      averageProgress: 0,
      totalStudyTime: lessons.reduce((sum, l) => sum + (l.studyTime || 0), 0)
    };
    
    stats.averageProgress = stats.totalLessons > 0 ? 
      Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0;
    
    return stats;
  }

  // Методы для работы с закладками слов

  /**
   * Добавляет слово в закладки
   * @param {string} word - слово
   * @param {Object} wordData - данные слова
   */
  addWordBookmark(word, wordData = {}) {
    const bookmarks = this.get('word_bookmarks', []);
    
    if (!bookmarks.find(b => b.word === word)) {
      bookmarks.push({
        word,
        ...wordData,
        dateAdded: Date.now()
      });
      
      this.set('word_bookmarks', bookmarks);
    }
  }

  /**
   * Удаляет слово из закладок
   * @param {string} word - слово
   */
  removeWordBookmark(word) {
    const bookmarks = this.get('word_bookmarks', []);
    const filtered = bookmarks.filter(b => b.word !== word);
    this.set('word_bookmarks', filtered);
  }

  /**
   * Проверяет, есть ли слово в закладках
   * @param {string} word - слово
   * @returns {boolean}
   */
  isWordBookmarked(word) {
    const bookmarks = this.get('word_bookmarks', []);
    return bookmarks.some(b => b.word === word);
  }

  /**
   * Получает все закладки слов
   * @returns {Array}
   */
  getWordBookmarks() {
    return this.get('word_bookmarks', []);
  }

  // Методы для заметок и прогресса слов

  getWordNotes(word) {
    const notes = this.get('word_notes', {});
    return notes[word] || '';
  }

  saveWordNotes(word, note) {
    const notes = this.get('word_notes', {});

    if (note && note.trim()) {
      notes[word] = note;
    } else {
      delete notes[word];
    }

    this.set('word_notes', notes);
  }

  getWordProgress(word) {
    const progress = this.get('word_progress', {});
    const defaults = {
      viewCount: 0,
      practiceCount: 0,
      lastPracticeScore: null,
      lastPracticeDate: null,
      isKnown: false,
      markedKnownDate: null,
      lastUpdate: null
    };

    return {
      ...defaults,
      ...(progress[word] || {})
    };
  }

  updateWordProgress(word, updates = {}) {
    const allProgress = this.get('word_progress', {});
    const current = allProgress[word] || {};
    const defaults = {
      viewCount: 0,
      practiceCount: 0,
      lastPracticeScore: null,
      lastPracticeDate: null,
      isKnown: false,
      markedKnownDate: null,
      lastUpdate: null
    };

    const merged = {
      ...defaults,
      ...current,
      ...updates,
      lastUpdate: Date.now()
    };

    allProgress[word] = merged;
    this.set('word_progress', allProgress);

    if (!current.isKnown && merged.isKnown) {
      this.updateStudyStatistics('word', { word });
    }

    return merged;
  }

  addToStudyList(word, entry = {}) {
    const studyList = this.get('study_list', []);
    const existingIndex = studyList.findIndex(item => item.word === word);
    const baseData = {
      word,
      ...entry
    };

    if (existingIndex >= 0) {
      const existing = studyList[existingIndex];
      studyList[existingIndex] = {
        ...existing,
        ...baseData,
        dateAdded: existing.dateAdded || baseData.dateAdded || Date.now(),
        lastUpdated: Date.now()
      };
    } else {
      studyList.push({
        dateAdded: baseData.dateAdded || Date.now(),
        ...baseData
      });
    }

    this.set('study_list', studyList);
  }

  getStudyList() {
    return this.get('study_list', []);
  }

  // Методы для аналитики и событий

  /**
   * Отслеживает пользовательское событие
   * @param {string} eventType - тип события
   * @param {Object} eventData - данные события
   */
  trackEvent(eventType, eventData = {}) {
    const events = this.get('user_events', []);
    
    events.push({
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    });
    
    // Ограничиваем количество событий для экономии места
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    this.set('user_events', events);
  }

  /**
   * Получает события по типу
   * @param {string} eventType - тип события
   * @param {number} limit - максимальное количество
   * @returns {Array}
   */
  getEventsByType(eventType, limit = 100) {
    const events = this.get('user_events', []);
    return events
      .filter(event => event.type === eventType)
      .slice(-limit);
  }

  /**
   * Получает статистику событий
   * @returns {Object}
   */
  getEventsStatistics() {
    const events = this.get('user_events', []);
    const stats = {};
    
    events.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    
    return {
      totalEvents: events.length,
      eventTypes: stats,
      lastEvent: events[events.length - 1] || null
    };
  }

  // Методы для работы с результатами упражнений

  /**
   * Сохраняет результат упражнения
   * @param {string} exerciseId - ID упражнения
   * @param {Object} result - результат
   */
  saveExerciseResult(exerciseId, result) {
    const results = this.get('exercise_results', {});
    
    if (!results[exerciseId]) {
      results[exerciseId] = [];
    }
    
    results[exerciseId].push({
      ...result,
      timestamp: Date.now()
    });
    
    // Ограничиваем количество сохраненных результатов
    if (results[exerciseId].length > 10) {
      results[exerciseId] = results[exerciseId].slice(-10);
    }
    
    this.set('exercise_results', results);
    this.updateStudyStatistics('exercise', result);
  }

  /**
   * Получает результаты упражнения
   * @param {string} exerciseId - ID упражнения
   * @returns {Array}
   */
  getExerciseResults(exerciseId) {
    const results = this.get('exercise_results', {});
    return results[exerciseId] || [];
  }

  /**
   * Получает лучший результат упражнения
   * @param {string} exerciseId - ID упражнения
   * @returns {Object|null}
   */
  getBestExerciseResult(exerciseId) {
    const results = this.getExerciseResults(exerciseId);
    
    if (results.length === 0) return null;
    
    return results.reduce((best, current) => 
      (current.percentage || 0) > (best.percentage || 0) ? current : best
    );
  }

  // Методы для работы со статистикой обучения

  /**
   * Обновляет статистику обучения
   * @param {string} type - тип активности
   * @param {Object} data - данные
   */
  updateStudyStatistics(type, data) {
    const stats = this.get('study_statistics', {});
    const today = new Date().toDateString();
    
    switch (type) {
      case 'lesson':
        if (data.completed) {
          stats.lessonsCompleted = (stats.lessonsCompleted || 0) + 1;
        }
        break;
        
      case 'exercise':
        stats.exercisesCompleted = (stats.exercisesCompleted || 0) + 1;
        break;
        
      case 'word':
        stats.wordsLearned = (stats.wordsLearned || 0) + 1;
        break;
    }
    
    // Обновляем streak
    if (stats.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (stats.lastStudyDate === yesterday.toDateString()) {
        stats.streakDays = (stats.streakDays || 0) + 1;
      } else {
        stats.streakDays = 1;
      }
      
      stats.lastStudyDate = today;
    }
    
    this.set('study_statistics', stats);
  }

  /**
   * Получает статистику обучения
   * @returns {Object}
   */
  getStudyStatistics() {
    return this.get('study_statistics', {});
  }

  /**
   * Обновляет время учебной сессии
   */
  updateStudySession() {
    const sessionStart = this.sessionStart || Date.now();
    const sessionTime = Date.now() - sessionStart;
    
    const stats = this.get('study_statistics', {});
    stats.totalStudyTime = (stats.totalStudyTime || 0) + sessionTime;
    
    this.set('study_statistics', stats);
  }

  // Утилиты

  /**
   * Получает или создает ID сессии
   * @returns {string}
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      this.sessionStart = Date.now();
    }
    return this.sessionId;
  }

  /**
   * Экспортирует все данные пользователя
   * @returns {Object}
   */
  exportUserData() {
    const data = {};
    
    const keys = [
      'user_preferences',
      'lesson_progress',
      'word_bookmarks',
      'word_notes',
      'word_progress',
      'study_list',
      'exercise_results',
      'study_statistics'
    ];
    
    keys.forEach(key => {
      data[key] = this.get(key);
    });
    
    data.exportDate = Date.now();
    data.version = this.version;
    
    return data;
  }

  /**
   * Импортирует данные пользователя
   * @param {Object} data - данные для импорта
   * @returns {boolean} - успешность импорта
   */
  importUserData(data) {
    try {
      if (!data.version) {
        throw new Error('Неверный формат данных');
      }
      
      const keys = [
        'user_preferences',
        'lesson_progress',
        'word_bookmarks',
        'word_notes',
        'word_progress',
        'study_list',
        'exercise_results',
        'study_statistics'
      ];
      
      keys.forEach(key => {
        if (data[key]) {
          this.set(key, data[key]);
        }
      });
      
      console.log('Данные пользователя успешно импортированы');
      return true;
      
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      return false;
    }
  }

  /**
   * Получает размер занимаемого места в хранилище
   * @returns {Object}
   */
  getStorageInfo() {
    if (!this.isAvailable) {
      return { 
        used: 0, 
        available: 0, 
        total: 0,
        percentage: 0 
      };
    }
    
    let used = 0;
    let appUsed = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const itemSize = localStorage[key].length + key.length;
        used += itemSize;
        
        if (key.startsWith(this.prefix)) {
          appUsed += itemSize;
        }
      }
    }
    
    // Примерный лимит localStorage (5MB в большинстве браузеров)
    const total = 5 * 1024 * 1024;
    const available = total - used;
    
    return {
      used: Math.round(used / 1024), // KB
      appUsed: Math.round(appUsed / 1024), // KB
      available: Math.round(available / 1024), // KB
      total: Math.round(total / 1024), // KB
      percentage: Math.round((used / total) * 100)
    };
  }

  handleStorageError(error, key, value) {
    console.warn('Ошибка записи в localStorage, используем fallback:', error);
    
    if (!this.fallbackStorage) {
      this.fallbackStorage = new Map();
    }
    
    this.fallbackStorage.set(this.prefix + key, value);
    
    // Уведомляем пользователя о проблеме
    this.showStorageWarning();
  }

  showStorageWarning() {
    // Можно добавить уведомление пользователю
    console.warn('Хранилище переполнено. Некоторые данные могут не сохраниться.');
  }

  destroy() {
    this.updateStudySession();
    
    if (this.fallbackStorage) {
      this.fallbackStorage.clear();
    }
    
    this.sessionId = null;
    this.sessionStart = null;
  }
}