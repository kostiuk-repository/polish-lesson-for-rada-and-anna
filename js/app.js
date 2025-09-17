import { Router } from './core/router.js';
import { API } from './core/api.js'; 
import { DictionaryService } from './services/dictionary.js';
import { SpeechService } from './services/speech.js';
import { StorageService } from './services/storage.js';
import { ModalComponent } from './components/modal.js';
import { CatalogComponent } from './components/catalog.js';
import { LessonComponent } from './components/lesson.js';
import { CategoryComponent } from './components/category.js';

class App {
    constructor() {
        this.api = new API('data/');
        this.dictionary = new DictionaryService(this.api);
        this.speech = new SpeechService();
        this.storage = new StorageService();
        this.modal = new ModalComponent({ dictionary: this.dictionary });
        
        // Исправляем ID элемента
        this.rootElement = document.getElementById('page-container');
        
        if (!this.rootElement) {
            console.error('Элемент page-container не найден');
            return;
        }
        
        this.initApp();
    }

    async initApp() {
        try {
            console.log('🚀 Инициализация приложения...');
            
            // Инициализируем сервисы
            await this.initServices();
            
            // Инициализируем роутер
            this.initRouter();
            
            // Настраиваем обработчики событий
            this.initEventListeners();
            
            // Запускаем роутер
            this.router.start();
            
            console.log('✅ Приложение успешно инициализировано');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации приложения:', error);
            this.showError('Ошибка загрузки приложения. Попробуйте обновить страницу.');
        }
    }

    async initServices() {
        try {
            // Инициализируем сервисы в нужном порядке
            await this.storage.init?.() || Promise.resolve();
            await this.speech.init?.() || Promise.resolve();
            
            // Словарь пока не инициализируем, чтобы не блокировать загрузку
            // await this.dictionary.init();
            
            console.log('📦 Сервисы инициализированы');
        } catch (error) {
            console.warn('⚠️ Некоторые сервисы не удалось инициализировать:', error);
        }
    }

    initRouter() {
        const routes = [
            { path: '/', render: () => this.showCatalog() },
            { path: '/categories', render: () => this.showCatalog() },
            { path: '/categories/:categoryId', render: (params) => this.showCategory(params.categoryId) },
            { path: '/lesson/:id', render: (params) => this.showLesson(params.id) },
            { path: '/dictionary', render: () => this.showPlaceholder('Словарь') },
            { path: '/rules', render: () => this.showPlaceholder('Правила') },
        ];
        
        this.router = new Router(routes, this.rootElement);
        console.log('🛣️ Роутер инициализирован');
    }

    initEventListeners() {
        // Обработчик ссылок роутера
        document.addEventListener('click', e => {
            const link = e.target.closest('a[data-router-link]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const path = href.substring(1);
                    this.router.navigateTo(path);
                }
            }
        });

        // Глобальная обработка ошибок
        window.addEventListener('error', (e) => {
            console.error('Глобальная ошибка:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Необработанное отклонение Promise:', e.reason);
        });
        
        console.log('👂 Обработчики событий настроены');
    }

    showCatalog() {
        console.log('📋 Показываем каталог');
        try {
            if (!this.catalogComponent) {
                this.catalogComponent = new CatalogComponent({ 
                    container: this.rootElement, 
                    api: this.api 
                });
            }
            return this.catalogComponent.render(); 
        } catch (error) {
            console.error('Ошибка показа каталога:', error);
            this.showError('Ошибка загрузки каталога');
        }
    }

    showCategory(categoryId) {
        console.log('📂 Показываем категорию:', categoryId);
        try {
            if (!this.categoryComponent) {
                this.categoryComponent = new CategoryComponent({
                    container: this.rootElement,
                    api: this.api,
                    categoryId: categoryId
                });
            }
            return this.categoryComponent.render();
        } catch (error) {
            console.error('Ошибка показа категории:', error);
            this.showError('Ошибка загрузки категории');
        }
    }

    showLesson(lessonId) {
        console.log('📖 Показываем урок:', lessonId);
        try {
            if (!this.lessonComponent) {
                this.lessonComponent = new LessonComponent({
                    container: this.rootElement,
                    api: this.api,
                    dictionary: this.dictionary,
                    modal: this.modal,
                    speech: this.speech,
                    storage: this.storage
                });
            }
            return this.lessonComponent.render(); // Изменено с loadAndRender на render
        } catch (error) {
            console.error('Ошибка показа урока:', error);
            this.showError('Ошибка загрузки урока');
        }
    }
    
    showPlaceholder(pageTitle) {
        console.log('📄 Показываем placeholder:', pageTitle);
        this.rootElement.innerHTML = `
            <div class="container placeholder-page">
                <h1 class="placeholder-title">${pageTitle}</h1>
                <p class="placeholder-text">Этот раздел находится в разработке.</p>
                <a href="#/" class="btn btn--primary" data-router-link>
                    Вернуться на главную
                </a>
            </div>
        `;
    }

    showError(message) {
        console.error('🚨 Показываем ошибку:', message);
        this.rootElement.innerHTML = `
            <div class="container error-page">
                <div class="error-message">
                    <h2>Что-то пошло не так</h2>
                    <p>${message}</p>
                    <div class="error-actions">
                        <button onclick="window.location.reload()" class="btn btn--primary">
                            Обновить страницу
                        </button>
                        <a href="#/" class="btn btn--outline" data-router-link>
                            На главную
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Глобальный доступ к сервисам
    getServices() {
        return {
            api: this.api,
            dictionary: this.dictionary,
            speech: this.speech,
            storage: this.storage,
            modal: this.modal
        };
    }
}

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM загружен, создаем приложение...');
    
    try {
        window.app = new App();
        
        // Глобальный доступ к сервисам (для совместимости)
        window.PolishApp = window.app.getServices();
        
    } catch (error) {
        console.error('❌ Критическая ошибка при создании приложения:', error);
        
        // Показываем базовую ошибку прямо в HTML
        const container = document.getElementById('page-container');
        if (container) {
            container.innerHTML = `
                <div class="container error-page">
                    <h2>Ошибка загрузки приложения</h2>
                    <p>Произошла критическая ошибка при инициализации приложения.</p>
                    <p>Подробности в консоли разработчика.</p>
                    <button onclick="window.location.reload()" class="btn btn--primary">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }
});