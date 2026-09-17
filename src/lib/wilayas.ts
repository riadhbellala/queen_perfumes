export type Wilaya = {
  code: number;
  name: { fr: string; ar: string };
};

// Source: community-maintained open dataset (github.com/ihahachi/Algeria-Cities),
// reflecting Algeria's 69-wilaya division. One known labeling bug fixed: wilaya
// code 30 was mislabeled "Touggourt" in the source despite holding Ouargla's
// communes (Ouargla, Hassi Messaoud, Rouissat...) — relabeled "Ouargla" here.
export const WILAYAS: Wilaya[] = [
  { code: 1, name: { fr: "Adrar", ar: "أدرار" } },
  { code: 2, name: { fr: "Chlef", ar: "الشلف" } },
  { code: 3, name: { fr: "Laghouat", ar: "الأغواط" } },
  { code: 4, name: { fr: "Oum El Bouaghi", ar: "أم البواقي" } },
  { code: 5, name: { fr: "Batna", ar: "باتنة" } },
  { code: 6, name: { fr: "Béjaïa", ar: "بجاية" } },
  { code: 7, name: { fr: "Biskra", ar: "بسكرة" } },
  { code: 8, name: { fr: "Béchar", ar: "بشار" } },
  { code: 9, name: { fr: "Blida", ar: "البليدة" } },
  { code: 10, name: { fr: "Bouira", ar: "البويرة" } },
  { code: 11, name: { fr: "Tamanrasset", ar: "تمنراست" } },
  { code: 12, name: { fr: "Tébessa", ar: "تبسة" } },
  { code: 13, name: { fr: "Tlemcen", ar: "تلمسان" } },
  { code: 14, name: { fr: "Tiaret", ar: "تيارت" } },
  { code: 15, name: { fr: "Tizi Ouzou", ar: "تيزي وزو" } },
  { code: 16, name: { fr: "Alger", ar: "الجزائر" } },
  { code: 17, name: { fr: "Djelfa", ar: "الجلفة" } },
  { code: 18, name: { fr: "Jijel", ar: "جيجل" } },
  { code: 19, name: { fr: "Sétif", ar: "سطيف" } },
  { code: 20, name: { fr: "Saïda", ar: "سعيدة" } },
  { code: 21, name: { fr: "Skikda", ar: "سكيكدة" } },
  { code: 22, name: { fr: "Sidi Bel Abbès", ar: "سيدي بلعباس" } },
  { code: 23, name: { fr: "Annaba", ar: "عنابة" } },
  { code: 24, name: { fr: "Guelma", ar: "قالمة" } },
  { code: 25, name: { fr: "Constantine", ar: "قسنطينة" } },
  { code: 26, name: { fr: "Médéa", ar: "المدية" } },
  { code: 27, name: { fr: "Mostaganem", ar: "مستغانم" } },
  { code: 28, name: { fr: "M'Sila", ar: "المسيلة" } },
  { code: 29, name: { fr: "Mascara", ar: "معسكر" } },
  { code: 30, name: { fr: "Ouargla", ar: "ورقلة" } },
  { code: 31, name: { fr: "Oran", ar: "وهران" } },
  { code: 32, name: { fr: "El Bayadh", ar: "البيض" } },
  { code: 33, name: { fr: "Illizi", ar: "إليزي" } },
  { code: 34, name: { fr: "Bordj Bou Arreridj", ar: "برج بوعريريج" } },
  { code: 35, name: { fr: "Boumerdès", ar: "بومرداس" } },
  { code: 36, name: { fr: "El Tarf", ar: "الطارف" } },
  { code: 37, name: { fr: "Tindouf", ar: "تندوف" } },
  { code: 38, name: { fr: "Tissemsilt", ar: "تيسمسيلت" } },
  { code: 39, name: { fr: "El Oued", ar: "الوادي" } },
  { code: 40, name: { fr: "Khenchela", ar: "خنشلة" } },
  { code: 41, name: { fr: "Souk Ahras", ar: "سوق أهراس" } },
  { code: 42, name: { fr: "Tipaza", ar: "تيبازة" } },
  { code: 43, name: { fr: "Mila", ar: "ميلة" } },
  { code: 44, name: { fr: "Aïn Defla", ar: "عين الدفلة" } },
  { code: 45, name: { fr: "Naâma", ar: "النعامة" } },
  { code: 46, name: { fr: "Aïn Témouchent", ar: "عين تيموشنت" } },
  { code: 47, name: { fr: "Ghardaïa", ar: "غرداية" } },
  { code: 48, name: { fr: "Relizane", ar: "غليزان" } },
  { code: 49, name: { fr: "Timimoun", ar: "تيميمون" } },
  { code: 50, name: { fr: "Bordj Badji Mokhtar", ar: "برج باجي مختار" } },
  { code: 51, name: { fr: "Ouled Djellal", ar: "أولاد جلال" } },
  { code: 52, name: { fr: "Béni Abbès", ar: "بني عباس" } },
  { code: 53, name: { fr: "Ain Salah", ar: "عين صالح" } },
  { code: 54, name: { fr: "Ain Guezzam", ar: "عين قزام" } },
  { code: 55, name: { fr: "Touggourt", ar: "تقرت" } },
  { code: 56, name: { fr: "Djanet", ar: "جانت" } },
  { code: 57, name: { fr: "El Meghaier", ar: "المغير" } },
  { code: 58, name: { fr: "El Menia", ar: "المنيعة" } },
  { code: 59, name: { fr: "Aflou", ar: "أفلو" } },
  { code: 60, name: { fr: "Barika", ar: "بريكة" } },
  { code: 61, name: { fr: "El Kantara", ar: "القنطرة" } },
  { code: 62, name: { fr: "Bir El Ater", ar: "بئر العاتر" } },
  { code: 63, name: { fr: "El Aricha", ar: "العريشة" } },
  { code: 64, name: { fr: "Ksar Chellala", ar: "قصر الشلالة" } },
  { code: 65, name: { fr: "Ain Oussera", ar: "عين وسارة" } },
  { code: 66, name: { fr: "Messaad", ar: "مسعد" } },
  { code: 67, name: { fr: "Ksar El Boukhari", ar: "قصر البخاري" } },
  { code: 68, name: { fr: "Boussaâda", ar: "بوسعادة" } },
  { code: 69, name: { fr: "El Abiodh Sidi Cheikh", ar: "الأبيض سيدي الشيخ" } },
];

// Estimated flat delivery fees by zone, standing in until real carrier rates
// (Yalidine/ZR Express) are wired up — see CLAUDE.md progress log.
const CENTRAL_WILAYA_CODES = new Set([9, 16, 35, 42]); // Blida, Alger, Boumerdès, Tipaza
const REMOTE_WILAYA_CODES = new Set([1, 11, 33, 37, 49, 50, 52, 53, 54, 56]); // Adrar, Tamanrasset, Illizi, Tindouf, Timimoun, Bordj Badji Mokhtar, Béni Abbès, In Salah, In Guezzam, Djanet

export type DeliveryType = "home" | "office";

export function getDeliveryFee(wilayaCode: number, deliveryType: DeliveryType = "home"): number {
  const base = CENTRAL_WILAYA_CODES.has(wilayaCode) ? 400 : REMOTE_WILAYA_CODES.has(wilayaCode) ? 900 : 600;
  // Office/stopdesk pickup skips home drop-off, so it's cheaper — matches how
  // Algerian carriers (Yalidine, ZR Express) typically price the two options.
  return deliveryType === "office" ? Math.max(200, base - 200) : base;
}
