export class ClickableWordsHandler {
  constructor({ container, dictionary, modal }) {
    this.container = container;
    this.dictionary = dictionary;
    this.modal = modal;
    this.activeWord = null;
    this.tooltip = null;
    
    this.init();
  }

  init() {
    this.createTooltip();
    this.setupEventListeners();
  }

  createTooltip() {
    // Удаляем существующий tooltip, если есть
    const existing = document.querySelector('.quick-tooltip');
    if (existing) {
      existing.remove();
    }
    
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'quick-tooltip';
    document.body.appendChild(this.tooltip);
  }

  setupEventListeners() {
    // Обработчик клика по кликабельным словам
    this.container.addEventListener('click', (e) => {
      const clickableWord = e.target.closest('.clickable-word');
      if (clickableWord) {
        e.preventDefault();
        e.stopPropagation();
        this.handleWordClick(clickableWord);
      }
    });

    // Обработчик наведения для предпросмотра
    this.container.addEventListener('mouseenter', (e) => {
      const clickableWord = e.target.closest('.clickable-word');
      if (clickableWord) {
        this.handleWordHover(clickableWord);
      }
    }, true);

    this.container.addEventListener('mouseleave', (e) => {
      const clickableWord = e.target.closest('.clickable-word');
      if (clickableWord) {
        this.handleWordLeave(clickableWord);
      }
    }, true);

    // Скрываем tooltip при движении мыши
    this.container.addEventListener('mousemove', (e) => {
      const clickableWord = e.target.closest('.clickable-word');
      if (!clickableWord) {
        this.hideQuickTooltip();
      }
    });

    // Обработчик клавиатуры для доступности
    this.container.addEventListener('keydown', (e) => {
      const clickableWord = e.target.closest('.clickable-word');
      if (clickableWord && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.handleWordClick(clickableWord);
      }
    });
  }

  async handleWordClick(wordElement) {
    const wordKey = wordElement.dataset.wordKey;
    if (!wordKey) return;

    try {
      // Добавляем визуальную обратную связь
      this.highlightWord(wordElement);
      
      // Получаем данные слова
      const wordData = await this.getWordData(wordKey);
      
      if (wordData) {
        // Показываем модальное окно с деталями слова
        this.modal.showWord(wordData, {
          onClose: () => this.removeWordHighlight(wordElement)
        });
        
        // Отслеживаем событие для аналитики
        this.trackWordClick(wordKey);
      } else {
        // Если слово не найдено, показываем базовую информацию
        this.showBasicWordInfo(wordKey, wordElement);
      }
    } catch (error) {
      console.error('Ошибка при получении данных слова:', error);
      this.showErrorMessage(wordElement);
    }
  }

  handleWordHover(wordElement) {
    wordElement.classList.add('word-hovered');
    
    // Даем небольшую задержку перед показом tooltip
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(() => {
      this.showQuickTooltip(wordElement);
    }, 300);
  }

  handleWordLeave(wordElement) {
    wordElement.classList.remove('word-hovered');
    clearTimeout(this.hoverTimeout);
    
    // Задержка перед скрытием tooltip
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.hideQuickTooltip();
    }, 100);
  }

  async getWordData(wordKey) {
    if (!this.dictionary) {
      console.warn('Словарь не инициализирован');
      return null;
    }

    try {
      // Убеждаемся, что словарь инициализирован
      if (!this.dictionary.isInitialized) {
        await this.dictionary.init();
      }

      // Получаем данные слова
      const wordData = await this.dictionary.getWord(wordKey);
      return wordData;
    } catch (error) {
      console.error('Ошибка получения данных слова:', error);
      return null;
    }
  }

  showBasicWordInfo(wordKey, wordElement) {
    const translation = wordElement.dataset.translation || 'Нет перевода';
    
    const content = `
      <div class="basic-word-info">
        <div class="word-header">
          <h3 class="word-title">${wordKey}</h3>
        </div>
        <div class="translation-section">
          <div class="translation-text">${translation}</div>
        </div>
        <div class="word-note">
          <p>📝 Полная информация о слове недоступна</p>
          <p>Попробуйте обновить словарь или проверьте подключение к интернету.</p>
        </div>
      </div>
    `;

    this.modal.open({
      title: wordKey,
      content,
      size: 'small'
    });
  }

  showErrorMessage(wordElement) {
    const content = `
      <div class="error-message">
        <h3>Ошибка загрузки</h3>
        <p>Не удалось загрузить информацию о слове. Попробуйте еще раз.</p>
      </div>
    `;

    this.modal.open({
      title: 'Ошибка',
      content,
      size: 'small'
    });
  }

  showQuickTooltip(wordElement) {
    if (!this.tooltip) return;

    let translation = wordElement.dataset.translation;
    
    // Если нет перевода в атрибуте, пробуем получить из title
    if (!translation || translation === 'Загрузка...' || translation === 'Нет перевода') {
      translation = wordElement.getAttribute('title');
    }
    
    if (!translation || translation === 'Нет перевода' || translation === 'Загрузка...') {
      this.tooltip.classList.remove('quick-tooltip--visible');
      return;
    }

    this.tooltip.textContent = translation;
    
    // Позиционируем tooltip
    const rect = wordElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // Проверяем, не выходит ли tooltip за границы экрана
    const margin = 10;
    if (left < margin) {
      left = margin;
    } else if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin;
    }
    
    if (top < margin) {
      top = rect.bottom + 10; // Показываем снизу, если не помещается сверху
    }

    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
    this.tooltip.classList.add('quick-tooltip--visible');
  }

  hideQuickTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('quick-tooltip--visible');
    }
  }

  highlightWord(wordElement) {
    // Убираем предыдущие выделения
    if (this.activeWord) {
      this.removeWordHighlight(this.activeWord);
    }
    
    wordElement.classList.add('word-highlight-animation');
    this.activeWord = wordElement;
  }

  removeWordHighlight(wordElement) {
    if (wordElement) {
      wordElement.classList.remove('word-highlight-animation');
    }
    if (this.activeWord === wordElement) {
      this.activeWord = null;
    }
  }

  trackWordClick(wordKey) {
    // Отправляем событие для аналитики
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.trackEvent('word_clicked', {
        word: wordKey,
        timestamp: Date.now(),
        context: 'lesson_dialog'
      });
    }
  }

  /**
   * Добавляет возможность поиска слов по тексту
   * @param {string} searchText - текст для поиска
   */
  highlightSearchResults(searchText) {
    if (!searchText.trim()) {
      this.clearHighlights();
      return;
    }

    const words = this.container.querySelectorAll('.clickable-word');
    const searchLower = searchText.toLowerCase();

    words.forEach(word => {
      const wordText = word.textContent.toLowerCase();
      const translation = (word.dataset.translation || '').toLowerCase();
      
      if (wordText.includes(searchLower) || translation.includes(searchLower)) {
        word.classList.add('search-highlight');
      } else {
        word.classList.remove('search-highlight');
      }
    });
  }

  clearHighlights() {
    const highlightedWords = this.container.querySelectorAll('.search-highlight');
    highlightedWords.forEach(word => {
      word.classList.remove('search-highlight');
    });
  }

  /**
   * Получает статистику по кликам на слова
   * @returns {Object} статистика
   */
  getClickStats() {
    const events = this.getStoredEvents();
    const wordClicks = events.filter(event => event.type === 'word_clicked');
    
    const stats = {
      totalClicks: wordClicks.length,
      uniqueWords: new Set(wordClicks.map(click => click.data.word)).size,
      mostClickedWords: {}
    };

    // Подсчитываем клики по словам
    wordClicks.forEach(click => {
      const word = click.data.word;
      stats.mostClickedWords[word] = (stats.mostClickedWords[word] || 0) + 1;
    });

    // Сортируем по популярности
    stats.mostClickedWords = Object.entries(stats.mostClickedWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [word, count]) => {
        obj[word] = count;
        return obj;
      }, {});

    return stats;
  }

  /**
   * Предварительная загрузка популярных слов
   */
  async preloadPopularWords() {
    const stats = this.getClickStats();
    const popularWords = Object.keys(stats.mostClickedWords);
    
    for (const word of popularWords) {
      try {
        await this.getWordData(word);
      } catch (error) {
        console.warn('Не удалось предзагрузить слово:', word);
      }
    }
  }

  /**
   * Экспорт изученных слов
   * @returns {Array} список изученных слов
   */
  getLearnedWords() {
    const events = this.getStoredEvents();
    const wordClicks = events.filter(event => event.type === 'word_clicked');
    
    return Array.from(new Set(wordClicks.map(click => click.data.word)));
  }

  destroy() {
    // Очищаем таймауты
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.hideTimeout);
    
    // Удаляем активные тултипы
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }

    // Очищаем активные выделения
    if (this.activeWord) {
      this.removeWordHighlight(this.activeWord);
    }

    this.clearHighlights();
    
    // Очищаем ссылки
    this.container = null;
    this.dictionary = null;
    this.modal = null;
    this.tooltip = null;
  }

  getStoredEvents() {
    const storage = window.PolishApp?.storage;

    if (storage) {
      return storage.get('user_events', []);
    }

    try {
      return JSON.parse(localStorage.getItem('userEvents') || '[]');
    } catch (error) {
      console.warn('Не удалось прочитать события пользователя из localStorage:', error);
      return [];
    }
  }
}