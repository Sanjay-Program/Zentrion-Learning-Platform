import { Breadcrumbs, Card, PageHeader } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/seo-schema";
import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const BASE_URL = process.env.APP_BASE_URL || "https://zentrion.dev";

export const metadata: Metadata = {
  title: "Engineering Journal & Insights — AI, Security & Systems",
  description:
    "Engineering insights, research articles, and production guides on Prompt Engineering, Agentic AI, LLMOps, Defensive Cybersecurity, and Full-Stack Engineering from Zentrion.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: "Zentrion Engineering Journal & Blog",
    description: "Deep dive articles on AI systems, cybersecurity drills, and developer education.",
    url: `${BASE_URL}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentrion Engineering Journal",
    description: "Guides on building agentic AI, LLMOps, and defensive security.",
  },
};

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  date: string;
  minutes: number;
}

const posts: Post[] = [
  {
    slug: "prompt-engineering-fundamentals",
    title: "Prompt engineering is a systems skill, not a magic trick",
    excerpt:
      "Why the best prompt engineers think in context windows, constraints and evaluation loops — and how to teach it.",
    topic: "Prompt engineering",
    date: "2026-09-28",
    minutes: 7,
  },
  {
    slug: "building-agentic-ai-safely",
    title: "Building agentic AI safely: budgets, approvals and traces",
    excerpt:
      "Practical guardrails for multi-step agents: token budgets, human-in-the-loop approvals and step-level tracing.",
    topic: "Agentic AI",
    date: "2026-09-14",
    minutes: 9,
  },
  {
    slug: "rag-in-production",
    title: "RAG in production: retrieval quality beats model size",
    excerpt:
      "What we learn from running retrieval-augmented generation workloads: chunking, hybrid search and evaluation datasets.",
    topic: "AI engineering",
    date: "2026-08-30",
    minutes: 8,
  },
  {
    slug: "teaching-security-with-simulated-labs",
    title: "Teaching security with simulated labs (and zero risk)",
    excerpt:
      "How simulated environments let students practise real techniques — port scanning, log triage, injection — safely.",
    topic: "Cybersecurity",
    date: "2026-08-12",
    minutes: 6,
  },
  {
    slug: "llmops-in-practice",
    title: "LLMOps in practice: from prototype to production",
    excerpt:
      "The operational checklist that separates a demo from a deployed LLM application — quotas, tracing, evals and rollbacks.",
    topic: "AI engineering",
    date: "2026-10-02",
    minutes: 10,
  },
  {
    slug: "onboarding-that-converts",
    title: "The 30-second learner: onboarding that converts",
    excerpt:
      "Why the first half-minute decides whether a learner stays, and the five design patterns that move activation rates.",
    topic: "Product",
    date: "2026-10-06",
    minutes: 6,
  },
  {
    slug: "simulated-labs-for-enterprises",
    title: "Why simulated labs beat CTFs for enterprise training",
    excerpt:
      "CTFs are great for individuals. For teams, simulated labs with rubrics and evidence beat scoreboards every time.",
    topic: "Cybersecurity",
    date: "2026-10-09",
    minutes: 7,
  },
];

export default function BlogPage() {
  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      <PageHeader
        eyebrow="Journal"
        title="Blog"
        description="Notes from the Zentrion team on teaching AI, security and modern application development."
      />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 20rem), 1fr))", gap: "var(--space-5)" }}>
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <Card hover className="flex-col h-full">
              <div className="flex gap-2 mb-2">
                <span className="badge badge-info">{post.topic}</span>
                <span className="text-subtle text-sm">{formatDate(post.date)}</span>
              </div>
              <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>{post.title}</h3>
              <p className="text-muted text-sm">{post.excerpt}</p>
              <p className="text-subtle text-sm" style={{ marginTop: "auto", paddingTop: "var(--space-4)" }}>
                {post.minutes} min read →
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
