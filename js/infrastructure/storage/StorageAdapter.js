import { StorageService } from '../../services/storage.js';

/**
 * StorageAdapter
 * Infrastructure adapter for local storage
 * Provides a clean interface for data persistence
 */
export class StorageAdapter {
  constructor() {
    this.storage = new StorageService();
  }

  /**
   * Save a value to storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  set(key, value) {
    this.storage.set(key, value);
  }

  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any}
   */
  get(key, defaultValue = null) {
    return this.storage.get(key, defaultValue);
  }

  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    this.storage.remove(key);
  }

  /**
   * Clear all storage
   */
  clear() {
    this.storage.clear();
  }

  /**
   * Get user preferences
   * @returns {Object}
   */
  getUserPreferences() {
    return this.storage.getUserPreferences();
  }

  /**
   * Update user preferences
   * @param {Object} preferences - New preferences
   */
  updateUserPreferences(preferences) {
    this.storage.updateUserPreferences(preferences);
  }

  /**
   * Get lesson progress
   * @param {string} lessonId - Lesson ID
   * @returns {Object|null}
   */
  getLessonProgress(lessonId) {
    return this.storage.getLessonProgress(lessonId);
  }

  /**
   * Save lesson progress
   * @param {string} lessonId - Lesson ID
   * @param {Object} progress - Progress data
   */
  saveLessonProgress(lessonId, progress) {
    this.storage.saveLessonProgress(lessonId, progress);
  }

  /**
   * Get word progress
   * @param {string} wordKey - Word key
   * @returns {Object|null}
   */
  getWordProgress(wordKey) {
    return this.storage.getWordProgress(wordKey);
  }

  /**
   * Update word progress
   * @param {string} wordKey - Word key
   * @param {Object} progress - Progress data
   */
  updateWordProgress(wordKey, progress) {
    this.storage.updateWordProgress(wordKey, progress);
  }

  /**
   * Get bookmarked words
   * @returns {Array<string>}
   */
  getBookmarkedWords() {
    return this.storage.getBookmarkedWords();
  }

  /**
   * Add word to bookmarks
   * @param {string} wordKey - Word key
   */
  addBookmark(wordKey) {
    this.storage.addBookmark(wordKey);
  }

  /**
   * Remove word from bookmarks
   * @param {string} wordKey - Word key
   */
  removeBookmark(wordKey) {
    this.storage.removeBookmark(wordKey);
  }

  /**
   * Check if word is bookmarked
   * @param {string} wordKey - Word key
   * @returns {boolean}
   */
  isBookmarked(wordKey) {
    return this.storage.isBookmarked(wordKey);
  }

  /**
   * Get study statistics
   * @returns {Object}
   */
  getStudyStatistics() {
    return this.storage.getStudyStatistics();
  }

  /**
   * Update study statistics
   * @param {Object} stats - Statistics data
   */
  updateStudyStatistics(stats) {
    this.storage.updateStudyStatistics(stats);
  }

  /**
   * Save exercise result
   * @param {string} lessonId - Lesson ID
   * @param {string} exerciseType - Exercise type
   * @param {Object} result - Result data
   */
  saveExerciseResult(lessonId, exerciseType, result) {
    this.storage.saveExerciseResult(lessonId, exerciseType, result);
  }

  /**
   * Get exercise results
   * @param {string} lessonId - Lesson ID
   * @returns {Object}
   */
  getExerciseResults(lessonId) {
    return this.storage.getExerciseResults(lessonId);
  }
}
