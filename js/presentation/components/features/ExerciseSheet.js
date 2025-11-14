import { Button } from '../base/Button.js';
import { Input } from '../base/Input.js';
import { Badge } from '../base/Badge.js';

/**
 * ExerciseSheet Component
 * Feature component for rendering and managing exercises
 */
export class ExerciseSheet {
  constructor(exerciseService) {
    this.exerciseService = exerciseService;
    this.element = null;
    this.exercise = null;
    this.onComplete = null;
  }

  /**
   * Create exercise sheet
   * @param {Object} options
   * @returns {HTMLElement}
   */
  create({
    exercise,
    onComplete = null,
    className = ''
  } = {}) {
    this.exercise = exercise;
    this.onComplete = onComplete;

    this.exerciseService.startExercise(exercise);

    const container = document.createElement('div');
    container.className = `exercise-sheet ${className}`.trim();

    // Header
    const header = document.createElement('div');
    header.className = 'exercise-header';

    const title = document.createElement('h2');
    title.textContent = exercise.getTitle();
    header.appendChild(title);

    const typeBadge = Badge.create({
      text: this.formatType(exercise.getType()),
      type: 'info'
    });
    header.appendChild(typeBadge);

    container.appendChild(header);

    // Exercise content
    const content = this.createExerciseContent(exercise);
    container.appendChild(content);

    // Submit button
    const submitBtn = Button.create({
      text: 'Check Answers',
      type: 'primary',
      onClick: () => this.submitExercise(),
      className: 'exercise-submit'
    });
    container.appendChild(submitBtn);

    this.element = container;
    this.submitButton = submitBtn;

    return container;
  }

  /**
   * Create exercise content based on type
   * @param {Exercise} exercise
   * @returns {HTMLElement}
   */
  createExerciseContent(exercise) {
    const type = exercise.getType();

    switch (type) {
      case 'fill-blank':
        return this.createFillBlankExercise(exercise);
      case 'multiple-choice':
        return this.createMultipleChoiceExercise(exercise);
      case 'reorder':
        return this.createReorderExercise(exercise);
      case 'transform':
        return this.createTransformExercise(exercise);
      case 'translate':
        return this.createTranslateExercise(exercise);
      default:
        return document.createElement('div');
    }
  }

  /**
   * Create fill-in-the-blank exercise
   * @param {Exercise} exercise
   * @returns {HTMLElement}
   */
  createFillBlankExercise(exercise) {
    const container = document.createElement('div');
    container.className = 'exercise-fill-blank';

    exercise.getQuestions().forEach(question => {
      const questionEl = document.createElement('div');
      questionEl.className = 'exercise-question';

      const sentence = document.createElement('p');

      question.sentence.forEach(part => {
        if (typeof part === 'string') {
          sentence.appendChild(document.createTextNode(part + ' '));
        } else if (part.blank) {
          const input = Input.create({
            placeholder: '...',
            className: 'fill-blank-input',
            onChange: (e) => {
              this.exerciseService.submitAnswer(question.id, e.target.value);
            }
          });
          input.dataset.questionId = question.id;
          sentence.appendChild(input);
        }
      });

      questionEl.appendChild(sentence);
      container.appendChild(questionEl);
    });

    return container;
  }

  /**
   * Create multiple choice exercise
   * @param {Exercise} exercise
   * @returns {HTMLElement}
   */
  createMultipleChoiceExercise(exercise) {
    const container = document.createElement('div');
    container.className = 'exercise-multiple-choice';

    exercise.getQuestions().forEach(question => {
      const questionEl = document.createElement('div');
      questionEl.className = 'exercise-question';

      const questionText = document.createElement('p');
      questionText.className = 'question-text';
      questionText.textContent = question.question;
      questionEl.appendChild(questionText);

      const options = document.createElement('div');
      options.className = 'question-options';

      question.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'option-label';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `question-${question.id}`;
        radio.value = option;
        radio.addEventListener('change', () => {
          this.exerciseService.submitAnswer(question.id, option);
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + option));
        options.appendChild(label);
      });

      questionEl.appendChild(options);
      container.appendChild(questionEl);
    });

    return container;
  }

  /**
   * Create reorder exercise (placeholder)
   * @param {Exercise} exercise
   * @returns {HTMLElement}
   */
  createReorderExercise(exercise) {
    const container = document.createElement('div');
    container.className = 'exercise-reorder';
    container.innerHTML = '<p>Reorder exercise - Implementation pending</p>';
    return container;
  }

  /**
   * Create transform exercise (placeholder)
   * @param {Exercise} exercise
   * @returns {HTMLElement}
   */
  createTransformExercise(exercise) {
    const container = document.createElement('div');
    container.className = 'exercise-transform';
    container.innerHTML = '<p>Transform exercise - Implementation pending</p>';
    return container;
  }

  /**
   * Create translate exercise
   * @param {Exercise} exercise
   * @returns {HTMLElement}
   */
  createTranslateExercise(exercise) {
    const container = document.createElement('div');
    container.className = 'exercise-translate';

    exercise.getQuestions().forEach(question => {
      const questionEl = document.createElement('div');
      questionEl.className = 'exercise-question';

      const questionText = document.createElement('p');
      questionText.textContent = question.ru || question.en;
      questionEl.appendChild(questionText);

      const input = Input.create({
        placeholder: 'Your translation...',
        onChange: (e) => {
          this.exerciseService.submitAnswer(question.id, e.target.value);
        }
      });
      input.dataset.questionId = question.id;

      questionEl.appendChild(input);
      container.appendChild(questionEl);
    });

    return container;
  }

  /**
   * Submit exercise and show results
   */
  submitExercise() {
    if (!this.exerciseService.areAllQuestionsAnswered()) {
      alert('Please answer all questions before submitting.');
      return;
    }

    const results = this.exerciseService.calculateResults();
    this.showResults(results);

    if (this.onComplete) {
      this.onComplete(results);
    }
  }

  /**
   * Show exercise results
   * @param {Object} results
   */
  showResults(results) {
    const resultsEl = document.createElement('div');
    resultsEl.className = 'exercise-results';

    const score = document.createElement('h3');
    score.textContent = `Score: ${results.correctAnswers}/${results.totalQuestions} (${results.percentage}%)`;
    resultsEl.appendChild(score);

    const status = document.createElement('p');
    status.className = results.passed ? 'result-passed' : 'result-failed';
    status.textContent = results.passed ? '✅ Passed!' : '❌ Try again';
    resultsEl.appendChild(status);

    // Show in modal or insert into page
    if (this.element) {
      this.element.appendChild(resultsEl);
    }

    // Disable submit button
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Completed';
    }
  }

  /**
   * Format exercise type
   * @param {string} type
   * @returns {string}
   */
  formatType(type) {
    const typeMap = {
      'fill-blank': 'Fill in the Blank',
      'multiple-choice': 'Multiple Choice',
      'reorder': 'Reorder',
      'transform': 'Transform',
      'translate': 'Translation',
      'cases': 'Cases'
    };
    return typeMap[type] || type;
  }

  /**
   * Reset exercise
   */
  reset() {
    this.exerciseService.resetAnswers();
    // Re-render would go here
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
