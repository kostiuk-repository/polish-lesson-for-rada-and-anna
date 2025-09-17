// js/ui/tabs.js

export class TabsComponent {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      activeClass: 'tabs__button--active',
      contentActiveClass: 'tabs__content--active',
      ...options
    };
    
    this.init();
  }

  init() {
    if (!this.container) return;

    this.tabs = Array.from(this.container.querySelectorAll('[role="tab"]'));
    this.contentWrapper = this.container.querySelector('.tabs__content_wrapper') || this.findContentWrapper();
    if (!this.contentWrapper) return;
    
    this.contents = Array.from(this.contentWrapper.querySelectorAll('.tabs__content'));

    this.setupInitialState();
    this.setupEventListeners();
  }

  findContentWrapper() {
    // Якщо немає спеціальної обгортки, беремо батьківський елемент першого контенту
    const firstContent = this.container.querySelector('.tabs__content');
    return firstContent ? firstContent.parentElement : null;
  }

  setupInitialState() {
    this.activeIndex = this.tabs.findIndex(tab => tab.classList.contains(this.options.activeClass));
    if (this.activeIndex === -1) this.activeIndex = 0;
    
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
    if (index === this.activeIndex) return;

    const previousIndex = this.activeIndex;
    this.activeIndex = index;

    // Оновлюємо кнопки
    this.tabs.forEach((tab, i) => {
      tab.classList.toggle(this.options.activeClass, i === index);
      tab.setAttribute('aria-selected', i === index);
    });

    // Оновлюємо контент
    const oldContent = this.contents[previousIndex];
    const newContent = this.contents[index];

    if (oldContent) {
      oldContent.classList.remove(this.options.contentActiveClass);
    }
    
    if (newContent) {
      // Спочатку встановлюємо висоту, потім показуємо контент
      this.adjustHeight(newContent, animate);
      newContent.classList.add(this.options.contentActiveClass);
    }
  }

  adjustHeight(newContent, animate) {
    if (!this.contentWrapper || !newContent) return;

    if (!animate) {
      this.contentWrapper.style.transition = 'none';
    }

    const newHeight = newContent.scrollHeight;
    this.contentWrapper.style.height = `${newHeight}px`;

    if (!animate) {
      // Повертаємо анімацію після миттєвої зміни
      setTimeout(() => {
        this.contentWrapper.style.transition = '';
      }, 0);
    }
  }
}