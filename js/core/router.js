export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.isStarted = false;
  }

  addRoute(pattern, handler) {
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

  navigate(path, replace = false) {
    if (replace) {
      history.replaceState(null, '', `#/${path}`);
    } else {
      history.pushState(null, '', `#/${path}`);
    }
    this.handleRoute(path);
  }

  handleRoute(path = null) {
    if (path === null) {
      path = this.getCurrentPath();
    }

    for (const [pattern, route] of this.routes) {
      const match = path.match(route.regex);
      
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        this.currentRoute = {
          path,
          pattern,
          params,
          handler: route.handler
        };

        try {
          route.handler(params, path);
        } catch (error) {
          console.error(`Ошибка в обработчике маршрута ${pattern}:`, error);
        }
        
        return;
      }
    }

    this.handleNotFound(path);
  }

  getCurrentPath() {
    return window.location.hash.slice(2) || ''; // Убираем #/
  }

  handleNotFound(path) {
    console.warn(`Маршрут не найден: ${path}, перенаправляем на главную.`);
    this.navigate('categories', true);
  }

  start() {
    if (this.isStarted) return;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => this.handleRoute());
    
    this.handleRoute();
    this.isStarted = true;
  }

  stop() {
    this.isStarted = false;
    // remove listeners
  }
}