"use client";

import { useState } from "react";
import TrackedLink from "@/components/TrackedLink";
import { pushToDataLayer } from "@/lib/gtm";
import type { Dictionary } from "@/lib/i18n/server";
import { CONTACT_EMAIL } from "@/lib/site";

const inputClass =
  "rounded-input border border-line-input bg-white px-3.5 py-3 text-[15px] outline-none focus-visible:border-pink focus-visible:ring-2 focus-visible:ring-pink/30";

export default function ContactForm({
  dict,
}: {
  dict: Dictionary["contact"]["form"];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const body = `${message}\n\n—\n${name} (${email})`;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // A mailto: navigation is not a link click, so nothing tracks it for us.
    pushToDataLayer({ event: "contact_submit" });
    const subject = `${dict.subject} ${name}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  async function handleCopy() {
    pushToDataLayer({ event: "contact_copy" });
    await navigator.clipboard.writeText(body);
    setCopied(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[18px] rounded-block bg-white p-9 shadow-card"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-bold">
            {dict.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder={dict.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold">
            {dict.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={dict.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-bold">
            {dict.message}
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder={dict.messagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>

        <button
          type="submit"
          className="mt-2 cursor-pointer rounded-full bg-pink px-4 py-4 font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {dict.submit}
        </button>

        <p className="text-[13px] leading-[1.5] text-ink-muted">{dict.hint}</p>
      </form>

      {/* mailto gives no success or failure signal, so always offer a fallback */}
      {sent && (
        <div
          role="status"
          className="rounded-card border border-line-input bg-white p-6 text-[15px] leading-[1.6]"
        >
          <p className="mb-2 font-bold">{dict.openedTitle}</p>
          <p className="text-ink-muted">
            {dict.openedBody}{" "}
            <TrackedLink
              href={`mailto:${CONTACT_EMAIL}`}
              event="email_click"
              params={{ link_location: "contact_fallback" }}
              className="font-bold text-pink hover:text-pink-hover"
            >
              {CONTACT_EMAIL}
            </TrackedLink>
            .
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 cursor-pointer rounded-full border-2 border-ink px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            {copied ? dict.copied : dict.copy}
          </button>
        </div>
      )}
    </div>
  );
}
