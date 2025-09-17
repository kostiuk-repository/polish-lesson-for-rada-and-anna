export class TabsComponent {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      activeClass: 'tabs__button--active',
      contentActiveClass: 'tabs__content--active',
      animationDuration: 300,
      ...options,
    };
    this.init();
  }

  init() {
    if (!this.container) return;

    this.tabs = Array.from(this.container.querySelectorAll('[data-tab]'));
    if (this.tabs.length === 0) return;

    // Шукаємо контент відносно батьківського елемента, щоб знайти сусідні блоки
    const searchContext = this.container.closest('.modal__body, .inflection-container') || document;
    this.contents = this.tabs.map(tab => searchContext.querySelector(`[data-content="${tab.dataset.tab}"]`));
    
    // Обгорткою для анімації буде спільний батьківський елемент контенту
    this.contentWrapper = this.contents.length > 0 && this.contents[0] ? this.contents[0].parentElement : null;

    this.setupInitialState();
    this.setupEventListeners();
  }

  setupInitialState() {
    this.activeIndex = this.tabs.findIndex(tab => tab.classList.contains(this.options.activeClass));
    if (this.activeIndex === -1) {
      this.activeIndex = 0;
    }
    this.showTab(this.activeIndex, false);
  }

  setupEventListeners() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.showTab(index);
      });
    });
  }

  showTab(index, animate = true) {
    if (index === this.activeIndex || !this.tabs[index]) return;

    const previousIndex = this.activeIndex;
    this.activeIndex = index;

    // Оновлюємо кнопки
    this.tabs.forEach((tab, i) => {
      tab.classList.toggle(this.options.activeClass, i === index);
      tab.setAttribute('aria-selected', String(i === index));
    });

    // Перемикаємо контент
    this.switchContent(previousIndex, index, animate);
  }

  switchContent(previousIndex, newIndex, animate) {
    const oldContent = this.contents[previousIndex];
    const newContent = this.contents[newIndex];

    if (!newContent || !this.contentWrapper) return;
    
    // Розраховуємо висоту нового контенту
    const newHeight = newContent.scrollHeight;

    // Для плавної анімації фіксуємо поточну висоту обгортки
    if (animate) {
      this.contentWrapper.style.overflow = 'hidden';
      this.contentWrapper.style.height = `${this.contentWrapper.offsetHeight}px`;
    }

    // Ховаємо старий контент і показуємо новий
    if (oldContent) {
      oldContent.classList.remove(this.options.contentActiveClass);
    }
    newContent.classList.add(this.options.contentActiveClass);

    // Асинхронно запускаємо анімацію, щоб браузер встиг обробити зміни
    requestAnimationFrame(() => {
      if (animate) {
        this.contentWrapper.style.transition = `height ${this.options.animationDuration}ms ease-in-out`;
        this.contentWrapper.style.height = `${newHeight}px`;

        // Після анімації повертаємо автоматичну висоту
        setTimeout(() => {
          this.contentWrapper.style.transition = '';
          this.contentWrapper.style.height = 'auto';
          this.contentWrapper.style.overflow = '';
        }, this.options.animationDuration);
      } else {
        // Якщо анімація не потрібна, просто встановлюємо висоту
        this.contentWrapper.style.height = 'auto';
      }
    });
  }
}