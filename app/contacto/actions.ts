"use server";

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

/**
 * Not wired up yet: the form opens the visitor's mail client instead.
 * TODO: send a real email. Steps: `npm i resend`, put RESEND_API_KEY in
 * .env.local, uncomment the block below, and swap the form's onSubmit for
 * `action={sendContactMessage}`.
 */
export async function sendContactMessage(formData: FormData) {
  const message: ContactMessage = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  if (!message.name || !message.email || !message.message) {
    return { ok: false as const, error: "missing-fields" as const };
  }

  console.log("Contact message", message);

  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "onboarding@resend.dev",
  //   to: CONTACT_EMAIL,
  //   replyTo: message.email,
  //   subject: `Mensaje de ${message.name}`,
  //   text: message.message,
  // });

  return { ok: true as const };
}
