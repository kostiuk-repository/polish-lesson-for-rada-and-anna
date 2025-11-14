/**
 * Badge Component
 * Base reusable badge component
 */
export class Badge {
  /**
   * Create a badge element
   * @param {Object} options
   * @returns {HTMLSpanElement}
   */
  static create({
    text,
    type = 'default', // default, primary, success, warning, danger, info
    size = 'medium', // small, medium, large
    className = '',
    icon = null
  } = {}) {
    const badge = document.createElement('span');
    badge.className = `badge badge-${type} badge-${size} ${className}`.trim();

    if (icon) {
      const iconEl = document.createElement('i');
      iconEl.className = icon;
      badge.appendChild(iconEl);
      badge.appendChild(document.createTextNode(' '));
    }

    badge.appendChild(document.createTextNode(text));

    return badge;
  }

  /**
   * Create a level badge
   * @param {string} level - Level (A1, A2, B1, etc.)
   * @returns {HTMLSpanElement}
   */
  static createLevelBadge(level) {
    const typeMap = {
      'A1': 'success',
      'A2': 'info',
      'B1': 'warning',
      'B2': 'primary',
      'C1': 'danger',
      'C2': 'danger'
    };

    return Badge.create({
      text: level,
      type: typeMap[level] || 'default',
      className: 'level-badge'
    });
  }

  /**
   * Create a status badge
   * @param {string} status - Status text
   * @param {string} type - Badge type
   * @returns {HTMLSpanElement}
   */
  static createStatusBadge(status, type = 'default') {
    return Badge.create({
      text: status,
      type,
      size: 'small'
    });
  }

  /**
   * Create a count badge
   * @param {number} count
   * @returns {HTMLSpanElement}
   */
  static createCountBadge(count) {
    return Badge.create({
      text: count.toString(),
      type: 'primary',
      size: 'small',
      className: 'count-badge'
    });
  }
}
