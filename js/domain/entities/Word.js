import { Translation } from '../value-objects/Translation.js';
import { Pronunciation } from '../value-objects/Pronunciation.js';
import { Morphology } from '../value-objects/Morphology.js';
import { Inflection } from '../value-objects/Inflection.js';
import { Example } from '../value-objects/Example.js';

/**
 * Word Entity
 * Core domain entity representing a Polish word with all its properties
 */
export class Word {
  constructor({
    lemma,
    partOfSpeech,
    translations,
    pronunciation,
    morphology,
    inflection,
    examples,
    appliedRules,
    categories
  }) {
    this.lemma = lemma;
    this.partOfSpeech = partOfSpeech || 'unknown';
    this.translations = Translation.fromData(translations || {});
    this.pronunciation = Pronunciation.fromData(pronunciation || {});
    this.morphology = Morphology.fromData(morphology || {});
    this.inflection = Inflection.fromData(inflection || {});
    this.examples = Example.fromArray(examples || []);
    this.appliedRules = appliedRules || [];
    this.categories = categories || [];
  }

  /**
   * Get the lemma (base form) of the word
   * @returns {string}
   */
  getLemma() {
    return this.lemma;
  }

  /**
   * Get the part of speech
   * @returns {string}
   */
  getPartOfSpeech() {
    return this.partOfSpeech;
  }

  /**
   * Get translation in a specific language
   * @param {string} lang - Language code
   * @returns {string}
   */
  getTranslation(lang = 'ru') {
    return this.translations.get(lang);
  }

  /**
   * Get pronunciation transcription
   * @returns {string}
   */
  getPronunciation() {
    return this.pronunciation.getRussianTranscription();
  }

  /**
   * Get a specific inflected form
   * @param {string} tense - Tense or case
   * @param {string} form - Specific form
   * @returns {string|null}
   */
  getInflectedForm(tense, form) {
    return this.inflection.getForm(tense, form);
  }

  /**
   * Get all examples
   * @returns {Array<Example>}
   */
  getExamples() {
    return this.examples;
  }

  /**
   * Check if word is a verb
   * @returns {boolean}
   */
  isVerb() {
    return this.partOfSpeech === 'verb';
  }

  /**
   * Check if word is a noun
   * @returns {boolean}
   */
  isNoun() {
    return this.partOfSpeech === 'noun';
  }

  /**
   * Check if word is an adjective
   * @returns {boolean}
   */
  isAdjective() {
    return this.partOfSpeech === 'adjective';
  }

  /**
   * Get all applied phonetic rules
   * @returns {Array<string>}
   */
  getAppliedRules() {
    return this.appliedRules;
  }

  /**
   * Create Word from raw JSON data
   * @param {Object} data - Raw word data
   * @param {string} lemma - The lemma key
   * @returns {Word}
   */
  static fromData(data, lemma = null) {
    return new Word({
      lemma: lemma || data.lemma,
      partOfSpeech: data.part_of_speech || data.partOfSpeech,
      translations: data.translations,
      pronunciation: data.pronunciation,
      morphology: data.morphology,
      inflection: data.inflection,
      examples: data.examples,
      appliedRules: data.applied_rules || data.appliedRules,
      categories: data.categories
    });
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object}
   */
  toJSON() {
    return {
      lemma: this.lemma,
      part_of_speech: this.partOfSpeech,
      translations: this.translations,
      pronunciation: this.pronunciation,
      morphology: this.morphology,
      inflection: this.inflection,
      examples: this.examples,
      applied_rules: this.appliedRules,
      categories: this.categories
    };
  }
}
