/**
 * Text-size preferences (demande F24). Isomorphic: the provider and the
 * pre-paint inline script in `src/app/layout.tsx` share these values.
 */

export const textSizes = ['default', 'large', 'xlarge'] as const;

export type TextSize = (typeof textSizes)[number];

export const textSizeLabels: Record<TextSize, string> = {
  default: 'Normale',
  large: 'Grande',
  xlarge: 'Très grande',
};

export const TEXT_SIZE_STORAGE_KEY = 'preskenler-text-size';

export const textSizeScale: Record<TextSize, string> = {
  default: '100%',
  large: '112.5%',
  xlarge: '125%',
};

export function isTextSize(value: unknown): value is TextSize {
  return (
    typeof value === 'string' &&
    (textSizes as readonly string[]).includes(value)
  );
}

/**
 * Scale the whole UI by changing the root font size. Tailwind sizes are
 * `rem`-based, so every spacing/typography step scales with it.
 */
export function applyTextSize(size: TextSize) {
  const root = document.documentElement;
  root.style.fontSize = textSizeScale[size];
  root.dataset.textSize = size;
}

/**
 * Tiny external store for the text-size preference. `useSyncExternalStore`
 * keeps the read out of an effect (the repo's lint rule forbids setState in
 * effects) and lets the saved value hydrate cleanly.
 */
let currentTextSize: TextSize | null = null;
const listeners = new Set<() => void>();

export function subscribeTextSize(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTextSizeSnapshot(): TextSize {
  if (currentTextSize) {
    return currentTextSize;
  }

  try {
    const saved =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY)
        : null;

    if (isTextSize(saved)) {
      currentTextSize = saved;
      return saved;
    }
  } catch {
    // Storage unavailable (private mode): fall through to the default.
  }

  return 'default';
}

export function getServerTextSizeSnapshot(): TextSize {
  return 'default';
}

/** Test helper: drop the cached value so each test starts clean. */
export function resetTextSizeStore() {
  currentTextSize = null;
}

export function setStoredTextSize(size: TextSize) {
  currentTextSize = size;
  applyTextSize(size);

  try {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch {
    // Storage can be unavailable; the in-memory value still applies.
  }

  for (const listener of listeners) {
    listener();
  }
}

/** Inline script that applies the stored size before first paint. */
export const textSizeScript = `(function(){try{var s=localStorage.getItem('${TEXT_SIZE_STORAGE_KEY}');if(s==='large'||s==='xlarge'){document.documentElement.style.fontSize=s==='large'?'112.5%':'125%';document.documentElement.dataset.textSize=s;}}catch(e){}})();`;
