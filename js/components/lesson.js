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
    this.tabs = null;
    this.exercises = null;
    this.clickableWords = null;
    this.dialogLines = null;
  }

  async render() {
    console.log('📖 LessonComponent: начинаем рендер');
    
    // Получаем ID урока из URL
    this.lessonId = this.getLessonIdFromUrl();
    
    if (!this.lessonId) {
      console.error('❌ ID урока не найден в URL');
      this.renderError('ID урока не указан');
      return;
    }

    this.container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    try {
      console.log('📚 Загружаем урок:', this.lessonId);
      
      // Загружаем данные урока
      this.lessonData = await this.api.getLesson(this.lessonId);
      
      console.log('✅ Данные урока загружены:', this.lessonData.title);
      
      // Рендерим урок
      this.renderLesson();
      
      // Инициализируем компоненты
      this.initializeComponents();
      
      // Настраиваем обработчики событий
      this.setupEventListeners();
      
      // Отслеживаем прогресс
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

  renderLesson() {
    // Обновляем заголовок страницы
    document.title = `${this.lessonData.title} - Polish Learning Hub`;
    
    // Генерируем HTML урока
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
      
    return `
      <header class="lesson-header-box">
        <a href="#/categories" class="btn btn--outline mb-4" data-router-link>&larr; Назад к урокам</a>
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
      <div class="tabs__content tabs__content--active" data-content="main">
        ${this.generateDialogHTML()}
      </div>
      <div class="tabs__content" data-content="grammar">
        ${this.generateGrammarHTML()}
      </div>
      <div class="tabs__content" data-content="exercises">
        ${this.generateExercisesHTML()}
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
              <span class="toggle-switch" role="switch" aria-checked="false"></span>
              <span class="ml-3">Показать переводы</span>
            </label>
          </div>
          
          <div class="audio-controls">
            <button class="btn btn--primary btn--icon" id="play-all-dialog" title="Воспроизвести весь диалог">
              <i class="fas fa-play"></i>
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
        <div class="dialog-character">
          <h4 class="dialog-character__name">${char.name}</h4>
          <p class="dialog-character__translation">${char.translation}</p>
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
        const wordsHTML = (line.words || [])
          .map(word => `
            <span class="clickable-word" 
                  data-word-key="${word.wordKey}"
                  data-translation="${this.getWordTranslation(word.wordKey)}">
              ${word.text}
            </span>
          `)
          .join(' ');
          
        return `
          <div class="dialog-line" 
               data-speaker="${line.speaker.toLowerCase()}"
               data-line-index="${index}">
            
            <div class="dialog-speaker">
              ${line.speaker}
              <button class="audio-play-btn ml-auto" 
                      data-text="${line.sentence}"
                      title="Озвучить">
                <i class="fas fa-volume-up"></i>
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
    const tabsElement = this.container.querySelector('[data-tabs]');
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

  setupEventListeners() {
    // Переключатель переводов
    const translationToggle = this.container.querySelector('#show-translations');
    if (translationToggle) {
      translationToggle.addEventListener('change', (e) => {
        this.toggleTranslations(e.target.checked);
      });
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

  getWordTranslation(wordKey) {
    if (!this.dictionary || !wordKey) {
      return 'Нет перевода';
    }
    
    try {
      const wordData = this.dictionary.getWord(wordKey);
      return wordData?.translations?.ru || 'Нет перевода';
    } catch (error) {
      console.warn('Ошибка получения перевода для слова:', wordKey, error);
      return 'Нет перевода';
    }
  }

  toggleTranslations(show) {
    const dialogContainer = this.container.querySelector('.dialog-container');
    const toggleSwitch = this.container.querySelector('.toggle-switch');

    if (dialogContainer) {
      dialogContainer.classList.toggle('show-translations', show);
    }
    
    if (toggleSwitch) {
      toggleSwitch.classList.toggle('toggle-switch--active', show);
      toggleSwitch.setAttribute('aria-checked', show);
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