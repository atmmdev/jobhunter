import { z } from 'zod';

import type { AiClient, StructuredChatInput } from '@/modules/domain/ai/ai-client';
import { ValidationError } from '@/modules/domain/shared/errors';

/**
 * OpenAI-compatible structured chat client (JSON object responses).
 */
export class OpenAiCompatibleClient implements AiClient {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly model: string,
    private readonly baseUrl: string,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async chatStructured<T>(input: StructuredChatInput<T>): Promise<T> {
    if (!this.isConfigured() || !this.apiKey) {
      throw new ValidationError('OPENAI_API_KEY is not configured');
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `${input.system}\n\nReturn ONLY valid JSON matching the required schema. Prompt version: ${input.promptVersion}`,
          },
          { role: 'user', content: input.user },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      throw new ValidationError(`AI provider error: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new ValidationError('AI provider returned empty content');
    }

    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      throw new ValidationError('AI provider returned invalid JSON');
    }

    const parsed = input.schema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError(`AI output failed schema validation: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}

export const aiScoreSchema = z.object({
  score: z.number().min(0).max(100),
  explanation: z.string().min(1),
});

export type AiScoreDto = z.infer<typeof aiScoreSchema>;
