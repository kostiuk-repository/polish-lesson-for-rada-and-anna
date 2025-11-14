/**
 * DictionaryService
 * Application service for managing dictionary and word lookups
 */
export class DictionaryService {
  constructor(apiAdapter) {
    this.apiAdapter = apiAdapter;
    this.dictionary = new Map(); // Map<lemma, Word>
    this.phoneticRules = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the dictionary service
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing DictionaryService...');

      // Load phonetic rules
      const phoneticRules = await this.apiAdapter.getPhoneticRules();
      if (phoneticRules && Array.isArray(phoneticRules)) {
        phoneticRules.forEach(rule => {
          this.phoneticRules.set(rule.letter, rule.pronunciation);
        });
      }

      // Load main dictionary
      const mainDictionary = await this.apiAdapter.getMainDictionary();
      mainDictionary.forEach((word, lemma) => {
        const normalized = this.normalizeWord(lemma);
        if (!this.dictionary.has(normalized)) {
          this.dictionary.set(normalized, word);
        }
      });

      // Load categorized dictionaries
      await this.loadAllCategories();

      this.isInitialized = true;
      console.log(`✅ DictionaryService initialized. Total words: ${this.dictionary.size}`);
    } catch (error) {
      console.error('❌ Error initializing DictionaryService:', error);
      throw error;
    }
  }

  /**
   * Load all dictionary categories
   * @returns {Promise<void>}
   */
  async loadAllCategories() {
    try {
      const dictionaryIndex = await this.apiAdapter.getDictionaryIndex();
      const loadPromises = [];

      if (dictionaryIndex.categories) {
        for (const [categoryName, categoryData] of Object.entries(dictionaryIndex.categories)) {
          if (categoryData.themes) {
            for (const [themeName, themeData] of Object.entries(categoryData.themes)) {
              if (themeData.words_count > 0) {
                loadPromises.push(
                  this.loadDictionaryCategory(categoryName, themeName)
                );
              }
            }
          }
        }
      }

      await Promise.all(loadPromises);
    } catch (error) {
      console.warn('Could not load additional categories:', error);
    }
  }

  /**
   * Load a specific dictionary category
   * @param {string} category - Category name
   * @param {string} theme - Theme name
   * @returns {Promise<void>}
   */
  async loadDictionaryCategory(category, theme = 'basic') {
    try {
      const words = await this.apiAdapter.getDictionaryCategory(category, theme);
      words.forEach((word, lemma) => {
        const normalized = this.normalizeWord(lemma);
        if (!this.dictionary.has(normalized)) {
          this.dictionary.set(normalized, word);
        }
      });
    } catch (error) {
      console.warn(`Could not load category ${category}/${theme}:`, error);
    }
  }

  /**
   * Look up a word
   * @param {string} wordKey - Word to look up
   * @returns {Word|null}
   */
  lookupWord(wordKey) {
    if (!this.isInitialized) {
      console.warn('DictionaryService not initialized');
      return null;
    }

    const normalized = this.normalizeWord(wordKey);
    return this.dictionary.get(normalized) || null;
  }

  /**
   * Get multiple words
   * @param {Array<string>} wordKeys - Array of word keys
   * @returns {Map<string, Word>}
   */
  lookupWords(wordKeys) {
    const results = new Map();
    wordKeys.forEach(key => {
      const word = this.lookupWord(key);
      if (word) {
        results.set(key, word);
      }
    });
    return results;
  }

  /**
   * Search words by query
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters
   * @returns {Array<Word>}
   */
  searchWords(query, filters = {}) {
    const normalizedQuery = this.normalizeWord(query);
    const results = [];

    this.dictionary.forEach((word, lemma) => {
      if (lemma.includes(normalizedQuery)) {
        // Apply filters
        if (filters.partOfSpeech && word.partOfSpeech !== filters.partOfSpeech) {
          return;
        }
        results.push(word);
      }
    });

    return results.slice(0, filters.limit || 50);
  }

  /**
   * Get all words of a specific part of speech
   * @param {string} partOfSpeech - Part of speech
   * @returns {Array<Word>}
   */
  getWordsByPartOfSpeech(partOfSpeech) {
    const results = [];
    this.dictionary.forEach(word => {
      if (word.partOfSpeech === partOfSpeech) {
        results.push(word);
      }
    });
    return results;
  }

  /**
   * Normalize a word for lookup
   * @param {string} word - Word to normalize
   * @returns {string}
   */
  normalizeWord(word) {
    return word.toLowerCase().trim();
  }

  /**
   * Get phonetic transcription for a word
   * @param {string} word - Word
   * @returns {string}
   */
  getPhoneticTranscription(word) {
    const wordObj = this.lookupWord(word);
    if (wordObj) {
      return wordObj.getPronunciation();
    }
    return '';
  }

  /**
   * Get total number of words
   * @returns {number}
   */
  getWordCount() {
    return this.dictionary.size;
  }

  /**
   * Check if dictionary is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized;
  }
}
