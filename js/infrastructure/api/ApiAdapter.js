import { API } from '../../core/api.js';
import { Lesson } from '../../domain/entities/Lesson.js';
import { Catalog } from '../../domain/entities/Category.js';
import { Word } from '../../domain/entities/Word.js';

/**
 * ApiAdapter
 * Infrastructure adapter for API calls
 * Wraps the core API and converts raw data to domain entities
 */
export class ApiAdapter {
  constructor(baseUrl = 'data/') {
    this.api = new API(baseUrl);
  }

  /**
   * Get the catalog as a domain entity
   * @returns {Promise<Catalog>}
   */
  async getCatalog() {
    const rawData = await this.api.getCatalog();
    return Catalog.fromData(rawData);
  }

  /**
   * Get a lesson by ID as a domain entity
   * @param {string} lessonId
   * @returns {Promise<Lesson>}
   */
  async getLesson(lessonId) {
    const rawData = await this.api.getLesson(lessonId);
    return Lesson.fromData(rawData);
  }

  /**
   * Get dictionary index
   * @returns {Promise<Object>}
   */
  async getDictionaryIndex() {
    return this.api.getDictionary();
  }

  /**
   * Get words from a dictionary category
   * @param {string} category - Category name
   * @param {string} theme - Theme name
   * @returns {Promise<Map<string, Word>>}
   */
  async getDictionaryCategory(category, theme = 'basic') {
    const rawData = await this.api.getDictionaryCategory(category, theme);
    const words = new Map();

    if (rawData && typeof rawData === 'object') {
      for (const [lemma, wordData] of Object.entries(rawData)) {
        words.set(lemma, Word.fromData(wordData, lemma));
      }
    }

    return words;
  }

  /**
   * Get the main dictionary
   * @returns {Promise<Map<string, Word>>}
   */
  async getMainDictionary() {
    const rawData = await this.api.fetchJSON('dictionary.json');
    const words = new Map();

    if (rawData && typeof rawData === 'object') {
      for (const [lemma, wordData] of Object.entries(rawData)) {
        words.set(lemma, Word.fromData(wordData, lemma));
      }
    }

    return words;
  }

  /**
   * Get phonetic rules
   * @returns {Promise<Array>}
   */
  async getPhoneticRules() {
    return this.api.getPhoneticRules();
  }

  /**
   * Get grammar rules
   * @returns {Promise<Array>}
   */
  async getGrammarRules() {
    return this.api.getGrammarRules();
  }

  /**
   * Clear cache
   * @param {string} path - Optional path to clear
   */
  clearCache(path = null) {
    this.api.clearCache(path);
  }

  /**
   * Get cache information
   * @returns {Object}
   */
  getCacheInfo() {
    return this.api.getCacheInfo();
  }
}
