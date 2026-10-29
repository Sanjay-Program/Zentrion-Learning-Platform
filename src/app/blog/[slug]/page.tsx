import { notFound } from "next/navigation";
import { Breadcrumbs, Card } from "@/components/ui";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Blog" };

interface Post {
  slug: string;
  title: string;
  topic: string;
  date: string;
  minutes: number;
  paragraphs: string[];
}

const posts: Post[] = [
  {
    slug: "prompt-engineering-fundamentals",
    title: "Prompt engineering is a systems skill, not a magic trick",
    topic: "Prompt engineering",
    date: "2026-09-28",
    minutes: 7,
    paragraphs: [
      "The most common mistake new prompt engineers make is treating prompts as incantations: a secret phrase that unlocks the right answer. In reality, a prompt is the entire context window — system message, history, tools and the current turn — and every part of it shapes the next token the model produces.",
      "Three principles do most of the work. First, position matters: instructions at the start and end of the prompt get the most attention, so put constraints there. Second, specificity beats brevity: 'answer in exactly three bullet points' outperforms 'be concise' every time, because models cannot read your mind. Third, every constraint you want must be stated explicitly — the model knows nothing about your format, tone or audience unless you say so.",
      "But prompts are only half the system. The other half is the evaluation loop. A prompt that works on one example is a hypothesis; a prompt that works on a dataset is a design. That is why the Prompt Studio in Zentrion records every run, and why our evaluation harness scores prompts against datasets instead of vibes.",
      "Finally, teach the reasoning, not the recipe. When learners understand attention position, context windows and iteration, they can adapt to any model. When they memorise templates, they break the first time the model updates.",
    ],
  },
  {
    slug: "building-agentic-ai-safely",
    title: "Building agentic AI safely: budgets, approvals and traces",
    topic: "Agentic AI",
    date: "2026-09-14",
    minutes: 9,
    paragraphs: [
      "An agent is a loop: observe, reason, act, repeat. That loop is powerful precisely because it repeats — and dangerous for the same reason. A bug that costs one wasted tool call in a single turn costs a hundred in an agentic run. Safety in agentic systems is therefore mostly about bounds and visibility.",
      "Start with budgets. Every agent definition in Zentrion carries a max step count, a time limit and an optional token budget. When any bound is hit, the run stops and records exactly where it stopped. Bounds turn an unbounded loop into a failed experiment you can learn from.",
      "Next, approvals. Any agent that can write, send or purchase should require human approval for high-impact actions. Our agent runs record every step — the reasoning, the tool call and the observation — so a reviewer can replay a run as easily as reading a log.",
      "Finally, design for failure. Tools time out, models hallucinate, and contexts overflow. Agents that record errors, degrade gracefully and surface their own uncertainty are the ones you can trust in production. The Agent Studio lets you run agents synchronously with bounded steps so every one of these behaviours is observable in a single request.",
    ],
  },
  {
    slug: "rag-in-production",
    title: "RAG in production: retrieval quality beats model size",
    topic: "AI engineering",
    date: "2026-08-30",
    minutes: 8,
    paragraphs: [
      "Retrieval-augmented generation is sold as 'give the model your documents'. In production, the difference between a demo and a working system is almost entirely retrieval quality. A smaller model with precise retrieval beats a giant model with noise.",
      "Chunking is the first lever. Too small and you lose context; too large and you dilute relevance. The knowledge bases in Zentrion store documents as chunks with explicit IDs so you can measure which chunks actually get retrieved for real questions.",
      "Second, evaluate relentlessly. An evaluation dataset of question–answer pairs — the kind you can build in the Evals workspace — turns 'does this feel right?' into a measurable score. Track retrieval recall and answer quality separately; they fail for different reasons.",
      "Third, plan for the failure modes: stale documents, conflicting sources and the model confidently answering from its own weights instead of the retrieved context. Cite the chunks you used, and make the answer say 'I don't know' when retrieval comes up empty.",
    ],
  },
  {
    slug: "teaching-security-with-simulated-labs",
    title: "Teaching security with simulated labs (and zero risk)",
    topic: "Cybersecurity",
    date: "2026-08-12",
    minutes: 6,
      paragraphs: [
      "Security education has a credibility problem: students need to practise attacking systems, but attacking real systems is illegal and unethical. Simulated labs solve this. Every Zentrion lab runs in an in-process, sandboxed environment with synthetic data — the techniques are real, the targets are not.",
      "In the port scanning lab, students enumerate a simulated service and read the responses. In the SIEM triage lab, they analyse synthetic log streams and make triage decisions. In the SQL injection and XSS labs, they exploit deliberately vulnerable simulated apps and then patch the flaw.",
      "The key design rule: no student input ever reaches a real shell, network or database. Commands are interpreted by a simulated executor that models realistic outputs. Students get the muscle memory of the technique without any risk to production systems or third parties.",
      "The result is a classroom where 'try it and see' is always safe — which is exactly the mindset security work requires.",
    ],
  },
  {
    slug: "llmops-in-practice",
    title: "LLMOps in practice: from prototype to production",
    topic: "AI engineering",
    date: "2026-10-02",
    minutes: 10,
    paragraphs: [
      "A working LLM demo and a production LLM application are different species. The demo works until it doesn't; production is built so that when it doesn't, you know within minutes, can trace why, and can roll back.",
      "Start with quotas. Per-user, per-day token and spend limits turn an unbounded cost centre into a managed service. Zentrion's usage records power exactly this: every completion is metered against a daily budget before the next call is allowed.",
      "Second, evaluate continuously. A prompt or model change is a deploy — and deploys need a test suite. Build evaluation datasets of question–answer pairs, score every candidate against them, and promote only on measurable improvement. The Evals workspace treats prompts like code under test.",
      "Third, trace everything. When an agent misbehaves, the answer is in the step log: the reasoning, the tool call, the observation. Agent runs record each step so you can replay a failing run as easily as reading a stack trace.",
      "Finally, plan the failure path. Providers time out, models hallucinate, contexts overflow. A production system degrades gracefully, logs the failure, and tells the user what happened. The offline tutor in Zentrion is a deliberate example: when no provider is configured, the platform still teaches — it never dead-ends.",
    ],
  },
  {
    slug: "onboarding-that-converts",
    title: "The 30-second learner: onboarding that converts",
    topic: "Product",
    date: "2026-10-06",
    minutes: 6,
    paragraphs: [
      "The first thirty seconds decide whether a learner stays. Not the first course, not the first lesson — the moment between landing on the homepage and the first click that feels like progress.",
      "Pattern one: show the product, not the pitch. A visitor who can start a simulated lab without signing up has already experienced the value. Every secondary action on Zentrion's homepage leads somewhere usable immediately.",
      "Pattern two: remove the setup tax. 'Configure your API key' is a conversion killer. That is why the AI Tutor ships with a built-in offline mode: the feature works in the first session, and the provider setting is an upgrade, not a prerequisite.",
      "Pattern three: make the next step obvious. One primary CTA per screen, a trust bar of concrete numbers, and a free tier that never asks for a card. Learners who reach 'I did a thing' in session one come back at dramatically higher rates.",
      "Pattern four: earn the email. Sign-up should feel like the reward, not the toll booth — offered exactly when the learner wants to save progress, not before they've seen anything.",
    ],
  },
  {
    slug: "simulated-labs-for-enterprises",
    title: "Why simulated labs beat CTFs for enterprise training",
    topic: "Cybersecurity",
    date: "2026-10-09",
    minutes: 7,
    paragraphs: [
      "CTFs are excellent for individuals: short, sharp, competitive. But for organisations, they measure the wrong things — speed and novelty-seeking, not job competence. A SOC analyst doesn't need to capture the flag fastest; they need to triage correctly, document clearly, and escalate appropriately.",
      "Simulated labs change the unit of measurement. A lab session produces evidence: the commands run, the triage decisions made, the findings documented. That evidence maps directly to a rubric, and the rubric maps to role requirements — which is what skills-gap analysis actually needs.",
      "Second, labs fit the working day. A forty-minute SIEM triage lab slots into a team's training hour; a CTF weekend does not. Completion data flows into the compliance reports that auditors ask for, without anyone filling in a spreadsheet.",
      "Third, labs scale safely. Every analyst practises on the same synthetic data, so nobody accidentally touches production, and nobody's 'practice' becomes an incident. For enterprise security training, the safest environment is also the most measurable one — and that is exactly what simulated labs provide.",
    ],
  },
];

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <main className="container" style={{ padding: "var(--space-10) var(--space-6)", maxWidth: 44 * 16 }}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]} />
      <article>
        <p className="eyebrow">{post.topic}</p>
        <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", marginBottom: "var(--space-3)" }}>
          {post.title}
        </h1>
        <p className="text-muted text-sm" style={{ marginBottom: "var(--space-8)" }}>
          {formatDate(post.date)} · {post.minutes} min read
        </p>
        <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
          {post.paragraphs.map((p, i) => (
            <p key={i} className="text-muted" style={{ fontSize: "var(--text-lg)", lineHeight: 1.7, margin: "0 0 var(--space-6)" }}>
              {p}
            </p>
          ))}
        </Card>
        <div style={{ marginTop: "var(--space-8)" }}>
          <Link href="/blog" className="text-sm font-semibold">← Back to blog</Link>
        </div>
      </article>
    </main>
  );
}
