/**
 * Button Component
 * Base reusable button component
 */
export class Button {
  /**
   * Create a button element
   * @param {Object} options - Button options
   * @param {string} options.text - Button text
   * @param {string} options.type - Button type (primary, secondary, danger, etc.)
   * @param {string} options.size - Button size (small, medium, large)
   * @param {Function} options.onClick - Click handler
   * @param {string} options.icon - Icon class (optional)
   * @param {boolean} options.disabled - Disabled state
   * @param {string} options.className - Additional CSS classes
   * @returns {HTMLButtonElement}
   */
  static create({
    text = '',
    type = 'primary',
    size = 'medium',
    onClick = null,
    icon = null,
    disabled = false,
    className = '',
    ariaLabel = null
  } = {}) {
    const button = document.createElement('button');
    button.className = `btn btn-${type} btn-${size} ${className}`.trim();

    if (disabled) {
      button.disabled = true;
    }

    if (ariaLabel) {
      button.setAttribute('aria-label', ariaLabel);
    }

    // Add icon if provided
    if (icon) {
      const iconElement = document.createElement('i');
      iconElement.className = icon;
      button.appendChild(iconElement);

      if (text) {
        button.appendChild(document.createTextNode(' '));
      }
    }

    // Add text
    if (text) {
      button.appendChild(document.createTextNode(text));
    }

    // Add click handler
    if (onClick) {
      button.addEventListener('click', onClick);
    }

    return button;
  }

  /**
   * Create an icon-only button
   * @param {Object} options
   * @returns {HTMLButtonElement}
   */
  static createIconButton({
    icon,
    onClick = null,
    type = 'secondary',
    size = 'medium',
    ariaLabel,
    className = '',
    disabled = false
  }) {
    return Button.create({
      icon,
      onClick,
      type,
      size,
      ariaLabel: ariaLabel || 'Button',
      className: `btn-icon ${className}`,
      disabled
    });
  }

  /**
   * Create a link-styled button
   * @param {Object} options
   * @returns {HTMLButtonElement}
   */
  static createLinkButton({ text, onClick, className = '' }) {
    return Button.create({
      text,
      onClick,
      type: 'link',
      className
    });
  }
}
