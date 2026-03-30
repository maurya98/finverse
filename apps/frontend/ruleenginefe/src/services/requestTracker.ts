type Listener = (inFlightCount: number) => void;

let inFlightCount = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(inFlightCount);
}

export function getInFlightCount(): number {
  return inFlightCount;
}

export function subscribeToRequestTracker(listener: Listener): () => void {
  listeners.add(listener);
  // Emit current value so subscribers can render immediately.
  listener(inFlightCount);
  return () => listeners.delete(listener);
}

/**
 * Track an async operation as "in-flight" for global loader purposes.
 * Ensure callers await the returned promise so the counter is decremented.
 */
export async function trackRequest<T>(fn: () => Promise<T>): Promise<T> {
  inFlightCount += 1;
  emit();
  try {
    return await fn();
  } finally {
    inFlightCount = Math.max(0, inFlightCount - 1);
    emit();
  }
}

