export class WordDetailsHandler {
  constructor({ dictionary, modal, speech, storage }) {
    this.dictionary = dictionary;
    this.modal = modal;
    this.speech = speech;
    this.storage = storage;
    
    this.currentWord = null;
    this.studyMode = false;
    this.flashcardIndex = 0;
    this.relatedWords = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Слушаем события от модального окна
    document.addEventListener('word-modal-opened', (e) => {
      this.handleWordModalOpened(e.detail);
    });

    // Слушаем клавиатурные сокращения
    document.addEventListener('keydown', (e) => {
      if (this.modal.isOpen && this.currentWord) {
        this.handleKeyboardShortcuts(e);
      }
    });
  }

  async handleWordModalOpened(wordData) {
    this.currentWord = wordData;
    await this.loadRelatedWords();
    this.setupModalInteractions();
  }

  /**
   * Загружает связанные слова
   */
  async loadRelatedWords() {
    if (!this.currentWord) return;

    try {
      // Получаем слова того же типа
      this.relatedWords = this.dictionary.getRelatedWords(this.currentWord.lemma);
      
      // Обновляем секцию связанных слов в модальном окне
      this.updateRelatedWordsSection();
    } catch (error) {
      console.error('Ошибка загрузки связанных слов:', error);
    }
  }

  setupModalInteractions() {
    const modalBody = this.modal.modal.querySelector('.modal__body');
    if (!modalBody) return;

    // Добавляем обработчики для интерактивных элементов
    this.setupFormChallenges(modalBody);
    this.setupPronunciationPractice(modalBody);
    this.setupProgressTracking(modalBody);
    this.setupStudyNotes(modalBody);
  }

  /**
   * Настраивает интерактивные задания с формами слов
   */
  setupFormChallenges(container) {
    const inflectionSection = container.querySelector('.inflection-section');
    if (!inflectionSection || !this.currentWord.inflection) return;

    // Создаем кнопку для тренировки форм
    const practiceButton = document.createElement('button');
    practiceButton.className = 'btn btn--outline btn--small';
    practiceButton.innerHTML = '<i class="fas fa-dumbbell"></i> Тренировать формы';
    practiceButton.addEventListener('click', () => this.startFormsPractice());

    const sectionTitle = inflectionSection.querySelector('.modal-section__title');
    if (sectionTitle) {
      sectionTitle.appendChild(practiceButton);
    }
  }

  /**
   * Настраивает практику произношения
   */
  setupPronunciationPractice(container) {
    const pronunciationSection = container.querySelector('.pronunciation-section');
    if (!pronunciationSection) return;

    // Добавляем кнопку записи произношения
    const recordButton = document.createElement('button');
    recordButton.className = 'btn btn--secondary btn--small';
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Записать произношение';
    recordButton.addEventListener('click', () => this.startPronunciationRecording());

    pronunciationSection.appendChild(recordButton);
  }

  /**
   * Настраивает отслеживание прогресса изучения слова
   */
  setupProgressTracking(container) {
    const wordProgress = this.storage.getWordProgress(this.currentWord.lemma);
    
    // Создаем секцию прогресса
    const progressSection = document.createElement('div');
    progressSection.className = 'modal-section word-progress-section';
    progressSection.innerHTML = `
      <h4 class="modal-section__title">
        <i class="fas fa-chart-line"></i>
        Прогресс изучения
      </h4>
      <div class="word-progress">
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-value">${wordProgress.viewCount || 0}</span>
            <span class="stat-label">Просмотров</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${wordProgress.practiceCount || 0}</span>
            <span class="stat-label">Тренировок</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${this.calculateMasteryLevel(wordProgress)}%</span>
            <span class="stat-label">Освоение</span>
          </div>
        </div>
        <div class="learning-actions">
          <button class="btn btn--primary btn--small mark-known-btn">
            <i class="fas fa-check"></i>
            ${wordProgress.isKnown ? 'Изучено' : 'Отметить как изученное'}
          </button>
          <button class="btn btn--outline btn--small add-to-study-btn">
            <i class="fas fa-bookmark"></i>
            Добавить в изучение
          </button>
        </div>
      </div>
    `;

    // Добавляем обработчики
    const markKnownBtn = progressSection.querySelector('.mark-known-btn');
    const addToStudyBtn = progressSection.querySelector('.add-to-study-btn');

    markKnownBtn.addEventListener('click', () => this.toggleWordKnown());
    addToStudyBtn.addEventListener('click', () => this.addToStudyList());

    container.appendChild(progressSection);
  }

  /**
   * Настраивает заметки пользователя
   */
  setupStudyNotes(container) {
    const existingNotes = this.storage.getWordNotes(this.currentWord.lemma);
    
    const notesSection = document.createElement('div');
    notesSection.className = 'modal-section word-notes-section';
    notesSection.innerHTML = `
      <h4 class="modal-section__title">
        <i class="fas fa-sticky-note"></i>
        Мои заметки
      </h4>
      <div class="word-notes">
        <textarea class="notes-textarea" 
                  placeholder="Добавьте свои заметки об этом слове...">${existingNotes || ''}</textarea>
        <div class="notes-actions">
          <button class="btn btn--primary btn--small save-notes-btn">
            <i class="fas fa-save"></i>
            Сохранить
          </button>
          <button class="btn btn--outline btn--small clear-notes-btn">
            <i class="fas fa-trash"></i>
            Очистить
          </button>
        </div>
      </div>
    `;

    // Обработчики для заметок
    const textarea = notesSection.querySelector('.notes-textarea');
    const saveBtn = notesSection.querySelector('.save-notes-btn');
    const clearBtn = notesSection.querySelector('.clear-notes-btn');

    saveBtn.addEventListener('click', () => {
      this.storage.saveWordNotes(this.currentWord.lemma, textarea.value);
      this.showNotification('Заметки сохранены', 'success');
    });

    clearBtn.addEventListener('click', () => {
      if (confirm('Удалить все заметки для этого слова?')) {
        textarea.value = '';
        this.storage.saveWordNotes(this.currentWord.lemma, '');
        this.showNotification('Заметки удалены', 'info');
      }
    });

    // Автосохранение через 3 секунды после прекращения ввода
    let saveTimeout;
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.storage.saveWordNotes(this.currentWord.lemma, textarea.value);
      }, 3000);
    });

    container.appendChild(notesSection);
  }

  /**
   * Обновляет секцию связанных слов
   */
  updateRelatedWordsSection() {
    const modalBody = this.modal.modal.querySelector('.modal__body');
    if (!modalBody || this.relatedWords.length === 0) return;

    const relatedSection = document.createElement('div');
    relatedSection.className = 'modal-section related-words-section';
    relatedSection.innerHTML = `
      <h4 class="modal-section__title">
        <i class="fas fa-link"></i>
        Связанные слова
      </h4>
      <div class="related-words-grid">
        ${this.relatedWords.map(word => `
          <div class="related-word-item" data-word="${word.key}">
            <span class="word-text">${word.key}</span>
            <span class="word-translation">${word.translations?.ru || ''}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Добавляем обработчики клика по связанным словам
    relatedSection.addEventListener('click', (e) => {
      const wordItem = e.target.closest('.related-word-item');
      if (wordItem) {
        const wordKey = wordItem.dataset.word;
        this.loadRelatedWord(wordKey);
      }
    });

    modalBody.appendChild(relatedSection);
  }

  /**
   * Запускает тренировку форм слова
   */
  startFormsPractice() {
    if (!this.currentWord.inflection) return;

    const forms = Object.entries(this.currentWord.inflection);
    const randomForms = this.shuffleArray(forms).slice(0, 5);

    const practiceHTML = `
      <div class="forms-practice">
        <h4>Тренировка форм слова "${this.currentWord.lemma}"</h4>
        <div class="practice-questions">
          ${randomForms.map((form, index) => `
            <div class="practice-question" data-form="${form[0]}">
              <p><strong>${this.getFormName(form[0])}:</strong></p>
              <input type="text" class="form-input" data-answer="${form[1]}" placeholder="Введите форму...">
              <div class="form-feedback"></div>
            </div>
          `).join('')}
        </div>
        <div class="practice-actions">
          <button class="btn btn--primary check-forms-btn">Проверить</button>
          <button class="btn btn--outline reset-forms-btn">Сбросить</button>
        </div>
      </div>
    `;

    // Создаем модальное окно для тренировки
    this.modal.open({
      title: 'Тренировка форм',
      content: practiceHTML,
      size: 'large'
    });

    // Настраиваем обработчики
    this.setupFormsPracticeHandlers();
  }

  setupFormsPracticeHandlers() {
    const checkBtn = this.modal.modal.querySelector('.check-forms-btn');
    const resetBtn = this.modal.modal.querySelector('.reset-forms-btn');

    checkBtn.addEventListener('click', () => this.checkFormsAnswers());
    resetBtn.addEventListener('click', () => this.resetFormsPractice());
  }

  checkFormsAnswers() {
    const questions = this.modal.modal.querySelectorAll('.practice-question');
    let correct = 0;
    let total = questions.length;

    questions.forEach(question => {
      const input = question.querySelector('.form-input');
      const feedback = question.querySelector('.form-feedback');
      const correctAnswer = input.dataset.answer;
      const userAnswer = input.value.trim().toLowerCase();

      if (userAnswer === correctAnswer.toLowerCase()) {
        input.classList.add('correct');
        feedback.innerHTML = '<span class="correct-mark">✓ Правильно</span>';
        correct++;
      } else {
        input.classList.add('incorrect');
        feedback.innerHTML = `<span class="incorrect-mark">✗ Правильно: ${correctAnswer}</span>`;
      }
    });

    // Показываем результат
    const result = document.createElement('div');
    result.className = 'practice-result';
    result.innerHTML = `
      <h5>Результат: ${correct}/${total}</h5>
      <p>${this.getFormsPracticeMessage(correct, total)}</p>
    `;

    const actionsContainer = this.modal.modal.querySelector('.practice-actions');
    actionsContainer.appendChild(result);

    // Сохраняем результат
    this.storage.updateWordProgress(this.currentWord.lemma, {
      practiceCount: (this.storage.getWordProgress(this.currentWord.lemma).practiceCount || 0) + 1,
      lastPracticeScore: Math.round((correct / total) * 100),
      lastPracticeDate: Date.now()
    });
  }

  /**
   * Запускает запись произношения
   */
  async startPronunciationRecording() {
    try {
      // Проверяем поддержку записи
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Запись аудио не поддерживается в этом браузере');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Здесь можно добавить логику записи и анализа произношения
      // Пока просто показываем уведомление
      this.showNotification('Запись произношения пока в разработке', 'info');
      
      // Останавливаем поток
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Ошибка записи произношения:', error);
      this.showNotification('Ошибка доступа к микрофону', 'error');
    }
  }

  /**
   * Загружает данные связанного слова
   */
  async loadRelatedWord(wordKey) {
    try {
      const wordData = await this.dictionary.getWord(wordKey);
      if (wordData) {
        this.modal.showWord(wordData);
      }
    } catch (error) {
      console.error('Ошибка загрузки связанного слова:', error);
    }
  }

  /**
   * Переключает статус "изучено" для слова
   */
  toggleWordKnown() {
    const currentProgress = this.storage.getWordProgress(this.currentWord.lemma);
    const newStatus = !currentProgress.isKnown;
    
    this.storage.updateWordProgress(this.currentWord.lemma, {
      isKnown: newStatus,
      markedKnownDate: newStatus ? Date.now() : null
    });

    // Обновляем кнопку
    const markKnownBtn = this.modal.modal.querySelector('.mark-known-btn');
    if (markKnownBtn) {
      markKnownBtn.innerHTML = `
        <i class="fas fa-check"></i>
        ${newStatus ? 'Изучено' : 'Отметить как изученное'}
      `;
      markKnownBtn.classList.toggle('btn--success', newStatus);
    }

    this.showNotification(
      newStatus ? 'Слово отмечено как изученное' : 'Слово убрано из изученных',
      'success'
    );
  }

  /**
   * Добавляет слово в список для изучения
   */
  addToStudyList() {
    this.storage.addToStudyList(this.currentWord.lemma, {
      word: this.currentWord.lemma,
      translation: this.currentWord.translations?.ru,
      partOfSpeech: this.currentWord.part_of_speech,
      dateAdded: Date.now()
    });

    this.showNotification('Слово добавлено в список для изучения', 'success');
  }

  /**
   * Обработка клавиатурных сокращений
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + клавиши
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'p':
          e.preventDefault();
          this.speech?.speak(this.currentWord.lemma);
          break;
        case 'b':
          e.preventDefault();
          this.toggleWordKnown();
          break;
        case 's':
          e.preventDefault();
          this.addToStudyList();
          break;
      }
    }

    // Обычные клавиши
    switch (e.key) {
      case 'Escape':
        this.modal.close();
        break;
      case 'ArrowLeft':
        if (this.relatedWords.length > 0) {
          e.preventDefault();
          this.navigateToRelatedWord(-1);
        }
        break;
      case 'ArrowRight':
        if (this.relatedWords.length > 0) {
          e.preventDefault();
          this.navigateToRelatedWord(1);
        }
        break;
    }
  }

  /**
   * Навигация по связанным словам
   */
  navigateToRelatedWord(direction) {
    const currentIndex = this.relatedWords.findIndex(word => word.key === this.currentWord.lemma);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = this.relatedWords.length - 1;
    if (newIndex >= this.relatedWords.length) newIndex = 0;
    
    const nextWord = this.relatedWords[newIndex];
    if (nextWord) {
      this.loadRelatedWord(nextWord.key);
    }
  }

  // Утилиты

  calculateMasteryLevel(progress) {
    if (!progress) return 0;
    
    let score = 0;
    if (progress.viewCount > 0) score += 20;
    if (progress.viewCount >= 5) score += 20;
    if (progress.practiceCount > 0) score += 30;
    if (progress.lastPracticeScore >= 80) score += 20;
    if (progress.isKnown) score += 10;
    
    return Math.min(score, 100);
  }

  getFormName(formKey) {
    const formNames = {
      'present': 'Настоящее время',
      'past_masc': 'Прошедшее (м.р.)',
      'past_fem': 'Прошедшее (ж.р.)',
      'future': 'Будущее время',
      'sg1': '1л. ед.ч.',
      'sg2': '2л. ед.ч.',
      'sg3': '3л. ед.ч.',
      'pl1': '1л. мн.ч.',
      'pl2': '2л. мн.ч.',
      'pl3': '3л. мн.ч.',
      'nom_sg': 'И.п. ед.ч.',
      'gen_sg': 'Р.п. ед.ч.',
      'dat_sg': 'Д.п. ед.ч.',
      'acc_sg': 'В.п. ед.ч.',
      'ins_sg': 'Т.п. ед.ч.',
      'loc_sg': 'П.п. ед.ч.'
    };
    
    return formNames[formKey] || formKey;
  }

  getFormsPracticeMessage(correct, total) {
    const percentage = (correct / total) * 100;
    
    if (percentage === 100) return '🎉 Отлично! Все формы правильные!';
    if (percentage >= 80) return '👍 Очень хорошо! Почти все правильно.';
    if (percentage >= 60) return '👌 Неплохо, но есть место для улучшения.';
    if (percentage >= 40) return '📚 Нужно еще поучить формы этого слова.';
    return '💪 Не сдавайтесь! Попробуйте еще раз.';
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  showNotification(message, type = 'info') {
    // Простая реализация уведомлений
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notifications-container') || document.body;
    container.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  resetFormsPractice() {
    const inputs = this.modal.modal.querySelectorAll('.form-input');
    const feedbacks = this.modal.modal.querySelectorAll('.form-feedback');
    const result = this.modal.modal.querySelector('.practice-result');
    
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('correct', 'incorrect');
    });
    
    feedbacks.forEach(feedback => {
      feedback.innerHTML = '';
    });
    
    if (result) result.remove();
  }

  destroy() {
    this.currentWord = null;
    this.relatedWords = [];
    this.dictionary = null;
    this.modal = null;
    this.speech = null;
    this.storage = null;
  }
}