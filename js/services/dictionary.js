export class DictionaryService {
  constructor(api) {
    this.api = api;
    this.dictionary = new Map();
    this.phoneticRules = new Map();
    this.isInitialized = false;
  }

  async init() {
    try {
      // Загружаем правила произношения
      const rulesData = await this.api.fetchJSON('rules/phonetic.json'); // Corrected path
      if (rulesData && rulesData.rules) {
        this.phoneticRules = new Map(Object.entries(rulesData.rules));
      }

      // Загружаем индекс словаря и все категории из него
      const dictionaryIndex = await this.api.getDictionary();
      const loadPromises = [];

      for (const category in dictionaryIndex.categories) {
        for (const theme in dictionaryIndex.categories[category].themes) {
          loadPromises.push(this.loadDictionaryCategory(category, theme));
        }
      }

      await Promise.all(loadPromises);

      this.isInitialized = true;
      console.log('✅ DictionaryService инициализирован. Всего слов:', this.dictionary.size);
    } catch (error) {
      console.error('❌ Ошибка инициализации DictionaryService:', error);
      throw error;
    }
  }

  /**
   * Загружает категорию словаря
   * @param {string} category - категория (verbs, nouns, adjectives)
   * @param {string} theme - тема (basic, restaurant, shop)
   */
  async loadDictionaryCategory(category, theme = 'basic') {
    try {
      const words = await this.api.getDictionaryCategory(category, theme);
      
      // Добавляем слова в общий словарь
      for (const [key, wordData] of Object.entries(words)) {
        this.dictionary.set(key.toLowerCase(), {
          ...wordData,
          category,
          theme
        });
      }

      console.log(`📚 Загружена категория: ${category}/${theme} (${Object.keys(words).length} слов)`);
    } catch (error) {
      console.error(`❌ Ошибка загрузки категории ${category}/${theme}:`, error);
    }
  }

  /**
   * Получает информацию о слове
   * @param {string} word - слово для поиска
   * @returns {Object|null}
   */
  getWord(word) {
    const normalizedWord = this.normalizeWord(word);
    return this.dictionary.get(normalizedWord) || null;
  }

  /**
   * Ищет слова по запросу
   * @param {string} query - поисковый запрос
   * @param {number} limit - максимальное количество результатов
   * @returns {Array}
   */
  searchWords(query, limit = 10) {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    for (const [key, wordData] of this.dictionary) {
      if (results.length >= limit) break;

      // Поиск по лемме
      if (key.includes(normalizedQuery)) {
        results.push({
          key,
          word: wordData,
          matchType: 'lemma',
          relevance: this.calculateRelevance(key, normalizedQuery)
        });
        continue;
      }

      // Поиск по переводу
      if (wordData.translations?.ru?.toLowerCase().includes(normalizedQuery)) {
        results.push({
          key,
          word: wordData,
          matchType: 'translation',
          relevance: this.calculateRelevance(wordData.translations.ru, normalizedQuery)
        });
      }
    }

    // Сортируем по релевантности
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Получает правило произношения
   * @param {string} ruleKey - ключ правила
   * @returns {Object|null}
   */
  getPhoneticRule(ruleKey) {
    return this.phoneticRules.get(ruleKey) || null;
  }

  /**
   * Применяет правила произношения к слову
   * @param {string} word - польское слово
   * @returns {string} - транскрипция
   */
  applyPhoneticRules(word) {
    let transcription = word.toLowerCase();

    // Применяем правила в определенном порядке
    const ruleOrder = [
      'ą', 'ę', 'ł', 'ć', 'ś', 'ź', 'ń',
      'rz', 'cz', 'sz', 'dz', 'dź', 'dż',
      'cie', 'sie', 'zie', 'nie',
      'ci', 'si', 'zi', 'ni'
    ];

    for (const ruleKey of ruleOrder) {
      const rule = this.phoneticRules.get(ruleKey);
      if (rule) {
        const regex = new RegExp(ruleKey, 'gi');
        transcription = transcription.replace(regex, rule.ru);
      }
    }

    return transcription;
  }

  /**
   * Генерирует произношение для слова
   * @param {Object} wordData - данные слова
   * @returns {Object}
   */
  generatePronunciation(wordData) {
    if (wordData.pronunciation?.ru_transcription) {
      return wordData.pronunciation;
    }

    // Автоматически генерируем произношение
    const transcription = this.applyPhoneticRules(wordData.lemma);
    
    return {
      ru_transcription: transcription,
      auto_generated: true
    };
  }

  /**
   * Получает примеры использования слова
   * @param {string} word - слово
   * @returns {Array}
   */
  getWordExamples(word) {
    const wordData = this.getWord(word);
    return wordData?.examples || [];
  }

  /**
   * Получает связанные слова
   * @param {string} word - слово
   * @returns {Array}
   */
  getRelatedWords(word) {
    const wordData = this.getWord(word);
    if (!wordData) return [];

    const related = [];
    const samePOS = this.getWordsByPartOfSpeech(wordData.part_of_speech);
    
    // Добавляем слова той же части речи (максимум 5)
    related.push(...samePOS.slice(0, 5));

    return related;
  }

  /**
   * Получает слова по части речи
   * @param {string} partOfSpeech - часть речи
   * @returns {Array}
   */
  getWordsByPartOfSpeech(partOfSpeech) {
    const words = [];
    
    for (const [key, wordData] of this.dictionary) {
      if (wordData.part_of_speech === partOfSpeech) {
        words.push({ key, ...wordData });
      }
    }

    return words;
  }

  /**
   * Нормализует слово для поиска
   * @param {string} word - слово
   * @returns {string}
   */
  normalizeWord(word) {
    return word.toLowerCase()
      .replace(/[.,!?;:()]/g, '')
      .trim();
  }

  /**
   * Вычисляет релевантность поиска
   * @param {string} text - текст для проверки
   * @param {string} query - поисковый запрос
   * @returns {number}
   */
  calculateRelevance(text, query) {
    const normalizedText = text.toLowerCase();
    
    if (normalizedText === query) return 100;
    if (normalizedText.startsWith(query)) return 80;
    if (normalizedText.includes(query)) return 60;
    
    return 0;
  }

  /**
   * Получает статистику словаря
   * @returns {Object}
   */
  getStats() {
    const stats = {
      totalWords: this.dictionary.size,
      byPartOfSpeech: {},
      byCategory: {},
      byTheme: {}
    };

    for (const [key, wordData] of this.dictionary) {
      // По частям речи
      stats.byPartOfSpeech[wordData.part_of_speech] = 
        (stats.byPartOfSpeech[wordData.part_of_speech] || 0) + 1;

      // По категориям
      stats.byCategory[wordData.category] = 
        (stats.byCategory[wordData.category] || 0) + 1;

      // По темам
      stats.byTheme[wordData.theme] = 
        (stats.byTheme[wordData.theme] || 0) + 1;
    }

    return stats;
  }

  getPartOfSpeechName(pos) {
    const names = {
      'verb': 'Глагол',
      'noun': 'Существительное',
      'adjective': 'Прилагательное',
      'adverb': 'Наречие',
      'pronoun': 'Местоимение',
      'preposition': 'Предлог',
      'conjunction': 'Союз',
      'particle': 'Частица',
      'modal': 'Модальное слово',
      'interjection': 'Междометие',
      'numeral': 'Числительное',
      'punctuation': 'Знак препинания'
    };
    return names[pos] || pos;
  }
}