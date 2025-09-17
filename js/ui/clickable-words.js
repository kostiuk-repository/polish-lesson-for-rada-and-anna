export class ClickableWordsHandler {
  constructor({ container, dictionary, modal }) {
    this.container = container;
    this.dictionary = dictionary;
    this.modal = modal;
    this.activeWord = null;
    this.tooltip = null;
    this.isMobile = window.innerWidth <= 768;
    
    this.init();
  }

  init() {
    // На мобильных устройствах не создаем tooltip
    if (!this.isMobile) {
      this.createTooltip();
    }
    this.setupEventListeners();
    this.detectDeviceType();
  }

  detectDeviceType() {
    // Определяем тип устройства
    this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    // Слушаем изменения размера окна
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      // Если изменился тип устройства, пересоздаем tooltip
      if (wasMobile !== this.isMobile) {
        if (this.isMobile && this.tooltip) {
          this.destroyTooltip();
        } else if (!this.isMobile && !this.tooltip) {
          this.createTooltip();
        }
      }
    });
  }

  createTooltip() {
    // Удаляем существующий tooltip, если есть
    this.destroyTooltip();
    
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'quick-tooltip';
    document.body.appendChild(this.tooltip);
  }

  destroyTooltip() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
      this.tooltip = null;
    }
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

    // Обработчики наведения только для десктопа
    if (!this.isMobile) {
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
    }

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
    if (!wordKey) {
      console.warn('Отсутствует wordKey для элемента:', wordElement);
      return;
    }

    try {
      // Добавляем визуальную обратную связь
      this.highlightWord(wordElement);
      
      // Показываем индикатор загрузки
      this.showLoadingFeedback(wordElement);
      
      // Получаем данные слова
      const wordData = await this.getWordData(wordKey);
      
      if (wordData) {
        // Обновляем перевод в элементе, если его не было
        if (!wordElement.dataset.translation || wordElement.dataset.translation === 'Загрузка...') {
          const translation = wordData.translations?.ru || 'Нет перевода';
          wordElement.dataset.translation = translation;
          wordElement.setAttribute('title', translation);
        }
        
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
      this.showErrorMessage(wordElement, error);
    } finally {
      this.hideLoadingFeedback(wordElement);
    }
  }

  showLoadingFeedback(wordElement) {
    wordElement.classList.add('word-loading');
    
    // Добавляем анимацию пульсации
    const style = document.createElement('style');
    style.textContent = `
      .word-loading {
        opacity: 0.7;
        animation: pulse 1s infinite;
      }
      @keyframes pulse {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
  }

  hideLoadingFeedback(wordElement) {
    wordElement.classList.remove('word-loading');
  }

  handleWordHover(wordElement) {
    if (this.isMobile) return;
    
    wordElement.classList.add('word-hovered');
    
    // Даем небольшую задержку перед показом tooltip
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(() => {
      this.showQuickTooltip(wordElement);
    }, 500); // Увеличенная задержка для лучшего UX
  }

  handleWordLeave(wordElement) {
    if (this.isMobile) return;
    
    wordElement.classList.remove('word-hovered');
    clearTimeout(this.hoverTimeout);
    
    // Задержка перед скрытием tooltip
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.hideQuickTooltip();
    }, 200);
  }

  async getWordData(wordKey) {
    if (!this.dictionary) {
      throw new Error('Словарь не инициализирован');
    }

    try {
      // Убеждаемся, что словарь инициализирован
      if (!this.dictionary.isInitialized) {
        console.log('Инициализируем словарь...');
        await this.dictionary.init();
      }

      // Получаем данные слова
      const normalizedKey = this.dictionary.normalizeWord(wordKey);
      console.log(`Ищем слово: ${wordKey} (нормализовано: ${normalizedKey})`);
      
      const wordData = await this.dictionary.getWord(normalizedKey);
      
      if (!wordData) {
        console.warn(`Слово не найдено в словаре: ${wordKey}`);
        // Попытаемся найти по другим вариантам
        return await this.tryAlternativeSearch(wordKey);
      }
      
      return wordData;
    } catch (error) {
      console.error('Ошибка получения данных слова:', error);
      throw error;
    }
  }

  async tryAlternativeSearch(wordKey) {
    console.log('Пытаемся альтернативный поиск для:', wordKey);
    
    // Пробуем поиск без изменения регистра
    const exactMatch = await this.dictionary.getWord(wordKey.toLowerCase());
    if (exactMatch) return exactMatch;
    
    // Пробуем поиск по первым буквам (для словоформ)
    const searchResults = this.dictionary.searchWords(wordKey, 1);
    if (searchResults.length > 0) {
      return searchResults[0].word;
    }
    
    return null;
  }

  showBasicWordInfo(wordKey, wordElement) {
    const translation = wordElement.dataset.translation && 
                        wordElement.dataset.translation !== 'Загрузка...' 
                        ? wordElement.dataset.translation 
                        : 'Перевод не найден';
    
    const content = `
      <div class="basic-word-info">
        <div class="word-header">
          <h3 class="word-title">${wordKey}</h3>
          <span class="word-type-badge">Неизвестно</span>
        </div>
        <div class="translation-section">
          <div class="translation-text">${translation}</div>
        </div>
        <div class="word-note">
          <h4>📝 Информация</h4>
          <p>Полная информация о слове недоступна в словаре.</p>
          <p>Возможно, это словоформа или слово отсутствует в базе данных.</p>
        </div>
        <div class="word-suggestions">
          <h4>💡 Что можно сделать:</h4>
          <ul>
            <li>Попробуйте найти базовую форму слова</li>
            <li>Проверьте правильность написания</li>
            <li>Используйте внешний словарь</li>
          </ul>
        </div>
      </div>
    `;

    this.modal.open({
      title: `Слово: ${wordKey}`,
      content,
      size: 'default',
      footer: `
        <button class="btn btn--primary" onclick="this.closest('.modal').querySelector('.modal__close').click()">
          Понятно
        </button>
      `
    });
  }

  showErrorMessage(wordElement, error) {
    const content = `
      <div class="error-message">
        <h3>❌ Ошибка загрузки</h3>
        <p>Не удалось загрузить информацию о слове.</p>
        <details>
          <summary>Подробности ошибки</summary>
          <pre>${error.message}</pre>
        </details>
        <p>Попробуйте:</p>
        <ul>
          <li>Обновить страницу</li>
          <li>Проверить подключение к интернету</li>
          <li>Попробовать еще раз через несколько секунд</li>
        </ul>
      </div>
    `;

    this.modal.open({
      title: 'Ошибка',
      content,
      size: 'small',
      footer: `
        <button class="btn btn--primary" onclick="window.location.reload()">
          Обновить страницу
        </button>
        <button class="btn btn--outline" onclick="this.closest('.modal').querySelector('.modal__close').click()">
          Закрыть
        </button>
      `
    });
  }

  showQuickTooltip(wordElement) {
    if (!this.tooltip || this.isMobile) return;

    let translation = wordElement.dataset.translation;
    
    // Если нет перевода в атрибуте, пробуем получить из title
    if (!translation || translation === 'Загрузка...' || translation === 'Нет перевода') {
      translation = wordElement.getAttribute('title');
    }
    
    // Если все еще нет перевода, не показываем tooltip
    if (!translation || translation === 'Нет перевода' || translation === 'Загрузка...' || translation === 'Перевод не найден') {
      this.hideQuickTooltip();
      return;
    }

    this.tooltip.innerHTML = `
      <div class="tooltip-content">
        <div class="tooltip-word">${wordElement.textContent}</div>
        <div class="tooltip-translation">${translation}</div>
        <div class="tooltip-hint">Нажмите для подробностей</div>
      </div>
    `;
    
    // Позиционируем tooltip
    this.positionTooltip(wordElement);
    this.tooltip.classList.add('quick-tooltip--visible');
  }

  positionTooltip(wordElement) {
    if (!this.tooltip) return;

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
  }

  hideQuickTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('quick-tooltip--visible');
    }
  }

  highlightWord(wordElement) {
    // Убираем предыдущие выделения
    if (this.activeWord && this.activeWord !== wordElement) {
      this.removeWordHighlight(this.activeWord);
    }
    
    wordElement.classList.add('word-highlight-animation');
    this.activeWord = wordElement;
    
    // Автоматически убираем выделение через 3 секунды
    setTimeout(() => {
      this.removeWordHighlight(wordElement);
    }, 3000);
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
        context: 'lesson_dialog',
        deviceType: this.isMobile ? 'mobile' : 'desktop'
      });
      
      // Обновляем прогресс слова
      window.PolishApp.storage.updateWordProgress(wordKey, {
        viewCount: (window.PolishApp.storage.getWordProgress(wordKey).viewCount || 0) + 1
      });
    }
  }

  // Дополнительные утилиты

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

  destroy() {
    // Очищаем таймауты
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.hideTimeout);
    
    // Удаляем активные тултипы
    this.destroyTooltip();

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