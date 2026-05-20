import { z } from "zod";
import { REFLECTION_MOODS } from "./reflection/constants";

export const ReflectionRequestSchema = z
  .object({
    userInput: z.string().max(300).optional(),
    emotionTag: z.enum(REFLECTION_MOODS as [string, ...string[]]).optional(),
  })
  .refine((data) => data.userInput || data.emotionTag, {
    message: "Either userInput or emotionTag must be provided",
  });

export const AIResponseSchema = z.object({
  emotionTag: z.string(),
  themes: z.array(z.string()).min(1).max(5),
  verseReferences: z
    .array(
      z.object({
        surahNumber: z.number().int().min(1).max(114),
        ayahNumber: z.number().int().min(1),
      }),
    )
    .min(1),
  athkarIds: z.array(
    z.enum([
      "tasbeeh",
      "istighfar",
      "salawat",
      "dua_anxiety",
      "dua_patience",
      "dua_distress",
      "dua_guidance",
      "dua_peace",
      "dua_strength",
      "dua_gratitude",
      "morning_remembrance",
      "evening_remembrance",
    ]),
  ),
  reflection: z.string().min(10),
  wirdPlan: z.string().min(5),
  motivationalMessage: z.string().min(5),
});

export type ReflectionRequest = z.infer<typeof ReflectionRequestSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
