import type { z } from 'zod';

export interface StructuredChatInput<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  promptVersion: string;
}

/**
 * Provider-agnostic AI port for structured outputs.
 */
export interface AiClient {
  isConfigured(): boolean;
  chatStructured<T>(input: StructuredChatInput<T>): Promise<T>;
}
