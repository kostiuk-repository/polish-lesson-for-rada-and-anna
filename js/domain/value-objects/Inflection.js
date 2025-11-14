/**
 * Inflection Value Object
 * Represents inflected forms of a word (conjugations, declensions)
 */
export class Inflection {
  constructor(data = {}) {
    this.present = data.present || {};
    this.past = data.past || {};
    this.future = data.future || {};
    this.imperative = data.imperative || {};
    this.conditional = data.conditional || {};
    this.cases = data.cases || {};
  }

  /**
   * Get a specific inflected form
   * @param {string} tense - Tense or case (present, past, future, etc.)
   * @param {string} form - Specific form (sg1, sg2, pl1, etc.)
   * @returns {string|null}
   */
  getForm(tense, form) {
    return this[tense]?.[form] || null;
  }

  /**
   * Get all forms for a tense
   * @param {string} tense
   * @returns {Object}
   */
  getAllForms(tense) {
    return this[tense] || {};
  }

  /**
   * Check if inflection data exists
   * @returns {boolean}
   */
  exists() {
    return Object.keys(this.present).length > 0 ||
           Object.keys(this.past).length > 0 ||
           Object.keys(this.future).length > 0 ||
           Object.keys(this.cases).length > 0;
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Inflection}
   */
  static fromData(data) {
    return new Inflection(data);
  }
}
