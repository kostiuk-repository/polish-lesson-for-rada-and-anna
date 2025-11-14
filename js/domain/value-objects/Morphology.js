/**
 * Morphology Value Object
 * Represents morphological properties of a word
 */
export class Morphology {
  constructor(data = {}) {
    this.aspect = data.aspect || null; // perfective, imperfective
    this.gender = data.gender || null; // masculine, feminine, neuter
    this.animacy = data.animacy || null; // animate, inanimate
    this.transitivity = data.transitivity || null; // transitive, intransitive
  }

  /**
   * Get the aspect of a verb
   * @returns {string|null}
   */
  getAspect() {
    return this.aspect;
  }

  /**
   * Get the gender of a noun/adjective
   * @returns {string|null}
   */
  getGender() {
    return this.gender;
  }

  /**
   * Check if the word is perfective
   * @returns {boolean}
   */
  isPerfective() {
    return this.aspect === 'perfective';
  }

  /**
   * Check if the word is imperfective
   * @returns {boolean}
   */
  isImperfective() {
    return this.aspect === 'imperfective';
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Morphology}
   */
  static fromData(data) {
    return new Morphology(data);
  }
}
