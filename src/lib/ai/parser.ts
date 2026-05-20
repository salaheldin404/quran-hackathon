import { AIResponseSchema, AIResponse } from "./schemas";
import { extractJsonObject } from "./sanitize";

export function parseGeminiResponse(content: string): AIResponse {
  try {
    // 1. Extract potential JSON object from response
    const jsonString = extractJsonObject(content);

    // 2. Check for truncation before parsing (optional but good for logging)
    // if (isTruncated(jsonString)) {
    //   console.warn("[GEMINI_PARSER_WARNING] Detected potentially truncated JSON.");
    // }

    // 3. Parse JSON string
    const parsed = JSON.parse(jsonString);
    // 4. Validate with Zod for strict structure & type safety
    return AIResponseSchema.parse(parsed);

  } catch (error) {
    // We log for infrastructure monitoring, but the service layer will handle the fallback
    if (error instanceof Error) {
      console.error(`[DETAILS] ${error.message}`);
    }
    throw error; // Rethrow to trigger the graceful fallback in the service
  }
}


export function sanitizeAIResponse(text: string): string {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export function extractJSONObject(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("No JSON object found in AI response");
  }

  return match[0];
}

export function parseAIResponse<T>(text: string): T {
  const sanitized = sanitizeAIResponse(text);
  const extracted = extractJSONObject(sanitized);

  const parsed = JSON.parse(extracted);

  return AIResponseSchema.parse(parsed) as T;
}