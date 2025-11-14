/**
 * ProgressService
 * Application service for managing user progress and statistics
 */
export class ProgressService {
  constructor(storageAdapter) {
    this.storageAdapter = storageAdapter;
  }

  /**
   * Get user preferences
   * @returns {Object}
   */
  getUserPreferences() {
    return this.storageAdapter.getUserPreferences();
  }

  /**
   * Update user preferences
   * @param {Object} preferences
   */
  updateUserPreferences(preferences) {
    this.storageAdapter.updateUserPreferences(preferences);
  }

  /**
   * Get word progress
   * @param {string} wordKey
   * @returns {Object|null}
   */
  getWordProgress(wordKey) {
    return this.storageAdapter.getWordProgress(wordKey);
  }

  /**
   * Update word progress
   * @param {string} wordKey
   * @param {Object} update - Progress update
   */
  updateWordProgress(wordKey, update) {
    const current = this.getWordProgress(wordKey) || {
      encounters: 0,
      lastSeen: null,
      mastered: false,
      mistakes: 0
    };

    const updated = {
      ...current,
      ...update,
      encounters: current.encounters + 1,
      lastSeen: new Date().toISOString()
    };

    this.storageAdapter.updateWordProgress(wordKey, updated);
  }

  /**
   * Mark word as mastered
   * @param {string} wordKey
   */
  markWordMastered(wordKey) {
    this.updateWordProgress(wordKey, { mastered: true });
  }

  /**
   * Get all bookmarked words
   * @returns {Array<string>}
   */
  getBookmarks() {
    return this.storageAdapter.getBookmarkedWords();
  }

  /**
   * Add word to bookmarks
   * @param {string} wordKey
   */
  addBookmark(wordKey) {
    this.storageAdapter.addBookmark(wordKey);
  }

  /**
   * Remove word from bookmarks
   * @param {string} wordKey
   */
  removeBookmark(wordKey) {
    this.storageAdapter.removeBookmark(wordKey);
  }

  /**
   * Toggle bookmark for a word
   * @param {string} wordKey
   * @returns {boolean} - New bookmark state
   */
  toggleBookmark(wordKey) {
    if (this.isBookmarked(wordKey)) {
      this.removeBookmark(wordKey);
      return false;
    } else {
      this.addBookmark(wordKey);
      return true;
    }
  }

  /**
   * Check if word is bookmarked
   * @param {string} wordKey
   * @returns {boolean}
   */
  isBookmarked(wordKey) {
    return this.storageAdapter.isBookmarked(wordKey);
  }

  /**
   * Get study statistics
   * @returns {Object}
   */
  getStatistics() {
    return this.storageAdapter.getStudyStatistics();
  }

  /**
   * Update study statistics
   * @param {Object} updates
   */
  updateStatistics(updates) {
    const current = this.getStatistics();
    const updated = { ...current, ...updates };
    this.storageAdapter.updateStudyStatistics(updated);
  }

  /**
   * Increment lessons completed
   */
  incrementLessonsCompleted() {
    const stats = this.getStatistics();
    this.updateStatistics({
      lessonsCompleted: (stats.lessonsCompleted || 0) + 1
    });
  }

  /**
   * Increment exercises completed
   */
  incrementExercisesCompleted() {
    const stats = this.getStatistics();
    this.updateStatistics({
      exercisesCompleted: (stats.exercisesCompleted || 0) + 1
    });
  }

  /**
   * Add study time (in minutes)
   * @param {number} minutes
   */
  addStudyTime(minutes) {
    const stats = this.getStatistics();
    this.updateStatistics({
      totalStudyTime: (stats.totalStudyTime || 0) + minutes,
      lastStudyDate: new Date().toISOString()
    });
  }

  /**
   * Update streak days
   */
  updateStreak() {
    const stats = this.getStatistics();
    const today = new Date().toDateString();
    const lastStudy = stats.lastStudyDate ? new Date(stats.lastStudyDate).toDateString() : null;

    if (lastStudy === today) {
      // Already studied today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastStudy === yesterdayStr) {
      // Continuing streak
      this.updateStatistics({
        streakDays: (stats.streakDays || 0) + 1,
        lastStudyDate: new Date().toISOString()
      });
    } else {
      // Streak broken, start new
      this.updateStatistics({
        streakDays: 1,
        lastStudyDate: new Date().toISOString()
      });
    }
  }

  /**
   * Get words learned count
   * @returns {number}
   */
  getWordsLearnedCount() {
    const stats = this.getStatistics();
    return stats.wordsLearned || 0;
  }

  /**
   * Reset all progress (use with caution)
   */
  resetAllProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      this.storageAdapter.clear();
      console.log('All progress has been reset');
    }
  }
}
