export class TabsComponent {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      activeClass: 'tabs__button--active',
      contentActiveClass: 'tabs__content--active',
      animationDuration: 300,
      keyboard: true,
      autoHeight: false,
      ...options
    };
    
    this.tabs = [];
    this.contents = [];
    this.activeIndex = 0;
    this.isInitialized = false;
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('TabsComponent: контейнер не найден');
      return;
    }

    this.findElements();
    this.setupInitialState();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
    
    this.isInitialized = true;
    this.trigger('init');
  }

  findElements() {
    // Находим все кнопки табов
    this.tabs = Array.from(this.container.querySelectorAll('[role="tab"], .tabs__button, [data-tab]'));
    
    // Находим все панели контента
    this.contents = [];
    
    this.tabs.forEach(tab => {
      const targetId = tab.dataset.tab || tab.getAttribute('aria-controls');
      let content = null;
      
      if (targetId) {
        // Ищем по data-content или id
        content = this.container.querySelector(`[data-content="${targetId}"], #${targetId}`);
        
        // Если не найдено, ищем в документе
        if (!content) {
          content = document.querySelector(`[data-content="${targetId}"], #${targetId}`);
        }
      }
      
      this.contents.push(content);
    });

    if (this.tabs.length === 0) {
      console.warn('TabsComponent: кнопки табов не найдены');
      return;
    }

    if (this.contents.some(content => !content)) {
      console.warn('TabsComponent: некоторые панели контента не найдены');
    }
  }

  setupInitialState() {
    // Находим активный таб
    const activeTab = this.tabs.find(tab => 
      tab.classList.contains(this.options.activeClass) ||
      tab.getAttribute('aria-selected') === 'true'
    );

    if (activeTab) {
      this.activeIndex = this.tabs.indexOf(activeTab);
    }

    // Настраиваем ARIA атрибуты
    this.tabs.forEach((tab, index) => {
      const content = this.contents[index];
      const tabId = tab.id || `tab-${index}`;
      const panelId = content?.id || `panel-${index}`;

      // Устанавливаем IDs если их нет
      if (!tab.id) tab.id = tabId;
      if (content && !content.id) content.id = panelId;

      // ARIA атрибуты для доступности
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('tabindex', index === this.activeIndex ? '0' : '-1');
      
      if (content) {
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', tabId);
      }
    });

    // Показываем активный таб
    this.showTab(this.activeIndex, false);
  }

  setupEventListeners() {
    this.tabs.forEach((tab, index) => {
      // Клик по табу
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.showTab(index);
      });

      // Фокус для клавиатурной навигации
      tab.addEventListener('focus', () => {
        this.setActiveTab(index, false);
      });
    });

    // Обработка изменения размера окна для автовысоты
    if (this.options.autoHeight) {
      window.addEventListener('resize', () => this.adjustHeight());
    }
  }

  setupKeyboardNavigation() {
    if (!this.options.keyboard) return;

    this.container.addEventListener('keydown', (e) => {
      const currentTab = e.target.closest('[role="tab"]');
      if (!currentTab) return;

      const currentIndex = this.tabs.indexOf(currentTab);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
          break;
          
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          newIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
          break;
          
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
          
        case 'End':
          e.preventDefault();
          newIndex = this.tabs.length - 1;
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.showTab(currentIndex);
          return;
          
        default:
          return;
      }

      this.tabs[newIndex].focus();
    });
  }

  showTab(index, animate = true) {
    if (index < 0 || index >= this.tabs.length) {
      console.warn('TabsComponent: недопустимый индекс таба', index);
      return;
    }

    if (index === this.activeIndex) return;

    const previousIndex = this.activeIndex;
    const previousContent = this.contents[previousIndex];
    const newContent = this.contents[index];

    // Вызываем событие перед переключением
    const beforeEvent = this.trigger('beforeTabChange', {
      previousIndex,
      newIndex: index,
      previousTab: this.tabs[previousIndex],
      newTab: this.tabs[index],
      previousContent,
      newContent
    });

    if (beforeEvent.defaultPrevented) return;

    this.activeIndex = index;

    // Обновляем активные классы и ARIA атрибуты
    this.setActiveTab(index, animate);

    // Переключаем контент
    this.switchContent(previousIndex, index, animate);

    // Вызываем событие после переключения
    this.trigger('tabChanged', {
      previousIndex,
      activeIndex: index,
      activeTab: this.tabs[index],
      activeContent: newContent
    });
  }

  setActiveTab(index, updateTabindex = true) {
    this.tabs.forEach((tab, i) => {
      const isActive = i === index;
      
      tab.classList.toggle(this.options.activeClass, isActive);
      tab.setAttribute('aria-selected', isActive);
      
      if (updateTabindex) {
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      }
    });
  }

  switchContent(previousIndex, newIndex, animate) {
    const previousContent = this.contents[previousIndex];
    const newContent = this.contents[newIndex];
    const contentWrapper = newContent?.parentElement;

    if (!newContent || !contentWrapper) return;

    const newHeight = newContent.scrollHeight;

    // Встановлюємо фіксовану висоту для плавної анімації
    contentWrapper.style.height = `${contentWrapper.offsetHeight}px`;

    if (previousContent) {
      previousContent.classList.remove(this.options.contentActiveClass);
      previousContent.setAttribute('aria-hidden', 'true');
    }
    
    newContent.classList.add(this.options.contentActiveClass);
    newContent.setAttribute('aria-hidden', 'false');

    // Даємо браузеру час на перерахунок і запускаємо анімацію висоти
    requestAnimationFrame(() => {
      contentWrapper.style.height = `${newHeight}px`;
    });

    // Після завершення анімації повертаємо height: auto, щоб контент не обрізався
    // при зміні розміру вікна браузера
    setTimeout(() => {
      contentWrapper.style.height = 'auto';
    }, this.options.animationDuration);

    if (this.options.autoHeight) {
      this.adjustHeight();
    }
  }

  adjustHeight() {
    const activeContent = this.contents[this.activeIndex];
    if (!activeContent) return;

    const container = activeContent.parentElement;
    if (container) {
      container.style.height = `${activeContent.scrollHeight}px`;
    }
  }

  // Публичные методы

  /**
   * Получает индекс активного таба
   * @returns {number}
   */
  getActiveIndex() {
    return this.activeIndex;
  }

  /**
   * Получает активный таб
   * @returns {Element}
   */
  getActiveTab() {
    return this.tabs[this.activeIndex];
  }

  /**
   * Получает активный контент
   * @returns {Element}
   */
  getActiveContent() {
    return this.contents[this.activeIndex];
  }

  /**
   * Переходит к табу по индексу
   * @param {number} index - индекс таба
   */
  goToTab(index) {
    this.showTab(index);
  }

  /**
   * Переходит к следующему табу
   */
  nextTab() {
    const nextIndex = this.activeIndex < this.tabs.length - 1 ? this.activeIndex + 1 : 0;
    this.showTab(nextIndex);
  }

  /**
   * Переходит к предыдущему табу
   */
  previousTab() {
    const prevIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.tabs.length - 1;
    this.showTab(prevIndex);
  }

  /**
   * Добавляет новый таб
   * @param {Object} tabData - данные таба
   */
  addTab(tabData) {
    const { title, content, id } = tabData;
    
    // Создаем кнопку таба
    const tabButton = document.createElement('button');
    tabButton.className = 'tabs__button';
    tabButton.setAttribute('role', 'tab');
    tabButton.textContent = title;
    tabButton.dataset.tab = id;
    
    // Создаем панель контента
    const tabContent = document.createElement('div');
    tabContent.className = 'tabs__content';
    tabContent.setAttribute('role', 'tabpanel');
    tabContent.dataset.content = id;
    
    if (typeof content === 'string') {
      tabContent.innerHTML = content;
    } else {
      tabContent.appendChild(content);
    }
    
    // Добавляем в DOM
    const tabsList = this.container.querySelector('.tabs__list');
    if (tabsList) {
      tabsList.appendChild(tabButton);
    }
    
    const contentsContainer = this.container.querySelector('.tabs__contents') || this.container;
    contentsContainer.appendChild(tabContent);
    
    // Обновляем внутренние массивы
    this.tabs.push(tabButton);
    this.contents.push(tabContent);
    
    // Переинициализируем
    this.setupInitialState();
    this.setupEventListeners();
  }

  /**
   * Удаляет таб по индексу
   * @param {number} index - индекс таба для удаления
   */
  removeTab(index) {
    if (index < 0 || index >= this.tabs.length) return;
    
    const tab = this.tabs[index];
    const content = this.contents[index];
    
    // Удаляем из DOM
    if (tab) tab.remove();
    if (content) content.remove();
    
    // Удаляем из массивов
    this.tabs.splice(index, 1);
    this.contents.splice(index, 1);
    
    // Корректируем активный индекс
    if (index === this.activeIndex) {
      this.activeIndex = Math.min(this.activeIndex, this.tabs.length - 1);
    } else if (index < this.activeIndex) {
      this.activeIndex--;
    }
    
    // Показываем новый активный таб
    if (this.tabs.length > 0) {
      this.showTab(this.activeIndex, false);
    }
  }

  /**
   * Включает/выключает таб
   * @param {number} index - индекс таба
   * @param {boolean} enabled - включен ли таб
   */
  setTabEnabled(index, enabled) {
    const tab = this.tabs[index];
    if (!tab) return;
    
    if (enabled) {
      tab.removeAttribute('disabled');
      tab.setAttribute('aria-disabled', 'false');
    } else {
      tab.setAttribute('disabled', 'true');
      tab.setAttribute('aria-disabled', 'true');
      
      // Если отключаемый таб активен, переключаемся на первый доступный
      if (index === this.activeIndex) {
        const nextAvailable = this.tabs.findIndex(t => !t.disabled);
        if (nextAvailable !== -1) {
          this.showTab(nextAvailable);
        }
      }
    }
  }

  /**
   * Добавляет бейдж к табу
   * @param {number} index - индекс таба
   * @param {string|number} badge - текст бейджа
   */
  setBadge(index, badge) {
    const tab = this.tabs[index];
    if (!tab) return;
    
    // Удаляем существующий бейдж
    const existingBadge = tab.querySelector('.tabs__badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Добавляем новый бейдж если задан
    if (badge !== null && badge !== undefined && badge !== '') {
      const badgeElement = document.createElement('span');
      badgeElement.className = 'tabs__badge';
      badgeElement.textContent = badge;
      tab.appendChild(badgeElement);
    }
  }

  // Система событий

  trigger(eventName, data = {}) {
    const event = new CustomEvent(`tabs:${eventName}`, {
      detail: data,
      bubbles: true,
      cancelable: true
    });
    
    this.container.dispatchEvent(event);
    return event;
  }

  on(eventName, handler) {
    this.container.addEventListener(`tabs:${eventName}`, handler);
  }

  off(eventName, handler) {
    this.container.removeEventListener(`tabs:${eventName}`, handler);
  }

  destroy() {
    // Удаляем обработчики событий
    this.tabs.forEach(tab => {
      tab.replaceWith(tab.cloneNode(true));
    });
    
    // Очищаем ссылки
    this.tabs = [];
    this.contents = [];
    this.container = null;
    this.isInitialized = false;
  }
}