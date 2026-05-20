import { ReflectionResponse } from "@/types/reflection";

/**
 * Production-safe static fallback reflection (Arabic Only).
 * Used when AI quota is hit, or when parsing/validation fails.
 */
export const FALLBACK_REFLECTION: ReflectionResponse = {
  emotionTag: "هادئ",
  themes: ["الصبر", "الأمل", "السكينة"],
  verses: [
    {
      surahNumber: 94,
      surahName: "سورة الشرح",
      ayahNumber: 6,
      text: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    }
  ],
  athkar: [
    {
      arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      transliteration: "Hasbunallahu wa ni'mal wakeel",
      translation: "حسبنا الله ونعم الوكيل.",
      purpose: "للقوة الداخلية والتوكل.",
      reference: "Surah Ali 'Imran 3:173"
    }
  ],
  reflection: "الله يعلم ما في قلبك وما تحمله من أعباء. رحمته أقرب إليك مما تتخيل، ومع كل ضيق هناك طريق لليسر. خذ نفساً عميقاً وثق أنك لست وحدك.",
  wirdPlan: "اقرأ سورة الشرح وتأمل في معانيها لمدة خمس دقائق.",
  motivationalMessage: "خطوة صغيرة واحدة للأمام تكفي اليوم.",
  uiColorTheme: "#059669",
};
