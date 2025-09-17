export class CategoryComponent {
  constructor({ container, api, categoryId }) {
    this.container = container;
    this.api = api;
    this.categoryId = categoryId;
    this.category = null;
    this.lessons = [];
  }

  async render() {
    this.container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    try {
      const catalog = await this.api.getCatalog();
      this.category = catalog.categories.find(c => c.id === this.categoryId);
      if (!this.category) throw new Error('Категория не найдена');
      
      this.lessons = this.category.lessons;
      
      const categoryHTML = this.generateCategoryHTML();
      this.container.innerHTML = categoryHTML;

      this.setupEventListeners();
    } catch (error) {
      this.container.innerHTML = `<div class="error-container">${error.message}</div>`;
    }
  }

  generateCategoryHTML() {
    return `
      <header class="category-header">
        <div class="container category-header__container">
          <a href="#/categories" class="btn btn--outline btn--icon-left">
            <i class="fas fa-arrow-left"></i>
            <span>Назад</span>
          </a>
          <h1 class="category-header__title">${this.category.title}</h1>
          <div class="search-field">
            <i class="fas fa-search search-field__icon"></i>
            <input type="text" id="search-input" class="search-field__input" placeholder="Поиск уроков...">
          </div>
        </div>
      </header>
      
      <section class="catalog-section">
        <div class="container">
            <div id="lessons-grid" class="cards-grid">
                ${this.generateLessonsGridHTML(this.lessons)}
            </div>
        </div>
      </section>
    `;
  }

  generateLessonsGridHTML(lessons) {
    if (lessons.length === 0) return `<p>Немає уроків у цій категорії.</p>`;
    return lessons
      .map(lesson => this.generateLessonCardHTML(lesson))
      .join('');
  }

  generateLessonCardHTML(lesson) {
    return `
      <a href="#/lesson/${lesson.id}" class="card lesson-card" data-type="${lesson.type}">
        <div class="card-content">
          <h4>${lesson.title}</h4>
          <p>${lesson.description}</p>
        </div>
        <div class="card-footer">
          <span class="label label--level-${lesson.level.toLowerCase()}">${lesson.level}</span>
          <i class="fas fa-arrow-right arrow-icon"></i>
        </div>
      </a>
    `;
  }
  
  setupEventListeners() {
      const searchInput = this.container.querySelector('#search-input');
      const typeFilter = this.container.querySelector('#type-filter');

      searchInput.addEventListener('input', () => this.filterAndRender());
      typeFilter.addEventListener('change', () => this.filterAndRender());
  }

  filterAndRender() {
      const searchInput = this.container.querySelector('#search-input');
      const typeFilter = this.container.querySelector('#type-filter');
      const grid = this.container.querySelector('#lessons-grid');

      const searchQuery = searchInput.value.toLowerCase();
      const typeQuery = typeFilter.value;

      const filteredLessons = this.lessons.filter(lesson => {
          const titleMatch = lesson.title.toLowerCase().includes(searchQuery);
          const typeMatch = typeQuery === 'all' || lesson.type === typeQuery;
          return titleMatch && typeMatch;
      });

      grid.innerHTML = this.generateLessonsGridHTML(filteredLessons);
  }

  destroy() {
    this.container.innerHTML = '';
  }
}