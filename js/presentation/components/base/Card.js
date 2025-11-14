/**
 * Card Component
 * Base reusable card component
 */
export class Card {
  /**
   * Create a card element
   * @param {Object} options
   * @returns {HTMLDivElement}
   */
  static create({
    title = null,
    subtitle = null,
    content = null,
    footer = null,
    className = '',
    onClick = null,
    icon = null,
    color = null
  } = {}) {
    const card = document.createElement('div');
    card.className = `card ${className}`.trim();

    if (color) {
      card.classList.add(`card-${color}`);
    }

    if (onClick) {
      card.classList.add('card-clickable');
      card.addEventListener('click', onClick);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
    }

    // Header (title + subtitle)
    if (title || subtitle || icon) {
      const header = document.createElement('div');
      header.className = 'card-header';

      if (icon) {
        const iconEl = typeof icon === 'string'
          ? document.createElement('i')
          : icon;

        if (typeof icon === 'string') {
          iconEl.className = icon;
        }

        iconEl.classList.add('card-icon');
        header.appendChild(iconEl);
      }

      if (title) {
        const titleEl = document.createElement('h3');
        titleEl.className = 'card-title';
        titleEl.textContent = title;
        header.appendChild(titleEl);
      }

      if (subtitle) {
        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'card-subtitle';
        subtitleEl.textContent = subtitle;
        header.appendChild(subtitleEl);
      }

      card.appendChild(header);
    }

    // Content
    if (content) {
      const contentEl = document.createElement('div');
      contentEl.className = 'card-content';

      if (typeof content === 'string') {
        contentEl.textContent = content;
      } else if (content instanceof HTMLElement) {
        contentEl.appendChild(content);
      }

      card.appendChild(contentEl);
    }

    // Footer
    if (footer) {
      const footerEl = document.createElement('div');
      footerEl.className = 'card-footer';

      if (typeof footer === 'string') {
        footerEl.textContent = footer;
      } else if (footer instanceof HTMLElement) {
        footerEl.appendChild(footer);
      }

      card.appendChild(footerEl);
    }

    return card;
  }

  /**
   * Create a lesson card
   * @param {Object} options
   * @returns {HTMLDivElement}
   */
  static createLessonCard({
    title,
    description,
    level,
    type,
    onClick,
    completed = false
  }) {
    const card = Card.create({
      title,
      content: description,
      onClick,
      className: completed ? 'lesson-card completed' : 'lesson-card'
    });

    // Add level badge
    const badge = document.createElement('span');
    badge.className = `badge badge-${level.toLowerCase()}`;
    badge.textContent = level;

    const header = card.querySelector('.card-header');
    if (header) {
      header.appendChild(badge);
    }

    return card;
  }

  /**
   * Create a category card
   * @param {Object} options
   * @returns {HTMLDivElement}
   */
  static createCategoryCard({
    title,
    description,
    icon,
    color,
    lessonCount,
    onClick
  }) {
    const footer = document.createElement('div');
    footer.innerHTML = `<small>${lessonCount} ${lessonCount === 1 ? 'lesson' : 'lessons'}</small>`;

    return Card.create({
      title,
      content: description,
      icon,
      color,
      footer,
      onClick,
      className: 'category-card'
    });
  }
}
