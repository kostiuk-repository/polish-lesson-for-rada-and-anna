/**
 * Translation Value Object
 * Represents translations of a word in different languages
 */
export class Translation {
  constructor(translations = {}) {
    this.ru = translations.ru || '';
    this.en = translations.en || '';
    this.ua = translations.ua || '';
  }

  /**
   * Get translation for a specific language
   * @param {string} lang - Language code (ru, en, ua)
   * @returns {string}
   */
  get(lang = 'ru') {
    return this[lang] || this.ru || '';
  }

  /**
   * Check if translation exists for a language
   * @param {string} lang - Language code
   * @returns {boolean}
   */
  has(lang) {
    return Boolean(this[lang]);
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Translation}
   */
  static fromData(data) {
    return new Translation(data);
  }
}
