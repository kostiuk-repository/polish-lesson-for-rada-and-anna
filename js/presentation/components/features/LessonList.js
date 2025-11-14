import { Card } from '../base/Card.js';
import { Badge } from '../base/Badge.js';
import { SearchField } from '../composite/SearchField.js';

/**
 * LessonList Component
 * Feature component for displaying lesson catalog
 */
export class LessonList {
  constructor(lessonService) {
    this.lessonService = lessonService;
    this.element = null;
    this.lessons = [];
    this.filteredLessons = [];
    this.onLessonClick = null;
  }

  /**
   * Create lesson list
   * @param {Object} options
   * @returns {HTMLElement}
   */
  create({
    lessons = [],
    onLessonClick = null,
    showSearch = true,
    showFilters = false,
    groupByCategory = false,
    className = ''
  } = {}) {
    this.lessons = lessons;
    this.filteredLessons = [...lessons];
    this.onLessonClick = onLessonClick;

    const container = document.createElement('div');
    container.className = `lesson-list-container ${className}`.trim();

    // Search and filters
    if (showSearch) {
      const searchField = new SearchField();
      const searchEl = searchField.create({
        placeholder: 'Search lessons...',
        onChange: (query) => this.filterLessons(query)
      });
      container.appendChild(searchEl);
      this.searchField = searchField;
    }

    // Lessons container
    const lessonsContainer = document.createElement('div');
    lessonsContainer.className = 'lesson-list';

    if (groupByCategory) {
      this.renderGroupedLessons(lessonsContainer);
    } else {
      this.renderLessons(lessonsContainer, this.filteredLessons);
    }

    container.appendChild(lessonsContainer);

    this.element = container;
    this.lessonsContainer = lessonsContainer;

    return container;
  }

  /**
   * Render lessons as a flat list
   * @param {HTMLElement} container
   * @param {Array} lessons
   */
  renderLessons(container, lessons) {
    container.innerHTML = '';

    if (lessons.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'lesson-list-empty';
      empty.textContent = 'No lessons found';
      container.appendChild(empty);
      return;
    }

    lessons.forEach(lesson => {
      const card = this.createLessonCard(lesson);
      container.appendChild(card);
    });
  }

  /**
   * Render lessons grouped by category
   * @param {HTMLElement} container
   */
  renderGroupedLessons(container) {
    container.innerHTML = '';

    const categories = this.lessonService.getCategories();

    categories.forEach(category => {
      const categoryLessons = category.getLessons();

      if (categoryLessons.length === 0) return;

      // Category header
      const header = document.createElement('h2');
      header.className = 'lesson-category-header';
      header.textContent = category.getTitle();
      container.appendChild(header);

      // Category description
      const description = document.createElement('p');
      description.className = 'lesson-category-description';
      description.textContent = category.getDescription();
      container.appendChild(description);

      // Category lessons
      const categoryContainer = document.createElement('div');
      categoryContainer.className = 'lesson-category-list';

      categoryLessons.forEach(lesson => {
        const card = this.createLessonCard(lesson);
        categoryContainer.appendChild(card);
      });

      container.appendChild(categoryContainer);
    });
  }

  /**
   * Create a lesson card
   * @param {LessonMetadata} lesson
   * @returns {HTMLElement}
   */
  createLessonCard(lesson) {
    const isCompleted = this.lessonService.isLessonCompleted(lesson.id);

    const card = Card.create({
      title: lesson.title,
      content: lesson.description,
      onClick: () => {
        if (this.onLessonClick) {
          this.onLessonClick(lesson.id);
        }
      },
      className: isCompleted ? 'lesson-card completed' : 'lesson-card'
    });

    // Add level badge
    const levelBadge = Badge.createLevelBadge(lesson.level);

    // Add completed badge if applicable
    if (isCompleted) {
      const completedBadge = Badge.createStatusBadge('Completed', 'success');
      const header = card.querySelector('.card-header');
      if (header) {
        header.appendChild(levelBadge);
        header.appendChild(completedBadge);
      }
    } else {
      const header = card.querySelector('.card-header');
      if (header) {
        header.appendChild(levelBadge);
      }
    }

    return card;
  }

  /**
   * Filter lessons by query
   * @param {string} query
   */
  filterLessons(query) {
    if (!query || query.trim() === '') {
      this.filteredLessons = [...this.lessons];
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredLessons = this.lessons.filter(lesson => {
        return lesson.title.toLowerCase().includes(lowerQuery) ||
               lesson.description.toLowerCase().includes(lowerQuery);
      });
    }

    this.renderLessons(this.lessonsContainer, this.filteredLessons);
  }

  /**
   * Refresh the lesson list
   */
  refresh() {
    if (this.lessonsContainer) {
      this.renderLessons(this.lessonsContainer, this.filteredLessons);
    }
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.searchField) {
      this.searchField.destroy();
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
