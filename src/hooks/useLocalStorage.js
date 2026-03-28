import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Re-hydrate Set from array
        return initialValue instanceof Set ? new Set(parsed) : parsed;
      }
    } catch {
      // ignore
    }
    return initialValue;
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    try {
      const toJson = valueToStore instanceof Set ? [...valueToStore] : valueToStore;
      window.localStorage.setItem(key, JSON.stringify(toJson));
    } catch {
      // ignore
    }
  };

  return [storedValue, setValue];
}
