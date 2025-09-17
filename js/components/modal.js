export class ModalComponent {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.currentContent = null;
    this.focusedElementBeforeModal = null;
    this.onCloseCallback = null;
    
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    // Создаем модальное окно, если его еще нет
    this.modal = document.getElementById('modal');
    
    if (!this.modal) {
      this.modal = document.createElement('div');
      this.modal.id = 'modal';
      this.modal.className = 'modal';
      this.modal.setAttribute('role', 'dialog');
      this.modal.setAttribute('aria-modal', 'true');
      this.modal.setAttribute('aria-hidden', 'true');
      
      this.modal.innerHTML = `
        <div class="modal__content">
          <header class="modal__header">
            <h2 class="modal__title" id="modal-title"></h2>
            <div class="modal__controls">
              <button class="modal__control-btn bookmark-btn" 
                      title="Добавить в закладки"
                      aria-label="Добавить в закладки">
                <i class="fas fa-bookmark"></i>
              </button>
              <button class="modal__control-btn audio-btn" 
                      title="Прослушать произношение"
                      aria-label="Прослушать произношение">
                <i class="fas fa-volume-up"></i>
              </button>
            </div>
            <button class="modal__close" 
                    aria-label="Закрыть модальное окно">
              <i class="fas fa-times"></i>
            </button>
          </header>
          
          <div class="modal__body" id="modal-body">
            <!-- Контент будет добавлен динамически -->
          </div>
          
          <footer class="modal__footer" id="modal-footer" style="display: none;">
            <!-- Кнопки действий -->
          </footer>
        </div>
      `;
      
      // Добавляем в контейнер для модальных окон
      let modalsContainer = document.getElementById('modals-container');
      if (!modalsContainer) {
        modalsContainer = document.createElement('div');
        modalsContainer.id = 'modals-container';
        document.body.appendChild(modalsContainer);
      }
      modalsContainer.appendChild(this.modal);
    }
  }

  setupEventListeners() {
    // Закрытие по клику на оверлей
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Закрытие по кнопке X
    const closeBtn = this.modal.querySelector('.modal__close');
    closeBtn.addEventListener('click', () => this.close());

    // Кнопка закладок
    const bookmarkBtn = this.modal.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', () => this.toggleBookmark());

    // Кнопка аудио
    const audioBtn = this.modal.querySelector('.audio-btn');
    audioBtn.addEventListener('click', () => this.playAudio());

    // Обработка клавиатуры
    this.modal.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Открывает модальное окно со словарной статьей
   * @param {Object} wordData - данные слова
   * @param {Object} options - дополнительные опции
   */
  showWord(wordData, options = {}) {
    const content = this.generateWordContent(wordData);
    
    this.open({
      title: wordData.lemma,
      content,
      size: 'large',
      wordData,
      ...options
    });
  }

  /**
   * Открывает модальное окно с произвольным контентом
   * @param {Object} config - конфигурация модального окна
   */
  open(config) {
    const {
      title = '',
      content = '',
      size = 'default',
      footer = null,
      onClose = null,
      wordData = null
    } = config;

    // Сохраняем текущий фокус
    this.focusedElementBeforeModal = document.activeElement;
    this.onCloseCallback = onClose;
    this.currentContent = { wordData, ...config };

    // Устанавливаем контент
    this.setTitle(title);
    this.setContent(content);
    this.setFooter(footer);
    this.setSize(size);

    // Обновляем кнопки в заголовке
    this.updateHeaderButtons(wordData);

    // Показываем модальное окно
    this.modal.classList.add('modal--open');
    this.modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Фокусируемся на модальном окне
    this.focusModal();

    // Блокируем прокрутку страницы
    document.body.style.overflow = 'hidden';

    // Запускаем анимацию
    this.modal.querySelector('.modal__content').classList.add('modal-enter');
  }

  /**
   * Закрывает модальное окно
   */
  close() {
    if (!this.isOpen) return;

    // Запускаем анимацию выхода
    const content = this.modal.querySelector('.modal__content');
    content.classList.add('modal-exit');

    setTimeout(() => {
      this.modal.classList.remove('modal--open');
      this.modal.setAttribute('aria-hidden', 'true');
      this.isOpen = false;

      // Восстанавливаем фокус
      if (this.focusedElementBeforeModal) {
        this.focusedElementBeforeModal.focus();
      }

      // Восстанавливаем прокрутку
      document.body.style.overflow = '';

      // Очищаем анимационные классы
      content.classList.remove('modal-enter', 'modal-exit');

      // Вызываем callback
      if (this.onCloseCallback) {
        this.onCloseCallback();
        this.onCloseCallback = null;
      }

      // Очищаем данные
      this.currentContent = null;
    }, 300);
  }

  setTitle(title) {
    const titleElement = this.modal.querySelector('#modal-title');
    titleElement.textContent = title;
  }

  setContent(content) {
    const bodyElement = this.modal.querySelector('#modal-body');
    if (typeof content === 'string') {
      bodyElement.innerHTML = content;
    } else {
      bodyElement.innerHTML = '';
      bodyElement.appendChild(content);
    }
  }

  setFooter(footer) {
    const footerElement = this.modal.querySelector('#modal-footer');
    
    if (footer) {
      footerElement.innerHTML = footer;
      footerElement.style.display = 'flex';
    } else {
      footerElement.style.display = 'none';
    }
  }

  setSize(size) {
    const content = this.modal.querySelector('.modal__content');
    
    // Удаляем существующие классы размеров
    content.classList.remove('modal--small', 'modal--large', 'modal--full');
    
    // Добавляем новый класс размера
    if (size !== 'default') {
      content.classList.add(`modal--${size}`);
    }
  }

  updateHeaderButtons(wordData) {
    const bookmarkBtn = this.modal.querySelector('.bookmark-btn');
    const audioBtn = this.modal.querySelector('.audio-btn');

    if (wordData) {
      // Показываем кнопки для словарных статей
      bookmarkBtn.style.display = 'flex';
      audioBtn.style.display = 'flex';

      // Проверяем, добавлено ли слово в закладки
      const isBookmarked = this.isWordBookmarked(wordData.lemma);
      bookmarkBtn.classList.toggle('active', isBookmarked);
    } else {
      // Скрываем кнопки для обычных модальных окон
      bookmarkBtn.style.display = 'none';
      audioBtn.style.display = 'none';
    }
  }

  generateWordContent(wordData) {
    const isVerb = wordData.part_of_speech === 'verb';
    const inflectionTabTitle = isVerb ? 'Спряжение' : 'Склонение';

    return `
      <div class="word-details">
        ${this.generateWordHeader(wordData)}
        
        <nav class="tabs tabs--card" data-tabs="word-details-tabs">
          <div class="tabs__list" role="tablist">
            <button class="tabs__button tabs__button--active" role="tab" data-tab="base">База</button>
            <button class="tabs__button" role="tab" data-tab="examples">Примеры</button>
            ${wordData.inflection ? `<button class="tabs__button" role="tab" data-tab="inflection">${inflectionTabTitle}</button>` : ''}
          </div>
        </nav>
        
        <div class="modal-section">
          <div class="tabs__content tabs__content--active" data-content="base">
            ${this.generateBaseTabHTML(wordData)}
          </div>
          <div class="tabs__content" data-content="examples">
            ${this.generateExamplesTabHTML(wordData)}
          </div>
          ${wordData.inflection ? `
            <div class="tabs__content" data-content="inflection">
              ${isVerb ? this.generateConjugationTabHTML(wordData) : this.generateDeclensionTabHTML(wordData)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateWordHeader(wordData) {
    return `
      <div class="word-header">
        <h3 class="word-title">${wordData.lemma}</h3>
        <span class="word-type-badge">${this.getPartOfSpeechName(wordData.part_of_speech)}</span>
      </div>
    `;
  }

  generateBaseTabHTML(wordData) {
    const translation = wordData.translations?.ru || 'Нет перевода';
    const pronunciation = wordData.pronunciation?.ru_transcription || '';
    
    return `
      <div class="translation-section">
        <div class="translation-text">${translation}</div>
        ${pronunciation ? `<div class="pronunciation">[${pronunciation}]</div>` : ''}
      </div>
    `;
  }

  generateExamplesTabHTML(wordData) {
    if (!wordData.examples?.length) {
      return '<p class="text-muted text-center">Примеры для этого слова отсутствуют.</p>';
    }
    const examples = wordData.examples
      .map(example => `
        <div class="example-item">
          <div class="example-polish">${example.pl}</div>
          <div class="example-russian">${example.ru}</div>
          ${example.ru_transcription ? `<div class="example-transcription">[${example.ru_transcription}]</div>` : ''}
        </div>
      `)
      .join('');

    return `<div class="examples-list">${examples}</div>`;
  }

  generateConjugationTabHTML(wordData) {
    const tenses = Object.keys(wordData.inflection);
    if (tenses.length === 0) return '<p class="text-muted text-center">Формы спряжения отсутствуют.</p>';
    
    // Создаем "нагетсы" (вложенные табы)
    const tenseTabs = tenses.map((tense, index) => `
      <button class="tabs__button ${index === 0 ? 'tabs__button--active' : ''}" role="tab" data-tab="${tense}">${this.getTenseName(tense)}</button>
    `).join('');

    // Создаем контент для каждого "нагетса"
    const tenseContents = tenses.map((tense, index) => {
      const forms = wordData.inflection[tense];
      if (Object.keys(forms).length === 0) return ''; // Пропускаем пустые секции (например, imperative для некоторых глаголов)
      
      const formsTable = `
        <table class="conjugation-table table--compact">
          <tbody>
            ${Object.entries(forms).map(([form, value]) => `
              <tr>
                <td>${this.getFormName(form)}</td>
                <td><strong>${value}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      return `
        <div class="tabs__content ${index === 0 ? 'tabs__content--active' : ''}" data-content="${tense}">
          ${formsTable}
        </div>
      `;
    }).join('');

    return `
      <div class="inflection-container">
        <nav class="tabs tabs--card" data-tabs="inflection-tabs">
          <div class="tabs__list" role="tablist">
            ${tenseTabs}
          </div>
        </nav>
        <div class="inflection-content mt-4">
          ${tenseContents}
        </div>
      </div>
    `;
  }

  generateDeclensionTabHTML(wordData) {
    let tableHTML = '';
    const categories = Object.keys(wordData.inflection);

    categories.forEach(category => {
      const forms = wordData.inflection[category];
      tableHTML += `
        <div class="declension-group">
          <h5 class="declension-group__title">${this.getInflectionCategoryName(category)}</h5>
          <table class="conjugation-table table--striped table--compact">
            <tbody>
              ${Object.entries(forms).map(([form, value]) => `
                <tr>
                  <td>${this.getFormName(form)}</td>
                  <td><strong>${value}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    return `<div class="declension-container">${tableHTML}</div>`;
  }

  // Вспомогательные функции для названий
  getTenseName(tenseKey) {
    const names = {
      'present': 'Настоящее',
      'past_masc': 'Прошедшее (муж.)',
      'past_fem': 'Прошедшее (жен.)',
      'past_neut': 'Прошедшее (ср.)',
      'future': 'Будущее',
      'imperative': 'Повелительное',
      'conditional': 'Условное'
    };
    return names[tenseKey] || this.capitalize(tenseKey);
  }

  getInflectionCategoryName(category) {
    const names = {
      'singular': 'Единственное число',
      'plural': 'Множественное число',
      'masculine': 'Мужской род',
      'feminine': 'Женский род',
      'neuter': 'Средний род',
      // Fallback for tense-like categories (if ever used here)
      'present': 'Настоящее время',
      'past_masc': 'Прошедшее время (муж.)',
      'past_fem': 'Прошедшее время (жен.)',
      'past_neut': 'Прошедшее время (ср.)',
      'future': 'Будущее время'
    };
    return names[category] || this.capitalize(category);
  }

  // Consolidated getFormName for both verb-person keys and case/form names
  getFormName(form) {
    const names = {
      // Verb person keys (pronouns)
      'sg1': 'ja', 'sg2': 'ty', 'sg3': 'on/ona/ono',
      'pl1': 'my', 'pl2': 'wy', 'pl3': 'oni/one',
      // Grammatical cases / forms
      'nominative': 'Именительный', 'genitive': 'Родительный',
      'dative': 'Дательный', 'accusative': 'Винительный',
      'instrumental': 'Творительный', 'locative': 'Предложный',
      'vocative': 'Звательный',
      // Alternative short labels often used for person-number (kept as fallback)
      '1sg': '1л. ед.ч.', '2sg': '2л. ед.ч.', '3sg': '3л. ед.ч.',
      '1pl': '1л. мн.ч.', '2pl': '2л. мн.ч.', '3pl': '3л. мн.ч.'
    };
    return names[form] || form;
  }
  
  capitalize(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
  }

  focusModal() {
    const firstFocusableElement = this.modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    } else {
      this.modal.focus();
    }
  }

  handleKeyDown(e) {
    if (!this.isOpen) return;

    if (e.key === 'Escape') {
      this.close();
      return;
    }

    // Trap focus внутри модального окна
    if (e.key === 'Tab') {
      this.trapFocus(e);
    }
  }

  trapFocus(e) {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  playAudio() {
    if (!this.currentContent?.wordData) return;
    const word = this.currentContent.wordData.lemma;
    // Вызываем сервис озвучки
    if (window.PolishApp && window.PolishApp.speech) {
      window.PolishApp.speech.speak(word);
    } else {
      console.error('SpeechService не найден.');
    }
  }

  toggleBookmark() {
    if (!this.currentContent?.wordData) return;
    const word = this.currentContent.wordData.lemma;
    const isBookmarked = this.isWordBookmarked(word);
    const bookmarkBtn = this.modal.querySelector('.bookmark-btn');

    if (isBookmarked) {
      this.removeFromBookmarks(word);
      bookmarkBtn.classList.remove('active');
    } else {
      this.addToBookmarks(word);
      bookmarkBtn.classList.add('active');
    }
  }

  isWordBookmarked(word) {
    if (window.PolishApp && window.PolishApp.storage) {
      return window.PolishApp.storage.isWordBookmarked(word);
    }
    return false;
  }

  addToBookmarks(word) {
    if (window.PolishApp && window.PolishApp.storage) {
      window.PolishApp.storage.addWordBookmark(word, this.currentContent.wordData);
    }
  }

  removeFromBookmarks(word) {
    if (window.PolishApp && window.PolishApp.storage) {
      window.PolishApp.storage.removeWordBookmark(word);
    }
  }

  destroy() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    this.modal = null;
    this.isOpen = false;
  }
}