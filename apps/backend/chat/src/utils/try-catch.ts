export async function tryCatch<T>(
  fn: (() => T | Promise<T>) | Promise<T>
): Promise<[Error | null, T | null]> {
  try {
    const data = typeof fn === "function" ? await fn() : await fn;
    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error("Unknown error"), null];
  }
}
