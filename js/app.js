import { Router } from './core/router.js';
import { API } from './core/api.js'; 
import { Dictionary } from './services/dictionary.js';
import { ModalComponent } from './components/modal.js';
import { CatalogComponent } from './components/catalog.js';
import { LessonComponent } from './components/lesson.js';

class App {
    constructor() {
        this.api = new API('data');
        this.dictionary = new Dictionary(this.api);
        this.modal = new ModalComponent({ dictionary: this.dictionary });
        this.rootElement = document.getElementById('app-root');
        this.initRouter();
        this.initEventListeners();
    }

    initRouter() {
        const routes = [
            { path: '/', render: () => this.showCatalog() },
            { path: '/lesson/:id', render: (params) => this.showLesson(params.id) },
            { path: '/dictionary', render: () => this.showPlaceholder('Словник') },
            { path: '/rules', render: () => this.showPlaceholder('Правила') },
            { path: '/categories', render: () => this.showCatalog() },
        ];
        this.router = new Router(routes, this.rootElement);
    }

    initEventListeners() {
        document.addEventListener('click', e => {
            const link = e.target.closest('a');
            if (link && link.matches('[data-router-link]')) {
                e.preventDefault();
                const targetUrl = link.getAttribute('href').substring(1);
                this.router.navigateTo(targetUrl);
            }
        });
    }

    showCatalog() {
        if (!this.catalogComponent) {
            this.catalogComponent = new CatalogComponent({ 
                container: this.rootElement, 
                api: this.api 
            });
        }
        this.catalogComponent.render(); 
    }

    showLesson(lessonId) {
        if (!this.lessonComponent) {
            this.lessonComponent = new LessonComponent({
                api: this.api,
                dictionary: this.dictionary,
                modal: this.modal,
            });
        }
        this.lessonComponent.loadAndRender(lessonId, this.rootElement);
    }
    
    showPlaceholder(pageTitle) {
        this.rootElement.innerHTML = `
            <div class="container placeholder-page">
                <h1 class="placeholder-title">${pageTitle}</h1>
                <p class="placeholder-text">Цей розділ знаходиться в розробці.</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});