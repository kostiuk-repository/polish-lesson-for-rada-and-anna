export class ClickableWordsHandler {
  constructor({ container, dictionary, modal }) {
    this.container = container;
    this.dictionary = dictionary;
    this.modal = modal;
    this.activeWord = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
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
    // Добавляем класс для эффекта наведения
    wordElement.classList.add('word-hovered');
    
    // Показываем краткую подсказку с переводом
    this.showQuickTooltip(wordElement);
  }

  handleWordLeave(wordElement) {
    wordElement.classList.remove('word-hovered');
    this.hideQuickTooltip(wordElement);
  }

  async getWordData(wordKey) {
    // Сначала ищем в загруженном словаре
    let wordData = this.dictionary.getWord(wordKey);
    
    if (!wordData) {
      // Если не найдено, пытаемся загрузить дополнительные данные
      try {
        await this.dictionary.loadAdditionalWordData(wordKey);
        wordData = this.dictionary.getWord(wordKey);
      } catch (error) {
        console.warn('Не удалось загрузить дополнительные данные для слова:', wordKey);
      }
    }
    
    return wordData;
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
    // Проверяем, есть ли уже тултип
    if (wordElement.querySelector('.quick-tooltip')) return;

    const translation = wordElement.dataset.translation;
    if (!translation) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'quick-tooltip';
    tooltip.textContent = translation;
    
    // Позиционируем тултип
    const rect = wordElement.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.top = `${rect.top - 35}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.zIndex = '1000';
    tooltip.style.background = 'var(--gray-800)';
    tooltip.style.color = 'var(--white)';
    tooltip.style.padding = 'var(--space-2) var(--space-3)';
    tooltip.style.borderRadius = 'var(--radius-base)';
    tooltip.style.fontSize = 'var(--font-size-xs)';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity var(--transition-fast)';
    tooltip.style.pointerEvents = 'none';

    document.body.appendChild(tooltip);

    // Анимация появления
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
    });

    // Сохраняем ссылку на тултип
    wordElement._tooltip = tooltip;
  }

  hideQuickTooltip(wordElement) {
    const tooltip = wordElement._tooltip;
    if (tooltip) {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 150);
      wordElement._tooltip = null;
    }
  }

  highlightWord(wordElement) {
    wordElement.classList.add('word-highlight-animation');
    this.activeWord = wordElement;
  }

  removeWordHighlight(wordElement) {
    if (wordElement) {
      wordElement.classList.remove('word-highlight-animation');
    }
    this.activeWord = null;
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
    const events = JSON.parse(localStorage.getItem('userEvents') || '[]');
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
    const events = JSON.parse(localStorage.getItem('userEvents') || '[]');
    const wordClicks = events.filter(event => event.type === 'word_clicked');
    
    return Array.from(new Set(wordClicks.map(click => click.data.word)));
  }

  destroy() {
    // Удаляем активные тултипы
    const tooltips = document.querySelectorAll('.quick-tooltip');
    tooltips.forEach(tooltip => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    });

    // Очищаем активные выделения
    if (this.activeWord) {
      this.removeWordHighlight(this.activeWord);
    }

    this.clearHighlights();
    
    // Очищаем ссылки
    this.container = null;
    this.dictionary = null;
    this.modal = null;
  }
}