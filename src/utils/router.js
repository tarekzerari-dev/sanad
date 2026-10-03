// ============================
// SPA Hash Router
// ============================

export class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.beforeEach = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  add(path, handler) {
    this.routes.push({ path, handler });
    return this;
  }

  guard(fn) {
    this.beforeEach = fn;
    return this;
  }

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    
    for (const route of this.routes) {
      const match = this.matchRoute(route.path, hash);
      if (match) {
        if (this.beforeEach) {
          const proceed = this.beforeEach(hash, route);
          if (proceed === false) return;
        }
        this.currentRoute = { ...route, params: match.params };
        route.handler(match.params);
        return;
      }
    }

    // 404 — redirect to home
    this.navigate('/');
  }

  matchRoute(pattern, hash) {
    const patternParts = pattern.split('/').filter(Boolean);
    const hashParts = hash.split('/').filter(Boolean);

    if (patternParts.length !== hashParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(hashParts[i]);
      } else if (patternParts[i] !== hashParts[i]) {
        return null;
      }
    }

    return { params };
  }

  navigate(path) {
    window.location.hash = path;
  }

  start() {
    this.resolve();
  }
}

export function navigateTo(path) {
  window.location.hash = path;
}
