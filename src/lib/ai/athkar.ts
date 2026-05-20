export const ATHKAR_MAP = {
  tasbeeh: {
    id: "tasbeeh",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    translation: "Glory be to Allah and praise be to Him.",
    purpose: "ذكر خفيف يبعث الطمأنينة ويزيد القرب من الله.",
    reference: "Sahih Muslim 2694",
  },

  istighfar: {
    id: "istighfar",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha wa atubu ilayh",
    translation: "I seek Allah’s forgiveness and repent to Him.",
    purpose: "الاستغفار يساعد على تهدئة القلب وتجديد الأمل.",
    reference: "Sahih al-Bukhari 6307",
  },

  salawat: {
    id: "salawat",
    arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد",
    transliteration: "Allahumma salli wa sallim ala nabiyyina Muhammad",
    translation: "O Allah, send prayers and peace upon our Prophet Muhammad.",
    purpose: "الصلاة على النبي ﷺ تجلب السكينة والرحمة.",
    reference: "Sahih Muslim 408",
  },

  dua_anxiety: {
    id: "dua_anxiety",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    transliteration: "Allahumma inni a'udhu bika min al-hammi wal-hazan",
    translation: "O Allah, I seek refuge in You from anxiety and sorrow.",
    purpose: "دعاء نبوي يساعد على التخفيف من القلق والحزن.",
    reference: "Sahih al-Bukhari 2893",
  },

  dua_patience: {
    id: "dua_patience",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا",
    transliteration: "Rabbana afrigh alayna sabran wa thabbit aqdamana",
    translation: "Our Lord, pour upon us patience and make our steps firm.",
    purpose: "دعاء يعزز الصبر والثبات في الأوقات الصعبة.",
    reference: "Quran 2:250",
  },

  dua_distress: {
    id: "dua_distress",
    arabic:
      "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translation:
      "There is no deity except You. Glory be to You. Indeed, I was among the wrongdoers.",
    purpose: "دعاء عظيم للكرب والضيق وطلب الفرج.",
    reference: "Quran 21:87",
  },

  dua_guidance: {
    id: "dua_guidance",
    arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    transliteration: "Allahumma ihdini wa saddidni",
    translation: "O Allah, guide me and keep me steadfast.",
    purpose: "دعاء لطلب الهداية والثبات والوضوح.",
    reference: "Sahih Muslim 2725",
  },

  dua_peace: {
    id: "dua_peace",
    arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ",
    transliteration: "Allahumma antas-salam wa minkas-salam",
    translation: "O Allah, You are Peace and from You comes peace.",
    purpose: "ذكر يساعد على الشعور بالسكينة والراحة.",
    reference: "Sahih Muslim 591",
  },

  dua_strength: {
    id: "dua_strength",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "HasbunAllahu wa ni'mal wakeel",
    translation:
      "Allah is sufficient for us, and He is the best disposer of affairs.",
    purpose: "يعزز التوكل والثقة بالله وقت الصعوبة.",
    reference: "Sahih al-Bukhari 4563",
  },

  dua_gratitude: {
    id: "dua_gratitude",
    arabic:
      "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration:
      "Allahumma a'inni ala dhikrika wa shukrika wa husni ibadatik",
    translation:
      "O Allah, help me remember You, thank You, and worship You well.",
    purpose: "دعاء يعزز الامتنان والقرب من الله.",
    reference: "Sunan Abi Dawud 1522",
  },

  morning_remembrance: {
    id: "morning_remembrance",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
    transliteration: "Asbahna wa asbahal-mulku lillah",
    translation:
      "We have entered the morning and all sovereignty belongs to Allah.",
    purpose: "ذكر صباحي يمنح القلب طمأنينة وبداية هادئة.",
    reference: "Sahih Muslim 2723",
  },

  evening_remembrance: {
    id: "evening_remembrance",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
    transliteration: "Amsayna wa amsal-mulku lillah",
    translation:
      "We have entered the evening and all sovereignty belongs to Allah.",
    purpose: "ذكر مسائي يساعد على السكينة والراحة.",
    reference: "Sahih Muslim 2723",
  },
} as const;

export type AthkarId = keyof typeof ATHKAR_MAP;
