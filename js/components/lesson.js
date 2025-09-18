import { TabsComponent } from './tabs.js';
import { ModalComponent } from './modal.js';
import { ExercisesComponent } from './exercises.js';
import { ClickableWordsHandler } from '../ui/clickable-words.js';
import { DialogLinesHandler } from '../ui/dialog-lines.js';

export class LessonComponent {
  constructor({ container, api, dictionary, speech, storage, modal }) {
    this.container = container;
    this.api = api;
    this.dictionary = dictionary;
    this.speech = speech;
    this.storage = storage;
    this.modal = modal;
    
    this.lessonData = null;
    this.lessonId = null;
    this.categoryId = null;
    this.tabs = null;
    this.exercises = null;
    this.clickableWords = null;
    this.dialogLines = null;
  }

  async render() {
    console.log('📖 LessonComponent: начинаем рендер');
    
    this.lessonId = this.getLessonIdFromUrl();
    
    if (!this.lessonId) {
      console.error('❌ ID урока не найден в URL');
      this.renderError('ID урока не указан');
      return;
    }

    this.container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    try {
      console.log('📚 Загружаем урок:', this.lessonId);
      
      this.lessonData = await this.api.getLesson(this.lessonId);
      await this.getCategoryId();
      
      console.log('✅ Данные урока загружены:', this.lessonData.title);
      
      this.renderLesson();
      this.initializeComponents();
      this.setupEventListeners();
      this.trackLessonStart();
      
      console.log('✅ Урок успешно отрендерен');
      
    } catch (error) {
      console.error('❌ Ошибка рендеринга урока:', error);
      this.renderError(error.message);
    }
  }

  getLessonIdFromUrl() {
    const hash = window.location.hash;
    const match = hash.match(/#\/lesson\/(.+)$/);
    return match ? match[1] : null;
  }

  async getCategoryId() {
    try {
      const catalog = await this.api.getCatalog();
      for (const category of catalog.categories) {
        const lesson = category.lessons.find(l => l.id === this.lessonId);
        if (lesson) {
          this.categoryId = category.id;
          break;
        }
      }
    } catch (error) {
      console.warn('Не удалось получить ID категории:', error);
    }
  }

  renderLesson() {
    document.title = `${this.lessonData.title} - Polish Learning Hub`;
    const lessonHTML = this.generateLessonHTML();
    this.container.innerHTML = lessonHTML;
  }

  generateLessonHTML() {
    return `
      <div class="lesson-view">
        ${this.generateHeaderHTML()}
        ${this.generateTabsHTML()}
        ${this.generateContentHTML()}
      </div>
    `;
  }

  generateHeaderHTML() {
    const tags = (this.lessonData.tags || [])
      .map(tag => `<span class="tag">#${tag}</span>`)
      .join('');

    const backLink = this.categoryId ? `#/categories/${this.categoryId}` : '#/categories';
      
    return `
      <header class="lesson-header-box">
        <a href="${backLink}" class="btn btn--outline btn--icon-left btn--large mb-4" data-router-link>
          <span class="btn__icon" aria-hidden="true">
            <i class="fas fa-arrow-left"></i>
          </span>
          <span class="btn__label">Назад к урокам</span>
        </a>
        <h1>${this.lessonData.title}</h1>
        <p>${this.lessonData.description}</p>
        <div class="lesson-tags">
          ${tags}
        </div>
      </header>
    `;
  }

  generateTabsHTML() {
    return `
      <nav class="tabs tabs--chips" data-tabs="lesson-tabs">
        <div class="tabs__list" role="tablist">
          <button class="tabs__button tabs__button--active" 
                  role="tab" 
                  data-tab="main"
                  aria-selected="true">
            <i class="fas fa-comments"></i>
            Диалог
          </button>
          <button class="tabs__button" 
                  role="tab" 
                  data-tab="grammar">
            <i class="fas fa-book"></i>
            Грамматика
            <span class="tabs__badge">${(this.lessonData.grammar || []).length}</span>
          </button>
          <button class="tabs__button" 
                  role="tab" 
                  data-tab="exercises">
            <i class="fas fa-dumbbell"></i>
            Упражнения
            <span class="tabs__badge">${(this.lessonData.exercises || []).length}</span>
          </button>
        </div>
      </nav>
    `;
  }

  generateContentHTML() {
    return `
      <div class="tabs__content-wrapper">
        <div class="tabs__content tabs__content--active" data-content="main">
          ${this.generateDialogHTML()}
        </div>
        <div class="tabs__content" data-content="grammar">
          ${this.generateGrammarHTML()}
        </div>
        <div class="tabs__content" data-content="exercises">
          ${this.generateExercisesHTML()}
        </div>
      </div>
    `;
  }

  generateDialogHTML() {
    if (!this.lessonData.content) {
      return '<p>Нет диалога для отображения</p>';
    }
    
    const charactersHTML = this.generateCharactersHTML();
    const dialogHTML = this.generateDialogLinesHTML();
    
    return `
      <div class="dialog-section">
        ${charactersHTML}
        
        <div class="dialog-controls">
          <div class="translation-toggle">
            <label>
              <input type="checkbox" id="show-translations" class="sr-only">
              <span class="toggle-switch" role="switch" aria-checked="false" data-state="off"></span>
              <span class="translation-toggle__state" data-state="off">Выкл</span>
              <span class="translation-toggle__label">Показать переводы</span>
            </label>
          </div>

          <div class="audio-controls">
            <button class="btn btn--primary btn--icon-left" id="play-all-dialog" type="button" title="Воспроизвести весь диалог">
              <span class="btn__icon" aria-hidden="true">
                <i class="fas fa-play"></i>
              </span>
              <span class="btn__label">Воспроизвести диалог</span>
            </button>
          </div>
        </div>
        
        <div class="dialog-progress">
          <div class="dialog-progress__bar" style="width: 0%"></div>
        </div>
        
        <div class="dialog-container">
          ${dialogHTML}
        </div>
      </div>
    `;
  }

  generateCharactersHTML() {
    if (!this.lessonData.characters) return '';

    const charactersHTML = this.lessonData.characters
      .map(char => `
        <div class="dialog-character-card dialog-character">
          <div class="dialog-character-card__name">${char.name}</div>
          <div class="dialog-character-card__translation">${char.translation}</div>
        </div>
      `)
      .join('');

    return `
      <div class="dialog-characters">
        ${charactersHTML}
      </div>
    `;
  }

  generateDialogLinesHTML() {
    return this.lessonData.content
      .map((line, index) => {
        const speaker = line.speaker || '';
        const wordsHTML = (line.words || [])
          .map(word => {
            // ИСПРАВЛЕНО: Получаем перевод асинхронно, но показываем загрузку
            const wordKey = word.wordKey || word.text.toLowerCase();
            return `
              <span class="clickable-word" 
                    data-word-key="${wordKey}"
                    data-translation="Загрузка..."
                    title="Нажмите для подробностей">
                ${word.text}
              </span>
            `;
          })
          .join(' ');
          
        return `
          <div class="dialog-line"
               data-speaker="${speaker.toLowerCase()}"
               data-line-index="${index}">

            <div class="dialog-speaker">
              <span class="dialog-speaker-name">${speaker}</span>
              <button class="audio-play-btn"
                      data-text="${line.sentence}"
                      title="Озвучить"
                      aria-label="Озвучить реплику"
                      type="button">
                <i class="fas fa-volume-up" aria-hidden="true"></i>
              </button>
            </div>
            
            <div class="dialog-text clickable-sentence" 
                 data-translation="${line.translation}">
              ${wordsHTML}
            </div>
            
            <div class="dialog-translation">
              <p class="text-transcription">${line.transcryption || ''}</p>
              <p class="text-russian">${line.translation}</p>
            </div>
          </div>
        `;
      })
      .join('');
  }

  generateGrammarHTML() {
    if (!this.lessonData.grammar || this.lessonData.grammar.length === 0) {
      return '<p>Для этого урока нет грамматических тем.</p>';
    }
    
    return this.lessonData.grammar
      .map(topic => `
        <div class="grammar-topic">
          <h4 class="grammar-topic__title">${topic.title}</h4>
          <div class="grammar-topic__content">
            ${topic.content}
          </div>
        </div>
      `)
      .join('');
  }

  generateExercisesHTML() {
    if (!this.lessonData.exercises || this.lessonData.exercises.length === 0) {
      return '<p>Для этого урока нет упражнений.</p>';
    }

    return `<div class="exercises-container" data-exercises='${JSON.stringify(this.lessonData.exercises)}'></div>`;
  }

  initializeComponents() {
    console.log('🔧 Инициализируем компоненты урока');

    // Инициализируем табы
    const tabsElement = this.container.querySelector('[data-tabs="lesson-tabs"]');
    if (tabsElement) {
      this.tabs = new TabsComponent(tabsElement);
    }
    
    // Инициализируем упражнения
    const exercisesContainer = this.container.querySelector('.exercises-container');
    if (exercisesContainer && this.lessonData.exercises && this.lessonData.exercises.length > 0) {
      try {
        const exercisesData = JSON.parse(exercisesContainer.dataset.exercises);
        this.exercises = new ExercisesComponent(exercisesContainer, exercisesData);
      } catch (error) {
        console.error('Ошибка инициализации упражнений:', error);
      }
    }
    
    // Инициализируем обработчики кликабельных элементов
    if (this.dictionary && this.modal) {
      this.clickableWords = new ClickableWordsHandler({
        container: this.container,
        dictionary: this.dictionary,
        modal: this.modal
      });
      
      // ИСПРАВЛЕНО: Загружаем переводы для всех слов после инициализации
      this.loadWordTranslations();
    }
    
    if (this.modal && this.speech && this.dictionary) {
      this.dialogLines = new DialogLinesHandler({
        container: this.container,
        modal: this.modal,
        speech: this.speech,
        dictionary: this.dictionary
      });
    }
  }

  // НОВЫЙ МЕТОД: Загружает переводы для всех кликабельных слов
  async loadWordTranslations() {
    const clickableWords = this.container.querySelectorAll('.clickable-word');
    
    for (const wordElement of clickableWords) {
      const wordKey = wordElement.dataset.wordKey;
      if (wordKey) {
        try {
          const translation = await this.getWordTranslation(wordKey);
          wordElement.dataset.translation = translation;
          wordElement.setAttribute('title', translation);
        } catch (error) {
          console.warn('Не удалось загрузить перевод для слова:', wordKey);
          wordElement.dataset.translation = 'Перевод недоступен';
        }
      }
    }
  }

  async getWordTranslation(wordKey) {
    if (!this.dictionary || !wordKey) {
      return 'Словарь не инициализирован';
    }
    
    try {
      // Убеждаемся, что словарь инициализирован
      if (!this.dictionary.isInitialized) {
        await this.dictionary.init();
      }
      
      // Получаем данные слова
      const wordData = await this.dictionary.getWord(wordKey);
      return wordData?.translations?.ru || 'Нет перевода';
    } catch (error) {
      console.warn('Ошибка получения перевода для слова:', wordKey, error);
      return 'Ошибка загрузки';
    }
  }

  setupEventListeners() {
    // Переключатель переводов
    const translationToggle = this.container.querySelector('#show-translations');
    if (translationToggle) {
      translationToggle.addEventListener('change', (e) => {
        this.toggleTranslations(e.target.checked);
      });
      this.toggleTranslations(translationToggle.checked);
    }
    
    // Аудио кнопки
    this.container.addEventListener('click', (e) => {
      const playBtn = e.target.closest('.audio-play-btn');
      if (playBtn) {
        const text = playBtn.dataset.text;
        this.playAudio(text, playBtn);
      }
      
      const playAllBtn = e.target.closest('#play-all-dialog');
      if (playAllBtn) {
        this.playAllDialog(playAllBtn);
      }
    });
  }

  toggleTranslations(show) {
    const dialogContainer = this.container.querySelector('.dialog-container');
    const toggleSwitch = this.container.querySelector('.toggle-switch');
    const stateLabel = this.container.querySelector('.translation-toggle__state');

    if (dialogContainer) {
      dialogContainer.classList.toggle('show-translations', show);
    }

    if (toggleSwitch) {
      toggleSwitch.classList.toggle('toggle-switch--active', show);
      toggleSwitch.setAttribute('aria-checked', show ? 'true' : 'false');
      toggleSwitch.dataset.state = show ? 'on' : 'off';
    }

    if (stateLabel) {
      stateLabel.dataset.state = show ? 'on' : 'off';
      stateLabel.textContent = show ? 'Вкл' : 'Выкл';
    }
  }

  async playAudio(text, button) {
    if (!this.speech || !text) return;

    button.classList.add('audio-play-btn--playing');

    try {
      await this.speech.speak(text);
    } catch (error) {
      console.error('Ошибка воспроизведения аудио:', error);
    } finally {
      button.classList.remove('audio-play-btn--playing');
    }
  }

  async playAllDialog(playButton) {
    console.log('🎵 Воспроизведение всего диалога пока не реализовано');
  }

  trackLessonStart() {
    if (this.storage && this.lessonId) {
      try {
        this.storage.updateLessonProgress(this.lessonId, {
          started: true,
          lastAccessed: Date.now()
        });
      } catch (error) {
        console.warn('Не удалось отследить начало урока:', error);
      }
    }
  }

  renderError(message) {
    console.error('💥 Рендерим ошибку урока:', message);
    
    if (this.container) {
      this.container.innerHTML = `
        <div class="error-message">
          <h3>Ошибка загрузки урока</h3>
          <p>${message}</p>
          <div class="error-actions">
            <a href="#/categories" class="btn btn--primary" data-router-link>
              Вернуться к категориям
            </a>
            <button onclick="window.location.reload()" class="btn btn--outline">
              Обновить страницу
            </button>
          </div>
        </div>
      `;
    }
  }

  destroy() {
    if (this.tabs) this.tabs.destroy?.();
    if (this.exercises) this.exercises.destroy?.();
    if (this.clickableWords) this.clickableWords.destroy?.();
    if (this.dialogLines) this.dialogLines.destroy?.();
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}