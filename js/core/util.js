/**
 * Утилиты для приложения Polish Learning Hub
 */

// DOM утилиты
export const DOM = {
  /**
   * Безопасный querySelector
   * @param {string} selector - CSS селектор
   * @param {Element} parent - родительский элемент
   * @returns {Element|null}
   */
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Безопасный querySelectorAll
   * @param {string} selector - CSS селектор
   * @param {Element} parent - родительский элемент
   * @returns {NodeList}
   */
  $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
  },

  /**
   * Создает элемент с атрибутами и содержимым
   * @param {string} tag - тег элемента
   * @param {Object} attrs - атрибуты
   * @param {string|Element|Array} content - содержимое
   * @returns {Element}
   */
  createElement(tag, attrs = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (typeof content === 'string') {
      element.innerHTML = content;
    } else if (content instanceof Element) {
      element.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    }

    return element;
  },

  /**
   * Добавляет/убирает класс с анимацией
   * @param {Element} element - элемент
   * @param {string} className - класс
   * @param {boolean} add - добавить или убрать
   * @param {number} duration - длительность анимации
   */
  toggleClass(element, className, add, duration = 300) {
    if (add) {
      element.classList.add(className);
    } else {
      element.classList.add(`${className}--exit`);
      setTimeout(() => {
        element.classList.remove(className, `${className}--exit`);
      }, duration);
    }
  },

  /**
   * Плавная прокрутка к элементу
   * @param {Element|string} target - элемент или селектор
   * @param {Object} options - опции прокрутки
   */
  scrollTo(target, options = {}) {
    const element = typeof target === 'string' ? this.$(target) : target;
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options
    });
  },

  /**
   * Проверяет, виден ли элемент в viewport
   * @param {Element} element - элемент
   * @param {number} threshold - порог видимости (0-1)
   * @returns {boolean}
   */
  isInViewport(element, threshold = 0.5) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                       ((rect.top + rect.height) >= windowHeight * threshold);
    const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                      ((rect.left + rect.width) >= windowWidth * threshold);

    return vertInView && horInView;
  }
};

// Утилиты для работы со строками
export const StringUtils = {
  /**
   * Обрезает строку до указанной длины
   * @param {string} str - строка
   * @param {number} length - максимальная длина
   * @param {string} suffix - суффикс
   * @returns {string}
   */
  truncate(str, length, suffix = '...') {
    return str.length <= length ? str : str.slice(0, length) + suffix;
  },

  /**
   * Преобразует строку в slug
   * @param {string} str - строка
   * @returns {string}
   */
  slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Капитализирует первую букву
   * @param {string} str - строка
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Преобразует в camelCase
   * @param {string} str - строка
   * @returns {string}
   */
  camelCase(str) {
    return str.replace(/[-_\s]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '');
  },

  /**
   * Убирает HTML теги
   * @param {string} html - HTML строка
   * @returns {string}
   */
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  /**
   * Экранирует HTML
   * @param {string} str - строка
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Подсчитывает слова в тексте
   * @param {string} text - текст
   * @returns {number}
   */
  wordCount(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  /**
   * Подсвечивает поисковые термины в тексте
   * @param {string} text - текст
   * @param {string} term - поисковый термин
   * @param {string} className - CSS класс для подсветки
   * @returns {string}
   */
  highlight(text, term, className = 'highlight') {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
    return text.replace(regex, `<mark class="${className}">$1</mark>`);
  },

  /**
   * Экранирует специальные символы регулярного выражения
   * @param {string} str - строка
   * @returns {string}
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
};

// Утилиты для работы с массивами
export const ArrayUtils = {
  /**
   * Перемешивает массив
   * @param {Array} array - массив
   * @returns {Array}
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * Группирует элементы массива по ключу
   * @param {Array} array - массив
   * @param {string|Function} key - ключ или функция
   * @returns {Object}
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = typeof key === 'function' ? key(item) : item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  /**
   * Удаляет дубликаты из массива
   * @param {Array} array - массив
   * @param {string|Function} key - ключ для сравнения
   * @returns {Array}
   */
  unique(array, key = null) {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = typeof key === 'function' ? key(item) : item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  /**
   * Разбивает массив на чанки
   * @param {Array} array - массив
   * @param {number} size - размер чанка
   * @returns {Array}
   */
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Находит пересечение массивов
   * @param {...Array} arrays - массивы
   * @returns {Array}
   */
  intersection(...arrays) {
    return arrays.reduce((acc, array) => 
      acc.filter(item => array.includes(item))
    );
  }
};

// Утилиты для работы с объектами
export const ObjectUtils = {
  /**
   * Глубокое клонирование объекта
   * @param {any} obj - объект
   * @returns {any}
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * Глубокое слияние объектов
   * @param {Object} target - целевой объект
   * @param {...Object} sources - источники
   * @returns {Object}
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  },

  /**
   * Проверяет, является ли значение объектом
   * @param {any} item - значение
   * @returns {boolean}
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  /**
   * Получает значение по пути в объекте
   * @param {Object} obj - объект
   * @param {string} path - путь (например, 'user.profile.name')
   * @param {any} defaultValue - значение по умолчанию
   * @returns {any}
   */
  get(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || !(key in result)) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result;
  },

  /**
   * Устанавливает значение по пути в объекте
   * @param {Object} obj - объект
   * @param {string} path - путь
   * @param {any} value - значение
   * @returns {Object}
   */
  set(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  }
};

// Утилиты для работы с датами
export const DateUtils = {
  /**
   * Форматирует дату
   * @param {Date|string|number} date - дата
   * @param {string} format - формат
   * @returns {string}
   */
  format(date, format = 'DD.MM.YYYY') {
    const d = new Date(date);
    const formats = {
      'DD': d.getDate().toString().padStart(2, '0'),
      'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
      'YYYY': d.getFullYear().toString(),
      'HH': d.getHours().toString().padStart(2, '0'),
      'mm': d.getMinutes().toString().padStart(2, '0'),
      'ss': d.getSeconds().toString().padStart(2, '0')
    };
    
    return format.replace(/DD|MM|YYYY|HH|mm|ss/g, match => formats[match]);
  },

  /**
   * Возвращает относительное время
   * @param {Date|string|number} date - дата
   * @returns {string}
   */
  timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return 'только что';
  },

  /**
   * Проверяет, является ли дата сегодняшней
   * @param {Date|string|number} date - дата
   * @returns {boolean}
   */
  isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  },

  /**
   * Возвращает начало дня
   * @param {Date|string|number} date - дата
   * @returns {Date}
   */
  startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Возвращает конец дня
   * @param {Date|string|number} date - дата
   * @returns {Date}
   */
  endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }
};

// Утилиты для debounce и throttle
export const FunctionUtils = {
  /**
   * Debounce функция
   * @param {Function} func - функция
   * @param {number} wait - задержка
   * @param {boolean} immediate - выполнить немедленно
   * @returns {Function}
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  },

  /**
   * Throttle функция
   * @param {Function} func - функция
   * @param {number} limit - ограничение
   * @returns {Function}
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Мемоизация функции
   * @param {Function} func - функция
   * @param {Function} getKey - функция получения ключа кэша
   * @returns {Function}
   */
  memoize(func, getKey = (...args) => JSON.stringify(args)) {
    const cache = new Map();
    return function(...args) {
      const key = getKey(...args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }
};

// Утилиты для валидации
export const ValidationUtils = {
  /**
   * Проверяет email
   * @param {string} email - email
   * @returns {boolean}
   */
  isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Проверяет URL
   * @param {string} url - URL
   * @returns {boolean}
   */
  isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Проверяет, является ли строка пустой
   * @param {string} str - строка
   * @returns {boolean}
   */
  isEmpty(str) {
    return !str || str.trim().length === 0;
  },

  /**
   * Проверяет длину строки
   * @param {string} str - строка
   * @param {number} min - минимальная длина
   * @param {number} max - максимальная длина
   * @returns {boolean}
   */
  isLength(str, min = 0, max = Infinity) {
    const length = str ? str.length : 0;
    return length >= min && length <= max;
  }
};

// Утилиты для работы с URL
export const UrlUtils = {
  /**
   * Парсит query параметры
   * @param {string} search - строка поиска
   * @returns {Object}
   */
  parseQuery(search = window.location.search) {
    const params = new URLSearchParams(search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  /**
   * Строит query строку
   * @param {Object} params - параметры
   * @returns {string}
   */
  buildQuery(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },

  /**
   * Получает базовый URL
   * @returns {string}
   */
  getBaseUrl() {
    return `${window.location.protocol}//${window.location.host}`;
  },

  /**
   * Создает абсолютный URL
   * @param {string} path - путь
   * @returns {string}
   */
  createAbsoluteUrl(path) {
    return new URL(path, this.getBaseUrl()).href;
  }
};

// Утилиты для работы с localStorage
export const StorageUtils = {
  /**
   * Безопасно сохраняет в localStorage
   * @param {string} key - ключ
   * @param {any} value - значение
   * @returns {boolean}
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Ошибка сохранения в localStorage:', error);
      return false;
    }
  },

  /**
   * Безопасно получает из localStorage
   * @param {string} key - ключ
   * @param {any} defaultValue - значение по умолчанию
   * @returns {any}
   */
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Ошибка чтения из localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Удаляет из localStorage
   * @param {string} key - ключ
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Ошибка удаления из localStorage:', error);
    }
  },

  /**
   * Очищает localStorage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Ошибка очистки localStorage:', error);
    }
  }
};

// Утилиты для уведомлений
export const NotificationUtils = {
  /**
   * Показывает уведомление
   * @param {string} message - сообщение
   * @param {string} type - тип (success, error, warning, info)
   * @param {number} duration - длительность показа
   */
  show(message, type = 'info', duration = 3000) {
    const container = this.getContainer();
    const notification = this.createNotification(message, type);
    
    container.appendChild(notification);
    
    // Анимация появления
    requestAnimationFrame(() => {
      notification.classList.add('animate-slide-in-right');
    });
    
    // Автоматическое скрытие
    if (duration > 0) {
      setTimeout(() => {
        this.hide(notification);
      }, duration);
    }
    
    return notification;
  },

  /**
   * Скрывает уведомление
   * @param {Element} notification - элемент уведомления
   */
  hide(notification) {
    notification.classList.add('animate-slide-out-right');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  },

  /**
   * Получает контейнер для уведомлений
   * @returns {Element}
   */
  getContainer() {
    let container = document.getElementById('notifications-container');
    if (!container) {
      container = DOM.createElement('div', {
        id: 'notifications-container',
        className: 'notifications-container'
      });
      document.body.appendChild(container);
    }
    return container;
  },

  /**
   * Создает элемент уведомления
   * @param {string} message - сообщение
   * @param {string} type - тип
   * @returns {Element}
   */
  createNotification(message, type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return DOM.createElement('div', {
      className: `notification notification--${type}`,
      onClick: (e) => this.hide(e.currentTarget)
    }, `
      <div class="notification__icon">${icons[type] || icons.info}</div>
      <div class="notification__message">${message}</div>
      <button class="notification__close" aria-label="Закрыть">×</button>
    `);
  }
};

// Основной объект утилит
export const Utils = {
  DOM,
  StringUtils,
  ArrayUtils,
  ObjectUtils,
  DateUtils,
  FunctionUtils,
  ValidationUtils,
  UrlUtils,
  StorageUtils,
  NotificationUtils,

  /**
   * Генерирует случайный ID
   * @param {number} length - длина
   * @returns {string}
   */
  generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Задержка выполнения
   * @param {number} ms - миллисекунды
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Копирует текст в буфер обмена
   * @param {string} text - текст
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    if (!navigator.clipboard) {
      console.error('Clipboard API не поддерживается в этом браузере.');
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Ошибка копирования в буфер обмена:', error);
      return false;
    }
  },

  /**
   * Определяет тип устройства
   * @returns {string}
   */
  getDeviceType() {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  },

  /**
   * Проверяет поддержку возможности браузером
   * @param {string} feature - возможность
   * @returns {boolean}
   */
  isSupported(feature) {
    const features = {
      localStorage: () => {
        try {
          const test = '__test__';
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch {
          return false;
        }
      },
      speechSynthesis: () => 'speechSynthesis' in window,
      webAudio: () => 'AudioContext' in window || 'webkitAudioContext' in window,
      fileReader: () => 'FileReader' in window,
      geolocation: () => 'geolocation' in navigator,
      notification: () => 'Notification' in window
    };

    return features[feature] ? features[feature]() : false;
  }
};

export default Utils;