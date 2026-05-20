/**
 * Utilities for cleaning and sanitizing AI-generated strings.
 */

/**
 * Extracts the first JSON object found in a string.
 * Handles cases where the AI adds prose before or after the JSON.
 */
export function extractJsonObject(input: string): string {
  // 1. Remove markdown code fences if present
  const sanitized = input.replace(/```json|```/g, "").trim();

  // 2. Find the first occurrence of '{' and the last occurrence of '}'
  const firstBrace = sanitized.indexOf("{");
  const lastBrace = sanitized.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("No valid JSON object found in AI response.");
  }

  return sanitized.substring(firstBrace, lastBrace + 1);
}

/**
 * Basic check for common JSON truncation signals.
 */
export function isTruncated(json: string): boolean {
  const openBraces = (json.match(/{/g) || []).length;
  const closeBraces = (json.match(/}/g) || []).length;
  const openBrackets = (json.match(/\[/g) || []).length;
  const closeBrackets = (json.match(/]/g) || []).length;

  return openBraces !== closeBraces || openBrackets !== closeBrackets;
}
