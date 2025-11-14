import { Button } from '../base/Button.js';
import { Icon } from '../base/Icon.js';

/**
 * Modal Component
 * Reusable modal dialog component
 */
export class Modal {
  constructor() {
    this.element = null;
    this.isOpen = false;
    this.onClose = null;
  }

  /**
   * Create modal
   * @param {Object} options
   * @returns {HTMLElement}
   */
  create({
    title = '',
    content = null,
    footer = null,
    size = 'medium', // small, medium, large, fullscreen
    closeOnBackdrop = true,
    closeButton = true,
    className = ''
  } = {}) {
    // Modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'none';

    if (closeOnBackdrop) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }

    // Modal container
    const modal = document.createElement('div');
    modal.className = `modal modal-${size} ${className}`.trim();
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    // Modal header
    if (title || closeButton) {
      const header = document.createElement('div');
      header.className = 'modal-header';

      if (title) {
        const titleEl = document.createElement('h2');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;
        header.appendChild(titleEl);
      }

      if (closeButton) {
        const closeBtn = Button.createIconButton({
          icon: Icon.icons.close,
          onClick: () => this.close(),
          ariaLabel: 'Close modal',
          className: 'modal-close'
        });
        header.appendChild(closeBtn);
      }

      modal.appendChild(header);
    }

    // Modal body
    const body = document.createElement('div');
    body.className = 'modal-body';

    if (content) {
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        body.appendChild(content);
      }
    }

    modal.appendChild(body);
    this.bodyElement = body;

    // Modal footer
    if (footer) {
      const footerEl = document.createElement('div');
      footerEl.className = 'modal-footer';

      if (typeof footer === 'string') {
        footerEl.innerHTML = footer;
      } else if (footer instanceof HTMLElement) {
        footerEl.appendChild(footer);
      }

      modal.appendChild(footerEl);
    }

    overlay.appendChild(modal);
    this.element = overlay;
    this.modalElement = modal;

    // ESC key handler
    this.escHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };

    return overlay;
  }

  /**
   * Open modal
   */
  open() {
    if (!this.element) return;

    this.element.style.display = 'flex';
    this.isOpen = true;
    document.body.style.overflow = 'hidden';

    // Add ESC key handler
    document.addEventListener('keydown', this.escHandler);

    // Trigger callback
    if (this.onOpen) {
      this.onOpen();
    }

    // Focus first focusable element
    setTimeout(() => {
      const focusable = this.modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        focusable.focus();
      }
    }, 100);
  }

  /**
   * Close modal
   */
  close() {
    if (!this.element) return;

    this.element.style.display = 'none';
    this.isOpen = false;
    document.body.style.overflow = '';

    // Remove ESC key handler
    document.removeEventListener('keydown', this.escHandler);

    // Trigger callback
    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Set modal content
   * @param {HTMLElement|string} content
   */
  setContent(content) {
    if (!this.bodyElement) return;

    this.bodyElement.innerHTML = '';

    if (typeof content === 'string') {
      this.bodyElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.bodyElement.appendChild(content);
    }
  }

  /**
   * Destroy modal
   */
  destroy() {
    this.close();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Create a confirmation modal
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  static confirm({
    title = 'Confirm',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  }) {
    return new Promise((resolve) => {
      const modal = new Modal();

      const content = document.createElement('p');
      content.textContent = message;

      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.gap = '10px';
      footer.style.justifyContent = 'flex-end';

      const cancelBtn = Button.create({
        text: cancelText,
        type: 'secondary',
        onClick: () => {
          modal.close();
          modal.destroy();
          resolve(false);
        }
      });

      const confirmBtn = Button.create({
        text: confirmText,
        type: 'primary',
        onClick: () => {
          modal.close();
          modal.destroy();
          resolve(true);
        }
      });

      footer.appendChild(cancelBtn);
      footer.appendChild(confirmBtn);

      const element = modal.create({
        title,
        content,
        footer,
        size: 'small',
        closeOnBackdrop: false
      });

      document.body.appendChild(element);
      modal.open();
    });
  }

  /**
   * Create an alert modal
   * @param {Object} options
   * @returns {Promise<void>}
   */
  static alert({ title = 'Alert', message = '', okText = 'OK' }) {
    return new Promise((resolve) => {
      const modal = new Modal();

      const content = document.createElement('p');
      content.textContent = message;

      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'flex-end';

      const okBtn = Button.create({
        text: okText,
        type: 'primary',
        onClick: () => {
          modal.close();
          modal.destroy();
          resolve();
        }
      });

      footer.appendChild(okBtn);

      const element = modal.create({
        title,
        content,
        footer,
        size: 'small'
      });

      document.body.appendChild(element);
      modal.open();
    });
  }
}
