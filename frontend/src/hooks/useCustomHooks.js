import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

/* ----------------------------------------------------------
   DEBOUNCE HOOK
---------------------------------------------------------- */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/* ----------------------------------------------------------
   CLICK OUTSIDE HOOK
---------------------------------------------------------- */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref?.current || ref.current.contains(event.target)) {
        return;
      }

      if (typeof handler === 'function') {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/* ----------------------------------------------------------
   LOCAL STORAGE HOOK
---------------------------------------------------------- */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);

      return item
        ? JSON.parse(item)
        : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function
            ? value(storedValue)
            : value;

        setStoredValue(valueToStore);

        window.localStorage.setItem(
          key,
          JSON.stringify(valueToStore)
        );
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/* ----------------------------------------------------------
   OPTIONAL DEFAULT EXPORT
   Prevents import mismatch during hot reload
---------------------------------------------------------- */
export default {
  useDebounce,
  useClickOutside,
  useLocalStorage,
};