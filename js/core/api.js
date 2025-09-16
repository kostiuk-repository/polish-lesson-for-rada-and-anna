export class API {
  constructor(baseUrl = 'data/') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Универсальный метод для загрузки JSON
   * @param {string} path - путь к файлу
   * @param {boolean} useCache - использовать ли кэш
   * @returns {Promise<any>}
   */
  async fetchJSON(path, useCache = true) {
    const fullPath = `${this.baseUrl}${path}`;
    
    // Проверяем кэш
    if (useCache && this.cache.has(fullPath)) {
      return this.cache.get(fullPath);
    }

    // Проверяем, не выполняется ли уже такой запрос
    if (this.pendingRequests.has(fullPath)) {
      return this.pendingRequests.get(fullPath);
    }

    // Создаем новый запрос
    const request = this.makeRequest(fullPath);
    this.pendingRequests.set(fullPath, request);

    try {
      const data = await request;
      
      // Сохраняем в кэш
      if (useCache) {
        this.cache.set(fullPath, data);
      }

      return data;
    } finally {
      // Удаляем из списка ожидающих
      this.pendingRequests.delete(fullPath);
    }
  }

  /**
   * Выполняет HTTP запрос
   * @param {string} url - URL для запроса
   * @returns {Promise<any>}
   */
  async makeRequest(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`Ошибка загрузки ${url}:`, error);
      throw new Error(`Не удалось загрузить данные: ${error.message}`);
    }
  }

  /**
   * Загружает каталог уроков
   */
  async getCatalog() {
    return this.fetchJSON('catalog.json');
  }

  /**
   * Загружает данные урока
   * @param {string} lessonId - ID урока
   */
  async getLesson(lessonId) {
    // Сначала загружаем каталог, чтобы найти путь к файлу урока
    const catalog = await this.getCatalog();
    const lessonInfo = this.findLessonInCatalog(catalog, lessonId);
    
    if (!lessonInfo) {
      throw new Error(`Урок с ID "${lessonId}" не найден`);
    }

    // Загружаем данные урока
    const lessonPath = lessonInfo.dataFile.startsWith('lessons/') 
      ? lessonInfo.dataFile 
      : `lessons/${lessonInfo.dataFile}`;
      
    return this.fetchJSON(lessonPath);
  }

  /**
   * Загружает полный словарь
   */
  async getDictionary() {
    return this.fetchJSON('dictionary/index.json');
  }

  /**
   * Загружает словарь по категории
   * @param {string} category - категория (verbs, nouns, adjectives)
   * @param {string} theme - тема (basic, restaurant, shop)
   */
  async getDictionaryCategory(category, theme = 'basic') {
    return this.fetchJSON(`dictionary/${category}/${theme}.json`);
  }

  /**
   * Загружает правила произношения
   */
  async getPhoneticRules() {
    return this.fetchJSON('rules/phonetic.json');
  }

  /**
   * Загружает грамматические правила
   */
  async getGrammarRules() {
    return this.fetchJSON('rules/grammar.json');
  }

  /**
   * Находит урок в каталоге по ID
   * @param {Object} catalog - объект каталога
   * @param {string} lessonId - ID урока
   * @returns {Object|null}
   */
  findLessonInCatalog(catalog, lessonId) {
    for (const category of catalog.categories) {
      const lesson = category.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return { ...lesson, categoryId: category.id };
      }
    }
    return null;
  }

  /**
   * Очищает кэш
   * @param {string} path - конкретный путь для очистки (опционально)
   */
  clearCache(path = null) {
    if (path) {
      const fullPath = `${this.baseUrl}${path}`;
      this.cache.delete(fullPath);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Получает информацию о кэше
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      pendingRequests: Array.from(this.pendingRequests.keys())
    };
  }
}