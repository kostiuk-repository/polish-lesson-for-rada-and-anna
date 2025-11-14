/**
 * Input Component
 * Base reusable input component
 */
export class Input {
  /**
   * Create an input element
   * @param {Object} options - Input options
   * @returns {HTMLInputElement}
   */
  static create({
    type = 'text',
    placeholder = '',
    value = '',
    onChange = null,
    onInput = null,
    onFocus = null,
    onBlur = null,
    className = '',
    id = null,
    name = null,
    required = false,
    disabled = false,
    maxLength = null,
    ariaLabel = null
  } = {}) {
    const input = document.createElement('input');
    input.type = type;
    input.className = `input ${className}`.trim();

    if (placeholder) input.placeholder = placeholder;
    if (value) input.value = value;
    if (id) input.id = id;
    if (name) input.name = name;
    if (required) input.required = true;
    if (disabled) input.disabled = true;
    if (maxLength) input.maxLength = maxLength;
    if (ariaLabel) input.setAttribute('aria-label', ariaLabel);

    // Event handlers
    if (onChange) input.addEventListener('change', onChange);
    if (onInput) input.addEventListener('input', onInput);
    if (onFocus) input.addEventListener('focus', onFocus);
    if (onBlur) input.addEventListener('blur', onBlur);

    return input;
  }

  /**
   * Create a textarea element
   * @param {Object} options
   * @returns {HTMLTextAreaElement}
   */
  static createTextarea({
    placeholder = '',
    value = '',
    onChange = null,
    onInput = null,
    className = '',
    rows = 4,
    cols = 50,
    maxLength = null
  } = {}) {
    const textarea = document.createElement('textarea');
    textarea.className = `textarea ${className}`.trim();
    textarea.rows = rows;
    textarea.cols = cols;

    if (placeholder) textarea.placeholder = placeholder;
    if (value) textarea.value = value;
    if (maxLength) textarea.maxLength = maxLength;

    if (onChange) textarea.addEventListener('change', onChange);
    if (onInput) textarea.addEventListener('input', onInput);

    return textarea;
  }

  /**
   * Create a labeled input group
   * @param {Object} options
   * @returns {HTMLDivElement}
   */
  static createGroup({
    label,
    input,
    helperText = null,
    error = null,
    className = ''
  }) {
    const group = document.createElement('div');
    group.className = `input-group ${className}`.trim();

    // Label
    if (label) {
      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      if (input.id) labelEl.htmlFor = input.id;
      labelEl.className = 'input-label';
      group.appendChild(labelEl);
    }

    // Input
    group.appendChild(input);

    // Helper text
    if (helperText) {
      const helper = document.createElement('small');
      helper.className = 'input-helper';
      helper.textContent = helperText;
      group.appendChild(helper);
    }

    // Error message
    if (error) {
      const errorEl = document.createElement('small');
      errorEl.className = 'input-error';
      errorEl.textContent = error;
      group.appendChild(errorEl);
      input.classList.add('input-invalid');
    }

    return group;
  }
}
