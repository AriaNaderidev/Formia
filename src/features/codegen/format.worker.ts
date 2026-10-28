import { prettierFormat } from "./prettierFormat";

export type FormatRequest = { id: number; code: string };
export type FormatResponse = { id: number; code?: string; error?: string };

// Load and initialise Prettier now, while the user is still reading the options.
void prettierFormat("0").catch(() => {});

// Formatting a whole form takes long enough to freeze the page, so it runs off the main thread.
self.onmessage = async (event: MessageEvent<FormatRequest>) => {
  const { id, code } = event.data;
  try {
    const formatted = await prettierFormat(code);
    self.postMessage({ id, code: formatted } satisfies FormatResponse);
  } catch (error) {
    self.postMessage({ id, error: String(error) } satisfies FormatResponse);
  }
};
