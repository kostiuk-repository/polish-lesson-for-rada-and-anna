import { Input } from '../base/Input.js';
import { Icon } from '../base/Icon.js';
import { Button } from '../base/Button.js';

/**
 * SearchField Component
 * Search input with icon and clear button
 */
export class SearchField {
  constructor() {
    this.element = null;
    this.input = null;
    this.onSearch = null;
    this.onChange = null;
  }

  /**
   * Create search field
   * @param {Object} options
   * @returns {HTMLElement}
   */
  create({
    placeholder = 'Search...',
    value = '',
    onSearch = null,
    onChange = null,
    className = '',
    showSearchIcon = true,
    showClearButton = true,
    debounce = 300
  } = {}) {
    this.onSearch = onSearch;
    this.onChange = onChange;

    // Container
    const container = document.createElement('div');
    container.className = `search-field ${className}`.trim();

    // Search icon
    if (showSearchIcon) {
      const searchIcon = Icon.create({
        name: Icon.icons.search,
        className: 'search-icon',
        ariaLabel: 'Search'
      });
      container.appendChild(searchIcon);
    }

    // Input
    this.input = Input.create({
      type: 'search',
      placeholder,
      value,
      className: 'search-input',
      ariaLabel: placeholder
    });

    // Debounced input handler
    let debounceTimer;
    this.input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (this.onChange) {
          this.onChange(e.target.value);
        }
      }, debounce);
    });

    // Enter key handler
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.onSearch) {
        this.onSearch(this.input.value);
      }
    });

    container.appendChild(this.input);

    // Clear button
    if (showClearButton) {
      const clearBtn = Button.createIconButton({
        icon: Icon.icons.close,
        onClick: () => this.clear(),
        ariaLabel: 'Clear search',
        className: 'search-clear',
        type: 'link'
      });
      clearBtn.style.display = value ? 'block' : 'none';
      this.clearButton = clearBtn;

      // Show/hide clear button based on input value
      this.input.addEventListener('input', () => {
        clearBtn.style.display = this.input.value ? 'block' : 'none';
      });

      container.appendChild(clearBtn);
    }

    this.element = container;
    return container;
  }

  /**
   * Get current value
   * @returns {string}
   */
  getValue() {
    return this.input ? this.input.value : '';
  }

  /**
   * Set value
   * @param {string} value
   */
  setValue(value) {
    if (!this.input) return;

    this.input.value = value;

    if (this.clearButton) {
      this.clearButton.style.display = value ? 'block' : 'none';
    }
  }

  /**
   * Clear search field
   */
  clear() {
    this.setValue('');
    this.input.focus();

    if (this.onChange) {
      this.onChange('');
    }
  }

  /**
   * Focus input
   */
  focus() {
    if (this.input) {
      this.input.focus();
    }
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
