/**
 * Example Value Object
 * Represents a usage example for a word
 */
export class Example {
  constructor(data = {}) {
    this.polish = data.pl || data.polish || '';
    this.russian = data.ru || data.russian || '';
    this.english = data.en || data.english || '';
  }

  /**
   * Get the Polish sentence
   * @returns {string}
   */
  getPolish() {
    return this.polish;
  }

  /**
   * Get translation in a specific language
   * @param {string} lang - Language code (ru, en)
   * @returns {string}
   */
  getTranslation(lang = 'ru') {
    const translations = {
      ru: this.russian,
      en: this.english
    };
    return translations[lang] || this.russian || '';
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Example}
   */
  static fromData(data) {
    return new Example(data);
  }

  /**
   * Create multiple examples from array
   * @param {Array} dataArray
   * @returns {Array<Example>}
   */
  static fromArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => Example.fromData(data));
  }
}
