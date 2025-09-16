import { TabsComponent } from './tabs.js';
import { ModalComponent } from './modal.js';
import { ExercisesComponent } from './exercises.js';
import { ClickableWordsHandler } from '../ui/clickable-words.js';
import { DialogLinesHandler } from '../ui/dialog-lines.js';

export class LessonComponent {
  constructor({ lessonId, api, dictionary, speech, storage }) {
    this.lessonId = lessonId;
    this.api = api;
    this.dictionary = dictionary;
    this.speech = speech;
    this.storage = storage;
    
    this.container = null;
    this.lessonData = null;
    this.tabs = null;
    this.modal = null;
    this.exercises = null;
    this.clickableWords = null;
    this.dialogLines = null;
    this.currentlyPlaying = {
        button: null,
        text: ''
    };
    this.isDialogPlaying = false;
  }

  async render() {
    try {
      // Находим контейнеры
      this.setupContainers();
      
      // Загружаем данные урока
      this.lessonData = await this.api.getLesson(this.lessonId);
      
      // Рендерим урок
      this.renderLesson();
      
      // Инициализируем компоненты
      this.initializeComponents();
      
      // Настраиваем обработчики событий
      this.setupEventListeners();
      
      // Отслеживаем прогресс
      this.trackLessonStart();
      
      console.log('✅ Урок отрендерен:', this.lessonId);
    } catch (error) {
      console.error('❌ Ошибка рендеринга урока:', error);
      this.renderError(error.message);
    }
  }

  setupContainers() {
    // Скрываем каталог, показываем урок
    const catalogSection = document.getElementById('catalog-section');
    const lessonSection = document.getElementById('lesson-section');
    
    if (catalogSection) catalogSection.style.display = 'none';
    if (lessonSection) {
      lessonSection.style.display = 'block';
      this.container = document.getElementById('lesson-container');
    }
    
    if (!this.container) {
      throw new Error('Контейнер урока не найден');
    }
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
      ${this.generateHeaderHTML()}
      ${this.generateTabsHTML()}
      ${this.generateContentHTML()}
    `;
  }

  generateHeaderHTML() {
    const tags = this.lessonData.tags
      .map(tag => `<span class="tag">#${tag}</span>`)
      .join('');
      
    return `
      <header class="lesson-header-box">
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
      <nav class="tabs lesson-tabs" data-tabs="lesson-tabs">
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
            <span class="tabs__badge">${this.lessonData.grammar?.length || 0}</span>
          </button>
          <button class="tabs__button" 
                  role="tab" 
                  data-tab="exercises">
            <i class="fas fa-dumbbell"></i>
            Упражнения
            <span class="tabs__badge">${this.lessonData.exercises?.length || 0}</span>
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
    if (!this.lessonData.content) return '<p>Нет диалога для отображения</p>';
    
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
        const wordsHTML = line.words
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
              ${line.translation}
            </div>
          </div>
        `;
      })
      .join('');
  }

  generateGrammarHTML() {
    if (!this.lessonData.grammar) return '<p>Нет грамматических тем</p>';
    
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
    if (!this.lessonData.exercises) return '<p>Нет упражнений</p>';
    
    return `<div class="exercises-container" data-exercises='${JSON.stringify(this.lessonData.exercises)}'></div>`;
  }

  initializeComponents() {
    // Инициализируем табы
    this.tabs = new TabsComponent(this.container.querySelector('[data-tabs]'));
    
    // Инициализируем модальное окно
    this.modal = new ModalComponent();
    
    // Инициализируем упражнения
    const exercisesContainer = this.container.querySelector('.exercises-container');
    if (exercisesContainer) {
      const exercisesData = JSON.parse(exercisesContainer.dataset.exercises);
      this.exercises = new ExercisesComponent(exercisesContainer, exercisesData);
    }
    
    // Инициализируем обработчики кликабельных элементов
    this.clickableWords = new ClickableWordsHandler({
      container: this.container,
      dictionary: this.dictionary,
      modal: this.modal
    });
    
    this.dialogLines = new DialogLinesHandler({
      container: this.container,
      modal: this.modal,
      speech: this.speech,
      dictionary: this.dictionary
    });
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
      if (e.target.closest('.audio-play-btn')) {
        const btn = e.target.closest('.audio-play-btn');
        const text = btn.dataset.text;
        this.playAudio(text, btn);
      }
      
      if (e.target.closest('#play-all-dialog')) {
        this.playAllDialog();
      }
    });
    
    // Кнопка "Назад к каталогу"
    this.setupBackNavigation();
  }

  setupBackNavigation() {
    // Добавляем кнопку возврата к каталогу
    const backButton = document.createElement('button');
    backButton.className = 'btn btn--outline mb-6';
    backButton.innerHTML = '<i class="fas fa-arrow-left mr-2"></i>Назад к каталогу';
    backButton.addEventListener('click', () => {
      window.location.hash = '';
    });
    
    this.container.insertBefore(backButton, this.container.firstChild);
  }

  getWordTranslation(wordKey) {
    const wordData = this.dictionary.getWord(wordKey);
    return wordData?.translations?.ru || 'Нет перевода';
  }

  toggleTranslations(show) {
    const translations = this.container.querySelectorAll('.dialog-translation');
    const toggle = this.container.querySelector('.toggle-switch');
    
    translations.forEach(translation => {
      if (show) {
        translation.classList.add('dialog-translation--visible');
      } else {
        translation.classList.remove('dialog-translation--visible');
      }
    });
    
    if (toggle) {
      toggle.classList.toggle('toggle-switch--active', show);
      toggle.setAttribute('aria-checked', show);
    }
    
    // Сохраняем настройку
    this.storage.setUserPreference('showTranslations', show);
  }

  async playAudio(text, button) {
    if (!text || !this.speech) return;

    const playIcon = '<i class="fas fa-volume-up"></i>';
    const pauseIcon = '<i class="fas fa-pause"></i>';
    const resumeIcon = '<i class="fas fa-play"></i>';

    // Если кликнули на другую кнопку во время воспроизведения
    if (this.currentlyPlaying.button && this.currentlyPlaying.button !== button) {
        this.currentlyPlaying.button.innerHTML = playIcon;
        this.currentlyPlaying.button.disabled = false;
        this.speech.stop();
    }
    
    this.currentlyPlaying.button = button;
    this.currentlyPlaying.text = text;

    try {
      if (this.speech.isSpeaking()) {
        this.speech.pause();
        button.innerHTML = resumeIcon;
      } else if (this.speech.isPaused()) {
        this.speech.resume();
        button.innerHTML = pauseIcon;
      } else {
        button.disabled = true;
        button.innerHTML = pauseIcon;
        await this.speech.speak(text);
        // Когда воспроизведение закончится само
        button.innerHTML = playIcon;
        button.disabled = false;
        this.currentlyPlaying.button = null;
      }
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
      button.innerHTML = playIcon; // Reset on error
      button.disabled = false;
      this.currentlyPlaying.button = null;
    }
  }

  async playAllDialog() {
    const playButton = this.container.querySelector('#play-all-dialog');
    
    if (this.isDialogPlaying) {
        this.stopAllDialog(playButton);
        return;
    }

    this.isDialogPlaying = true;
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    
    const progressBar = this.container.querySelector('.dialog-progress__bar');
    const dialogLines = this.container.querySelectorAll('.dialog-line');

    try {
        for (let i = 0; i < dialogLines.length; i++) {
            if (!this.isDialogPlaying) break; // Прерываем цикл, если нажали стоп

            const line = dialogLines[i];
            const sentence = line.querySelector('.dialog-text').textContent.trim();

            if (sentence) {
                line.classList.add('dialog-line--playing');
                await this.speech.speak(sentence);
                line.classList.remove('dialog-line--playing');

                const progress = ((i + 1) / dialogLines.length) * 100;
                progressBar.style.width = `${progress}%`;
            }
            await this.delay(500); // Пауза между репликами
        }
    } catch(error) {
        console.error('Ошибка воспроизведения диалога:', error);
    } finally {
        this.stopAllDialog(playButton);
    }
  }

  stopAllDialog(playButton) {
      this.isDialogPlaying = false;
      this.speech.stop();
      if (playButton) {
          playButton.innerHTML = '<i class="fas fa-play"></i>';
      }
      this.container.querySelectorAll('.dialog-line--playing').forEach(el => el.classList.remove('dialog-line--playing'));
      const progressBar = this.container.querySelector('.dialog-progress__bar');
      if(progressBar) progressBar.style.width = '0%';
  }

  trackLessonStart() {
    this.storage.trackEvent('lesson_started', {
      lessonId: this.lessonId,
      timestamp: Date.now()
    });
    
    // Отмечаем урок как начатый
    this.storage.updateLessonProgress(this.lessonId, {
      started: true,
      startTime: Date.now()
    });
  }

  trackLessonComplete() {
    this.storage.trackEvent('lesson_completed', {
      lessonId: this.lessonId,
      timestamp: Date.now()
    });
    
    // Отмечаем урок как завершенный
    this.storage.updateLessonProgress(this.lessonId, {
      completed: true,
      completedTime: Date.now(),
      percentage: 100
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  renderError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <h3>Ошибка загрузки урока</h3>
        <p>${message}</p>
        <button onclick="location.hash=''" class="btn btn--primary">
          Вернуться к каталогу
        </button>
      </div>
    `;
  }

  destroy() {
    // Очищаем компоненты
    this.stopAllDialog();
    if (this.tabs) this.tabs.destroy();
    if (this.modal) this.modal.destroy();
    if (this.exercises) this.exercises.destroy();
    if (this.clickableWords) this.clickableWords.destroy();
    if (this.dialogLines) this.dialogLines.destroy();
    
    // Очищаем контейнер
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}