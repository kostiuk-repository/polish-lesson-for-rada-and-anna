export class DialogLinesHandler {
  constructor({ container, modal, speech }) {
    this.container = container;
    this.modal = modal;
    this.speech = speech;
    this.currentLine = null;
    this.isPlaying = false;
    this.playbackQueue = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupProgressTracking();
  }

  setupEventListeners() {
    // Обработчик кликов по предложениям
    this.container.addEventListener('click', (e) => {
      const clickableSentence = e.target.closest('.clickable-sentence');
      if (clickableSentence) {
        e.preventDefault();
        e.stopPropagation();
        this.handleSentenceClick(clickableSentence);
      }
    });

    // Обработчик двойного клика для быстрого воспроизведения
    this.container.addEventListener('dblclick', (e) => {
      const dialogLine = e.target.closest('.dialog-line');
      if (dialogLine) {
        e.preventDefault();
        this.playDialogLine(dialogLine);
      }
    });

    // Обработчик правого клика для контекстного меню
    this.container.addEventListener('contextmenu', (e) => {
      const dialogLine = e.target.closest('.dialog-line');
      if (dialogLine) {
        e.preventDefault();
        this.showContextMenu(e, dialogLine);
      }
    });

    // Обработчик клавиатуры для навигации по диалогу
    document.addEventListener('keydown', (e) => {
      if (this.container.contains(document.activeElement)) {
        this.handleKeyboardNavigation(e);
      }
    });
  }

  setupProgressTracking() {
    // Отслеживаем прогресс чтения диалога
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lineElement = entry.target;
          this.markLineAsViewed(lineElement);
        }
      });
    }, {
      threshold: 0.7,
      rootMargin: '0px 0px -50% 0px'
    });

    // Наблюдаем за всеми строками диалога
    const dialogLines = this.container.querySelectorAll('.dialog-line');
    dialogLines.forEach(line => observer.observe(line));
  }

  handleSentenceClick(sentenceElement) {
    const dialogLine = sentenceElement.closest('.dialog-line');
    if (!dialogLine) return;

    const translation = sentenceElement.dataset.translation;
    const lineIndex = parseInt(dialogLine.dataset.lineIndex);
    
    // Показываем детальную информацию о предложении
    this.showSentenceDetails(sentenceElement, translation, lineIndex);
    
    // Отслеживаем взаимодействие
    this.trackSentenceClick(lineIndex);
  }

  showSentenceDetails(sentenceElement, translation, lineIndex) {
    const polishText = sentenceElement.textContent.trim();
    const speaker = sentenceElement.closest('.dialog-line').querySelector('.dialog-speaker').textContent.trim();
    
    const content = this.generateSentenceDetailsHTML({
      polish: polishText,
      russian: translation,
      speaker,
      lineIndex
    });

    this.modal.open({
      title: `${speaker}: Предложение ${lineIndex + 1}`,
      content,
      size: 'default',
      footer: this.generateSentenceFooter(polishText)
    });
  }

  generateSentenceDetailsHTML({ polish, russian, speaker, lineIndex }) {
    return `
      <div class="sentence-details">
        <div class="sentence-header">
          <div class="speaker-info">
            <h4 class="speaker-name">${speaker}</h4>
            <span class="sentence-number">Предложение ${lineIndex + 1}</span>
          </div>
        </div>
        
        <div class="sentence-content">
          <div class="original-text">
            <h5>Польский текст:</h5>
            <p class="text-polish">${polish}</p>
          </div>
          
          <div class="translated-text">
            <h5>Перевод:</h5>
            <p class="text-russian">${russian}</p>
          </div>
        </div>
        
        <div class="sentence-analysis">
          <h5>Анализ предложения:</h5>
          <div class="grammar-breakdown">
            ${this.generateGrammarBreakdown(polish)}
          </div>
        </div>
        
        <div class="pronunciation-section">
          <h5>Произношение:</h5>
          <div class="pronunciation-guide">
            ${this.generatePronunciationGuide(polish)}
          </div>
        </div>
      </div>
    `;
  }

  generateSentenceFooter(text) {
    return `
      <button class="btn btn--primary" onclick="this.closest('.modal').__handler.playText('${text}')">
        <i class="fas fa-volume-up"></i>
        Прослушать
      </button>
      <button class="btn btn--outline" onclick="this.closest('.modal').__handler.copyText('${text}')">
        <i class="fas fa-copy"></i>
        Скопировать
      </button>
    `;
  }

  generateGrammarBreakdown(sentence) {
    // Простой анализ структуры предложения
    const words = sentence.split(' ');
    
    return `
      <div class="word-breakdown">
        ${words.map((word, index) => `
          <span class="word-item" data-word="${word.toLowerCase().replace(/[.,!?;]/g, '')}">
            <span class="word-text">${word}</span>
            <span class="word-info">слово ${index + 1}</span>
          </span>
        `).join('')}
      </div>
      <div class="sentence-structure">
        <p><strong>Структура:</strong> ${this.analyzeSentenceStructure(sentence)}</p>
      </div>
    `;
  }

  generatePronunciationGuide(sentence) {
    // Базовая транскрипция (можно улучшить)
    const transcription = this.generateTranscription(sentence);
    
    return `
      <div class="transcription">
        <span class="transcription-text">[${transcription}]</span>
      </div>
      <div class="pronunciation-tips">
        <p><strong>Совет:</strong> Обратите внимание на ударения и звуки 'ą', 'ę', 'ć', 'ł'</p>
      </div>
    `;
  }

  analyzeSentenceStructure(sentence) {
    // Простой анализ (можно расширить)
    if (sentence.includes('?')) return 'Вопросительное предложение';
    if (sentence.includes('!')) return 'Восклицательное предложение';
    if (sentence.includes(',')) return 'Сложное предложение';
    return 'Простое повествовательное предложение';
  }

  generateTranscription(text) {
    // Базовые правила транскрипции
    return text.toLowerCase()
      .replace(/ą/g, 'о̃')
      .replace(/ę/g, 'э̃')
      .replace(/ć/g, 'чь')
      .replace(/ś/g, 'шь')
      .replace(/ź/g, 'жь')
      .replace(/ń/g, 'нь')
      .replace(/ł/g, 'у')
      .replace(/rz/g, 'ж')
      .replace(/cz/g, 'ч')
      .replace(/sz/g, 'ш')
      .replace(/dż/g, 'дж')
      .replace(/dź/g, 'джь');
  }

  async playDialogLine(dialogLine) {
    if (!this.speech || this.isPlaying) return;

    const lineIndex = parseInt(dialogLine.dataset.lineIndex);
    const speaker = dialogLine.querySelector('.dialog-speaker').textContent.trim();
    const text = dialogLine.querySelector('.dialog-text').textContent.trim();

    try {
      this.isPlaying = true;
      this.currentLine = dialogLine;
      
      // Визуальная обратная связь
      dialogLine.classList.add('dialog-line--playing');
      
      // Воспроизводим текст
      await this.speech.speak(text);
      
      // Отслеживаем воспроизведение
      this.trackLinePlayback(lineIndex, speaker);
      
    } catch (error) {
      console.error('Ошибка воспроизведения строки диалога:', error);
    } finally {
      this.isPlaying = false;
      dialogLine.classList.remove('dialog-line--playing');
      this.currentLine = null;
    }
  }

  async playEntireDialog() {
    const dialogLines = this.container.querySelectorAll('.dialog-line');
    if (!dialogLines.length || this.isPlaying) return;

    this.playbackQueue = Array.from(dialogLines);
    await this.processPlaybackQueue();
  }

  async processPlaybackQueue() {
    if (this.playbackQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const line = this.playbackQueue.shift();
    
    await this.playDialogLine(line);
    
    // Пауза между строками
    await this.delay(1000);
    
    // Продолжаем воспроизведение
    await this.processPlaybackQueue();
  }

  stopPlayback() {
    this.isPlaying = false;
    this.playbackQueue = [];
    
    if (this.speech && this.speech.stop) {
      this.speech.stop();
    }
    
    // Убираем визуальные эффекты
    const playingLines = this.container.querySelectorAll('.dialog-line--playing');
    playingLines.forEach(line => line.classList.remove('dialog-line--playing'));
  }

  handleKeyboardNavigation(e) {
    const dialogLines = Array.from(this.container.querySelectorAll('.dialog-line'));
    const currentLine = e.target.closest('.dialog-line');
    
    if (!currentLine) return;
    
    const currentIndex = dialogLines.indexOf(currentLine);
    let targetIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = Math.max(0, currentIndex - 1);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = Math.min(dialogLines.length - 1, currentIndex + 1);
        break;
        
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
        
      case 'End':
        e.preventDefault();
        targetIndex = dialogLines.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.playDialogLine(currentLine);
        return;
        
      case 'Escape':
        e.preventDefault();
        this.stopPlayback();
        return;
    }

    if (targetIndex !== currentIndex) {
      const targetLine = dialogLines[targetIndex];
      if (targetLine) {
        targetLine.focus();
        targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  showContextMenu(event, dialogLine) {
    // Создаем контекстное меню
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="context-menu__item" data-action="play">
        <i class="fas fa-play"></i>
        Воспроизвести
      </div>
      <div class="context-menu__item" data-action="details">
        <i class="fas fa-info-circle"></i>
        Подробности
      </div>
      <div class="context-menu__item" data-action="copy">
        <i class="fas fa-copy"></i>
        Скопировать текст
      </div>
      <div class="context-menu__item" data-action="translate">
        <i class="fas fa-language"></i>
        Показать/скрыть перевод
      </div>
    `;

    // Позиционируем меню
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.zIndex = '1000';

    document.body.appendChild(menu);

    // Обработчики действий
    menu.addEventListener('click', (e) => {
      const action = e.target.closest('.context-menu__item')?.dataset.action;
      
      switch (action) {
        case 'play':
          this.playDialogLine(dialogLine);
          break;
        case 'details':
          const sentence = dialogLine.querySelector('.clickable-sentence');
          this.handleSentenceClick(sentence);
          break;
        case 'copy':
          this.copyLineText(dialogLine);
          break;
        case 'translate':
          this.toggleLineTranslation(dialogLine);
          break;
      }
      
      menu.remove();
    });

    // Удаляем меню при клике вне его
    const removeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', removeMenu);
    }, 0);
  }

  copyLineText(dialogLine) {
    const text = dialogLine.querySelector('.dialog-text').textContent.trim();
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    this.showNotification('Текст скопирован в буфер обмена');
  }

  toggleLineTranslation(dialogLine) {
    const translation = dialogLine.querySelector('.dialog-translation');
    if (translation) {
      translation.classList.toggle('dialog-translation--visible');
    }
  }

  markLineAsViewed(lineElement) {
    lineElement.classList.add('dialog-line--viewed');
    
    const lineIndex = parseInt(lineElement.dataset.lineIndex);
    this.trackLineView(lineIndex);
  }

  // Методы отслеживания

  trackSentenceClick(lineIndex) {
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.trackEvent('sentence_clicked', {
        lineIndex,
        timestamp: Date.now(),
        context: 'dialog'
      });
    }
  }

  trackLinePlayback(lineIndex, speaker) {
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.trackEvent('line_played', {
        lineIndex,
        speaker,
        timestamp: Date.now(),
        context: 'dialog'
      });
    }
  }

  trackLineView(lineIndex) {
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.trackEvent('line_viewed', {
        lineIndex,
        timestamp: Date.now(),
        context: 'dialog'
      });
    }
  }

  // Утилиты

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showNotification(message) {
    // Простое уведомление (можно улучшить)
    const notification = document.createElement('div');
    notification.className = 'notification notification--success';
    notification.textContent = message;
    
    const container = document.getElementById('notifications-container') || document.body;
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Публичные методы

  /**
   * Получает статистику по диалогу
   * @returns {Object}
   */
  getDialogStats() {
    const dialogLines = this.container.querySelectorAll('.dialog-line');
    const viewedLines = this.container.querySelectorAll('.dialog-line--viewed');
    
    return {
      totalLines: dialogLines.length,
      viewedLines: viewedLines.length,
      progress: Math.round((viewedLines.length / dialogLines.length) * 100)
    };
  }

  /**
   * Сбрасывает прогресс просмотра диалога
   */
  resetProgress() {
    const viewedLines = this.container.querySelectorAll('.dialog-line--viewed');
    viewedLines.forEach(line => line.classList.remove('dialog-line--viewed'));
  }

  /**
   * Переходит к определенной строке диалога
   * @param {number} lineIndex - индекс строки
   */
  goToLine(lineIndex) {
    const dialogLines = this.container.querySelectorAll('.dialog-line');
    const targetLine = dialogLines[lineIndex];
    
    if (targetLine) {
      targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetLine.focus();
    }
  }

  destroy() {
    // Останавливаем воспроизведение
    this.stopPlayback();
    
    // Удаляем контекстные меню
    const contextMenus = document.querySelectorAll('.context-menu');
    contextMenus.forEach(menu => menu.remove());
    
    // Очищаем ссылки
    this.container = null;
    this.modal = null;
    this.speech = null;
    this.currentLine = null;
    this.playbackQueue = [];
  }
}