/**
 * ExerciseService
 * Application service for managing exercises and results
 */
export class ExerciseService {
  constructor(storageAdapter) {
    this.storageAdapter = storageAdapter;
    this.currentExercise = null;
    this.currentAnswers = new Map();
  }

  /**
   * Start an exercise
   * @param {Exercise} exercise
   */
  startExercise(exercise) {
    this.currentExercise = exercise;
    this.currentAnswers.clear();
  }

  /**
   * Submit an answer for a question
   * @param {number} questionId
   * @param {*} answer
   * @returns {boolean} - Whether answer is correct
   */
  submitAnswer(questionId, answer) {
    if (!this.currentExercise) {
      throw new Error('No active exercise');
    }

    const isCorrect = this.currentExercise.checkAnswer(questionId, answer);
    this.currentAnswers.set(questionId, {
      answer,
      isCorrect,
      timestamp: new Date().toISOString()
    });

    return isCorrect;
  }

  /**
   * Get user's answer for a question
   * @param {number} questionId
   * @returns {Object|null}
   */
  getAnswer(questionId) {
    return this.currentAnswers.get(questionId) || null;
  }

  /**
   * Get all current answers
   * @returns {Map}
   */
  getAllAnswers() {
    return this.currentAnswers;
  }

  /**
   * Complete the exercise and save results
   * @param {string} lessonId
   * @returns {Object} - Exercise results
   */
  completeExercise(lessonId) {
    if (!this.currentExercise) {
      throw new Error('No active exercise');
    }

    const results = this.calculateResults();

    // Save results
    this.storageAdapter.saveExerciseResult(
      lessonId,
      this.currentExercise.getType(),
      {
        ...results,
        completedAt: new Date().toISOString()
      }
    );

    return results;
  }

  /**
   * Calculate exercise results
   * @returns {Object}
   */
  calculateResults() {
    const totalQuestions = this.currentExercise.getQuestions().length;
    let correctAnswers = 0;

    this.currentAnswers.forEach(answer => {
      if (answer.isCorrect) {
        correctAnswers++;
      }
    });

    const percentage = totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

    return {
      type: this.currentExercise.getType(),
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      percentage,
      passed: percentage >= 70, // 70% pass threshold
      answers: Array.from(this.currentAnswers.entries()).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans.answer,
        isCorrect: ans.isCorrect
      }))
    };
  }

  /**
   * Get exercise results for a lesson
   * @param {string} lessonId
   * @returns {Object}
   */
  getExerciseResults(lessonId) {
    return this.storageAdapter.getExerciseResults(lessonId);
  }

  /**
   * Check if exercise type is completed for a lesson
   * @param {string} lessonId
   * @param {string} exerciseType
   * @returns {boolean}
   */
  isExerciseCompleted(lessonId, exerciseType) {
    const results = this.getExerciseResults(lessonId);
    return Boolean(results && results[exerciseType]);
  }

  /**
   * Get completion status for all exercises in a lesson
   * @param {Array<Exercise>} exercises
   * @param {string} lessonId
   * @returns {Object}
   */
  getCompletionStatus(exercises, lessonId) {
    const results = this.getExerciseResults(lessonId) || {};
    const status = {};

    exercises.forEach(exercise => {
      const type = exercise.getType();
      status[type] = {
        completed: Boolean(results[type]),
        result: results[type] || null
      };
    });

    return status;
  }

  /**
   * Reset exercise answers
   */
  resetAnswers() {
    this.currentAnswers.clear();
  }

  /**
   * Get current exercise
   * @returns {Exercise|null}
   */
  getCurrentExercise() {
    return this.currentExercise;
  }

  /**
   * Check if all questions are answered
   * @returns {boolean}
   */
  areAllQuestionsAnswered() {
    if (!this.currentExercise) return false;

    const totalQuestions = this.currentExercise.getQuestions().length;
    return this.currentAnswers.size === totalQuestions;
  }

  /**
   * Get progress percentage for current exercise
   * @returns {number}
   */
  getProgressPercentage() {
    if (!this.currentExercise) return 0;

    const totalQuestions = this.currentExercise.getQuestions().length;
    if (totalQuestions === 0) return 100;

    return Math.round((this.currentAnswers.size / totalQuestions) * 100);
  }
}
