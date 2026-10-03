'use client';

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  applyTextSize,
  getServerTextSizeSnapshot,
  getTextSizeSnapshot,
  setStoredTextSize,
  subscribeTextSize,
  type TextSize,
} from '@/lib/accessibility';

type TextSizeContextValue = {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
};

const TextSizeContext = createContext<TextSizeContextValue | null>(null);

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const textSize = useSyncExternalStore(
    subscribeTextSize,
    getTextSizeSnapshot,
    getServerTextSizeSnapshot,
  );

  // Applying the size to the DOM is a side effect, not a state update, so this
  // is allowed. The inline script already ran it before first paint.
  useEffect(() => {
    applyTextSize(textSize);
  }, [textSize]);

  return (
    <TextSizeContext.Provider
      value={{ textSize, setTextSize: setStoredTextSize }}
    >
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const context = useContext(TextSizeContext);

  if (!context) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }

  return context;
}
