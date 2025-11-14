/**
 * CatalogViewModel
 * ViewModel for the catalog view (lesson listing)
 */
export class CatalogViewModel {
  constructor(lessonService, progressService) {
    this.lessonService = lessonService;
    this.progressService = progressService;
    this.state = {
      categories: [],
      selectedCategory: null,
      isLoading: false,
      error: null
    };
    this.listeners = [];
  }

  /**
   * Initialize the ViewModel
   */
  async init() {
    this.setState({ isLoading: true, error: null });

    try {
      await this.lessonService.init();
      const categories = this.lessonService.getCategories();

      this.setState({
        categories,
        isLoading: false
      });
    } catch (error) {
      console.error('Error initializing catalog:', error);
      this.setState({
        isLoading: false,
        error: error.message
      });
    }
  }

  /**
   * Get all categories
   * @returns {Array<Category>}
   */
  getCategories() {
    return this.state.categories;
  }

  /**
   * Select a category
   * @param {string} categoryId
   */
  selectCategory(categoryId) {
    const category = this.lessonService.getCategory(categoryId);
    this.setState({ selectedCategory: category });
  }

  /**
   * Navigate to lesson
   * @param {string} lessonId
   */
  navigateToLesson(lessonId) {
    // This would trigger navigation in the view
    window.location.hash = `#/lesson/${lessonId}`;
  }

  /**
   * Get category statistics
   * @param {string} categoryId
   * @returns {Object}
   */
  getCategoryStats(categoryId) {
    const category = this.lessonService.getCategory(categoryId);
    if (!category) return null;

    const lessons = category.getLessons();
    const completed = lessons.filter(lesson =>
      this.lessonService.isLessonCompleted(lesson.id)
    ).length;

    return {
      total: lessons.length,
      completed,
      percentage: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0
    };
  }

  /**
   * Get state
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   * @param {Object} updates
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
