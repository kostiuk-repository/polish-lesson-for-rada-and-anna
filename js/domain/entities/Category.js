/**
 * LessonMetadata - metadata for a lesson in the catalog
 */
export class LessonMetadata {
  constructor({ id, title, description, level, type, dataFile }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.level = level;
    this.type = type;
    this.dataFile = dataFile;
  }

  static fromData(data) {
    return new LessonMetadata({
      id: data.id,
      title: data.title,
      description: data.description,
      level: data.level,
      type: data.type,
      dataFile: data.dataFile
    });
  }

  static fromArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => LessonMetadata.fromData(data));
  }
}

/**
 * Category Entity
 * Represents a category of lessons in the catalog
 */
export class Category {
  constructor({ id, title, description, icon, color, lessons }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.icon = icon;
    this.color = color;
    this.lessons = LessonMetadata.fromArray(lessons || []);
  }

  /**
   * Get category ID
   * @returns {string}
   */
  getId() {
    return this.id;
  }

  /**
   * Get category title
   * @returns {string}
   */
  getTitle() {
    return this.title;
  }

  /**
   * Get category description
   * @returns {string}
   */
  getDescription() {
    return this.description;
  }

  /**
   * Get all lessons in this category
   * @returns {Array<LessonMetadata>}
   */
  getLessons() {
    return this.lessons;
  }

  /**
   * Get lesson by ID
   * @param {string} lessonId
   * @returns {LessonMetadata|null}
   */
  getLessonById(lessonId) {
    return this.lessons.find(l => l.id === lessonId) || null;
  }

  /**
   * Get icon class
   * @returns {string}
   */
  getIcon() {
    return this.icon;
  }

  /**
   * Get color
   * @returns {string}
   */
  getColor() {
    return this.color;
  }

  /**
   * Get number of lessons
   * @returns {number}
   */
  getLessonCount() {
    return this.lessons.length;
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Category}
   */
  static fromData(data) {
    return new Category({
      id: data.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      color: data.color,
      lessons: data.lessons
    });
  }

  /**
   * Create multiple categories from array
   * @param {Array} dataArray
   * @returns {Array<Category>}
   */
  static fromArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => Category.fromData(data));
  }
}

/**
 * Catalog Entity
 * Represents the complete catalog of lessons
 */
export class Catalog {
  constructor({ categories }) {
    this.categories = Category.fromArray(categories || []);
  }

  /**
   * Get all categories
   * @returns {Array<Category>}
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Get category by ID
   * @param {string} categoryId
   * @returns {Category|null}
   */
  getCategoryById(categoryId) {
    return this.categories.find(c => c.id === categoryId) || null;
  }

  /**
   * Find lesson metadata by ID across all categories
   * @param {string} lessonId
   * @returns {{category: Category, lesson: LessonMetadata}|null}
   */
  findLesson(lessonId) {
    for (const category of this.categories) {
      const lesson = category.getLessonById(lessonId);
      if (lesson) {
        return { category, lesson };
      }
    }
    return null;
  }

  /**
   * Get all lessons across all categories
   * @returns {Array<LessonMetadata>}
   */
  getAllLessons() {
    return this.categories.flatMap(cat => cat.getLessons());
  }

  /**
   * Create from raw data
   * @param {Object} data
   * @returns {Catalog}
   */
  static fromData(data) {
    return new Catalog({
      categories: data.categories
    });
  }
}
