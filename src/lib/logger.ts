export function devLog(...args: unknown[]) {
  if (import.meta.env.DEV) console.log(...args);
}

export function devWarn(...args: unknown[]) {
  if (import.meta.env.DEV) console.warn(...args);
}

export function devInfo(...args: unknown[]) {
  if (import.meta.env.DEV) console.info(...args);
}

export function devError(...args: unknown[]) {
  if (import.meta.env.DEV) console.error(...args);
}



