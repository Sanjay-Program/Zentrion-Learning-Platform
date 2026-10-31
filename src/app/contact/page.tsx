import type { Metadata } from "next";
import ContactClientPage from "./contact-client";
import { BreadcrumbJsonLd } from "@/components/seo-schema";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export const metadata: Metadata = {
  title: "Contact Us & Admissions Helpline — Zentrion Learntech",
  description: "Reach Zentrion Learntech for course enquiries, admissions (+91 7305771789), college partnerships, enterprise workforce training, or technical support.",
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Zentrion Learntech — Support & Admissions",
    description: "Get in touch with our learning advisors via WhatsApp, phone, or email.",
    url: `${BASE_URL}/contact`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Zentrion Learntech",
    description: "Speak with our advisors or get enterprise proposals.",
  },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />
      <ContactClientPage />
    </>
  );
}
