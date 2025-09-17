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
    this.pageContainer = null; // Initialize as null
  }

  async init() {
    try {
      // Get the container element here, inside init
      this.pageContainer = document.getElementById('page-container');
      if (!this.pageContainer) {
        console.error('Fatal Error: #page-container not found in the DOM.');
        return;
      }

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
      if (!nav) {
        console.warn('Main navigation element не найден.');
        return;
      }

      nav.addEventListener('click', (e) => {
          const link = e.target.closest('[data-nav-link]');
          if (!link) {
              return;
          }

          e.preventDefault();

          const targetPath = link.dataset.navLink;
          if (targetPath) {
              this.router.navigate(targetPath);
              this.updateActiveTab(targetPath);
          }
      });

      // Set active tab on page load
      window.addEventListener('hashchange', () => this.updateActiveTab());
      this.updateActiveTab();
  }

  updateActiveTab(forcedPath) {
      const nav = document.getElementById('main-navigation');
      if (!nav) {
        return;
      }

      const path = forcedPath || this.router.getCurrentPath().split('/')[0] || 'categories';
      nav.querySelectorAll('[data-nav-link]').forEach(link => {
          link.classList.toggle('active', link.dataset.navLink === path);
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
    if (this.pageContainer) {
      this.pageContainer.innerHTML = `<div class="error-container"><h2>Произошла ошибка</h2><p>${message}</p></div>`;
    }
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
  window.PolishApp.init();
});