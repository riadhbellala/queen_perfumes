import { Perfume, Pack, PackSizePricing } from "@/types";

export const PACK_SIZE_PRICING: PackSizePricing[] = [
  { size: 2, price: 1900 },
  { size: 3, price: 2700 },
  { size: 4, price: 3600 },
  { size: 5, price: 4500 },
  { size: 6, price: 5000 }
];


export const PLACEHOLDER_PERFUMES: Perfume[] = [
  {
    id: "p1",
    name: { fr: "Rose de Nuit", ar: "وردة الليل" },
    description: {
      fr: "Une interprétation moderne et mystérieuse de la rose classique, enveloppée de notes boisées et d'épices douces. Parfait pour les soirées élégantes.",
      ar: "تفسير عصري وغامض للورد الكلاسيكي، مغلف بنفحات خشبية وتوابل ناعمة. مثالي للأمسيات الأنيقة."
    },
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
    scentFamily: "Floral",
    concentration: "EDP",
    inStock: true,
  },
  {
    id: "p2",
    name: { fr: "Éclat d'Agrumes", ar: "إشراقة الحمضيات" },
    description: {
      fr: "Un cocktail pétillant de bergamote, citron et mandarine. Une fragrance lumineuse et énergisante idéale pour les journées ensoleillées.",
      ar: "كوكتيل متلألئ من البرغموت والليمون واليوسفي. عطر مشرق وحيوي مثالي للأيام المشمسة."
    },
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea081d35b4a?w=600&q=80",
    scentFamily: "Frais",
    concentration: "EDT",
    inStock: true,
  },
  {
    id: "p3",
    name: { fr: "Ambre Impérial", ar: "العنبر الإمبراطوري" },
    description: {
      fr: "Un sillage riche et envoûtant mêlant l'ambre chaud, la vanille sensuelle et un soupçon d'encens. Une déclaration d'élégance absolue.",
      ar: "أثر غني وساحر يمزج بين العنبر الدافئ والفانيليا الجذابة ولمسة من البخور. إعلان عن الأناقة المطلقة."
    },
    imageUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&q=80",
    scentFamily: "Oriental",
    concentration: "Parfum",
    inStock: true,
  },
  {
    id: "p4",
    name: { fr: "Jardin Secret", ar: "الحديقة السرية" },
    description: {
      fr: "Un bouquet délicat de pivoines, de muguet et de freesia. Une essence romantique et douce qui évoque le printemps éternel.",
      ar: "باقة رقيقة من الفاوانيا وزنبق الوادي والفريزيا. جوهر رومانسي وناعم يستحضر الربيع الأبدي."
    },
    imageUrl: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80",
    scentFamily: "Floral",
    concentration: "EDP",
    inStock: false,
  },
  {
    id: "p5",
    name: { fr: "Bois de Cèdre", ar: "خشب الأرز" },
    description: {
      fr: "Une fragrance sophistiquée où le cèdre majestueux rencontre la chaleur du patchouli et la douceur du bois de santal.",
      ar: "عطر راقٍ حيث يلتقي خشب الأرز المهيب بدفء الباتشولي ونعومة خشب الصندل."
    },
    imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80",
    scentFamily: "Boisé",
    concentration: "EDP",
    inStock: true,
  },
  {
    id: "p6",
    name: { fr: "Délice Fruité", ar: "بهجة الفواكه" },
    description: {
      fr: "Un accord gourmand et pétillant de framboise, pêche et poire, adouci par une touche de musc blanc.",
      ar: "مزيج لذيذ ومتلألئ من التوت والخوخ والكمثرى، محلى بلمسة من المسك الأبيض."
    },
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
    scentFamily: "Fruité",
    concentration: "EDT",
    inStock: true,
  },
  {
    id: "p7",
    name: { fr: "Oud Mystique", ar: "العود الغامض" },
    description: {
      fr: "Le précieux bois de oud se dévoile dans une composition intense, sombre et fascinante, rehaussée de notes cuirées.",
      ar: "يتجلى خشب العود الثمين في تركيبة مكثفة وداكنة وساحرة، معززة بنفحات جلدية."
    },
    imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80",
    scentFamily: "Oriental",
    concentration: "Parfum",
    inStock: true,
  },
  {
    id: "p8",
    name: { fr: "Brise Océane", ar: "نسيم المحيط" },
    description: {
      fr: "Une évasion olfactive avec des notes marines fraîches, des zestes d'agrumes et un fond subtil de bois flotté.",
      ar: "هروب عطري مع نفحات بحرية منعشة وقشور الحمضيات وقاعدة رقيقة من الأخشاب الطافية."
    },
    imageUrl: "https://images.unsplash.com/photo-1595425964272-fc89fa4541be?w=600&q=80",
    scentFamily: "Frais",
    concentration: "EDT",
    inStock: true,
  },
  {
    id: "p9",
    name: { fr: "Jasmin Éternel", ar: "الياسمين الخالد" },
    description: {
      fr: "L'essence pure et envoûtante du jasmin de Grasse, capturée dans sa forme la plus lumineuse et séduisante.",
      ar: "الجوهر النقي والساحر لياسمين غراس، ملتقط في أكثر صوره إشراقاً وجاذبية."
    },
    imageUrl: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80",
    scentFamily: "Floral",
    concentration: "EDP",
    inStock: true,
  },
  {
    id: "p10",
    name: { fr: "Vanille Noire", ar: "الفانيليا السوداء" },
    description: {
      fr: "Une vanille profonde, addictive et légèrement fumée. Un parfum de caractère qui ne laisse personne indifférent.",
      ar: "فانيليا عميقة ومسببة للإدمان ومدخنة قليلاً. عطر ذو طابع خاص لا يترك أحداً غير مبال."
    },
    imageUrl: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80",
    scentFamily: "Oriental",
    concentration: "EDP",
    inStock: true,
  },
  {
    id: "p11",
    name: { fr: "Santal Royal", ar: "الصندل الملكي" },
    description: {
      fr: "Un hommage au bois de santal précieux, onctueux et lacté, soutenu par des notes d'épices douces.",
      ar: "تكريم لخشب الصندل الثمين، كريمي وحليبي، مدعوم بنفحات من التوابل الحلوة."
    },
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea081d35b4a?w=600&q=80",
    scentFamily: "Boisé",
    concentration: "Parfum",
    inStock: false,
  },
  {
    id: "p12",
    name: { fr: "Fleur de Cerisier", ar: "زهرة الكرز" },
    description: {
      fr: "La beauté éphémère et poétique des fleurs de cerisier dans une fragrance légère, musquée et tendrement florale.",
      ar: "الجمال العابر والاعتباري لأزهار الكرز في عطر خفيف ومسكي وزهري برقة."
    },
    imageUrl: "https://images.unsplash.com/photo-1700587498005-c4a07e9547c6?w=600&q=80",
    scentFamily: "Floral",
    concentration: "EDT",
    inStock: true,
  },
];

export const PLACEHOLDER_PACKS: Pack[] = [
  {
    id: "pack1",
    name: { fr: "Box Découverte Florale", ar: "مجموعة الاكتشاف الزهرية" },
    description: {
      fr: "Explorez notre collection florale emblématique avec cette box exclusive réunissant nos trois plus belles créations autour de la rose, du jasmin et des pivoines.",
      ar: "اكتشفي مجموعتنا الزهرية الأيقونية مع هذا الصندوق الحصري الذي يجمع أجمل ثلاث إبداعات لدينا تعتمد على الورد والياسمين والفاوانيا."
    },
    price: 2700,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    perfumeIds: ["p1", "p4", "p9"],
  },
  {
    id: "pack2",
    name: { fr: "Duo Sensuel Oriental", ar: "الثنائي الشرقي الحسي" },
    description: {
      fr: "Un voyage olfactif envoûtant en terres orientales. L'association parfaite entre l'Ambre Impérial et la Vanille Noire pour une signature mémorable.",
      ar: "رحلة عطرية ساحرة في الأراضي الشرقية. المزيج المثالي بين العنبر الإمبراطوري والفانيليا السوداء لبصمة لا تُنسى."
    },
    price: 1900,
    imageUrl: "https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=600&q=80",
    perfumeIds: ["p3", "p10"],
  },
  {
    id: "pack3",
    name: { fr: "Éclat & Brise", ar: "إشراقة ونسيم" },
    description: {
      fr: "La fraîcheur à l'état pur. Cette box combine des notes d'agrumes lumineuses et des accords marins pour un sillage rafraîchissant toute la journée.",
      ar: "الانتعاش في أنقى صوره. تجمع هذه المجموعة بين النفحات الحمضية المشرقة والاتفاقات البحرية لأثر منعش طوال اليوم."
    },
    price: 1900,
    imageUrl: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=600&q=80",
    perfumeIds: ["p2", "p8"],
  },
  {
    id: "pack4",
    name: { fr: "Forêt Enchantée", ar: "الغابة الساحرة" },
    description: {
      fr: "Un voyage profond dans la forêt avec quatre parfums boisés d'exception : cèdre noble, santal lacté, oud mystérieux et patchouli terreux. Pour celle qui aime les sillages de caractère.",
      ar: "رحلة عميقة في الغابة مع أربعة عطور خشبية استثنائية: الأرز النبيل والصندل الكريمي والعود الغامض والباتشولي الترابي. لمن تعشق عطور الشخصية القوية."
    },
    price: 3600,
    imageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
    perfumeIds: ["p5", "p7", "p10", "p11"],
  },
  {
    id: "pack5",
    name: { fr: "Instant Frais", ar: "لحظة الانتعاش" },
    description: {
      fr: "L'alliance parfaite de la légèreté et de la vitalité. Trois eaux de toilette fraîches et lumineuses pour un quotidien ensoleillé.",
      ar: "التحالف المثالي بين الخفة والحيوية. ثلاث مياه تواليت منعشة ومشرقة لحياة يومية مشمسة."
    },
    price: 1900,
    imageUrl: "https://images.unsplash.com/photo-1619994403073-2cec844b8c63?w=600&q=80",
    perfumeIds: ["p2", "p8", "p12"],
  },
  {
    id: "pack6",
    name: { fr: "Oud Précieux", ar: "العود النفيس" },
    description: {
      fr: "Un duo exclusif pour les amatrices de parfums rares et intenses. L'Oud Mystique et l'Ambre Impérial se conjuguent pour une expérience olfactive d'une richesse incomparable.",
      ar: "ثنائي حصري لعاشقات العطور النادرة والمكثفة. يجتمع العود الغامض والعنبر الإمبراطوري لتجربة عطرية لا مثيل لها من حيث الثراء."
    },
    price: 1900,
    imageUrl: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80",
    perfumeIds: ["p7", "p3"],
  },
];
