import type { FormatRequest, FormatResponse } from "./format.worker";

type Pending = { resolve: (code: string) => void; reject: (error: Error) => void };

/** Formatted results by source. Switching back to a library/UI combination is then instant. */
const CACHE_LIMIT = 40;
const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, Pending>();

const getWorker = () => {
  if (worker) return worker;
  worker = new Worker(new URL("./format.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<FormatResponse>) => {
    const { id, code, error } = event.data;
    const request = pending.get(id);
    if (!request) return;
    pending.delete(id);
    if (code !== undefined) request.resolve(code);
    else request.reject(new Error(error));
  };
  worker.onerror = () => {
    // The worker could not start (blocked, unsupported): drop it and let callers fall back.
    worker?.terminate();
    worker = null;
    for (const request of pending.values()) request.reject(new Error("Format worker failed"));
    pending.clear();
  };
  return worker;
};

const formatInWorker = (code: string) =>
  new Promise<string>((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, code } satisfies FormatRequest);
  });

const formatOnMainThread = async (code: string) => {
  const { prettierFormat } = await import("./prettierFormat");
  return prettierFormat(code);
};

/** The formatted code if it is already known, so callers can show it with no wait. */
export const getFormattedCode = (code: string) => cache.get(code);

/** Starts the worker and loads Prettier inside it, so the first real format is quicker. */
export const warmFormatter = () => {
  try {
    getWorker();
  } catch {
    /* formatCode falls back to the main thread */
  }
};

export const formatCode = (code: string): Promise<string> => {
  const cached = cache.get(code);
  if (cached !== undefined) return Promise.resolve(cached);

  let job = inFlight.get(code);
  if (!job) {
    job = formatInWorker(code)
      .catch(() => formatOnMainThread(code))
      .then((formatted) => {
        cache.set(code, formatted);
        if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value!);
        return formatted;
      })
      .finally(() => inFlight.delete(code));
    inFlight.set(code, job);
  }
  return job;
};
