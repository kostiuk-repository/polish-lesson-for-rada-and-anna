export class CatalogComponent {
  constructor({ container, api }) {
    this.container = container;
    this.api = api;
    this.catalog = null;
  }

  async render() {
    this.container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    try {
      this.catalog = await this.api.getCatalog();
      const catalogHTML = this.generateCatalogHTML();
      this.container.innerHTML = `
        <header class="page-header">
            <div class="container">
                <h1>Категорії</h1>
                <p class="page-subtitle">Виберіть тему для вивчення</p>
            </div>
        </header>
        <section class="catalog-section">
            <div class="container">
                <div class="cards-grid">
                    ${catalogHTML}
                </div>
            </div>
        </section>
      `;
    } catch (error) {
      this.container.innerHTML = `<div class="error-container">Ошибка загрузки каталога</div>`;
    }
  }

  generateCatalogHTML() {
    return this.catalog.categories
      .map(category => this.generateCategoryCardHTML(category))
      .join('');
  }

  generateCategoryCardHTML(category) {
    return `
      <a href="#/categories/${category.id}" class="card category-card">
        <div class="card-content">
          <h4>${category.title}</h4>
          <p>${category.description}</p>
        </div>
        <div class="card-footer">
            <span>Уроков: ${category.lessons.length}</span>
            <i class="fas fa-arrow-right arrow-icon"></i>
        </div>
      </a>
    `;
  }

  destroy() {
    this.container.innerHTML = '';
  }
}