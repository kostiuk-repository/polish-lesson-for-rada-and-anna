import { DialogueLine } from './DialogueLine.js';
import { Exercise } from './Exercise.js';
import { GrammarTopic } from './GrammarTopic.js';

/**
 * Character in a lesson
 */
export class Character {
  constructor({ name, translation }) {
    this.name = name;
    this.translation = translation;
  }

  static fromData(data) {
    return new Character({
      name: data.name,
      translation: data.translation
    });
  }

  static fromArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => Character.fromData(data));
  }
}

/**
 * Lesson Entity
 * Represents a complete lesson with dialogue, grammar, and exercises
 */
export class Lesson {
  constructor({
    id,
    title,
    description,
    tags,
    level,
    type,
    characters,
    content,
    grammar,
    exercises
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.tags = tags || [];
    this.level = level || 'A1';
    this.type = type || 'dialogue';
    this.characters = Character.fromArray(characters || []);
    this.content = DialogueLine.fromArray(content || []);
    this.grammar = GrammarTopic.fromArray(grammar || []);
    this.exercises = Exercise.fromArray(exercises || []);
  }

  /**
   * Get lesson ID
   * @returns {string}
   */
  getId() {
    return this.id;
  }

  /**
   * Get lesson title
   * @returns {string}
   */
  getTitle() {
    return this.title;
  }

  /**
   * Get lesson description
   * @returns {string}
   */
  getDescription() {
    return this.description;
  }

  /**
   * Get lesson type
   * @returns {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get lesson level
   * @returns {string}
   */
  getLevel() {
    return this.level;
  }

  /**
   * Get all dialogue lines
   * @returns {Array<DialogueLine>}
   */
  getContent() {
    return this.content;
  }

  /**
   * Get all characters
   * @returns {Array<Character>}
   */
  getCharacters() {
    return this.characters;
  }

  /**
   * Get all grammar topics
   * @returns {Array<GrammarTopic>}
   */
  getGrammar() {
    return this.grammar;
  }

  /**
   * Get all exercises
   * @returns {Array<Exercise>}
   */
  getExercises() {
    return this.exercises;
  }

  /**
   * Get all tags
   * @returns {Array<string>}
   */
  getTags() {
    return this.tags;
  }

  /**
   * Get all unique word keys from the lesson content
   * @returns {Array<string>}
   */
  getAllWordKeys() {
    const wordKeys = new Set();
    this.content.forEach(line => {
      line.getWordKeys().forEach(key => wordKeys.add(key));
    });
    return Array.from(wordKeys);
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Lesson}
   */
  static fromData(data) {
    return new Lesson({
      id: data.id,
      title: data.title,
      description: data.description,
      tags: data.tags,
      level: data.level,
      type: data.type,
      characters: data.characters,
      content: data.content,
      grammar: data.grammar,
      exercises: data.exercises
    });
  }
}
