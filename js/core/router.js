export class Router {
    constructor(routes, rootElement) {
        this.routes = routes;
        this.rootElement = rootElement;
        window.addEventListener('popstate', () => this.handleRouteChange());
    }

    navigateTo(path) {
        window.location.hash = path;
    }

    handleRouteChange() {
        const path = window.location.hash.substring(1) || '/';
        const currentRoute = this.routes.find(route => {
            const routePathSegments = route.path.split('/').filter(Boolean);
            const currentPathSegments = path.split('/').filter(Boolean);
            if (routePathSegments.length !== currentPathSegments.length) {
                return false;
            }
            const params = {};
            const match = routePathSegments.every((segment, i) => {
                if (segment.startsWith(':')) {
                    params[segment.substring(1)] = currentPathSegments[i];
                    return true;
                }
                return segment === currentPathSegments[i];
            });
            if (match) {
                route.params = params;
            }
            return match;
        });

        if (currentRoute) {
            currentRoute.render(currentRoute.params);
        } else {
            this.rootElement.innerHTML = '<h1>404 - Сторінку не знайдено</h1>';
        }
        this.updateActiveNav(path);
    }
    
    updateActiveNav(currentPath) {
        const navLinks = document.querySelectorAll('.app-nav a');
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            const isActive = (currentPath === linkPath.substring(1)) || (currentPath.startsWith(linkPath.substring(1)) && linkPath !== '#/');
            link.classList.toggle('active', isActive);
        });
        if (currentPath === '/') {
            navLinks.forEach(link => link.classList.remove('active'));
        }
    }

    start() {
        this.handleRouteChange();
    }
}