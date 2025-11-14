/**
 * CategoryViewModel
 * ViewModel for the category view (lessons within a category)
 */
export class CategoryViewModel {
  constructor(lessonService, progressService) {
    this.lessonService = lessonService;
    this.progressService = progressService;

    this.state = {
      category: null,
      lessons: [],
      searchQuery: '',
      filteredLessons: [],
      isLoading: false,
      error: null
    };

    this.listeners = [];
  }

  /**
   * Load a category
   * @param {string} categoryId
   */
  async loadCategory(categoryId) {
    this.setState({ isLoading: true, error: null });

    try {
      await this.lessonService.init();

      const category = this.lessonService.getCategory(categoryId);

      if (!category) {
        throw new Error(`Category "${categoryId}" not found`);
      }

      const lessons = category.getLessons();

      this.setState({
        category,
        lessons,
        filteredLessons: lessons,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading category:', error);
      this.setState({
        isLoading: false,
        error: error.message
      });
    }
  }

  /**
   * Get category
   * @returns {Category|null}
   */
  getCategory() {
    return this.state.category;
  }

  /**
   * Get lessons
   * @returns {Array}
   */
  getLessons() {
    return this.state.filteredLessons;
  }

  /**
   * Search lessons
   * @param {string} query
   */
  searchLessons(query) {
    this.setState({ searchQuery: query });

    if (!query || query.trim() === '') {
      this.setState({ filteredLessons: this.state.lessons });
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = this.state.lessons.filter(lesson => {
      return lesson.title.toLowerCase().includes(lowerQuery) ||
             lesson.description.toLowerCase().includes(lowerQuery);
    });

    this.setState({ filteredLessons: filtered });
  }

  /**
   * Navigate to lesson
   * @param {string} lessonId
   */
  navigateToLesson(lessonId) {
    window.location.hash = `#/lesson/${lessonId}`;
  }

  /**
   * Navigate back to catalog
   */
  navigateToCatalog() {
    window.location.hash = '#/catalog';
  }

  /**
   * Get lesson completion status
   * @param {string} lessonId
   * @returns {boolean}
   */
  isLessonCompleted(lessonId) {
    return this.lessonService.isLessonCompleted(lessonId);
  }

  /**
   * Get category completion statistics
   * @returns {Object}
   */
  getCategoryStats() {
    const total = this.state.lessons.length;
    const completed = this.state.lessons.filter(lesson =>
      this.lessonService.isLessonCompleted(lesson.id)
    ).length;

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
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
