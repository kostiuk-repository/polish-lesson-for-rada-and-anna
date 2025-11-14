import { Button } from '../components/base/Button.js';
import { LessonList } from '../components/features/LessonList.js';

/**
 * CategoryView
 * View for displaying lessons in a category
 */
export class CategoryView {
  constructor(viewModel) {
    this.viewModel = viewModel;
    this.container = null;
    this.lessonList = null;
  }

  /**
   * Render the category view
   * @param {HTMLElement} container
   * @param {string} categoryId
   */
  async render(container, categoryId) {
    this.container = container;
    container.innerHTML = '<div class="loading">Loading category...</div>';

    // Load category
    await this.viewModel.loadCategory(categoryId);

    // Subscribe to state changes
    this.viewModel.subscribe((state) => {
      this.renderContent(state);
    });

    // Initial render
    this.renderContent(this.viewModel.getState());
  }

  /**
   * Render content based on state
   * @param {Object} state
   */
  renderContent(state) {
    if (!this.container) return;

    this.container.innerHTML = '';

    // Error state
    if (state.error) {
      const error = document.createElement('div');
      error.className = 'error';
      error.textContent = `Error: ${state.error}`;
      this.container.appendChild(error);
      return;
    }

    // Loading state
    if (state.isLoading) {
      const loading = document.createElement('div');
      loading.className = 'loading';
      loading.textContent = 'Loading...';
      this.container.appendChild(loading);
      return;
    }

    if (!state.category) return;

    const category = state.category;

    // Header
    const header = this.createHeader(category);
    this.container.appendChild(header);

    // Stats
    const stats = this.viewModel.getCategoryStats();
    const statsEl = this.createStats(stats);
    this.container.appendChild(statsEl);

    // Lesson list
    this.lessonList = new LessonList(this.viewModel.lessonService);
    const listEl = this.lessonList.create({
      lessons: state.filteredLessons,
      onLessonClick: (lessonId) => this.viewModel.navigateToLesson(lessonId),
      showSearch: true
    });

    this.container.appendChild(listEl);
  }

  /**
   * Create header
   * @param {Category} category
   * @returns {HTMLElement}
   */
  createHeader(category) {
    const header = document.createElement('div');
    header.className = 'category-header';

    // Back button
    const backBtn = Button.create({
      text: '← Back to Catalog',
      type: 'link',
      onClick: () => this.viewModel.navigateToCatalog()
    });
    header.appendChild(backBtn);

    // Icon
    if (category.getIcon()) {
      const icon = document.createElement('i');
      icon.className = category.getIcon();
      header.appendChild(icon);
    }

    // Title
    const title = document.createElement('h1');
    title.textContent = category.getTitle();
    header.appendChild(title);

    // Description
    const description = document.createElement('p');
    description.className = 'category-description';
    description.textContent = category.getDescription();
    header.appendChild(description);

    return header;
  }

  /**
   * Create stats section
   * @param {Object} stats
   * @returns {HTMLElement}
   */
  createStats(stats) {
    const statsEl = document.createElement('div');
    statsEl.className = 'category-stats';

    statsEl.innerHTML = `
      <div class="stat">
        <span class="stat-value">${stats.total}</span>
        <span class="stat-label">Total Lessons</span>
      </div>
      <div class="stat">
        <span class="stat-value">${stats.completed}</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat">
        <span class="stat-value">${stats.percentage}%</span>
        <span class="stat-label">Progress</span>
      </div>
    `;

    return statsEl;
  }

  /**
   * Destroy view
   */
  destroy() {
    if (this.lessonList) {
      this.lessonList.destroy();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
