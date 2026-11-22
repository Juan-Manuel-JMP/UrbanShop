// localStorage y evento simple.
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('no se guardo en localStorage:', error);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
    }
  }
};

/** disparo un evento global para que la interfaz se actualice. */
export const emit = (name, detail = {}) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));
