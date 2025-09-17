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
      // Старый <header> был полностью удален отсюда
      this.container.innerHTML = `
        <section class="catalog-section">
            <div class="container">
                <h1 class="section-title">Категорії</h1>
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
      <a href="#/categories/${category.id}" class="card category-card category-card--${category.color}">
        <div class="card-icon">
          <i class="${category.icon}"></i>
        </div>
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