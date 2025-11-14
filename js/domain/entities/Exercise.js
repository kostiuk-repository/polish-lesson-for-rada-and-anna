/**
 * Exercise Entity
 * Represents an exercise in a lesson
 */
export class Exercise {
  constructor({
    type,
    title,
    instructions,
    questions,
    items,
    solution
  }) {
    this.type = type; // fill-blank, multiple-choice, reorder, transform, cases, translate
    this.title = title;
    this.instructions = instructions || '';
    this.questions = questions || [];
    this.items = items || [];
    this.solution = solution || null;
  }

  /**
   * Get exercise type
   * @returns {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get exercise title
   * @returns {string}
   */
  getTitle() {
    return this.title;
  }

  /**
   * Get questions/items
   * @returns {Array}
   */
  getQuestions() {
    return this.questions;
  }

  /**
   * Get items (for reorder exercises)
   * @returns {Array}
   */
  getItems() {
    return this.items;
  }

  /**
   * Check if exercise has solution
   * @returns {boolean}
   */
  hasSolution() {
    return this.solution !== null;
  }

  /**
   * Get the solution
   * @returns {*}
   */
  getSolution() {
    return this.solution;
  }

  /**
   * Check if answer is correct
   * @param {number} questionId - Question ID
   * @param {*} answer - User's answer
   * @returns {boolean}
   */
  checkAnswer(questionId, answer) {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return false;

    if (this.type === 'multiple-choice') {
      return question.answer === answer;
    } else if (this.type === 'fill-blank') {
      // Find the blank value in the sentence
      const blank = question.sentence.find(item => item.blank);
      return blank && blank.blank.toLowerCase() === answer.toLowerCase();
    } else if (this.type === 'cases') {
      return question.answer === answer;
    }

    return false;
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Exercise}
   */
  static fromData(data) {
    return new Exercise({
      type: data.type,
      title: data.title,
      instructions: data.instructions,
      questions: data.questions,
      items: data.items,
      solution: data.solution
    });
  }

  /**
   * Create multiple exercises from array
   * @param {Array} dataArray
   * @returns {Array<Exercise>}
   */
  static fromArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => Exercise.fromData(data));
  }
}
