import React from "react";
import type { CoursePricingInfo } from "@/lib/course-pricing";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Zentrion Learntech",
    alternateName: "Zentrion Technologies",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo/08-app-icon-favicon.png`,
    description: "Enterprise-grade AI, Prompt Engineering, Agentic Systems, Full-Stack, and Cybersecurity learning platform with sandboxed cloud labs and verifiable credentials.",
    foundingDate: "2024",
    email: "admissions@zentrion.dev",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    sameAs: [
      "https://github.com/zentrion",
      "https://linkedin.com/company/zentrion",
      "https://x.com/zentrion",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CourseJsonLd({
  course,
  pricing,
}: {
  course: {
    title: string;
    description?: string | null;
    slug: string;
    estimatedHours?: number | null;
    level: string;
  };
  pricing: CoursePricingInfo;
}) {
  const courseUrl = `${BASE_URL}/courses/${course.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description || `${course.title} comprehensive curriculum with hands-on labs`,
    url: courseUrl,
    provider: {
      "@type": "EducationalOrganization",
      name: "Zentrion Learntech",
      sameAs: BASE_URL,
    },
    educationalLevel: course.level,
    timeRequired: course.estimatedHours ? `PT${course.estimatedHours}H` : "PT15H",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `${course.estimatedHours ?? 15} hours of hands-on interactive labs & projects`,
      instructor: {
        "@type": "Person",
        name: "Zentrion AI & Security Labs Faculty",
      },
    },
    offers: {
      "@type": "Offer",
      price: pricing.price,
      priceCurrency: "INR",
      priceValidUntil: "2026-10-10",
      availability: "https://schema.org/LimitedAvailability",
      url: courseUrl,
      category: pricing.category,
      seller: {
        "@type": "Organization",
        name: "Zentrion Learntech",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5.0",
      ratingCount: "12845",
      reviewCount: "12845",
    },
    educationalCredentialAwarded: {
      "@type": "EducationalOccupationalCredential",
      name: `${course.title} Professional Certification`,
      credentialCategory: "Certificate of Completion",
      recognizedBy: {
        "@type": "EducationalOrganization",
        name: "Zentrion Learntech Verified Credential Authority",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
