/**
 * Application Bootstrap (New Architecture)
 *
 * This file initializes the new 4-layer architecture:
 * - Domain (entities and value objects)
 * - Infrastructure (adapters for external services)
 * - Application (business logic services)
 * - Presentation (MVVM: Views, ViewModels, Components)
 */

import { Router } from './core/router.js';

// Infrastructure Adapters
import { ApiAdapter } from './infrastructure/api/ApiAdapter.js';
import { SpeechApiAdapter } from './infrastructure/speech/SpeechApiAdapter.js';
import { StorageAdapter } from './infrastructure/storage/StorageAdapter.js';

// Application Services
import { DictionaryService } from './application/services/DictionaryService.js';
import { LessonService } from './application/services/LessonService.js';
import { ProgressService } from './application/services/ProgressService.js';
import { ExerciseService } from './application/services/ExerciseService.js';

// ViewModels
import { CatalogViewModel } from './presentation/view_models/CatalogViewModel.js';
import { LessonViewModel } from './presentation/view_models/LessonViewModel.js';
import { CategoryViewModel } from './presentation/view_models/CategoryViewModel.js';

// Views
import { CatalogView } from './presentation/views/CatalogView.js';
import { LessonView } from './presentation/views/LessonView.js';
import { CategoryView } from './presentation/views/CategoryView.js';

/**
 * Application Class
 * Manages the application lifecycle and dependency injection
 */
class Application {
  constructor() {
    // Infrastructure
    this.apiAdapter = null;
    this.speechAdapter = null;
    this.storageAdapter = null;

    // Services
    this.dictionaryService = null;
    this.lessonService = null;
    this.progressService = null;
    this.exerciseService = null;

    // Router
    this.router = null;

    // Container
    this.appContainer = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log('🚀 Initializing Application (New Architecture)...');

    try {
      // Setup infrastructure adapters
      this.setupInfrastructure();

      // Setup application services
      this.setupServices();

      // Initialize dictionary (critical for word lookups)
      await this.dictionaryService.init();

      // Initialize speech service
      await this.speechAdapter.init();

      // Setup routing
      this.setupRouting();

      // Get app container
      this.appContainer = document.getElementById('app');
      if (!this.appContainer) {
        throw new Error('App container not found');
      }

      // Start router
      this.router.start();

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showError(error);
    }
  }

  /**
   * Setup infrastructure adapters
   */
  setupInfrastructure() {
    console.log('Setting up infrastructure...');

    this.apiAdapter = new ApiAdapter('data/');
    this.speechAdapter = new SpeechApiAdapter();
    this.storageAdapter = new StorageAdapter();

    console.log('✅ Infrastructure adapters created');
  }

  /**
   * Setup application services
   */
  setupServices() {
    console.log('Setting up application services...');

    this.dictionaryService = new DictionaryService(this.apiAdapter);
    this.lessonService = new LessonService(this.apiAdapter, this.storageAdapter);
    this.progressService = new ProgressService(this.storageAdapter);
    this.exerciseService = new ExerciseService(this.storageAdapter);

    console.log('✅ Application services created');
  }

  /**
   * Setup routing
   */
  setupRouting() {
    console.log('Setting up routing...');

    this.router = new Router();

    // Catalog route (default)
    this.router.addRoute('/', () => this.renderCatalog());
    this.router.addRoute('/catalog', () => this.renderCatalog());

    // Category route
    this.router.addRoute('/category/:categoryId', (params) => {
      this.renderCategory(params.categoryId);
    });

    // Lesson route
    this.router.addRoute('/lesson/:lessonId', (params) => {
      this.renderLesson(params.lessonId);
    });

    console.log('✅ Routes configured');
  }

  /**
   * Render catalog view
   */
  async renderCatalog() {
    console.log('Rendering Catalog View');

    const viewModel = new CatalogViewModel(this.lessonService, this.progressService);
    const view = new CatalogView(viewModel);

    await view.render(this.appContainer);
  }

  /**
   * Render category view
   * @param {string} categoryId
   */
  async renderCategory(categoryId) {
    console.log(`Rendering Category View: ${categoryId}`);

    const viewModel = new CategoryViewModel(this.lessonService, this.progressService);
    const view = new CategoryView(viewModel);

    await view.render(this.appContainer, categoryId);
  }

  /**
   * Render lesson view
   * @param {string} lessonId
   */
  async renderLesson(lessonId) {
    console.log(`Rendering Lesson View: ${lessonId}`);

    const viewModel = new LessonViewModel(
      this.lessonService,
      this.dictionaryService,
      this.exerciseService,
      this.progressService
    );

    const view = new LessonView(
      viewModel,
      this.speechAdapter,
      this.dictionaryService,
      this.progressService
    );

    await view.render(this.appContainer, lessonId);
  }

  /**
   * Show error message
   * @param {Error} error
   */
  showError(error) {
    if (this.appContainer) {
      this.appContainer.innerHTML = `
        <div class="error-container">
          <h1>Application Error</h1>
          <p>${error.message}</p>
          <button onclick="location.reload()">Reload Application</button>
        </div>
      `;
    }
  }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.init();
  });
} else {
  const app = new Application();
  app.init();
}

// Export for debugging
window.app = Application;
