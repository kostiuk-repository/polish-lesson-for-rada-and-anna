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
      <header class="page-header">
        <div class="container">
          <a href="#/categories" class="btn btn--outline mb-4">&larr; Назад до категорій</a>
          <h1>${this.category.title}</h1>
          <p class="page-subtitle">${this.category.description}</p>
        </div>
      </header>
      <section class="filters-section">
          <div class="container">
              <div class="filters-container">
                  <div class="filter-group">
                      <label for="search-input">Пошук:</label>
                      <input type="text" id="search-input" class="search-input" placeholder="Пошук по назві...">
                  </div>
                  <div class="filter-group">
                      <label for="type-filter">Тип:</label>
                      <select id="type-filter" class="filter-select">
                          <option value="all">Всі типи</option>
                          <option value="dialogue">Діалог</option>
                          <option value="review">Відгук</option>
                          <option value="text">Текст</option>
                      </select>
                  </div>
              </div>
          </div>
      </section>
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