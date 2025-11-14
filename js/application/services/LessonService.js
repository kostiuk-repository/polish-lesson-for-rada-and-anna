/**
 * LessonService
 * Application service for managing lessons and catalog
 */
export class LessonService {
  constructor(apiAdapter, storageAdapter) {
    this.apiAdapter = apiAdapter;
    this.storageAdapter = storageAdapter;
    this.catalog = null;
    this.currentLesson = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the lesson service
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing LessonService...');
      this.catalog = await this.apiAdapter.getCatalog();
      this.isInitialized = true;
      console.log('✅ LessonService initialized');
    } catch (error) {
      console.error('❌ Error initializing LessonService:', error);
      throw error;
    }
  }

  /**
   * Get the catalog
   * @returns {Catalog}
   */
  getCatalog() {
    return this.catalog;
  }

  /**
   * Get all categories
   * @returns {Array<Category>}
   */
  getCategories() {
    if (!this.catalog) return [];
    return this.catalog.getCategories();
  }

  /**
   * Get a category by ID
   * @param {string} categoryId
   * @returns {Category|null}
   */
  getCategory(categoryId) {
    if (!this.catalog) return null;
    return this.catalog.getCategoryById(categoryId);
  }

  /**
   * Get all lessons from a category
   * @param {string} categoryId
   * @returns {Array<LessonMetadata>}
   */
  getLessonsByCategory(categoryId) {
    const category = this.getCategory(categoryId);
    if (!category) return [];
    return category.getLessons();
  }

  /**
   * Load a lesson by ID
   * @param {string} lessonId
   * @returns {Promise<Lesson>}
   */
  async loadLesson(lessonId) {
    try {
      this.currentLesson = await this.apiAdapter.getLesson(lessonId);
      return this.currentLesson;
    } catch (error) {
      console.error(`Error loading lesson ${lessonId}:`, error);
      throw error;
    }
  }

  /**
   * Get the current lesson
   * @returns {Lesson|null}
   */
  getCurrentLesson() {
    return this.currentLesson;
  }

  /**
   * Get lesson metadata from catalog
   * @param {string} lessonId
   * @returns {{category: Category, lesson: LessonMetadata}|null}
   */
  getLessonMetadata(lessonId) {
    if (!this.catalog) return null;
    return this.catalog.findLesson(lessonId);
  }

  /**
   * Get all lessons across all categories
   * @returns {Array<LessonMetadata>}
   */
  getAllLessons() {
    if (!this.catalog) return [];
    return this.catalog.getAllLessons();
  }

  /**
   * Get lessons by level
   * @param {string} level - Level (A1, A2, B1, etc.)
   * @returns {Array<LessonMetadata>}
   */
  getLessonsByLevel(level) {
    const allLessons = this.getAllLessons();
    return allLessons.filter(lesson => lesson.level === level);
  }

  /**
   * Get lessons by type
   * @param {string} type - Type (dialogue, review, etc.)
   * @returns {Array<LessonMetadata>}
   */
  getLessonsByType(type) {
    const allLessons = this.getAllLessons();
    return allLessons.filter(lesson => lesson.type === type);
  }

  /**
   * Get lesson progress
   * @param {string} lessonId
   * @returns {Object|null}
   */
  getLessonProgress(lessonId) {
    return this.storageAdapter.getLessonProgress(lessonId);
  }

  /**
   * Save lesson progress
   * @param {string} lessonId
   * @param {Object} progress
   */
  saveLessonProgress(lessonId, progress) {
    this.storageAdapter.saveLessonProgress(lessonId, progress);
  }

  /**
   * Mark lesson as started
   * @param {string} lessonId
   */
  markLessonStarted(lessonId) {
    const progress = this.getLessonProgress(lessonId) || {};
    progress.started = true;
    progress.startedAt = progress.startedAt || new Date().toISOString();
    this.saveLessonProgress(lessonId, progress);
  }

  /**
   * Mark lesson as completed
   * @param {string} lessonId
   */
  markLessonCompleted(lessonId) {
    const progress = this.getLessonProgress(lessonId) || {};
    progress.completed = true;
    progress.completedAt = new Date().toISOString();
    this.saveLessonProgress(lessonId, progress);
  }

  /**
   * Check if lesson is completed
   * @param {string} lessonId
   * @returns {boolean}
   */
  isLessonCompleted(lessonId) {
    const progress = this.getLessonProgress(lessonId);
    return progress?.completed || false;
  }

  /**
   * Get completion percentage for a lesson
   * @param {string} lessonId
   * @returns {number} - Percentage (0-100)
   */
  getLessonCompletionPercentage(lessonId) {
    const progress = this.getLessonProgress(lessonId);
    if (!progress) return 0;

    const lesson = this.currentLesson;
    if (!lesson || lesson.getId() !== lessonId) return progress.percentage || 0;

    // Calculate based on exercises completed
    const totalExercises = lesson.getExercises().length;
    const completedExercises = progress.exercisesCompleted || 0;

    if (totalExercises === 0) return progress.completed ? 100 : 0;

    return Math.round((completedExercises / totalExercises) * 100);
  }
}
