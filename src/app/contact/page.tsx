import type { Metadata } from "next";
import ContactClientPage from "./contact-client";

export const metadata: Metadata = {
  title: "Contact — Zentrion Learntech",
  description: "Reach Zentrion Learntech for course enquiries, college partnerships, enterprise training, or technical support. WhatsApp, phone, and email support available.",
};

export default function ContactPage() {
  return <ContactClientPage />;
}
