import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  // Get stored value from local storage or return initialValue
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  // Setter function that persists new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(`Tried setting localStorage key "${key}" even though window is not defined`);
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValueRef.current) : value;

        setStoredValue(newValue);
        storedValueRef.current = newValue;

        window.localStorage.setItem(key, JSON.stringify(newValue));
        window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key } }));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    const latest = readValue();
    setStoredValue((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(latest)) {
        return prev;
      }
      return latest;
    });
  }, [key, readValue]);

  useEffect(() => {
    const handleStorageChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.key !== key) {
        return;
      }
      if (event instanceof StorageEvent && event.key !== key) {
        return;
      }
      const latest = readValue();
      setStoredValue((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(latest)) {
          return prev;
        }
        return latest;
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-update', handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
