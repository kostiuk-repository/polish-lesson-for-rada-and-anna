/**
 * Pronunciation Value Object
 * Represents pronunciation information for a word
 */
export class Pronunciation {
  constructor(data = {}) {
    this.ipa = data.ipa || '';
    this.ruTranscription = data.ru_transcription || data.ruTranscription || '';
  }

  /**
   * Get the Russian transcription
   * @returns {string}
   */
  getRussianTranscription() {
    return this.ruTranscription;
  }

  /**
   * Get the IPA transcription
   * @returns {string}
   */
  getIPA() {
    return this.ipa;
  }

  /**
   * Check if pronunciation data exists
   * @returns {boolean}
   */
  exists() {
    return Boolean(this.ipa || this.ruTranscription);
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Pronunciation}
   */
  static fromData(data) {
    return new Pronunciation(data);
  }
}
