export class ModalComponent {
  constructor({ dictionary }) {
    this.dictionary = dictionary; // Залежність від DictionaryService
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
            </div>
          
          <footer class="modal__footer" id="modal-footer" style="display: none;">
            </footer>
        </div>
      `;
      
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
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    const closeBtn = this.modal.querySelector('.modal__close');
    closeBtn.addEventListener('click', () => this.close());

    const bookmarkBtn = this.modal.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', () => this.toggleBookmark());

    const audioBtn = this.modal.querySelector('.audio-btn');
    audioBtn.addEventListener('click', () => this.playAudio());

    this.modal.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

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

  open(config) {
    const {
      title = '',
      content = '',
      size = 'default',
      footer = null,
      onClose = null,
      wordData = null
    } = config;

    this.focusedElementBeforeModal = document.activeElement;
    this.onCloseCallback = onClose;
    this.currentContent = { wordData, ...config };

    this.setTitle(title);
    this.setContent(content);
    this.setFooter(footer);
    this.setSize(size);
    this.updateHeaderButtons(wordData);

    this.modal.classList.add('modal--open');
    this.modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    this.focusModal();
    document.body.style.overflow = 'hidden';
    this.modal.querySelector('.modal__content').classList.add('modal-enter');
  }

  close() {
    if (!this.isOpen) return;

    const content = this.modal.querySelector('.modal__content');
    content.classList.add('modal-exit');

    setTimeout(() => {
      if (this.focusedElementBeforeModal) {
        try {
          this.focusedElementBeforeModal.focus();
        } catch (e) {
          // ignore
        }
      } else if (document.activeElement && this.modal.contains(document.activeElement)) {
        try {
          document.activeElement.blur();
        } catch (e) {
          // ignore
        }
      }

      this.modal.classList.remove('modal--open');
      this.modal.setAttribute('aria-hidden', 'true');
      this.isOpen = false;
      document.body.style.overflow = '';
      content.classList.remove('modal-enter', 'modal-exit');

      if (this.onCloseCallback) {
        this.onCloseCallback();
        this.onCloseCallback = null;
      }
      this.currentContent = null;
    }, 300);
  }

  setTitle(title) {
    this.modal.querySelector('#modal-title').textContent = title;
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
    content.classList.remove('modal--small', 'modal--large', 'modal--full');
    if (size !== 'default') {
      content.classList.add(`modal--${size}`);
    }
  }

  updateHeaderButtons(wordData) {
    const bookmarkBtn = this.modal.querySelector('.bookmark-btn');
    const audioBtn = this.modal.querySelector('.audio-btn');

    if (wordData) {
      bookmarkBtn.style.display = 'flex';
      audioBtn.style.display = 'flex';
      const isBookmarked = this.isWordBookmarked(wordData.lemma);
      bookmarkBtn.classList.toggle('active', isBookmarked);
    } else {
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
        
        <nav class="tabs tabs--chips" data-tabs="word-details-tabs">
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
        <span class="word-type-badge">${this.dictionary.getPartOfSpeechName(wordData.part_of_speech)}</span>
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
    
    const tenseTabs = tenses.map((tense, index) => `
      <button class="tabs__button ${index === 0 ? 'tabs__button--active' : ''}" role="tab" data-tab="${tense}">${this.getTenseName(tense)}</button>
    `).join('');

    const tenseContents = tenses.map((tense, index) => {
      const forms = wordData.inflection[tense];
      if (Object.keys(forms).length === 0) return '';
      
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
        <nav class="tabs tabs--chips" data-tabs="inflection-tabs">
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
      'present': 'Настоящее время',
      'past_masc': 'Прошедшее время (муж.)',
      'past_fem': 'Прошедшее время (жен.)',
      'past_neut': 'Прошедшее время (ср.)',
      'future': 'Будущее время'
    };
    return names[category] || this.capitalize(category);
  }

  getFormName(form) {
    const names = {
      'sg1': 'ja', 'sg2': 'ty', 'sg3': 'on/ona/ono',
      'pl1': 'my', 'pl2': 'wy', 'pl3': 'oni/one',
      'nominative': 'Именительный', 'genitive': 'Родительный',
      'dative': 'Дательный', 'accusative': 'Винительный',
      'instrumental': 'Творительный', 'locative': 'Предложный',
      'vocative': 'Звательный',
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