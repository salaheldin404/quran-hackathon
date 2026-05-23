import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProviderResponse, AIProviderError } from "./types";
import { BaseAIProvider } from "./base";
import { withTimeout } from "../utils/timeout";

export class GeminiProvider extends BaseAIProvider {
  public name = "Gemini";

  private genAI: GoogleGenerativeAI;

  constructor(
    private apiKey: string,
    public modelName: string,
  ) {
    super();
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generate<T>(
    prompt: string,
    userMessage: string,
  ): Promise<AIProviderResponse<T>> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.5,
          topP: 0.8,
          maxOutputTokens: 3000,
          responseMimeType: "application/json",
        },
      });

      const result = await withTimeout(
        model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
            {
              role: "user",
              parts: [{ text: userMessage }],
            },
          ],
        }),
        30000,
      );

      const response = await result.response;
      const text = response.text();

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
        error instanceof Error ? error.message : "Unknown Gemini error";

      throw new AIProviderError(this.name, this.modelName, 500, message);
    }
  }
}
