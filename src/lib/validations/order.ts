import { z } from "zod";

// Accepts local (0[5-7]XXXXXXXX) and international (+213[5-7]XXXXXXXX) Algerian mobile numbers.
const ALGERIAN_PHONE_REGEX = /^(0[5-7][0-9]{8}|\+213[5-7][0-9]{8})$/;

export type DeliveryFormMessages = {
  fullNameRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  wilayaRequired: string;
  communeRequired: string;
  addressRequired: string;
};

export function createDeliveryFormSchema(messages: DeliveryFormMessages) {
  return z.object({
    fullName: z.string().trim().min(2, messages.fullNameRequired),
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneRequired)
      .transform((value) => value.replace(/[\s-]/g, ""))
      .refine((value) => ALGERIAN_PHONE_REGEX.test(value), messages.phoneInvalid),
    wilaya: z.string().min(1, messages.wilayaRequired),
    commune: z.string().trim().min(1, messages.communeRequired),
    deliveryType: z.enum(["home", "office"]),
    address: z.string().trim().min(5, messages.addressRequired),
    note: z.string().trim().optional(),
  });
}

export type DeliveryFormValues = z.infer<ReturnType<typeof createDeliveryFormSchema>>;
