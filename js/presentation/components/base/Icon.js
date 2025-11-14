/**
 * Icon Component
 * Base reusable icon component (using Font Awesome)
 */
export class Icon {
  /**
   * Create an icon element
   * @param {Object} options
   * @returns {HTMLElement}
   */
  static create({
    name,
    style = 'fas', // fas, far, fab
    size = null, // fa-xs, fa-sm, fa-lg, fa-2x, fa-3x, etc.
    className = '',
    color = null,
    onClick = null,
    ariaLabel = null
  } = {}) {
    const icon = document.createElement('i');

    let classes = [style, `fa-${name}`];
    if (size) classes.push(size);
    if (className) classes.push(className);

    icon.className = classes.join(' ');

    if (color) {
      icon.style.color = color;
    }

    if (ariaLabel) {
      icon.setAttribute('aria-label', ariaLabel);
      icon.setAttribute('role', 'img');
    } else {
      icon.setAttribute('aria-hidden', 'true');
    }

    if (onClick) {
      icon.addEventListener('click', onClick);
      icon.style.cursor = 'pointer';
    }

    return icon;
  }

  /**
   * Create a spinning icon (for loading states)
   * @param {string} name - Icon name (default: spinner)
   * @returns {HTMLElement}
   */
  static createSpinner(name = 'spinner') {
    return Icon.create({
      name,
      className: 'fa-spin',
      ariaLabel: 'Loading'
    });
  }

  /**
   * Predefined icon sets
   */
  static icons = {
    // Navigation
    home: 'home',
    back: 'arrow-left',
    forward: 'arrow-right',
    close: 'times',
    menu: 'bars',

    // Actions
    play: 'play',
    pause: 'pause',
    stop: 'stop',
    volume: 'volume-up',
    volumeMute: 'volume-mute',
    bookmark: 'bookmark',
    bookmarkOutline: 'bookmark',
    edit: 'edit',
    delete: 'trash',
    save: 'save',
    download: 'download',
    upload: 'upload',
    share: 'share',

    // Status
    check: 'check',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
    success: 'check-circle',

    // Content
    search: 'search',
    filter: 'filter',
    sort: 'sort',
    list: 'list',
    grid: 'th',

    // Learning
    book: 'book',
    lesson: 'graduation-cap',
    exercise: 'pencil-alt',
    star: 'star',
    trophy: 'trophy'
  };

  /**
   * Quick create methods for common icons
   */
  static play(onClick) {
    return Icon.create({ name: Icon.icons.play, onClick, ariaLabel: 'Play' });
  }

  static pause(onClick) {
    return Icon.create({ name: Icon.icons.pause, onClick, ariaLabel: 'Pause' });
  }

  static bookmark(onClick, filled = false) {
    return Icon.create({
      name: Icon.icons.bookmark,
      style: filled ? 'fas' : 'far',
      onClick,
      ariaLabel: filled ? 'Remove bookmark' : 'Add bookmark'
    });
  }

  static volume(onClick) {
    return Icon.create({ name: Icon.icons.volume, onClick, ariaLabel: 'Play audio' });
  }
}
