"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "@esmate/shadcn/pkgs/lucide-react";
import { analytics } from "@/lib/analytics";

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const t = useTranslations("Footer");
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    analytics.lead(source);
    setSubmitted(true);
    setEmail("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 flex max-w-md items-center border-b border-ink/25 pb-3 transition-colors focus-within:border-pop"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        className="flex-1 bg-transparent text-base tracking-wide text-ink placeholder:text-ink/30 focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitted}
        className="group inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-pop uppercase transition-opacity hover:opacity-70 disabled:opacity-50"
      >
        {submitted ? (
          <>
            {t("subscribed")}
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </>
        ) : (
          <>
            {t("subscribe")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </>
        )}
      </button>
    </form>
  );
}
