import { Card } from '../components/base/Card.js';
import { Button } from '../components/base/Button.js';

/**
 * CatalogView
 * View for displaying the lesson catalog
 */
export class CatalogView {
  constructor(viewModel) {
    this.viewModel = viewModel;
    this.container = null;
  }

  /**
   * Render the catalog view
   * @param {HTMLElement} container - Container to render into
   */
  async render(container) {
    this.container = container;
    container.innerHTML = '<div class="loading">Loading catalog...</div>';

    // Initialize ViewModel
    await this.viewModel.init();

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

    // Header
    const header = document.createElement('div');
    header.className = 'catalog-header';

    const title = document.createElement('h1');
    title.textContent = 'Polish Lessons';
    header.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'subtitle';
    subtitle.textContent = 'Choose a category to start learning';
    header.appendChild(subtitle);

    this.container.appendChild(header);

    // Categories grid
    const categoriesGrid = document.createElement('div');
    categoriesGrid.className = 'categories-grid';

    state.categories.forEach(category => {
      const stats = this.viewModel.getCategoryStats(category.getId());

      const card = Card.createCategoryCard({
        title: category.getTitle(),
        description: category.getDescription(),
        icon: category.getIcon(),
        color: category.getColor(),
        lessonCount: stats.total,
        onClick: () => this.handleCategoryClick(category.getId())
      });

      // Add progress indicator if there's progress
      if (stats.completed > 0) {
        const progress = document.createElement('div');
        progress.className = 'category-progress';
        progress.innerHTML = `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.percentage}%"></div>
          </div>
          <small>${stats.completed}/${stats.total} completed</small>
        `;
        card.appendChild(progress);
      }

      categoriesGrid.appendChild(card);
    });

    this.container.appendChild(categoriesGrid);
  }

  /**
   * Handle category click
   * @param {string} categoryId
   */
  handleCategoryClick(categoryId) {
    this.viewModel.selectCategory(categoryId);
    window.location.hash = `#/category/${categoryId}`;
  }

  /**
   * Destroy view
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
