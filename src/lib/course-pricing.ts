/**
 * Zentrion Learntech — Official Course Pricing, Limited Seats & Urgency Configuration.
 * 
 * Configured according to production pricing matrix:
 * - AI: ₹999 (Original: ₹1,999 - 50% OFF)
 * - Prompt Engineering: ₹499 (Original: ₹999 - 50% OFF)
 * - Cybersecurity: ₹1,499 (Original: ₹2,999 - 50% OFF)
 * - Data Science: ₹799 (Original: ₹1,599 - 50% OFF)
 * - Full Stack: ₹1,299 (Original: ₹2,499 - 48% OFF)
 * - Frontend: ₹599 (Original: ₹1,199 - 50% OFF)
 * 
 * Deadline: 10th October only
 * Limited seats remaining per batch with cryptographic trust guarantees.
 */

export interface CoursePricingInfo {
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPct: number;
  seatsRemaining: number;
  deadlineText: string;
  formattedPrice: string;
  formattedOriginalPrice: string;
  trustBadge: string;
  badgeColor: string;
}

export const COURSE_PRICING_MAP: Record<string, CoursePricingInfo> = {
  // 1. AI Foundations & Fluency
  "ai-foundations-and-fluency": {
    slug: "ai-foundations-and-fluency",
    name: "Artificial Intelligence Foundations & Fluency",
    category: "AI",
    price: 999,
    originalPrice: 1999,
    discountPct: 50,
    seatsRemaining: 7,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹999",
    formattedOriginalPrice: "₹1,999",
    trustBadge: "★ 4.9 (12.4k reviews) • 7 Seats Left",
    badgeColor: "#6366F1",
  },

  // Agentic AI
  "agentic-ai-engineering": {
    slug: "agentic-ai-engineering",
    name: "Agentic AI Engineering & Multi-Agent Systems",
    category: "AI",
    price: 999,
    originalPrice: 1999,
    discountPct: 50,
    seatsRemaining: 6,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹999",
    formattedOriginalPrice: "₹1,999",
    trustBadge: "🔥 #1 Trending 2026 • 6 Seats Left",
    badgeColor: "#C084FC",
  },

  // 2. Prompt Engineering
  "prompt-and-context-engineering": {
    slug: "prompt-and-context-engineering",
    name: "Prompt & Context Engineering Masterclass",
    category: "Prompt",
    price: 499,
    originalPrice: 999,
    discountPct: 50,
    seatsRemaining: 9,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹499",
    formattedOriginalPrice: "₹999",
    trustBadge: "★ 4.95 (8.2k reviews) • 9 Seats Left",
    badgeColor: "#818CF8",
  },

  // 3. Cybersecurity & LLM Security
  "ai-cybersecurity-and-llm-security": {
    slug: "ai-cybersecurity-and-llm-security",
    name: "AI Cybersecurity, LLM Defense & SOC Triage",
    category: "Cybersecurity",
    price: 1499,
    originalPrice: 2999,
    discountPct: 50,
    seatsRemaining: 5,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹1,499",
    formattedOriginalPrice: "₹2,999",
    trustBadge: "🛡️ Sandboxed Labs • 5 Seats Left",
    badgeColor: "#38BDF8",
  },

  // 4. Data Science / AI Apps / RAG
  "build-ai-apps-apis-rag": {
    slug: "build-ai-apps-apis-rag",
    name: "Data Science, AI APIs & RAG Pipelines",
    category: "Data Science",
    price: 799,
    originalPrice: 1599,
    discountPct: 50,
    seatsRemaining: 8,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹799",
    formattedOriginalPrice: "₹1,599",
    trustBadge: "📊 Hands-on ChromaDB • 8 Seats Left",
    badgeColor: "#2DD4BF",
  },

  // 5. Full Stack & AI Business Automation
  "ai-business-automation": {
    slug: "ai-business-automation",
    name: "Modern Full-Stack & AI Business Automation",
    category: "Full Stack",
    price: 1299,
    originalPrice: 2499,
    discountPct: 48,
    seatsRemaining: 6,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹1,299",
    formattedOriginalPrice: "₹2,499",
    trustBadge: "⚡ Full-Stack Production • 6 Seats Left",
    badgeColor: "#F472B6",
  },

  // 6. Frontend Development with GenAI
  "frontend-development-genai": {
    slug: "frontend-development-genai",
    name: "Modern Frontend Development with GenAI",
    category: "Frontend",
    price: 599,
    originalPrice: 1199,
    discountPct: 50,
    seatsRemaining: 11,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹599",
    formattedOriginalPrice: "₹1,199",
    trustBadge: "🎨 UI/UX Interactive • 11 Seats Left",
    badgeColor: "#10B981",
  },
};

/**
 * Get pricing details for a given course slug or category keyword.
 */
export function getCoursePricing(slug: string): CoursePricingInfo {
  if (COURSE_PRICING_MAP[slug]) {
    return COURSE_PRICING_MAP[slug];
  }

  // Fallback by keyword match
  const lower = slug.toLowerCase();
  if (lower.includes("cyber") || lower.includes("security")) {
    return COURSE_PRICING_MAP["ai-cybersecurity-and-llm-security"];
  }
  if (lower.includes("prompt")) {
    return COURSE_PRICING_MAP["prompt-and-context-engineering"];
  }
  if (lower.includes("agent") || lower.includes("ai-foundations") || lower.includes("ai")) {
    return COURSE_PRICING_MAP["ai-foundations-and-fluency"];
  }
  if (lower.includes("data") || lower.includes("rag")) {
    return COURSE_PRICING_MAP["build-ai-apps-apis-rag"];
  }
  if (lower.includes("stack") || lower.includes("automation") || lower.includes("app")) {
    return COURSE_PRICING_MAP["ai-business-automation"];
  }
  if (lower.includes("front") || lower.includes("ui") || lower.includes("web")) {
    return COURSE_PRICING_MAP["frontend-development-genai"];
  }

  // Default fallback
  return {
    slug,
    name: "Flagship Technical Course",
    category: "Tech",
    price: 999,
    originalPrice: 1999,
    discountPct: 50,
    seatsRemaining: 8,
    deadlineText: "Special Offer valid until 10th October only",
    formattedPrice: "₹999",
    formattedOriginalPrice: "₹1,999",
    trustBadge: "★ 4.9 Rating • Limited Seats",
    badgeColor: "#6366F1",
  };
}

export const TRUST_PROMISES = [
  { icon: "🛡️", title: "100% Money-Back Guarantee", desc: "Full refund within 7 days, no questions asked." },
  { icon: "📜", title: "Verifiable Credential", desc: "Cryptographic QR certificate accepted by hiring partners." },
  { icon: "⚡", title: "Lifetime Access", desc: "Keep course materials and future model upgrades forever." },
  { icon: "🔒", title: "Secure Checkout", desc: "Bank-grade 256-bit encryption via UPI, NetBanking & Cards." },
];
