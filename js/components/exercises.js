export class ExercisesComponent {
  constructor(container, exercisesData) {
    this.container = container;
    this.exercisesData = exercisesData;
    this.exercises = [];
    this.currentExercise = 0;
    this.userAnswers = new Map();
    this.exerciseResults = new Map();
    
    this.init();
  }

  init() {
    this.renderExercises();
    this.setupEventListeners();
  }

  renderExercises() {
    if (!this.exercisesData || !this.exercisesData.length) {
      this.container.innerHTML = '<p class="text-center">Нет упражнений для отображения</p>';
      return;
    }

    const exercisesHTML = this.exercisesData
      .map((exercise, index) => this.renderExercise(exercise, index))
      .join('');

    this.container.innerHTML = exercisesHTML;
    
    // Инициализируем каждое упражнение
    this.exercisesData.forEach((exercise, index) => {
      this.initializeExercise(exercise, index);
    });
  }

  renderExercise(exercise, index) {
    const exerciseClass = `exercise exercise--${exercise.type}`;
    
    return `
      <div class="${exerciseClass}" data-exercise-index="${index}" data-exercise-type="${exercise.type}">
        <div class="exercise__header">
          <h3 class="exercise__title">${exercise.title}</h3>
          ${exercise.description ? `<p class="exercise__description">${exercise.description}</p>` : ''}
        </div>
        
        <div class="exercise__progress">
          <div class="exercise__progress-bar">
            <div class="exercise__progress-fill" style="width: 0%"></div>
          </div>
          <div class="exercise__progress-text">0 из ${exercise.questions?.length || 0} выполнено</div>
        </div>
        
        <div class="exercise__content">
          ${this.renderExerciseContent(exercise, index)}
        </div>
        
        <div class="exercise__actions">
          <button class="exercise__btn exercise__btn--check" data-action="check" data-exercise="${index}">
            <i class="fas fa-check"></i>
            Проверить ответы
          </button>
          <button class="exercise__btn exercise__btn--hint" data-action="hint" data-exercise="${index}">
            <i class="fas fa-lightbulb"></i>
            Подсказка
          </button>
          <button class="exercise__btn exercise__btn--reset" data-action="reset" data-exercise="${index}">
            <i class="fas fa-redo"></i>
            Сбросить
          </button>
        </div>
        
        <div class="exercise__feedback" data-feedback="${index}">
          <!-- Результаты будут добавлены динамически -->
        </div>
        
        <div class="exercise__hint" data-hint="${index}">
          <!-- Подсказки будут добавлены динамически -->
        </div>
      </div>
    `;
  }

  renderExerciseContent(exercise, exerciseIndex) {
    switch (exercise.type) {
      case 'fill-blank':
        return this.renderFillBlankExercise(exercise, exerciseIndex);
      case 'multiple-choice':
        return this.renderMultipleChoiceExercise(exercise, exerciseIndex);
      case 'matching':
        return this.renderMatchingExercise(exercise, exerciseIndex);
      case 'translation':
        return this.renderTranslationExercise(exercise, exerciseIndex);
      default:
        return '<p>Неизвестный тип упражнения</p>';
    }
  }

  renderFillBlankExercise(exercise, exerciseIndex) {
    return `
      <div class="exercise__questions">
        ${exercise.questions.map((question, qIndex) => `
          <div class="exercise__question" data-question="${qIndex}">
            <div class="exercise__question-text">
              <div class="fill-blank__sentence">
                ${this.renderFillBlankSentence(question.sentence, exerciseIndex, qIndex)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderFillBlankSentence(sentence, exerciseIndex, questionIndex) {
    return sentence.map((part, partIndex) => {
      if (typeof part === 'string') {
        return `<span class="fill-blank__word">${part}</span>`;
      } else if (part.blank) {
        const inputId = `blank-${exerciseIndex}-${questionIndex}-${partIndex}`;
        return `
          <input type="text" 
                 class="fill-blank__input" 
                 id="${inputId}"
                 data-answer="${part.blank}"
                 data-exercise="${exerciseIndex}"
                 data-question="${questionIndex}"
                 data-blank="${partIndex}"
                 placeholder="___"
                 autocomplete="off">
        `;
      }
      return '';
    }).join('');
  }

  renderMultipleChoiceExercise(exercise, exerciseIndex) {
    return `
      <div class="exercise__questions">
        ${exercise.questions.map((question, qIndex) => `
          <div class="exercise__question" data-question="${qIndex}">
            <div class="exercise__question-text">
              <p>${question.question}</p>
            </div>
            <div class="multiple-choice__options">
              ${question.options.map((option, oIndex) => `
                <label class="multiple-choice__option" data-option="${oIndex}">
                  <div class="multiple-choice__radio"></div>
                  <input type="radio" 
                         name="mc-${exerciseIndex}-${qIndex}" 
                         value="${oIndex}"
                         data-exercise="${exerciseIndex}"
                         data-question="${qIndex}"
                         style="display: none;">
                  <span class="multiple-choice__text">${option}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderMatchingExercise(exercise, exerciseIndex) {
    return `
      <div class="exercise__questions">
        <div class="matching__container">
          <div class="matching__column" data-column="left">
            <h4>Соедините</h4>
            ${exercise.leftItems.map((item, index) => `
              <div class="matching__item" 
                   data-exercise="${exerciseIndex}"
                   data-type="left"
                   data-index="${index}"
                   data-value="${item}">
                ${item}
              </div>
            `).join('')}
          </div>
          
          <div class="matching__column" data-column="right">
            <h4>С соответствием</h4>
            ${exercise.rightItems.map((item, index) => `
              <div class="matching__item"
                   data-exercise="${exerciseIndex}"
                   data-type="right" 
                   data-index="${index}"
                   data-value="${item}">
                ${item}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderTranslationExercise(exercise, exerciseIndex) {
    return `
      <div class="exercise__questions">
        ${exercise.questions.map((question, qIndex) => `
          <div class="exercise__question" data-question="${qIndex}">
            <div class="exercise__question-text">
              <p><strong>Переведите:</strong> ${question.text}</p>
            </div>
            <div class="translation__input">
              <textarea class="form__textarea" 
                       data-exercise="${exerciseIndex}"
                       data-question="${qIndex}"
                       placeholder="Введите ваш перевод..."
                       rows="3"></textarea>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  initializeExercise(exercise, index) {
    switch (exercise.type) {
      case 'multiple-choice':
        this.initializeMultipleChoice(index);
        break;
      case 'matching':
        this.initializeMatching(index);
        break;
    }
  }

  initializeMultipleChoice(exerciseIndex) {
    const exerciseElement = this.container.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    const options = exerciseElement.querySelectorAll('.multiple-choice__option');
    
    options.forEach(option => {
      option.addEventListener('click', () => {
        const radio = option.querySelector('input[type="radio"]');
        const questionOptions = option.parentElement.querySelectorAll('.multiple-choice__option');
        
        // Снимаем выделение с других опций
        questionOptions.forEach(opt => opt.classList.remove('multiple-choice__option--selected'));
        
        // Выделяем выбранную опцию
        option.classList.add('multiple-choice__option--selected');
        radio.checked = true;
        
        this.updateProgress(exerciseIndex);
      });
    });
  }

  initializeMatching(exerciseIndex) {
    const exerciseElement = this.container.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    const items = exerciseElement.querySelectorAll('.matching__item');
    let selectedItem = null;
    let matches = new Map();
    
    items.forEach(item => {
      item.addEventListener('click', () => {
        if (item.classList.contains('matching__item--matched')) return;
        
        if (selectedItem === item) {
          // Отменяем выбор
          item.classList.remove('matching__item--selected');
          selectedItem = null;
          return;
        }
        
        if (selectedItem) {
          const selectedType = selectedItem.dataset.type;
          const currentType = item.dataset.type;
          
          if (selectedType !== currentType) {
            // Создаем связь
            this.createMatch(selectedItem, item, matches, exerciseIndex);
            selectedItem.classList.remove('matching__item--selected');
            selectedItem = null;
          } else {
            // Выбираем новый элемент того же типа
            selectedItem.classList.remove('matching__item--selected');
            item.classList.add('matching__item--selected');
            selectedItem = item;
          }
        } else {
          // Выбираем элемент
          item.classList.add('matching__item--selected');
          selectedItem = item;
        }
      });
    });
  }

  createMatch(item1, item2, matches, exerciseIndex) {
    const leftItem = item1.dataset.type === 'left' ? item1 : item2;
    const rightItem = item1.dataset.type === 'right' ? item1 : item2;
    
    // Сохраняем связь
    matches.set(leftItem.dataset.index, rightItem.dataset.index);
    
    // Визуально отмечаем как связанные
    leftItem.classList.add('matching__item--matched');
    rightItem.classList.add('matching__item--matched');
    
    // Сохраняем ответ пользователя
    this.saveUserAnswer(exerciseIndex, 'matching', matches);
    this.updateProgress(exerciseIndex);
  }

  setupEventListeners() {
    // Обработчики кнопок действий
    this.container.addEventListener('click', (e) => {
      const button = e.target.closest('.exercise__btn');
      if (!button) return;
      
      const action = button.dataset.action;
      const exerciseIndex = parseInt(button.dataset.exercise);
      
      switch (action) {
        case 'check':
          this.checkExercise(exerciseIndex);
          break;
        case 'hint':
          this.showHint(exerciseIndex);
          break;
        case 'reset':
          this.resetExercise(exerciseIndex);
          break;
      }
    });

    // Обработчики ввода для отслеживания прогресса
    this.container.addEventListener('input', (e) => {
      const input = e.target;
      const exerciseIndex = parseInt(input.dataset.exercise);
      
      if (!isNaN(exerciseIndex)) {
        this.updateProgress(exerciseIndex);
      }
    });

    // Автосохранение ответов
    this.container.addEventListener('input', (e) => {
      this.autoSaveAnswers(e.target);
    });
  }

  checkExercise(exerciseIndex) {
    const exercise = this.exercisesData[exerciseIndex];
    const result = this.evaluateExercise(exercise, exerciseIndex);
    
    this.exerciseResults.set(exerciseIndex, result);
    this.showExerciseResult(exerciseIndex, result);
    this.trackExerciseCompletion(exerciseIndex, result);
  }

  evaluateExercise(exercise, exerciseIndex) {
    switch (exercise.type) {
      case 'fill-blank':
        return this.evaluateFillBlank(exercise, exerciseIndex);
      case 'multiple-choice':
        return this.evaluateMultipleChoice(exercise, exerciseIndex);
      case 'matching':
        return this.evaluateMatching(exercise, exerciseIndex);
      case 'translation':
        return this.evaluateTranslation(exercise, exerciseIndex);
      default:
        return { score: 0, total: 0, feedback: 'Неизвестный тип упражнения' };
    }
  }

  evaluateFillBlank(exercise, exerciseIndex) {
    const inputs = this.container.querySelectorAll(`[data-exercise="${exerciseIndex}"].fill-blank__input`);
    let correct = 0;
    let total = inputs.length;
    
    inputs.forEach(input => {
      const userAnswer = input.value.trim().toLowerCase();
      const correctAnswer = input.dataset.answer.toLowerCase();
      
      if (userAnswer === correctAnswer) {
        input.classList.add('fill-blank__input--correct');
        input.classList.remove('fill-blank__input--incorrect');
        correct++;
      } else {
        input.classList.add('fill-blank__input--incorrect');
        input.classList.remove('fill-blank__input--correct');
      }
    });
    
    return {
      score: correct,
      total: total,
      percentage: Math.round((correct / total) * 100),
      feedback: this.generateFeedback(correct, total)
    };
  }

  evaluateMultipleChoice(exercise, exerciseIndex) {
    const questions = exercise.questions;
    let correct = 0;
    let total = questions.length;
    
    questions.forEach((question, qIndex) => {
      const selectedRadio = this.container.querySelector(
        `input[name="mc-${exerciseIndex}-${qIndex}"]:checked`
      );
      
      const option = selectedRadio?.closest('.multiple-choice__option');
      if (!option) return;
      
      const selectedValue = parseInt(selectedRadio.value);
      const correctAnswer = question.correctAnswer;
      
      if (selectedValue === correctAnswer) {
        option.classList.add('multiple-choice__option--correct');
        correct++;
      } else {
        option.classList.add('multiple-choice__option--incorrect');
        // Показываем правильный ответ
        const correctOption = option.parentElement.children[correctAnswer];
        if (correctOption) {
          correctOption.classList.add('multiple-choice__option--correct');
        }
      }
    });
    
    return {
      score: correct,
      total: total,
      percentage: Math.round((correct / total) * 100),
      feedback: this.generateFeedback(correct, total)
    };
  }

  evaluateMatching(exercise, exerciseIndex) {
    const userAnswers = this.userAnswers.get(exerciseIndex);
    if (!userAnswers) {
      return { score: 0, total: exercise.correctMatches.length, percentage: 0, feedback: 'Нет ответов' };
    }
    
    let correct = 0;
    const total = exercise.correctMatches.length;
    
    exercise.correctMatches.forEach(match => {
      const userMatch = userAnswers.get(match.left.toString());
      if (userMatch === match.right.toString()) {
        correct++;
      }
    });
    
    return {
      score: correct,
      total: total,
      percentage: Math.round((correct / total) * 100),
      feedback: this.generateFeedback(correct, total)
    };
  }

  evaluateTranslation(exercise, exerciseIndex) {
    // Упрощенная оценка перевода (можно улучшить с помощью NLP)
    const textareas = this.container.querySelectorAll(`[data-exercise="${exerciseIndex}"] textarea`);
    let score = 0;
    let total = textareas.length;
    
    textareas.forEach((textarea, index) => {
      const userTranslation = textarea.value.trim().toLowerCase();
      const question = exercise.questions[index];
      const acceptableAnswers = question.acceptableAnswers.map(ans => ans.toLowerCase());
      
      // Проверяем точное совпадение или частичное
      if (acceptableAnswers.some(ans => ans === userTranslation)) {
        score += 1;
      } else if (acceptableAnswers.some(ans => this.calculateSimilarity(ans, userTranslation) > 0.7)) {
        score += 0.5;
      }
    });
    
    return {
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100),
      feedback: this.generateTranslationFeedback(score, total)
    };
  }

  calculateSimilarity(str1, str2) {
    // Простой расчет схожести (можно улучшить)
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  generateFeedback(correct, total) {
    const percentage = (correct / total) * 100;
    
    if (percentage === 100) {
      return '🎉 Отлично! Все ответы правильные!';
    } else if (percentage >= 80) {
      return '👍 Очень хорошо! Почти все правильно.';
    } else if (percentage >= 60) {
      return '👌 Неплохо, но есть место для улучшения.';
    } else if (percentage >= 40) {
      return '📚 Нужно еще поучить материал.';
    } else {
      return '💪 Не сдавайтесь! Попробуйте еще раз.';
    }
  }

  generateTranslationFeedback(score, total) {
    if (score === total) {
      return '🎯 Превосходный перевод!';
    } else if (score >= total * 0.8) {
      return '✨ Очень хороший перевод!';
    } else if (score >= total * 0.6) {
      return '👍 Хороший перевод с небольшими неточностями.';
    } else {
      return '📖 Перевод требует доработки. Обратите внимание на грамматику и выбор слов.';
    }
  }

  showExerciseResult(exerciseIndex, result) {
    const feedbackElement = this.container.querySelector(`[data-feedback="${exerciseIndex}"]`);
    
    const feedbackClass = result.percentage >= 80 ? 'success' : 
                         result.percentage >= 60 ? 'partial' : 'error';
    
    feedbackElement.className = `exercise__feedback exercise__feedback--${feedbackClass} exercise__feedback--show`;
    feedbackElement.innerHTML = `
      <div class="exercise__score">
        <i class="fas fa-chart-pie"></i>
        Результат: ${result.score}/${result.total} (${result.percentage}%)
      </div>
      <div class="exercise__message">
        ${result.feedback}
      </div>
    `;
    
    // Анимация появления
    setTimeout(() => {
      feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  showHint(exerciseIndex) {
    const exercise = this.exercisesData[exerciseIndex];
    const hintElement = this.container.querySelector(`[data-hint="${exerciseIndex}"]`);
    
    if (exercise.hint) {
      hintElement.innerHTML = exercise.hint;
      hintElement.classList.add('exercise__hint--show');
    } else {
      hintElement.innerHTML = 'Подсказка недоступна для этого упражнения.';
      hintElement.classList.add('exercise__hint--show');
    }
    
    // Отслеживаем использование подсказки
    this.trackHintUsage(exerciseIndex);
  }

  resetExercise(exerciseIndex) {
    const exerciseElement = this.container.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    
    // Очищаем все поля ввода
    const inputs = exerciseElement.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('fill-blank__input--correct', 'fill-blank__input--incorrect');
    });
    
    // Сбрасываем состояние множественного выбора
    const options = exerciseElement.querySelectorAll('.multiple-choice__option');
    options.forEach(option => {
      option.classList.remove(
        'multiple-choice__option--selected',
        'multiple-choice__option--correct', 
        'multiple-choice__option--incorrect'
      );
    });
    
    // Сбрасываем состояние сопоставления
    const matchingItems = exerciseElement.querySelectorAll('.matching__item');
    matchingItems.forEach(item => {
      item.classList.remove(
        'matching__item--selected',
        'matching__item--matched',
        'matching__item--correct',
        'matching__item--incorrect'
      );
    });
    
    // Скрываем результаты и подсказки
    const feedback = exerciseElement.querySelector('.exercise__feedback');
    const hint = exerciseElement.querySelector('.exercise__hint');
    
    feedback.classList.remove('exercise__feedback--show');
    hint.classList.remove('exercise__hint--show');
    
    // Сбрасываем прогресс
    this.updateProgress(exerciseIndex);
    
    // Удаляем сохраненные ответы
    this.userAnswers.delete(exerciseIndex);
    this.exerciseResults.delete(exerciseIndex);
  }

  updateProgress(exerciseIndex) {
    const exercise = this.exercisesData[exerciseIndex];
    const exerciseElement = this.container.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    
    let completed = 0;
    let total = 0;
    
    switch (exercise.type) {
      case 'fill-blank':
        const inputs = exerciseElement.querySelectorAll('.fill-blank__input');
        total = inputs.length;
        completed = Array.from(inputs).filter(input => input.value.trim()).length;
        break;
        
      case 'multiple-choice':
        total = exercise.questions.length;
        completed = exerciseElement.querySelectorAll('input[type="radio"]:checked').length;
        break;
        
      case 'matching':
        total = exercise.leftItems.length;
        completed = exerciseElement.querySelectorAll('.matching__item--matched').length / 2;
        break;
        
      case 'translation':
        const textareas = exerciseElement.querySelectorAll('textarea');
        total = textareas.length;
        completed = Array.from(textareas).filter(textarea => textarea.value.trim()).length;
        break;
    }
    
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    // Обновляем визуальный прогресс
    const progressFill = exerciseElement.querySelector('.exercise__progress-fill');
    const progressText = exerciseElement.querySelector('.exercise__progress-text');
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${completed} из ${total} выполнено`;
  }

  saveUserAnswer(exerciseIndex, type, answer) {
    this.userAnswers.set(exerciseIndex, answer);
  }

  autoSaveAnswers(input) {
    // Автоматически сохраняем ответы в localStorage
    const exerciseIndex = parseInt(input.dataset.exercise);
    if (isNaN(exerciseIndex)) return;
    
    const savedAnswers = JSON.parse(localStorage.getItem('exerciseAnswers') || '{}');
    
    if (!savedAnswers[exerciseIndex]) {
      savedAnswers[exerciseIndex] = {};
    }
    
    if (input.classList.contains('fill-blank__input')) {
      const questionIndex = input.dataset.question;
      const blankIndex = input.dataset.blank;
      savedAnswers[exerciseIndex][`${questionIndex}-${blankIndex}`] = input.value;
    }
    
    localStorage.setItem('exerciseAnswers', JSON.stringify(savedAnswers));
  }

  loadSavedAnswers() {
    const savedAnswers = JSON.parse(localStorage.getItem('exerciseAnswers') || '{}');
    
    Object.entries(savedAnswers).forEach(([exerciseIndex, answers]) => {
      Object.entries(answers).forEach(([key, value]) => {
        const input = this.container.querySelector(`[data-exercise="${exerciseIndex}"][data-question="${key.split('-')[0]}"][data-blank="${key.split('-')[1]}"]`);
        if (input) {
          input.value = value;
        }
      });
    });
  }

  // Методы отслеживания

  trackExerciseCompletion(exerciseIndex, result) {
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.trackEvent('exercise_completed', {
        exerciseIndex,
        exerciseType: this.exercisesData[exerciseIndex].type,
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        timestamp: Date.now()
      });
    }
  }

  trackHintUsage(exerciseIndex) {
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.trackEvent('hint_used', {
        exerciseIndex,
        exerciseType: this.exercisesData[exerciseIndex].type,
        timestamp: Date.now()
      });
    }
  }

  // Публичные методы

  /**
   * Получает общую статистику по упражнениям
   * @returns {Object}
   */
  getOverallStats() {
    const totalExercises = this.exercisesData.length;
    const completedExercises = this.exerciseResults.size;
    let totalScore = 0;
    let maxScore = 0;
    
    this.exerciseResults.forEach(result => {
      totalScore += result.score;
      maxScore += result.total;
    });
    
    return {
      totalExercises,
      completedExercises,
      totalScore,
      maxScore,
      averagePercentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      completionRate: Math.round((completedExercises / totalExercises) * 100)
    };
  }

  /**
   * Экспортирует результаты упражнений
   * @returns {Object}
   */
  exportResults() {
    const results = {};
    
    this.exerciseResults.forEach((result, index) => {
      results[index] = {
        exercise: this.exercisesData[index],
        result: result,
        timestamp: Date.now()
      };
    });
    
    return results;
  }

  destroy() {
    // Очищаем ссылки
    this.container = null;
    this.exercisesData = null;
    this.exercises = [];
    this.userAnswers.clear();
    this.exerciseResults.clear();
  }
}