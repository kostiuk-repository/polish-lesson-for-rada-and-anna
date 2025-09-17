export class DialogLinesHandler {
  constructor({ container, modal, speech, dictionary }) {
    this.container = container;
    this.modal = modal;
    this.speech = speech;
    this.dictionary = dictionary; 
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
    // Обробник кліків по реченнях
    this.container.addEventListener('click', (e) => {
      const clickableSentence = e.target.closest('.clickable-sentence');
      if (clickableSentence) {
        e.preventDefault();
        e.stopPropagation();
        this.handleSentenceClick(e, clickableSentence);
      }
    });

    // Обробник подвійного кліку для швидкого відтворення
    this.container.addEventListener('dblclick', (e) => {
      const dialogLine = e.target.closest('.dialog-line');
      if (dialogLine) {
        e.preventDefault();
        this.playDialogLine(dialogLine);
      }
    });

    // Обробник правого кліку для контекстного меню
    this.container.addEventListener('contextmenu', (e) => {
      const dialogLine = e.target.closest('.dialog-line');
      if (dialogLine) {
        e.preventDefault();
        this.showContextMenu(e, dialogLine);
      }
    });

    // Обробник клавіатури для навігації по діалогу
    document.addEventListener('keydown', (e) => {
      if (this.container.contains(document.activeElement)) {
        this.handleKeyboardNavigation(e);
      }
    });
  }

  setupProgressTracking() {
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

    const dialogLines = this.container.querySelectorAll('.dialog-line');
    dialogLines.forEach(line => observer.observe(line));
  }

  handleSentenceClick(event, sentenceElement) {
    if (event.target.closest('.clickable-word')) {
      return;
    }
    const dialogLine = sentenceElement.closest('.dialog-line');
    if (!dialogLine) return;

    const translation = sentenceElement.dataset.translation;
    const lineIndex = parseInt(dialogLine.dataset.lineIndex);
    
    this.showSentenceDetails(sentenceElement, translation, lineIndex);
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
    
    // Прив'язуємо обробники до кнопок футера
    this.setupModalFooterActions(polishText);
  }
  
  setupModalFooterActions(text) {
      const modal = document.getElementById('modal');
      if (!modal) return;
      
      const playBtn = modal.querySelector('.footer-play-btn');
      const copyBtn = modal.querySelector('.footer-copy-btn');

      if(playBtn) {
          playBtn.onclick = () => this.speech.speak(text);
      }
      if(copyBtn) {
          copyBtn.onclick = () => this.copyLineText({ querySelector: () => ({ textContent: text }) });
      }
  }

  generateSentenceDetailsHTML({ polish, russian, speaker, lineIndex }) {
    const words = Array.from(this.container.querySelectorAll(`[data-line-index="${lineIndex}"] .clickable-word`));
    const wordAnalysisHTML = words.map(wordEl => {
        const word = wordEl.textContent;
        const wordKey = wordEl.dataset.wordKey;
        const translation = this.dictionary.getWord(wordKey)?.translations?.ru || 'Нет перевода';
        return `<li><strong>${word}</strong> - ${translation}</li>`;
    }).join('');

    return `
      <div class="sentence-details">
        <div class="modal-section">
            <h4 class="modal-section__title">Предложение</h4>
            <div class="original-text">
                <p class="text-polish" style="font-size: 1.2em;">${polish}</p>
            </div>
            <div class="translated-text">
                <p class="text-russian">${russian}</p>
            </div>
        </div>

        <div class="modal-section">
            <h4 class="modal-section__title">Разбор слов</h4>
            <ul class="word-breakdown-list">
                ${wordAnalysisHTML}
            </ul>
        </div>
        
        <div class="modal-section">
            <h4 class="modal-section__title">Произношение</h4>
            <div class="pronunciation-guide">
                ${this.generatePronunciationGuide(polish)}
            </div>
        </div>
      </div>
    `;
  }

  generateSentenceFooter(text) {
    return `
      <button class="btn btn--primary footer-play-btn">
        <i class="fas fa-volume-up"></i>
        Прослушать
      </button>
      <button class="btn btn--outline footer-copy-btn">
        <i class="fas fa-copy"></i>
        Скопировать
      </button>
    `;
  }

  generateGrammarBreakdown(sentence) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    
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
    const transcription = this.dictionary ? this.dictionary.applyPhoneticRules(sentence) : this.generateTranscription(sentence);
    
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
    if (sentence.includes('?')) return 'Вопросительное предложение';
    if (sentence.includes('!')) return 'Восклицательное предложение';
    if (sentence.includes(',')) return 'Сложное предложение';
    return 'Простое повествовательное предложение';
  }

  generateTranscription(text) {
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
      dialogLine.classList.add('dialog-line--playing');
      
      await this.speech.speak(text);
      
      this.trackLinePlayback(lineIndex, speaker);
      
    } catch (error) {
      console.error('Ошибка воспроизведения строки диалога:', error);
    } finally {
      this.isPlaying = false;
      dialogLine.classList.remove('dialog-line--playing');
      this.currentLine = null;
    }
  }

  copyLineText(dialogLine) {
    const text = dialogLine.querySelector('.dialog-text').textContent.trim();
    
    navigator.clipboard.writeText(text).then(() => {
        this.showNotification('Текст скопирован в буфер обмена');
    });
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

  trackLineView(lineIndex) {
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.trackEvent('line_viewed', {
        lineIndex,
        timestamp: Date.now(),
        context: 'dialog'
      });
    }
  }

  trackSentenceClick(lineIndex) {
    if (window.PolishApp?.storage) {
        window.PolishApp.storage.trackEvent('sentence_clicked', {
            lineIndex,
            timestamp: Date.now(),
            context: 'dialog'
        });
    }
  }

  showContextMenu(_event, _dialogLine) {
    // TODO: Implement custom context menu actions for dialog lines.
  }

  handleKeyboardNavigation(_event) {
    // TODO: Implement keyboard navigation between dialog lines.
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

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification--success';
    notification.textContent = message;
    
    const container = document.getElementById('notifications-container') || document.body;
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  destroy() {
    this.container = null;
    this.modal = null;
    this.speech = null;
    this.dictionary = null;
  }
}