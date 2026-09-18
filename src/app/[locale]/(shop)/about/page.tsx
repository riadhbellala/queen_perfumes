import React from "react";
import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const tNav = await getTranslations("Navigation");
  
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center py-24 px-6 text-center">
      <h1 className="text-4xl font-display font-semibold tracking-tight text-zinc-900 mb-6">
        {tNav("about")}
      </h1>
      <p className="text-lg text-zinc-600 max-w-2xl">
        This is a placeholder for the About page.
      </p>
    </div>
  );
}
