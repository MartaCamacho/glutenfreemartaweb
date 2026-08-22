import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import TrackedLink from "@/components/TrackedLink";
import { getDictionary } from "@/lib/i18n/server";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { contact } = await getDictionary();
  return { title: contact.meta.title, description: contact.meta.description };
}

export default async function ContactPage() {
  const { contact } = await getDictionary();

  return (
    <section className="mx-auto max-w-[1000px] px-[6%] pb-25 pt-20">
      <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-pink">
        {contact.eyebrow}
      </p>
      <h1 className="mb-5 text-center font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] text-pretty">
        {contact.headline}
      </h1>
      <p className="mx-auto mb-15 max-w-[560px] text-center text-[17px] leading-[1.7] text-ink-soft">
        {contact.intro}
      </p>

      <div className="grid items-start gap-[50px] md:grid-cols-2">
        <ContactForm dict={contact.form} />

        <div className="flex flex-col gap-6">
          <div className="rounded-card bg-pink-soft p-7">
            <p className="mb-2 font-display text-[17px] font-bold">
              {contact.cards.instagram}
            </p>
            <TrackedLink
              href={INSTAGRAM_URL}
              event="instagram_click"
              params={{ link_location: "contact" }}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[16px] text-pink hover:text-pink-hover"
            >
              {INSTAGRAM_HANDLE}
            </TrackedLink>
          </div>

          <div className="rounded-card bg-green-soft p-7">
            <p className="mb-2 font-display text-[17px] font-bold">
              {contact.cards.email}
            </p>
            <TrackedLink
              href={`mailto:${CONTACT_EMAIL}`}
              event="email_click"
              params={{ link_location: "contact" }}
              className="text-[16px] text-green hover:underline"
            >
              {CONTACT_EMAIL}
            </TrackedLink>
          </div>

          <p className="text-sm leading-[1.6] text-ink-muted">
            {contact.cards.note}
          </p>
        </div>
      </div>
    </section>
  );
}
