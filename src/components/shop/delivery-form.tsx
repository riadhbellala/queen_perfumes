"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { toOrderItemPayload } from "@/lib/cart-line";
import { Price } from "@/components/shop/price";
import { createDeliveryFormSchema, DeliveryFormValues } from "@/lib/validations/order";
import { WILAYAS, type DeliveryType } from "@/lib/wilayas";
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
import { ShieldCheck, AlertCircle } from "lucide-react";

type Locale = "fr" | "ar";

const inputClassName =
  "h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white focus-visible:ring-zinc-900";

export function DeliveryForm() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("Checkout");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [feesByWilaya, setFeesByWilaya] = useState<Record<string, number> | null>(null);

  // Fetched once on mount (69 tiny rows) rather than re-fetched on every
  // wilaya change — the fee then updates instantly as a synchronous lookup
  // instead of round-tripping to the DB on each selection.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("wilaya_delivery_fees")
      .select("wilaya, fee")
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setFeesByWilaya(Object.fromEntries(data.map((row) => [row.wilaya, Number(row.fee)])));
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
  const selectedWilayaObj = wilaya ? WILAYAS.find((w) => String(w.code) === wilaya) : undefined;
  const rawFee =
    selectedWilayaObj && feesByWilaya ? feesByWilaya[selectedWilayaObj.name.fr] : undefined;
  // A missing row and an explicit 0 are treated identically as "not
  // configured for this wilaya" — deliberately. A silent 0 here is exactly
  // what caused the earlier delivery-fee confusion (66 of 69 wilayas were
  // unset and silently charged nothing), so it's surfaced and blocks
  // checkout instead of ever being charged again.
  const isFeeUnavailable = !!selectedWilayaObj && !!feesByWilaya && (rawFee === undefined || rawFee === 0);
  const deliveryFee = isFeeUnavailable ? null : rawFee ?? null;
  const total = subtotal + (deliveryFee ?? 0);

  function handleWilayaChange(value: string) {
    setValue("wilaya", value, { shouldValidate: true });
    // A new wilaya invalidates whatever commune was picked for the previous one.
    setValue("commune", "", { shouldValidate: false });
  }

  async function onSubmit(values: DeliveryFormValues) {
    setSubmitError(null);

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    // orders/place_order() have no dedicated commune or delivery-type columns,
    // so fold them into the address/note text instead of dropping them.
    const wilayaObj = WILAYAS.find((w) => String(w.code) === values.wilaya);
    const fee = wilayaObj && feesByWilaya ? feesByWilaya[wilayaObj.name.fr] : undefined;

    // Belt-and-suspenders: the submit button is already disabled in this
    // state, but never let an order through with an unset/zero fee even if
    // that state is somehow stale by the time this fires.
    if (!wilayaObj || fee === undefined || fee === 0) {
      setSubmitError(t("deliveryFeeUnavailableMessage"));
      return;
    }

    const total = subtotal + fee;
    const wilayaLabel = wilayaObj
      ? `${String(wilayaObj.code).padStart(2, "0")} - ${wilayaObj.name.fr}`
      : values.wilaya;
    const communeObj = communeOptions.find((c) => c.fr === values.commune);
    const communeLabel = communeObj?.fr ?? values.commune;
    const deliveryTypeLabel = values.deliveryType === "home" ? "Domicile" : "Bureau/Stopdesk";
    const fullAddress = `${values.address}, ${communeLabel}`;
    const fullNote = [`Livraison: ${deliveryTypeLabel}`, values.note].filter(Boolean).join(" — ");

    try {
      const supabase = createClient();
      const { data: orderId, error } = await supabase.rpc("place_order", {
        p_customer_name: values.fullName,
        p_phone: values.phone,
        p_wilaya: wilayaLabel,
        p_address: fullAddress,
        p_note: fullNote,
        p_subtotal: subtotal,
        p_delivery_fee: fee,
        p_total: total,
        p_items: items.map(toOrderItemPayload),
      });

      if (error) throw error;

      try {
        sessionStorage.setItem(
          "tqp_last_order",
          JSON.stringify({
            orderId,
            fullName: values.fullName,
            itemCount,
            total,
            createdAt: Date.now(),
          })
        );
      } catch {
        // sessionStorage unavailable — confirmation page will fall back to a generic message
      }

      clearCart();
      router.push(`/${locale}/commande/confirmation`);
    } catch (err) {
      console.error("place_order failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(message.includes("INSUFFICIENT_STOCK") ? t("orderErrorStock") : t("orderErrorGeneric"));
    }
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
          ) : isFeeUnavailable ? (
            <span className="text-xs font-medium text-red-600">{t("deliveryFeeUnavailable")}</span>
          ) : wilaya && !feesByWilaya ? (
            <span className="text-xs italic">{t("deliveryFeeLoading")}</span>
          ) : (
            <span className="text-zinc-300">—</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="font-medium text-zinc-900">{t("total")}</span>
          <Price amount={total} className="text-2xl font-bold text-zinc-900" />
        </div>
      </div>

      {isFeeUnavailable && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-start">
          <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />
          <p className="text-sm text-red-700">{t("deliveryFeeUnavailableMessage")}</p>
        </div>
      )}

      {submitError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-start">
          <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || isFeeUnavailable}
        className="h-14 w-full rounded-full text-lg font-semibold bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-60"
      >
        {isSubmitting ? t("placingOrder") : t("placeOrder")}
      </Button>
    </form>
  );
}
