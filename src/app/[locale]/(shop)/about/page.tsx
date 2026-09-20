import React from "react";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export default async function AboutPage() {
  const tNav = await getTranslations("Navigation");
  
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="mb-6 font-display text-4xl font-medium tracking-tight text-foreground">
        {tNav("about")}
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
        This is a placeholder for the About page.
      </p>
    </div>
  );
}
