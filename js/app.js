import { Router } from './core/router.js';
import { API } from './core/api.js';
import { DictionaryService } from './services/dictionary.js';
import { SpeechService } from './services/speech.js';
import { StorageService } from './services/storage.js';

class PolishLearningApp {
  constructor() {
    this.router = new Router();
    this.api = new API();
    this.dictionary = new DictionaryService(this.api); 
    this.speech = new SpeechService();
    this.storage = new StorageService();
    this.currentComponent = null;
    this.pageContainer = document.getElementById('page-container');

    this.init();
  }

  async init() {
    try {
      await this.dictionary.init();
      await this.speech.init();
      
      this.setupRouting();
      this.setupNavigation();

      this.router.start();
      
      console.log('✅ Polish Learning App инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      this.showError('Ошибка загрузки приложения');
    }
  }
  
  setupRouting() {
    this.router.addRoute('', () => this.router.navigate('categories', true));
    this.router.addRoute('categories', () => this.loadCatalogPage());
    this.router.addRoute('categories/:id', (params) => this.loadCategoryPage(params.id));
    this.router.addRoute('lesson/:id', (params) => this.loadLessonPage(params.id));
    this.router.addRoute('dictionary', () => this.loadDictionaryPage());
  }
  
  setupNavigation() {
      const nav = document.getElementById('main-navigation');
      nav.addEventListener('click', (e) => {
          const tab = e.target.closest('[data-tab-link]');
          if (tab) {
              // Update active tab style
              nav.querySelectorAll('.tabs__button').forEach(t => t.classList.remove('tabs__button--active'));
              tab.classList.add('tabs__button--active');
              
              this.router.navigate(tab.dataset.tabLink);
          }
      });
      // Set active tab on page load
      window.addEventListener('hashchange', () => this.updateActiveTab());
      this.updateActiveTab();
  }
  
  updateActiveTab() {
      const path = this.router.getCurrentPath().split('/')[0] || 'categories';
      const nav = document.getElementById('main-navigation');
      nav.querySelectorAll('.tabs__button').forEach(t => {
          t.classList.toggle('tabs__button--active', t.dataset.tabLink === path);
      });
  }

  async loadCatalogPage() {
    this.destroyCurrentComponent();
    const { CatalogComponent } = await import('./components/catalog.js');
    this.currentComponent = new CatalogComponent({ 
        container: this.pageContainer, 
        api: this.api 
    });
    await this.currentComponent.render();
  }
  
  async loadCategoryPage(categoryId) {
    this.destroyCurrentComponent();
    const { CategoryComponent } = await import('./components/category.js');
    this.currentComponent = new CategoryComponent({
        container: this.pageContainer,
        api: this.api,
        categoryId: categoryId
    });
    await this.currentComponent.render();
  }

  async loadLessonPage(lessonId) {
    this.destroyCurrentComponent();
    const { LessonComponent } = await import('./components/lesson.js');
    this.currentComponent = new LessonComponent({
      container: this.pageContainer,
      lessonId,
      api: this.api,
      dictionary: this.dictionary,
      speech: this.speech,
      storage: this.storage
    });
    await this.currentComponent.render();
  }

  async loadDictionaryPage() {
    this.destroyCurrentComponent();
    this.pageContainer.innerHTML = '<h1>Словарь (в разработке)</h1>';
  }

  showError(message) {
    this.pageContainer.innerHTML = `<div class="error-container"><h2>Произошла ошибка</h2><p>${message}</p></div>`;
  }

  destroyCurrentComponent() {
    if (this.currentComponent && typeof this.currentComponent.destroy === 'function') {
      this.currentComponent.destroy();
    }
    this.pageContainer.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.PolishApp = new PolishLearningApp();
});