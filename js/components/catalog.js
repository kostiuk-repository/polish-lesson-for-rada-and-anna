export class CatalogComponent {
  constructor({ api, storage }) {
    this.api = api;
    this.storage = storage;
    this.container = null;
    this.catalog = null;
  }

  async render() {
    try {
      // Загружаем данные каталога
      this.catalog = await this.api.getCatalog();
      
      // Находим контейнер
      this.container = document.getElementById('catalog-container');
      if (!this.container) {
        throw new Error('Контейнер catalog-container не найден');
      }

      // Рендерим каталог
      this.renderCatalog();
      
      // Настраиваем обработчики событий
      this.setupEventListeners();

      console.log('✅ Каталог отрендерен');
    } catch (error) {
      console.error('❌ Ошибка рендеринга каталога:', error);
      this.renderError(error.message);
    }
  }

  renderCatalog() {
    const catalogHTML = this.generateCatalogHTML();
    this.container.innerHTML = catalogHTML;
  }

  generateCatalogHTML() {
    return this.catalog.categories
      .map(category => this.generateCategoryHTML(category))
      .join('');
  }

  generateCategoryHTML(category) {
    const lessonsGrid = this.generateLessonsGridHTML(category.lessons);
    
    return `
      <section class="category-section">
        <h2>${category.title}</h2>
        <p class="category-description">${category.description}</p>
        <div class="cards-grid">
          ${lessonsGrid}
        </div>
      </section>
    `;
  }

  generateLessonsGridHTML(lessons) {
    return lessons
      .map(lesson => this.generateLessonCardHTML(lesson))
      .join('');
  }

  generateLessonCardHTML(lesson) {
    const labels = this.generateLabelsHTML(lesson);
    const progress = this.getProgress(lesson.id);
    
    return `
      <a href="#lesson/${lesson.id}" 
         class="lesson-card card" 
         data-type="${lesson.type}"
         data-lesson-id="${lesson.id}">
        
        <div class="card-content">
          <h4>${lesson.title}</h4>
          <p>${lesson.description}</p>
          
          ${progress.completed ? '<div class="progress-indicator completed">✓ Завершено</div>' : ''}
          ${progress.inProgress ? '<div class="progress-indicator in-progress">📚 В процессе</div>' : ''}
        </div>

        <div class="card-footer">
          <div class="labels-group">
            ${labels}
          </div>
          <i class="fas fa-arrow-right arrow-icon"></i>
        </div>

        <div class="card-decoration"></div>
      </a>
    `;
  }

  generateLabelsHTML(lesson) {
    const levelLabel = `<span class="label label--level-${lesson.level.toLowerCase()}">${lesson.level}</span>`;
    const typeLabel = `<span class="label label--type-${lesson.type}">${this.getTypeDisplayName(lesson.type)}</span>`;
    
    return levelLabel + typeLabel;
  }

  getTypeDisplayName(type) {
    const typeNames = {
      'dialogue': 'Диалог',
      'review': 'Отзыв', 
      'text': 'Текст',
      'exercise': 'Упражнение'
    };
    return typeNames[type] || type;
  }

  getProgress(lessonId) {
    const progress = this.storage.getLessonProgress(lessonId);
    return {
      completed: progress?.completed || false,
      inProgress: progress?.started || false,
      percentage: progress?.percentage || 0
    };
  }

  setupEventListeners() {
    // Добавляем обработчики для карточек уроков
    this.container.addEventListener('click', (e) => {
      const lessonCard = e.target.closest('.lesson-card');
      if (lessonCard) {
        e.preventDefault();
        const lessonId = lessonCard.dataset.lessonId;
        this.onLessonClick(lessonId);
      }
    });

    // Добавляем обработчики клавиатуры для доступности
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const lessonCard = e.target.closest('.lesson-card');
        if (lessonCard) {
          e.preventDefault();
          const lessonId = lessonCard.dataset.lessonId;
          this.onLessonClick(lessonId);
        }
      }
    });
  }

  onLessonClick(lessonId) {
    // Сохраняем информацию о клике для аналитики
    this.storage.trackEvent('lesson_clicked', { lessonId });
    
    // Переходим к уроку через роутер
    window.location.hash = `lesson/${lessonId}`;
  }

  renderError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <h3>Ошибка загрузки каталога</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn--primary">
          Попробовать снова
        </button>
      </div>
    `;
  }

  /**
   * Обновляет отображение прогресса для конкретного урока
   * @param {string} lessonId - ID урока
   */
  updateLessonProgress(lessonId) {
    const lessonCard = this.container.querySelector(`[data-lesson-id="${lessonId}"]`);
    if (!lessonCard) return;

    const progress = this.getProgress(lessonId);
    const cardContent = lessonCard.querySelector('.card-content');
    
    // Удаляем старые индикаторы прогресса
    const oldIndicators = cardContent.querySelectorAll('.progress-indicator');
    oldIndicators.forEach(indicator => indicator.remove());

    // Добавляем новые индикаторы
    if (progress.completed) {
      cardContent.insertAdjacentHTML('beforeend', 
        '<div class="progress-indicator completed">✓ Завершено</div>');
    } else if (progress.inProgress) {
      cardContent.insertAdjacentHTML('beforeend', 
        '<div class="progress-indicator in-progress">📚 В процессе</div>');
    }
  }

  /**
   * Фильтрует уроки по уровню
   * @param {string} level - уровень для фильтрации (A1, A2, B1, B2)
   */
  filterByLevel(level) {
    const allCards = this.container.querySelectorAll('.lesson-card');
    
    allCards.forEach(card => {
      const cardLevel = card.querySelector('.label--level-a1, .label--level-a2, .label--level-b1, .label--level-b2');
      const cardLevelText = cardLevel ? cardLevel.textContent.trim() : '';
      
      if (level === 'all' || cardLevelText === level) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  /**
   * Фильтрует уроки по типу
   * @param {string} type - тип для фильтрации
   */
  filterByType(type) {
    const allCards = this.container.querySelectorAll('.lesson-card');
    
    allCards.forEach(card => {
      const cardType = card.dataset.type;
      
      if (type === 'all' || cardType === type) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  /**
   * Выполняет поиск по урокам
   * @param {string} query - поисковый запрос
   */
  search(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const allCards = this.container.querySelectorAll('.lesson-card');
    
    if (!normalizedQuery) {
      // Показываем все карточки, если запрос пустой
      allCards.forEach(card => card.style.display = '');
      return;
    }

    allCards.forEach(card => {
      const title = card.querySelector('h4').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      
      if (title.includes(normalizedQuery) || description.includes(normalizedQuery)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  /**
   * Уничтожает компонент и очищает обработчики
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
    this.catalog = null;
  }
}