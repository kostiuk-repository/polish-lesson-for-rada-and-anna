/**
 * TabBar Component
 * Reusable tab navigation component
 */
export class TabBar {
  constructor() {
    this.element = null;
    this.activeTab = null;
    this.tabs = [];
    this.onTabChange = null;
  }

  /**
   * Create tab bar
   * @param {Object} options
   * @returns {HTMLElement}
   */
  create({
    tabs = [],
    activeTabId = null,
    onTabChange = null,
    className = ''
  } = {}) {
    this.onTabChange = onTabChange;
    this.tabs = tabs;

    // Container
    const container = document.createElement('div');
    container.className = `tab-bar ${className}`.trim();
    container.setAttribute('role', 'tablist');

    // Create tab buttons
    tabs.forEach((tab, index) => {
      const button = document.createElement('button');
      button.className = 'tab';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', 'false');
      button.setAttribute('id', `tab-${tab.id}`);
      button.setAttribute('aria-controls', `panel-${tab.id}`);

      // Icon
      if (tab.icon) {
        const icon = document.createElement('i');
        icon.className = tab.icon;
        button.appendChild(icon);
        button.appendChild(document.createTextNode(' '));
      }

      // Label
      button.appendChild(document.createTextNode(tab.label));

      // Badge (e.g., for counts)
      if (tab.badge) {
        const badge = document.createElement('span');
        badge.className = 'tab-badge';
        badge.textContent = tab.badge;
        button.appendChild(badge);
      }

      // Click handler
      button.addEventListener('click', () => {
        this.setActiveTab(tab.id);
      });

      container.appendChild(button);

      // Set first tab as active if no activeTabId specified
      if ((activeTabId === tab.id) || (!activeTabId && index === 0)) {
        this.activeTab = tab.id;
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
      }
    });

    this.element = container;
    return container;
  }

  /**
   * Set active tab
   * @param {string} tabId
   */
  setActiveTab(tabId) {
    if (!this.element || this.activeTab === tabId) return;

    const buttons = this.element.querySelectorAll('.tab');

    buttons.forEach(button => {
      const buttonTabId = button.id.replace('tab-', '');

      if (buttonTabId === tabId) {
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        this.activeTab = tabId;
      } else {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      }
    });

    // Trigger callback
    if (this.onTabChange) {
      const tab = this.tabs.find(t => t.id === tabId);
      this.onTabChange(tabId, tab);
    }
  }

  /**
   * Get active tab ID
   * @returns {string|null}
   */
  getActiveTab() {
    return this.activeTab;
  }

  /**
   * Update tab badge
   * @param {string} tabId
   * @param {string|number} badge
   */
  updateBadge(tabId, badge) {
    if (!this.element) return;

    const button = this.element.querySelector(`#tab-${tabId}`);
    if (!button) return;

    let badgeEl = button.querySelector('.tab-badge');

    if (badge) {
      if (!badgeEl) {
        badgeEl = document.createElement('span');
        badgeEl.className = 'tab-badge';
        button.appendChild(badgeEl);
      }
      badgeEl.textContent = badge;
    } else if (badgeEl) {
      badgeEl.remove();
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
