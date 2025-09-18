import { TabsComponent } from '../ui/tabs.js';

export class ModalComponent {
  constructor({ dictionary }) {
    this.dictionary = dictionary;
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
              <button class="modal__control-btn bookmark-btn" title="Добавить в закладки" aria-label="Добавить в закладки">
                <i class="fas fa-bookmark"></i>
              </button>
              <button class="modal__control-btn audio-btn" title="Прослушать произношение" aria-label="Прослушать произношение">
                <i class="fas fa-volume-up"></i>
              </button>
            </div>
            <button class="modal__close" aria-label="Закрыть модальное окно">
              <i class="fas fa-times"></i>
            </button>
          </header>
          <div class="modal__body" id="modal-body"></div>
          <footer class="modal__footer" id="modal-footer" style="display: none;"></footer>
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
      if (e.target === this.modal) this.close();
    });
    this.modal.querySelector('.modal__close').addEventListener('click', () => this.close());
    this.modal.querySelector('.bookmark-btn').addEventListener('click', () => this.toggleBookmark());
    this.modal.querySelector('.audio-btn').addEventListener('click', () => this.playAudio());
    this.modal.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  showWord(wordData, options = {}) {
    const content = this.generateWordContent(wordData);
    this.open({ title: wordData.lemma, content, size: 'large', wordData, ...options });
  }

  open(config) {
    const { title = '', content = '', size = 'default', footer = null, onClose = null, wordData = null } = config;
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
        try { this.focusedElementBeforeModal.focus(); } catch (e) {}
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

  setTitle(title) { this.modal.querySelector('#modal-title').textContent = title; }

  setContent(content) {
    const bodyElement = this.modal.querySelector('#modal-body');
    if (typeof content === 'string') {
      bodyElement.innerHTML = content;
    } else {
      bodyElement.innerHTML = '';
      bodyElement.appendChild(content);
    }
    bodyElement.querySelectorAll('[data-tabs]').forEach(tabContainer => new TabsComponent(tabContainer));
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
    if (size !== 'default') content.classList.add(`modal--${size}`);
  }

  updateHeaderButtons(wordData) {
    const bookmarkBtn = this.modal.querySelector('.bookmark-btn');
    const audioBtn = this.modal.querySelector('.audio-btn');
    if (wordData) {
      bookmarkBtn.style.display = 'flex';
      audioBtn.style.display = 'flex';
      bookmarkBtn.classList.toggle('active', this.isWordBookmarked(wordData.lemma));
    } else {
      bookmarkBtn.style.display = 'none';
      audioBtn.style.display = 'none';
    }
  }

  generateWordContent(wordData) {
    const isVerb = wordData.part_of_speech === 'verb';
    const inflectionTabTitle = isVerb ? 'Спряжение' : 'Склонение';

    const hasInflection = this.hasInflectionData(wordData.inflection);

    return `
      <div class="word-details">
        ${this.generateWordHeader(wordData)}
        <nav class="tabs tabs--chips" data-tabs="word-details-tabs">
          <div class="tabs__list" role="tablist">
            <button class="tabs__button tabs__button--active" role="tab" data-tab="base">База</button>
            <button class="tabs__button" role="tab" data-tab="examples">Примеры</button>
            ${hasInflection ? `<button class="tabs__button" role="tab" data-tab="inflection">${inflectionTabTitle}</button>` : ''}
          </div>
        </nav>
        <div class="modal-section">
          <div class="tabs__content-wrapper">
            <div class="tabs__content tabs__content--active" data-content="base">
              ${this.generateBaseTabHTML(wordData)}
            </div>
            <div class="tabs__content" data-content="examples">
              ${this.generateExamplesTabHTML(wordData)}
            </div>
            ${hasInflection ? `
            <div class="tabs__content" data-content="inflection">
              ${isVerb ? this.generateConjugationTabHTML(wordData) : this.generateDeclensionTabHTML(wordData)}
            </div>
            ` : ''}
          </div>
        </div>
      </div>`;
  }

  generateWordHeader(wordData) {
    return `<div class="word-header">
              <h3 class="word-title">${wordData.lemma}</h3>
              <span class="word-type-badge">${this.dictionary.getPartOfSpeechName(wordData.part_of_speech)}</span>
            </div>`;
  }

  generateBaseTabHTML(wordData) {
    const translation = wordData.translations?.ru || 'Нет перевода';
    const pronunciation = wordData.pronunciation?.ru_transcription || '';
    return `<div class="translation-section">
              <div class="translation-text">${translation}</div>
              ${pronunciation ? `<div class="pronunciation">[${pronunciation}]</div>` : ''}
      </div>`;
  }

  createTabsId(prefix, lemma = '') {
    const normalizedLemma = (lemma || '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSuffix = Math.random().toString(36).slice(2, 6);
    const base = normalizedLemma || 'item';
    return `${prefix}-${base}-${uniqueSuffix}`;
  }

  generateExamplesTabHTML(wordData) {
    if (!wordData.examples?.length) {
      return '<p class="text-muted text-center">Примеры для этого слова отсутствуют.</p>';
    }
    return `<div class="examples-list">${wordData.examples.map(ex => `
      <div class="example-item">
        <div class="example-polish">${ex.pl}</div>
        <div class="example-russian">${ex.ru}</div>
        ${ex.ru_transcription ? `<div class="example-transcription">[${ex.ru_transcription}]</div>` : ''}
      </div>`).join('')}</div>`;
  }

  generateConjugationTabHTML(wordData) {
    const inflection = wordData.inflection || {};
    const tenseOrder = ['present', 'past', 'past_masc', 'past_fem', 'past_neut', 'future', 'imperative', 'conditional'];

    const availableTenses = [];

    tenseOrder.forEach((tenseKey) => {
      const tenseData = inflection[tenseKey];
      if (tenseData && Object.keys(tenseData).length > 0) {
        availableTenses.push({ key: tenseKey, forms: tenseData });
      }
    });

    Object.entries(inflection).forEach(([tenseKey, forms]) => {
      if (!tenseOrder.includes(tenseKey) && forms && Object.keys(forms).length > 0) {
        availableTenses.push({ key: tenseKey, forms });
      }
    });

    if (availableTenses.length === 0) {
      return '<p class="text-muted text-center">Формы спряжения отсутствуют.</p>';
    }

    const tabsId = this.createTabsId('conjugation', wordData.lemma);

    const formOrders = {
      present: ['sg1', 'sg2', 'sg3', 'pl1', 'pl2', 'pl3'],
      future: ['sg1', 'sg2', 'sg3', 'pl1', 'pl2', 'pl3'],
      conditional: ['sg1', 'sg2', 'sg3', 'pl1', 'pl2', 'pl3'],
      imperative: ['sg2', 'pl1', 'pl2'],
      past: ['sg1m', 'sg1f', 'sg2m', 'sg2f', 'sg3m', 'sg3f', 'sg3n', 'pl1m', 'pl1f', 'pl2m', 'pl2f', 'pl3m', 'pl3f'],
      past_masc: ['sg1', 'sg2', 'sg3', 'pl1', 'pl2', 'pl3'],
      past_fem: ['sg1', 'sg2', 'sg3', 'pl1', 'pl2', 'pl3'],
      past_neut: ['sg1', 'sg2', 'sg3', 'pl1', 'pl2', 'pl3']
    };

    const tenseTabs = availableTenses
      .map(({ key }, index) => {
        const tabKey = `${tabsId}-${key}`;
        const buttonId = `${tabKey}-tab`;
        return `
          <button class="tabs__button ${index === 0 ? 'tabs__button--active' : ''}"
                  type="button"
                  role="tab"
                  id="${buttonId}"
                  aria-controls="${tabKey}"
                  data-tab="${tabKey}"
                  aria-selected="${index === 0}">
            ${this.getTenseName(key)}
          </button>
        `;
      })
      .join('');

    const tenseContents = availableTenses
      .map(({ key, forms }, index) => {
        const tabKey = `${tabsId}-${key}`;
        const labelId = `${tabKey}-tab`;
        const order = formOrders[key] || Object.keys(forms);
        const rows = this.buildConjugationRows(forms, order);

        const tableContent = rows
          ? `
            <div class="conjugation-table-wrapper">
              <table class="conjugation-table table--compact">
                <thead>
                  <tr>
                    <th scope="col">Лицо</th>
                    <th scope="col">Форма</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`
          : '<p class="text-muted text-center">Для этого времени нет доступных форм.</p>';

        return `
          <div class="tabs__content ${index === 0 ? 'tabs__content--active' : ''}"
               data-content="${tabKey}"
               id="${tabKey}"
               role="tabpanel"
               aria-labelledby="${labelId}">
            ${tableContent}
          </div>`;
      })
      .join('');

    return `
      <div class="inflection-container">
        <nav class="tabs tabs--chips" data-tabs="${tabsId}">
          <div class="tabs__list" role="tablist">${tenseTabs}</div>
        </nav>
        <div class="inflection-content mt-4">
          <div class="tabs__content-wrapper">${tenseContents}</div>
        </div>
      </div>`;
  }

  buildConjugationRows(forms, order = []) {
    if (!forms || typeof forms !== 'object') {
      return '';
    }

    const orderedKeys = order.filter(key => this.hasInflectionData(forms[key]));
    const fallbackKeys = Object.keys(forms)
      .filter(key => this.hasInflectionData(forms[key]) && !orderedKeys.includes(key));
    const keys = [...orderedKeys, ...fallbackKeys];

    if (!keys.length) {
      return '';
    }

    const sections = [];
    const processed = new Set();

    const appendSection = (title, predicate) => {
      const sectionKeys = keys.filter(key => !processed.has(key) && predicate(key));
      if (!sectionKeys.length) return;

      sections.push(`
        <tr class="conjugation-table__section">
          <th class="conjugation-table__section-title" colspan="2">${title}</th>
        </tr>
      `);

      sectionKeys.forEach((formKey) => {
        processed.add(formKey);
        sections.push(this.generateConjugationRow(formKey, forms[formKey]));
      });
    };

    appendSection('Единственное число', key => key.startsWith('sg'));
    appendSection('Множественное число', key => key.startsWith('pl'));

    const remainingKeys = keys.filter(key => !processed.has(key));
    if (remainingKeys.length) {
      sections.push(`
        <tr class="conjugation-table__section">
          <th class="conjugation-table__section-title" colspan="2">Дополнительные формы</th>
        </tr>
      `);

      remainingKeys.forEach((formKey) => {
        processed.add(formKey);
        sections.push(this.generateConjugationRow(formKey, forms[formKey]));
      });
    }

    return sections.join('');
  }

  generateConjugationRow(formKey, value) {
    const formattedValue = this.formatInflectionValue(value);
    const displayValue = formattedValue ? `<strong>${formattedValue}</strong>` : '<span class="text-muted">—</span>';

    return `
      <tr>
        <th scope="row" class="conjugation-table__label">${this.getFormName(formKey)}</th>
        <td class="conjugation-table__value">${displayValue}</td>
      </tr>`;
  }

  generateDeclensionTabHTML(wordData) {
    const inflection = wordData.inflection || {};
    const singularForms = inflection.singular || {};
    const pluralForms = inflection.plural || {};

    const groups = [];

    if (this.hasInflectionData(singularForms)) {
      groups.push({ key: 'singular', label: 'Единственное число', forms: singularForms });
    }

    if (this.hasInflectionData(pluralForms)) {
      groups.push({ key: 'plural', label: 'Множественное число', forms: pluralForms });
    }

    const extraGroups = Object.entries(inflection)
      .filter(([key, value]) => !['singular', 'plural'].includes(key) && value && typeof value === 'object' && !Array.isArray(value))
      .map(([key, value]) => ({ key, label: this.formatInflectionGroupName(key), forms: value }))
      .filter(group => this.hasInflectionData(group.forms));

    if (!groups.length && this.hasInflectionData(inflection) && !Array.isArray(inflection)) {
      groups.push({ key: 'all', label: 'Формы', forms: inflection });
    }

    groups.push(...extraGroups);

    if (!groups.length) {
      return '<p class="text-muted text-center">Формы склонения отсутствуют.</p>';
    }

    const caseOrder = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'locative', 'vocative'];

    const tabsId = this.createTabsId('declension', wordData.lemma);
    const hasTabs = groups.length > 1;

    const tabsNav = hasTabs
      ? `
        <nav class="tabs tabs--chips" data-tabs="${tabsId}">
          <div class="tabs__list" role="tablist">
            ${groups
              .map((group, index) => {
                const tabKey = `${tabsId}-${group.key}`;
                return `
                  <button class="tabs__button ${index === 0 ? 'tabs__button--active' : ''}"
                          type="button"
                          role="tab"
                          id="${tabKey}-tab"
                          aria-controls="${tabKey}"
                          data-tab="${tabKey}"
                          aria-selected="${index === 0}">
                    ${group.label}
                  </button>`;
              })
              .join('')}
          </div>
        </nav>`
      : '';

    const content = groups
      .map((group, index) => {
        const rows = this.buildDeclensionRows(group.forms, caseOrder);
        const table = rows
          ? `
            <div class="conjugation-table-wrapper">
              <table class="conjugation-table table--striped table--compact">
                <thead>
                  <tr>
                    <th scope="col">Падеж</th>
                    <th scope="col">Форма</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`
          : '<p class="text-muted text-center">Нет доступных форм для этого числа.</p>';

        if (!hasTabs) {
          return table;
        }

        const tabKey = `${tabsId}-${group.key}`;
        return `
          <div class="tabs__content ${index === 0 ? 'tabs__content--active' : ''}"
               data-content="${tabKey}"
               id="${tabKey}"
               role="tabpanel"
               aria-labelledby="${tabKey}-tab">
            ${table}
          </div>`;
      })
      .join('');

    const contentWrapper = hasTabs
      ? `<div class="tabs__content-wrapper">${content}</div>`
      : `<div class="tabs__content-wrapper tabs__content-wrapper--static">${content}</div>`;

    return `
      <div class="inflection-container">
        ${tabsNav}
        <div class="inflection-content mt-4">
          ${contentWrapper}
        </div>
      </div>`;
  }

  buildDeclensionRows(forms, baseOrder = []) {
    if (!forms || typeof forms !== 'object') {
      return '';
    }

    const additionalKeys = Object.keys(forms).filter(key => !baseOrder.includes(key));
    const orderedCases = [...baseOrder, ...additionalKeys];

    return orderedCases
      .filter(caseKey => this.hasInflectionData(forms[caseKey]))
      .map(caseKey => this.generateDeclensionRow(caseKey, forms[caseKey]))
      .join('');
  }

  generateDeclensionRow(caseKey, value) {
    const formattedValue = this.formatInflectionValue(value);
    const displayValue = formattedValue ? `<strong>${formattedValue}</strong>` : '<span class="text-muted">—</span>';

    return `
      <tr>
        <th scope="row" class="conjugation-table__label">${this.getFormName(caseKey)}</th>
        <td class="conjugation-table__value">${displayValue}</td>
      </tr>`;
  }

  hasInflectionData(inflection) {
    if (!inflection) {
      return false;
    }

    if (typeof inflection === 'string') {
      return inflection.trim().length > 0;
    }

    if (Array.isArray(inflection)) {
      return inflection.some(item => this.hasInflectionData(item));
    }

    if (typeof inflection === 'object') {
      return Object.values(inflection).some(value => this.hasInflectionData(value));
    }

    return false;
  }

  formatInflectionValue(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(', ');
    }

    return value || '';
  }

  getTenseName(tenseKey) {
    const names = { present: 'Настоящее', past: 'Прошедшее', past_masc: 'Прошедшее (муж.)', past_fem: 'Прошедшее (жен.)', past_neut: 'Прошедшее (ср.)', future: 'Будущее', imperative: 'Повелительное', conditional: 'Условное' };
    return names[tenseKey] || this.capitalize(tenseKey);
  }

  formatInflectionGroupName(key) {
    const numberNames = { singular: 'Единственное число', plural: 'Множественное число' };
    if (numberNames[key]) {
      return numberNames[key];
    }

    return key
      .split('_')
      .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
      .join(' ');
  }

  getFormName(form) {
    const names = {
      sg1: 'ja',
      sg2: 'ty',
      sg3: 'on/ona/ono',
      pl1: 'my',
      pl2: 'wy',
      pl3: 'oni/one',
      sg1m: 'ja (муж.)',
      sg1f: 'ja (жен.)',
      sg2m: 'ty (муж.)',
      sg2f: 'ty (жен.)',
      sg3m: 'on',
      sg3f: 'ona',
      sg3n: 'ono',
      pl1m: 'my (муж.)',
      pl1f: 'my (жен.)',
      pl2m: 'wy (муж.)',
      pl2f: 'wy (жен.)',
      pl3m: 'oni',
      pl3f: 'one',
      nominative: 'Именительный',
      genitive: 'Родительный',
      dative: 'Дательный',
      accusative: 'Винительный',
      instrumental: 'Творительный',
      locative: 'Предложный',
      vocative: 'Звательный'
    };
    return names[form] || form;
  }

  capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }
  
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