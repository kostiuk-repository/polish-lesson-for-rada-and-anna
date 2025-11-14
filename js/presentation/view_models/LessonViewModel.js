/**
 * LessonViewModel
 * ViewModel for the lesson view
 */
export class LessonViewModel {
  constructor(lessonService, dictionaryService, exerciseService, progressService) {
    this.lessonService = lessonService;
    this.dictionaryService = dictionaryService;
    this.exerciseService = exerciseService;
    this.progressService = progressService;

    this.state = {
      lesson: null,
      activeTab: 'dialogue',
      isLoading: false,
      error: null,
      showTranslations: true,
      showTranscriptions: false
    };

    this.listeners = [];
  }

  /**
   * Load a lesson
   * @param {string} lessonId
   */
  async loadLesson(lessonId) {
    this.setState({ isLoading: true, error: null });

    try {
      const lesson = await this.lessonService.loadLesson(lessonId);

      // Mark lesson as started
      this.lessonService.markLessonStarted(lessonId);

      this.setState({
        lesson,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading lesson:', error);
      this.setState({
        isLoading: false,
        error: error.message
      });
    }
  }

  /**
   * Get current lesson
   * @returns {Lesson|null}
   */
  getLesson() {
    return this.state.lesson;
  }

  /**
   * Set active tab
   * @param {string} tabId
   */
  setActiveTab(tabId) {
    this.setState({ activeTab: tabId });
  }

  /**
   * Get active tab
   * @returns {string}
   */
  getActiveTab() {
    return this.state.activeTab;
  }

  /**
   * Toggle translations visibility
   */
  toggleTranslations() {
    this.setState({
      showTranslations: !this.state.showTranslations
    });
  }

  /**
   * Toggle transcriptions visibility
   */
  toggleTranscriptions() {
    this.setState({
      showTranscriptions: !this.state.showTranscriptions
    });
  }

  /**
   * Look up a word
   * @param {string} wordKey
   * @returns {Word|null}
   */
  lookupWord(wordKey) {
    return this.dictionaryService.lookupWord(wordKey);
  }

  /**
   * Start an exercise
   * @param {Exercise} exercise
   */
  startExercise(exercise) {
    this.exerciseService.startExercise(exercise);
  }

  /**
   * Complete an exercise
   * @param {Object} results
   */
  completeExercise(results) {
    if (!this.state.lesson) return;

    const lessonId = this.state.lesson.getId();
    this.exerciseService.completeExercise(lessonId);

    // Update progress
    if (results.passed) {
      this.progressService.incrementExercisesCompleted();
    }
  }

  /**
   * Mark lesson as completed
   */
  markLessonCompleted() {
    if (!this.state.lesson) return;

    const lessonId = this.state.lesson.getId();
    this.lessonService.markLessonCompleted(lessonId);
    this.progressService.incrementLessonsCompleted();
  }

  /**
   * Get lesson progress
   * @returns {Object|null}
   */
  getLessonProgress() {
    if (!this.state.lesson) return null;

    const lessonId = this.state.lesson.getId();
    return this.lessonService.getLessonProgress(lessonId);
  }

  /**
   * Navigate back to catalog
   */
  navigateToCatalog() {
    window.location.hash = '#/catalog';
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
