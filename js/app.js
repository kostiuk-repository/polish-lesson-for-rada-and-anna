// Главный файл приложения
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
    
    this.init();
  }

  async init() {
    try {
      // Инициализируем сервисы
      await this.dictionary.init();
      await this.speech.init();
      
      // Настраиваем роутинг
      this.setupRouting();
      
      // Запускаем роутер
      this.router.start();
      
      console.log('✅ Polish Learning App инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      this.showError('Ошибка загрузки приложения');
    }
  }

  setupRouting() {
    // Главная страница - каталог
    this.router.addRoute('', () => this.loadCatalogPage());
    this.router.addRoute('catalog', () => this.loadCatalogPage());
    
    // Страница урока
    this.router.addRoute('lesson/:id', (params) => this.loadLessonPage(params.id));
    
    // Страница словаря (будущее)
    this.router.addRoute('dictionary', () => this.loadDictionaryPage());
  }

  async loadCatalogPage() {
    const { CatalogComponent } = await import('./components/catalog.js');
    const catalog = new CatalogComponent({
      api: this.api,
      storage: this.storage
    });
    await catalog.render();
  }

  async loadLessonPage(lessonId) {
    const { LessonComponent } = await import('./components/lesson.js');
    const lesson = new LessonComponent({
      lessonId,
      api: this.api,
      dictionary: this.dictionary,
      speech: this.speech,
      storage: this.storage
    });
    await lesson.render();
  }

  async loadDictionaryPage() {
    // Для будущего функционала
    console.log('Dictionary page - coming soon!');
  }

  showError(message) {
    document.body.innerHTML = `
      <div class="error-container">
        <h2>Произошла ошибка</h2>
        <p>${message}</p>
        <button onclick="location.reload()">Перезагрузить</button>
      </div>
    `;
  }
}

// Экспортируем для глобального использования
window.PolishApp = PolishLearningApp;

// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  new PolishLearningApp();
});