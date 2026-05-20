import { ReflectionResponse } from "@/types/reflection";
import { GeminiProvider } from "./providers/gemini";
import { OpenRouterProvider } from "./providers/openrouter";
import {
  AIProvider,
  AIProviderResponse,
  AIProviderError,
} from "./providers/types";
import { FALLBACK_REFLECTION } from "./reflection/fallback";
import { AIResponse } from "./schemas";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

/**
 * Type-safe response from the AI Router.
 * Data can be either the structured AIResponse (for post-processing)
 * or a full ReflectionResponse (for static fallbacks).
 */
export type RouterResponse = AIProviderResponse<AIResponse | ReflectionResponse> & {
  isFallback: boolean;
};

export class ModelRouter {
  private readonly providers: AIProvider[];

  constructor() {
    this.providers = [
      new GeminiProvider(GEMINI_API_KEY, "gemini-2.5-flash-lite"),
      new GeminiProvider(GEMINI_API_KEY, "gemini-2.5-flash"),
      new OpenRouterProvider(OPENROUTER_API_KEY, "google/gemma-4-31b-it:free"),
    ];
  }

  async generateReflection(
    prompt: string,
    userMessage: string,
  ): Promise<RouterResponse> {
    for (const provider of this.providers) {
      try {

        const result = await provider.generate<AIResponse>(
          prompt,
          userMessage,
        );

        return {
          ...result,
          isFallback: provider !== this.providers[0],
        };
      } catch (error: unknown) {
        if (error instanceof AIProviderError && !error.isRetryable) {
          console.error(`[AI_FATAL] ${provider.name}: ${error.message}`);
          break;
        }

        const message = error instanceof Error ? error.message : "Unknown error";
        console.warn(`[AI_FALLBACK] ${provider.name} failed: ${message}`);
      }
    }

    return {
      data: FALLBACK_REFLECTION,
      provider: "system",
      model: "static-fallback",
      isFallback: true,
    };
  }
}
export const aiRouter = new ModelRouter();
