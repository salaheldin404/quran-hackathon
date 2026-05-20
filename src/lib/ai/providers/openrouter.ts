import { AIProviderResponse, AIProviderError } from "./types";

import { BaseAIProvider } from "./base";
import { isRetryableProviderError } from "../utils/error";

export class OpenRouterProvider extends BaseAIProvider {
  public name = "OpenRouter";

  constructor(
    private apiKey: string,
    public modelName: string,
  ) {
    super();
  }
  async generate<T>(
    prompt: string,
    userMessage: string,
  ): Promise<AIProviderResponse<T>> {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
            "X-Title": "Sakinah Streams",
          },
          body: JSON.stringify({
            model: this.modelName,
            response_format: {
              type: "json_object",
            },
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content: prompt,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new AIProviderError(
          this.name,
          this.modelName,
          response.status,
          `OpenRouter error ${response.status}`,
          response.status >= 500 || response.status === 429,
        );
      }

      const result = await response.json();

      const text = result?.choices?.[0]?.message?.content;

      const data = this.parse<T>(text);

      return {
        data,
        provider: this.name,
        model: this.modelName,
      };
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Unknown OpenRouter error";

      throw new AIProviderError(
        this.name,
        this.modelName,
        500,
        message,
        isRetryableProviderError(error),
      );
    }
  }
}
