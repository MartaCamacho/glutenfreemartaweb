"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/server";
import type { Discount } from "@/lib/links";

export default function DiscountCard({
  discount,
  dict,
}: {
  discount: Discount;
  dict: Dictionary["links"]["discounts"];
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(discount.code);
      setCopied(true);
    } catch {
      // Some in-app browsers refuse the clipboard. Leave the label alone: the
      // code sits selectable right beside it, so a refusal means a long-press.
    }
  }

  return (
    <article className="rounded-card bg-white p-6 shadow-card">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h3 className="font-display text-[19px] font-bold leading-[1.15]">
          {discount.brand}
        </h3>
        <span className="rounded-full bg-pink-soft px-3 py-1 text-sm font-bold text-pink">
          {discount.amount}
        </span>
      </div>

      <p className="mb-5 text-[15px] leading-[1.6] text-ink-muted">
        {dict.items[discount.id].description}
      </p>

      <div className="mb-4 rounded-input border border-line-input px-4 py-3">
        <span className="text-sm text-ink-muted">{dict.codeLabel}</span>
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-[17px] font-bold tracking-[0.04em]">
            {discount.code}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 cursor-pointer text-sm font-bold text-pink transition-colors hover:text-pink-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {copied ? dict.copied : dict.copy}
          </button>
        </div>
      </div>

      <a
        href={discount.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-full bg-pink px-7 py-3.5 text-center font-bold text-white transition-opacity hover:opacity-90"
      >
        {dict.cta.replace("{brand}", discount.brand)}
      </a>
    </article>
  );
}
