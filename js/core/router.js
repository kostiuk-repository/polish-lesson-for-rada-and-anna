export class Router {
    constructor(routes, rootElement) {
        this.routes = routes;
        this.rootElement = rootElement;
        this.currentRoute = null;
        
        console.log('🛣️ Router создан с', routes.length, 'маршрутами');
        
        // Слушаем изменения hash
        window.addEventListener('popstate', () => this.handleRouteChange());
        window.addEventListener('hashchange', () => this.handleRouteChange());
    }

    navigateTo(path) {
        console.log('🧭 Навигация к:', path);
        
        // Нормализуем путь
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Обновляем hash
        if (window.location.hash !== '#' + path) {
            window.location.hash = path;
        } else {
            // Если hash не изменился, вызываем обработчик вручную
            this.handleRouteChange();
        }
    }

    handleRouteChange() {
        // Получаем текущий путь из hash
        let path = window.location.hash.substring(1) || '/';
        
        // Нормализуем путь
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        console.log('🔄 Обрабатываем маршрут:', path);
        
        // Находим подходящий маршрут
        const matchedRoute = this.findMatchingRoute(path);
        
        if (matchedRoute) {
            console.log('✅ Найден маршрут:', matchedRoute.route.path);
            
            try {
                this.currentRoute = matchedRoute;
                const result = matchedRoute.route.render(matchedRoute.params);
                
                // Если render возвращает Promise, обрабатываем его
                if (result && typeof result.then === 'function') {
                    result.catch(error => {
                        console.error('❌ Ошибка в асинхронном рендере маршрута:', error);
                        this.show404();
                    });
                }
                
            } catch (error) {
                console.error('❌ Ошибка при рендере маршрута:', error);
                this.show404();
            }
        } else {
            console.warn('⚠️ Маршрут не найден:', path);
            this.show404();
        }
        
        // Обновляем активную навигацию
        this.updateActiveNav(path);
    }

    findMatchingRoute(path) {
        for (const route of this.routes) {
            const match = this.matchRoute(route.path, path);
            if (match) {
                return {
                    route: route,
                    params: match.params
                };
            }
        }
        return null;
    }

    matchRoute(routePath, actualPath) {
        // Разбиваем пути на сегменты
        const routeSegments = routePath.split('/').filter(Boolean);
        const actualSegments = actualPath.split('/').filter(Boolean);
        
        // Для корневого маршрута
        if (routePath === '/' && actualPath === '/') {
            return { params: {} };
        }
        
        // Количество сегментов должно совпадать
        if (routeSegments.length !== actualSegments.length) {
            return null;
        }
        
        const params = {};
        
        // Проверяем каждый сегмент
        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const actualSegment = actualSegments[i];
            
            if (routeSegment.startsWith(':')) {
                // Параметр маршрута
                const paramName = routeSegment.substring(1);
                params[paramName] = actualSegment;
            } else if (routeSegment !== actualSegment) {
                // Сегменты не совпадают
                return null;
            }
        }
        
        return { params };
    }

    show404() {
        console.log('🚫 Показываем 404');
        if (this.rootElement) {
            this.rootElement.innerHTML = `
                <div class="container error-page">
                    <div class="error-message">
                        <h2>Страница не найдена</h2>
                        <p>Запрашиваемая страница не существует.</p>
                        <div class="error-actions">
                            <a href="#/" class="btn btn--primary">
                                На главную
                            </a>
                            <button onclick="history.back()" class="btn btn--outline">
                                Назад
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    updateActiveNav(currentPath) {
        const navLinks = document.querySelectorAll('.app-nav a[data-router-link]');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (!linkPath) return;
            
            const normalizedLinkPath = linkPath.startsWith('#') ? linkPath.substring(1) : linkPath;
            
            // Определяем, активна ли ссылка
            let isActive = false;
            
            if (normalizedLinkPath === '/' && currentPath === '/') {
                isActive = true;
            } else if (normalizedLinkPath !== '/' && currentPath.startsWith(normalizedLinkPath)) {
                isActive = true;
            }
            
            link.classList.toggle('active', isActive);
        });
        
        console.log('🎨 Навигация обновлена для:', currentPath);
    }

    start() {
        console.log('▶️ Запуск роутера');
        
        // Обрабатываем текущий маршрут
        this.handleRouteChange();
        
        // Если нет hash, перенаправляем на главную
        if (!window.location.hash) {
            this.navigateTo('/');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    destroy() {
        window.removeEventListener('popstate', this.handleRouteChange);
        window.removeEventListener('hashchange', this.handleRouteChange);
        this.routes = null;
        this.rootElement = null;
        this.currentRoute = null;
    }
}