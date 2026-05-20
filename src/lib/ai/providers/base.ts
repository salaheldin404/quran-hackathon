import { parseAIResponse } from "../parser";
import { AIProvider, AIProviderError, AIProviderResponse } from "./types";

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract modelName: string;

  protected parse<T>(text: string): T {
    if (!text) {
      throw new AIProviderError(
        this.name,
        this.modelName,
        500,
        "Empty AI response",
        true,
      );
    }

    return parseAIResponse<T>(text);
  }

  abstract generate<T>(
    prompt: string,
    userMessage: string,
  ): Promise<AIProviderResponse<T>>;
}