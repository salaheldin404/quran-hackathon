import { SYSTEM_PROMPT } from "../prompts";
import { ReflectionRequest } from "../schemas";
import { UI_THEME_COLORS } from "./constants";
import { fetchBatchVerses } from "@/lib/quran/api";
import { ReflectionResponse } from "@/types/reflection";
import { prisma } from "@/lib/prisma";
import { FALLBACK_REFLECTION } from "./fallback";
import { ATHKAR_MAP, AthkarId } from "../athkar";
import { aiRouter } from "../router";
import { AIResponse } from "../schemas";
import { Prisma } from "@/generated/prisma/client";
import { AIUsageTracker } from "../usage/tracker";
import { UserType } from "../usage/types";

type VerseWithAyah = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  tafsir?: string;
};

export class ReflectionService {

  static async generate(
    request: ReflectionRequest,
    userId: string,
    identifier: string,
    userType: UserType = "authenticated",
  ): Promise<ReflectionResponse & { id: string }> {
    // 1. Check AI Usage Limits (Only for real AI generation)
    const usage = await AIUsageTracker.getStatus(identifier, userId, userType);
    if (!usage.canGenerate) {
      throw new Error(`AI_LIMIT:${usage.reason}`);
    }

    try {
      // 2. Multi-Model AI Analysis
      const userMessage = `
User Emotion: ${request.emotionTag}
User Context: ${request.userInput || "No context."}
Response Language: Arabic (اللغة العربية)
`;

      const aiResult = await aiRouter.generateReflection(
        SYSTEM_PROMPT,
        userMessage,
      );
      const aiRawResponse = aiResult.data;

      let versesWithContent: VerseWithAyah[] = [];
      if (aiResult.model === "static-fallback") {
        const fallbackResponse = aiRawResponse as ReflectionResponse;
        versesWithContent = fallbackResponse.verses;
      } else {
        const generatedResponse = aiRawResponse as AIResponse;
        versesWithContent = await fetchBatchVerses(
          generatedResponse.verseReferences || [],
        );

        //  Track Usage for successful real AI generation
        await AIUsageTracker.track({
          userId,
          identifier,
          provider: aiResult.provider,
          model: aiResult.model,
          cached: false,
        });
      }

      const generatedResponse = aiRawResponse as AIResponse;
      const fallbackResponse = aiRawResponse as ReflectionResponse;

      const finalResponse: ReflectionResponse = {
        emotionTag: aiRawResponse.emotionTag as ReflectionResponse["emotionTag"],
        themes: aiRawResponse.themes,
        verses: versesWithContent.map((v) => ({
          surahNumber: v.surahNumber,
          surahName: v.surahName,
          ayahNumber: v.ayahNumber,
          text: v.text,
          tafsir: v.tafsir,
        })),
        athkar: generatedResponse.athkarIds
          ? generatedResponse.athkarIds.map((id) => {
              const mapped = ATHKAR_MAP[id as AthkarId];
              return {
                arabic: mapped.arabic,
                transliteration: mapped.transliteration,
                translation: mapped.translation,
                purpose: mapped.purpose,
                reference: mapped.reference,
              };
            })
          : fallbackResponse.athkar, // For static fallback which has direct athkar
        reflection: aiRawResponse.reflection,
        wirdPlan: aiRawResponse.wirdPlan,
        motivationalMessage: aiRawResponse.motivationalMessage,
        uiColorTheme:
          UI_THEME_COLORS[
            aiRawResponse.emotionTag as keyof typeof UI_THEME_COLORS
          ] || "#7c3aed",
      };

      const log = await prisma.emotionLog.create({
        data: {
          userId,
          emotionTag: finalResponse.emotionTag,
          userInput: request.userInput || null,
          aiResponse: finalResponse as unknown as Prisma.InputJsonValue,
        },
      });

      return { ...finalResponse, id: log.id };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.startsWith("AI_LIMIT:")) {
        throw error;
      }

      console.error(
        "[REFLECTION_SERVICE_FAIL] Critical failure, using static fallback.",
        error,
      );

      const log = await prisma.emotionLog.create({
        data: {
          userId,
          emotionTag: request.emotionTag || "peaceful",
          userInput: request.userInput || null,
          aiResponse: FALLBACK_REFLECTION as unknown as Prisma.InputJsonValue,
        },
      });

      return { ...FALLBACK_REFLECTION, id: log.id };
    }
  }
}
