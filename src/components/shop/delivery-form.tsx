"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { Price } from "@/components/shop/price";
import { createDeliveryFormSchema, DeliveryFormValues } from "@/lib/validations/order";
import { WILAYAS, getDeliveryFee, type DeliveryType } from "@/lib/wilayas";
import { COMMUNES_BY_WILAYA } from "@/lib/communes";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

type Locale = "fr" | "ar";

function generateOrderRef(): string {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TQP-${random}`;
}

const inputClassName =
  "h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white focus-visible:ring-zinc-900";

export function DeliveryForm() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("Checkout");

  const schema = useMemo(
    () =>
      createDeliveryFormSchema({
        fullNameRequired: t("fullNameRequired"),
        phoneRequired: t("phoneRequired"),
        phoneInvalid: t("phoneInvalid"),
        wilayaRequired: t("wilayaRequired"),
        communeRequired: t("communeRequired"),
        addressRequired: t("addressRequired"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      wilaya: "",
      commune: "",
      deliveryType: "home",
      address: "",
      note: "",
    },
  });

  const wilaya = watch("wilaya");
  const commune = watch("commune");
  const deliveryType = watch("deliveryType");
  const communeOptions = wilaya ? COMMUNES_BY_WILAYA[Number(wilaya)] ?? [] : [];
  const deliveryFee = wilaya ? getDeliveryFee(Number(wilaya), deliveryType) : null;
  const total = subtotal + (deliveryFee ?? 0);

  function handleWilayaChange(value: string) {
    setValue("wilaya", value, { shouldValidate: true });
    // A new wilaya invalidates whatever commune was picked for the previous one.
    setValue("commune", "", { shouldValidate: false });
  }

  function onSubmit(values: DeliveryFormValues) {
    const orderRef = generateOrderRef();
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const fee = getDeliveryFee(Number(values.wilaya), values.deliveryType);

    try {
      sessionStorage.setItem(
        "tqp_last_order",
        JSON.stringify({
          orderRef,
          fullName: values.fullName,
          itemCount,
          total: subtotal + fee,
          createdAt: Date.now(),
        })
      );
    } catch {
      // sessionStorage unavailable — confirmation page will fall back to a generic message
    }

    clearCart();
    router.push(`/${locale}/commande/confirmation`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName">{t("fullName")} *</FieldLabel>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            className={inputClassName}
            {...register("fullName")}
          />
          <FieldError errors={[errors.fullName]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">{t("phone")} *</FieldLabel>
          <Input
            id="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            aria-invalid={!!errors.phone}
            className={inputClassName}
            {...register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field data-invalid={!!errors.wilaya}>
          <FieldLabel htmlFor="wilaya">{t("wilaya")} *</FieldLabel>
          <Select value={wilaya} onValueChange={(value) => handleWilayaChange(value as string)}>
            <SelectTrigger id="wilaya" className={`${inputClassName} w-full`}>
              <SelectValue placeholder={t("wilayaPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {WILAYAS.map((w) => (
                <SelectItem key={w.code} value={String(w.code)}>
                  {String(w.code).padStart(2, "0")} — {w.name[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.wilaya]} />
        </Field>

        <Field data-invalid={!!errors.commune}>
          <FieldLabel htmlFor="commune">{t("commune")} *</FieldLabel>
          <Select
            value={commune}
            disabled={!wilaya}
            onValueChange={(value) => setValue("commune", value as string, { shouldValidate: true })}
          >
            <SelectTrigger id="commune" className={`${inputClassName} w-full`}>
              <SelectValue
                placeholder={wilaya ? t("communePlaceholder") : t("communePlaceholderDisabled")}
              />
            </SelectTrigger>
            <SelectContent>
              {communeOptions.map((c) => (
                <SelectItem key={c.fr} value={c.fr}>
                  {c[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.commune]} />
        </Field>

        <Field>
          <FieldLabel>{t("deliveryType")} *</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            {(["home", "office"] as DeliveryType[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setValue("deliveryType", option, { shouldValidate: true })}
                className={`h-12 rounded-xl border text-sm font-medium transition-colors ${
                  deliveryType === option
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {option === "home" ? t("deliveryHome") : t("deliveryOffice")}
              </button>
            ))}
          </div>
        </Field>

        <Field data-invalid={!!errors.address}>
          <FieldLabel htmlFor="address">{t("address")} *</FieldLabel>
          <Textarea
            id="address"
            rows={3}
            placeholder={t("addressPlaceholder")}
            aria-invalid={!!errors.address}
            className="rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white focus-visible:ring-zinc-900"
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="note">{t("orderNote")}</FieldLabel>
          <Textarea
            id="note"
            rows={2}
            placeholder={t("orderNotePlaceholder")}
            className="rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white focus-visible:ring-zinc-900"
            {...register("note")}
          />
        </Field>
      </FieldGroup>

      <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-zinc-700" size={20} />
        <div>
          <p className="text-sm font-semibold text-zinc-900">{t("codTitle")}</p>
          <p className="text-sm text-zinc-500">{t("codDesc")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>{t("subtotal")}</span>
          <Price amount={subtotal} className="font-medium text-zinc-900" />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-zinc-500">
          <span>{t("deliveryFeeLabel")}</span>
          {deliveryFee !== null ? (
            <Price amount={deliveryFee} className="font-medium text-zinc-900" />
          ) : (
            <span className="text-xs italic">{t("deliveryFeeNote")}</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="font-medium text-zinc-900">{t("total")}</span>
          <Price amount={total} className="text-2xl font-bold text-zinc-900" />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-14 w-full rounded-full text-lg font-semibold bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl transition-all duration-300 hover:scale-[1.01]"
      >
        {t("placeOrder")}
      </Button>
    </form>
  );
}
