/**
 * DialogueLine Entity
 * Represents a single line in a dialogue
 */
export class DialogueLine {
  constructor({
    speaker,
    sentence,
    translation,
    transcription,
    words
  }) {
    this.speaker = speaker;
    this.sentence = sentence;
    this.translation = translation;
    this.transcription = transcription;
    this.words = words || []; // Array of {text, wordKey}
  }

  /**
   * Get the speaker name
   * @returns {string}
   */
  getSpeaker() {
    return this.speaker;
  }

  /**
   * Get the Polish sentence
   * @returns {string}
   */
  getSentence() {
    return this.sentence;
  }

  /**
   * Get the Russian translation
   * @returns {string}
   */
  getTranslation() {
    return this.translation;
  }

  /**
   * Get the phonetic transcription
   * @returns {string}
   */
  getTranscription() {
    return this.transcription;
  }

  /**
   * Get all words in the line
   * @returns {Array<{text: string, wordKey: string}>}
   */
  getWords() {
    return this.words;
  }

  /**
   * Get word keys (for dictionary lookup)
   * @returns {Array<string>}
   */
  getWordKeys() {
    return this.words.map(w => w.wordKey);
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {DialogueLine}
   */
  static fromData(data) {
    return new DialogueLine({
      speaker: data.speaker,
      sentence: data.sentence,
      translation: data.translation,
      transcription: data.transcryption || data.transcription,
      words: data.words
    });
  }

  /**
   * Create multiple lines from array
   * @param {Array} dataArray
   * @returns {Array<DialogueLine>}
   */
  static fromArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => DialogueLine.fromData(data));
  }
}
