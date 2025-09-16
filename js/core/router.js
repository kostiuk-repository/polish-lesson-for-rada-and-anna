export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.isStarted = false;
  }

  /**
   * Добавляет новый маршрут
   * @param {string} pattern - паттерн маршрута (например, 'lesson/:id')
   * @param {Function} handler - обработчик маршрута
   */
  addRoute(pattern, handler) {
    // Преобразуем паттерн в регулярное выражение
    const paramNames = [];
    const regexPattern = pattern
      .replace(/:([^\/]+)/g, (match, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    this.routes.set(pattern, {
      regex,
      handler,
      paramNames,
      pattern
    });
  }

  /**
   * Переходит к указанному маршруту
   * @param {string} path - путь для перехода
   * @param {boolean} replace - заменить текущую запись в истории
   */
  navigate(path, replace = false) {
    if (replace) {
      history.replaceState(null, '', `#${path}`);
    } else {
      history.pushState(null, '', `#${path}`);
    }
    this.handleRoute(path);
  }

  /**
   * Обрабатывает текущий маршрут
   */
  handleRoute(path = null) {
    if (path === null) {
      path = this.getCurrentPath();
    }

    // Ищем подходящий маршрут
    for (const [pattern, route] of this.routes) {
      const match = path.match(route.regex);
      
      if (match) {
        // Извлекаем параметры
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        // Обновляем текущий маршрут
        this.currentRoute = {
          path,
          pattern,
          params,
          handler: route.handler
        };

        // Вызываем обработчик
        try {
          route.handler(params, path);
        } catch (error) {
          console.error(`Ошибка в обработчике маршрута ${pattern}:`, error);
        }
        
        return;
      }
    }

    // Маршрут не найден
    console.warn(`Маршрут не найден: ${path}`);
    this.handleNotFound(path);
  }

  /**
   * Получает текущий путь из hash
   */
  getCurrentPath() {
    const hash = window.location.hash;
    return hash.startsWith('#') ? hash.slice(1) : '';
  }

  /**
   * Обработчик для несуществующих маршрутов
   */
  handleNotFound(path) {
    console.log(`Перенаправление с ${path} на главную страницу`);
    this.navigate('', true);
  }

  /**
   * Запускает роутер
   */
  start() {
    if (this.isStarted) return;

    // Обрабатываем изменения в браузере
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // Обрабатываем кнопки назад/вперед
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    // Обрабатываем текущий маршрут
    this.handleRoute();

    this.isStarted = true;
  }

  /**
   * Останавливает роутер
   */
  stop() {
    this.isStarted = false;
    window.removeEventListener('hashchange', this.handleRoute);
    window.removeEventListener('popstate', this.handleRoute);
  }

  /**
   * Получает текущий маршрут
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Проверяет, соответствует ли текущий маршрут паттерну
   */
  isCurrentRoute(pattern) {
    return this.currentRoute && this.currentRoute.pattern === pattern;
  }
}