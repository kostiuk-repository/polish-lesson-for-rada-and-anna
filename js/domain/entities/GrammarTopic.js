/**
 * GrammarTopic Entity
 * Represents a grammar topic/rule in a lesson
 */
export class GrammarTopic {
  constructor({ title, content }) {
    this.title = title;
    this.content = content; // HTML content
  }

  /**
   * Get topic title
   * @returns {string}
   */
  getTitle() {
    return this.title;
  }

  /**
   * Get topic content (HTML)
   * @returns {string}
   */
  getContent() {
    return this.content;
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {GrammarTopic}
   */
  static fromData(data) {
    return new GrammarTopic({
      title: data.title,
      content: data.content
    });
  }

  /**
   * Create multiple topics from array
   * @param {Array} dataArray
   * @returns {Array<GrammarTopic>}
   */
  static fromArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => GrammarTopic.fromData(data));
  }
}
