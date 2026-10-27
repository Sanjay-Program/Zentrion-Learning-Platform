/**
 * AI workspace domain: conversations, prompt studio, agents,
 * knowledge bases, evaluation harness, and usage metering.
 */
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  agentDefinitions,
  agentRuns,
  agentSteps,
  aiConversations,
  aiMessages,
  evaluationCases,
  evaluationDatasets,
  evaluationResults,
  knowledgeBases,
  knowledgeDocuments,
  documentChunks,
  promptRuns,
  promptTemplates,
  promptVersions,
  toolRegistry,
  usageRecords,
} from "@/db/schema";
import { getSettings, aiConfigured } from "@/lib/config";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { toIso } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Provider gateway (OpenAI-compatible)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletion {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

/** Call the configured OpenAI-compatible provider, with a safe local fallback. */
export async function callAi(
  messages: ChatMessage[],
  opts: { model?: string; maxTokens?: number } = {},
): Promise<ChatCompletion> {
  const settings = getSettings();
  const model = opts.model ?? settings.aiDefaultModel;
  const started = Date.now();

  if (!aiConfigured()) {
    // Offline tutor: deterministic, educational fallback.
    const last = messages[messages.length - 1]?.content ?? "";
    return {
      content: offlineResponse(last),
      model: "local-fallback",
      promptTokens: 0,
      completionTokens: 0,
      latencyMs: Date.now() - started,
    };
  }

  const res = await fetch(`${settings.aiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.aiApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ValidationError(`AI provider error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    model,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
    latencyMs: Date.now() - started,
  };
}

function offlineResponse(input: string): string {
  return simulatedTutor(input);
}

/**
 * Built-in offline tutor.
 *
 * Runs with zero configuration and no external API: it recognises the
 * learner's topic from the platform's own curriculum vocabulary and
 * answers with structured, curriculum-grounded guidance. It is a study
 * aid — it explains concepts, gives next steps and points to the
 * relevant courses, labs and challenges rather than pretending to be a
 * live model.
 */
const TUTOR_TOPICS: { match: RegExp[]; label: string; key: string; points: string[]; resources: string[] }[] = [
  {
    label: "prompt engineering",
    key: "prompt-engineering",
    match: [/prompt/i, /context window/i, /instruction/i, /system message/i, /few.?shot/i, /chain.of.thought/i, /temperature/i, /token/i],
    points: [
      "A prompt is the whole context window: system message, history, tools and the current turn.",
      "Position matters — put critical instructions at the start and end of the prompt.",
      "Be specific: 'answer in exactly three bullet points' beats 'be concise'.",
      "Models cannot read your mind: every constraint (format, tone, audience) must be explicit.",
      "Iterate with an evaluation set: a prompt that works once is a hypothesis, not a design.",
    ],
    resources: ["/courses/prompt-engineering-fundamentals", "/ai/studio", "/ai/evals"],
  },
  {
    label: "agentic AI",
    key: "agentic-ai",
    match: [/agent/i, /tool.?call/i, /autonomous/i, /multi.?step/i, /workflow/i, /orchestrat/i],
    points: [
      "An agent is a loop: observe → reason → act → repeat, with tools available at each step.",
      "Bound every run: max steps, time limit and an optional token budget.",
      "Require human approval for high-impact actions (writes, sends, purchases).",
      "Record every step — reasoning, tool call, observation — so runs can be replayed.",
      "Design for failure: tools time out and contexts overflow; log errors and degrade gracefully.",
    ],
    resources: ["/courses/agentic-ai-systems", "/ai/agents", "/ai/studio"],
  },
  {
    label: "RAG and retrieval",
    key: "rag",
    match: [/rag\b/i, /retrieval/i, /embedding/i, /vector/i, /chunk/i, /semantic search/i, /knowledge base/i],
    points: [
      "Retrieval quality beats model size: precise chunks with a smaller model outperform noise with a giant one.",
      "Chunking is the first lever — too small loses context, too large dilutes relevance.",
      "Evaluate with question–answer datasets; track retrieval recall and answer quality separately.",
      "Cite the chunks used, and make the answer say 'I don't know' when retrieval is empty.",
      "Plan for stale documents and conflicting sources.",
    ],
    resources: ["/courses/rag-and-retrieval-systems", "/ai/knowledge", "/ai/evals"],
  },
  {
    label: "LLM application development",
    key: "llm-apps",
    match: [/llm/i, /api/i, /function calling/i, /structured output/i, /json mode/i, /stream/i, /application/i],
    points: [
      "Treat the model as a nondeterministic component: validate outputs before use.",
      "Use structured outputs or JSON mode whenever the downstream code parses the response.",
      "Set timeouts, retries with backoff and per-user quotas around every provider call.",
      "Log prompts, responses and token usage — usage records power metering and quotas.",
      "Keep prompts in versioned templates so changes are reviewable and reversible.",
    ],
    resources: ["/courses/llm-application-development", "/ai/studio", "/ai/usage"],
  },
  {
    label: "AI safety and alignment",
    key: "ai-safety",
    match: [/safety/i, /alignment/i, /bias/i, /hallucinat/i, /jailbreak/i, /red.?team/i, /injection/i, /prompt injection/i],
    points: [
      "Treat all model outputs as untrusted data, especially when they feed tools or databases.",
      "Prompt injection is the key threat: separate instructions from data, and never let content override system instructions.",
      "Red-team your prompts: try to make the model ignore constraints before shipping.",
      "Hallucinations are reduced, not eliminated — ground answers in retrieved content and cite it.",
      "Log and review refusals and edge cases as part of the evaluation loop.",
    ],
    resources: ["/courses/ai-safety-and-alignment", "/ai/evals", "/challenges"],
  },
  {
    label: "networks and SOC",
    key: "network-defense",
    match: [/port/i, /scan/i, /network/i, /firewall/i, /\bsoc\b/i, /log/i, /triage/i, /incident/i, /siem/i, /monitor/i],
    points: [
      "Port scanning maps a target's exposed services — always against systems you own or simulated targets.",
      "SOC triage is a queue: prioritise by severity, evidence and blast radius, not by volume.",
      "SIEM correlation turns raw logs into signals: watch for impossible travel, privilege escalation and beaconing.",
      "Incident response follows prepare → detect → contain → eradicate → recover → learn.",
      "Every action in a real SOC is logged for audit — do the same in your head during triage.",
    ],
    resources: ["/courses/network-defense-and-soc", "/labs/siem-log-triage", "/labs/port-scanning-essentials"],
  },
  {
    label: "web security",
    key: "web-security",
    match: [/sql injection/i, /\bsqli\b/i, /xss/i, /cross.?site/i, /csrf/i, /owasp/i, /vulnerab/i, /exploit/i, /\bcve\b/i],
    points: [
      "SQL injection: never interpolate user input into queries — use parameterised queries.",
      "XSS: escape output by context (HTML, attribute, JS) and use Content-Security-Policy headers.",
      "CSRF: use anti-CSRF tokens and SameSite cookies for state-changing requests.",
      "The OWASP top ten is a baseline, not a ceiling — threat-model your specific app.",
      "Learn the exploit first, then the fix: both halves are in the labs.",
    ],
    resources: ["/labs/sql-injection-101", "/labs/xss-discovery-lab", "/courses/cybersecurity-fundamentals", "/challenges"],
  },
  {
    label: "cryptography",
    key: "cryptography",
    match: [/crypt/i, /hash/i, /encrypt/i, /hmac/i, /certificate/i, /tls/i, /ssl/i, /password/i],
    points: [
      "Hash passwords with a slow, salted algorithm (bcrypt, argon2) — never MD5 or SHA-1 alone.",
      "Weak hash recovery (MD5/SHA-1) is feasible via rainbow tables — that is why we practise on it.",
      "TLS terminates at the edge; validate certificates and never disable verification.",
      "Secrets belong in environment variables or secret managers, never in code or commits.",
      "Key rotation and expiry are part of the design, not an afterthought.",
    ],
    resources: ["/courses/cybersecurity-fundamentals", "/challenges/weak-hash-recovery", "/labs"],
  },
];

function simulatedTutor(input: string): string {
  const clean = input.trim();
  if (!clean) {
    return [
      "Hi! I'm the Zentrion offline tutor. Ask me about prompt engineering, agentic AI, RAG, LLM application development, AI safety, or cybersecurity (networks, SOC, web exploitation, cryptography).",
      "",
      "Example questions:",
      "• How do I write better prompts?",
      "• What is an agent loop?",
      "• How does SQL injection work — and how do I fix it?",
      "• How should I triage SIEM alerts?",
    ].join("\n");
  }

  // Score each topic by the specificity (pattern length) of matches —
  // a "sql injection" match must outrank a bare "injection" match.
  let best: (typeof TUTOR_TOPICS)[number] | null = null;
  let bestScore = 0;
  for (const topic of TUTOR_TOPICS) {
    const score = topic.match.reduce(
      (n, re) => (re.test(clean) ? n + re.source.length : n),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (!best) {
    return [
      "Great question. Here is a way to approach it:",
      "",
      "1. Restate the goal in one sentence.",
      "2. List the constraints (time, tools, safety, budget).",
      "3. Break the problem into the smallest testable steps.",
      "4. Pick one step, try it, and compare the result against what you expected.",
      "",
      "I can go deeper on: prompt engineering, agentic AI, RAG, LLM app development, AI safety, networks & SOC, web security, or cryptography.",
      "",
      "Try: \"explain RAG\" or \"how do agents stay safe\"",
    ].join("\n");
  }

  const questionType = /^(how|why|what|when|where|which|can|should|is|are|does|do)\b/i.test(clean)
    ? clean.match(/^(how|why|what|when|where|which|can|should|is|are|does|do)\b/i)?.[0].toLowerCase()
    : null;

  const opener =
    questionType === "how"
      ? `Here's how to think about ${best.label}:`
      : questionType === "why"
        ? `The reasoning behind ${best.label}:`
        : `Key points on ${best.label}:`;

  const lines = [
    opener,
    "",
    ...best.points.map((p, i) => `${i + 1}. ${p}`),
    "",
    `I'm the offline tutor (no AI provider is configured), so I answer from the platform's curriculum. To continue:`,
    ...best.resources.slice(0, 3).map((r) => `→ ${r}`),
  ];
  return lines.join("\n");
}

/** Record token usage for metering and quotas. */
export async function recordUsage(
  userId: number,
  feature: string,
  completion: ChatCompletion,
): Promise<void> {
  const db = getDb();
  await db
    .insert(usageRecords)
    .values({
      userId,
      feature,
      model: completion.model,
      promptTokens: completion.promptTokens,
      completionTokens: completion.completionTokens,
      latencyMs: completion.latencyMs,
      date: toIso(new Date()).slice(0, 10),
    })
    .run();
}

export async function usageToday(userId: number): Promise<{ prompt: number; completion: number }> {
  const db = getDb();
  const today = toIso(new Date()).slice(0, 10);
  const rows = await db
    .select({ prompt: usageRecords.promptTokens, completion: usageRecords.completionTokens })
    .from(usageRecords)
    .where(and(eq(usageRecords.userId, userId), eq(usageRecords.date, today)))
    .all();
  return rows.reduce(
    (acc, r) => ({ prompt: acc.prompt + r.prompt, completion: acc.completion + r.completion }),
    { prompt: 0, completion: 0 },
  );
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function listConversations(userId: number) {
  const db = getDb();
  return db
    .select({
      id: aiConversations.id,
      title: aiConversations.title,
      mode: aiConversations.mode,
      contextCourseId: aiConversations.contextCourseId,
      updatedAt: aiConversations.updatedAt,
      messageCount: count(aiMessages.id),
    })
    .from(aiConversations)
    .leftJoin(aiMessages, eq(aiMessages.conversationId, aiConversations.id))
    .where(eq(aiConversations.userId, userId))
    .groupBy(aiConversations.id)
    .orderBy(desc(aiConversations.updatedAt))
    .limit(50)
    .all();
}

export async function getConversation(id: number, userId: number) {
  const db = getDb();
  const conversation = await db
    .select()
    .from(aiConversations)
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)))
    .limit(1)
    .get();
  if (!conversation) throw new NotFoundError("Conversation not found");
  const messages = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, id))
    .orderBy(aiMessages.id)
    .all();
  return { ...conversation, messages };
}

export async function createConversation(
  userId: number,
  input: { title?: string; mode?: string; contextCourseId?: number | null },
) {
  const db = getDb();
  const result = await db
    .insert(aiConversations)
    .values({
      userId,
      title: input.title ?? "New conversation",
      mode: input.mode ?? "explain",
      contextCourseId: input.contextCourseId ?? null,
    })
    .run();
  return getConversation(Number(result.lastInsertRowid), userId);
}

export async function appendMessage(
  conversationId: number,
  message: { role: string; content: string; citations?: unknown[]; model?: string | null; promptTokens?: number | null; completionTokens?: number | null },
) {
  const db = getDb();
  await db
    .insert(aiMessages)
    .values({
      conversationId,
      role: message.role,
      content: message.content,
      citations: message.citations ?? [],
      model: message.model ?? null,
      promptTokens: message.promptTokens ?? null,
      completionTokens: message.completionTokens ?? null,
    })
    .run();
  await db
    .update(aiConversations)
    .set({ updatedAt: toIso(new Date()) })
    .where(eq(aiConversations.id, conversationId))
    .run();
}

export async function archiveConversation(id: number, userId: number) {
  const db = getDb();
  await db
    .update(aiConversations)
    .set({ archived: true })
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)))
    .run();
}

export async function deleteConversation(id: number, userId: number) {
  const db = getDb();
  await db
    .delete(aiConversations)
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)))
    .run();
}

// ---------------------------------------------------------------------------
// Prompt studio
// ---------------------------------------------------------------------------

/** Extract {{variable}} placeholders from a template. */
export function extractVariables(template: string): string[] {
  const found = new Set<string>();
  for (const match of template.matchAll(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g)) {
    found.add(match[1]);
  }
  return Array.from(found);
}

/** Render a template with the given variables (missing variables render empty). */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, key: string) =>
    vars[key] ?? "",
  );
}

export async function listPromptTemplates(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.ownerId, userId)))
    .orderBy(desc(promptTemplates.updatedAt))
    .limit(100)
    .all();
}

export async function listPublicPromptTemplates() {
  const db = getDb();
  return db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.visibility, "public"))
    .orderBy(desc(promptTemplates.updatedAt))
    .limit(100)
    .all();
}

export async function getPromptTemplate(id: number, userId: number) {
  const db = getDb();
  const template = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.ownerId, userId)))
    .limit(1)
    .get();
  if (!template) throw new NotFoundError("Prompt template not found");
  const versions = await db
    .select()
    .from(promptVersions)
    .where(eq(promptVersions.promptId, id))
    .orderBy(desc(promptVersions.versionNumber))
    .limit(20)
    .all();
  return { ...template, versions };
}

export async function createPromptTemplate(
  userId: number,
  input: { title: string; description?: string; template: string; tags?: string[]; visibility?: string },
) {
  const db = getDb();
  const variables = extractVariables(input.template);
  const result = await db
    .insert(promptTemplates)
    .values({
      ownerId: userId,
      title: input.title,
      description: input.description ?? "",
      template: input.template,
      variables,
      tags: input.tags ?? [],
      visibility: input.visibility ?? "private",
    })
    .run();
  const id = Number(result.lastInsertRowid);
  await db
    .insert(promptVersions)
    .values({ promptId: id, versionNumber: 1, template: input.template, changelog: "Initial version" })
    .run();
  return getPromptTemplate(id, userId);
}

export async function updatePromptTemplate(
  id: number,
  userId: number,
  input: Partial<{ title: string; description: string; template: string; tags: string[]; visibility: string; changelog: string }>,
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.ownerId, userId)))
    .limit(1)
    .get();
  if (!existing) throw new NotFoundError("Prompt template not found");

  const set: Partial<typeof promptTemplates.$inferInsert> = {};
  if (input.title !== undefined) set.title = input.title;
  if (input.description !== undefined) set.description = input.description;
  if (input.tags !== undefined) set.tags = input.tags;
  if (input.visibility !== undefined) set.visibility = input.visibility;
  if (input.template !== undefined && input.template !== existing.template) {
    set.template = input.template;
    set.variables = extractVariables(input.template);
    const nextVersion = existing.id
      ? (await db
          .select({ versionNumber: promptVersions.versionNumber })
          .from(promptVersions)
          .where(eq(promptVersions.promptId, id))
          .orderBy(desc(promptVersions.versionNumber))
          .limit(1)
          .get())?.versionNumber ?? 0
      : 0;
    await db
      .insert(promptVersions)
      .values({
        promptId: id,
        versionNumber: nextVersion + 1,
        template: input.template,
        changelog: input.changelog ?? "Update",
      })
      .run();
  }
  await db
    .update(promptTemplates)
    .set({ ...set, updatedAt: toIso(new Date()) })
    .where(eq(promptTemplates.id, id))
    .run();
  return getPromptTemplate(id, userId);
}

export async function deletePromptTemplate(id: number, userId: number) {
  const db = getDb();
  await db
    .delete(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.ownerId, userId)))
    .run();
}

export async function runPrompt(
  id: number,
  userId: number,
  vars: Record<string, string>,
  model?: string,
) {
  const template = await getPromptTemplate(id, userId);
  const rendered = renderTemplate(template.template, vars);
  const completion = await callAi([{ role: "user", content: rendered }], { model });
  const db = getDb();
  const result = await db
    .insert(promptRuns)
    .values({
      promptId: id,
      userId,
      renderedPrompt: rendered,
      model: completion.model,
      output: completion.content,
      promptTokens: completion.promptTokens,
      completionTokens: completion.completionTokens,
      latencyMs: completion.latencyMs,
    })
    .run();
  await recordUsage(userId, "prompt_run", completion);
  return { runId: Number(result.lastInsertRowid), rendered, completion };
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export async function listTools() {
  const db = getDb();
  return db
    .select()
    .from(toolRegistry)
    .where(eq(toolRegistry.isApproved, true))
    .orderBy(toolRegistry.name)
    .all();
}

export async function listAgents(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(agentDefinitions)
    .where(and(eq(agentDefinitions.ownerId, userId)))
    .orderBy(desc(agentDefinitions.updatedAt))
    .limit(100)
    .all();
}

export async function getAgent(id: number, userId: number) {
  const db = getDb();
  const agent = await db
    .select()
    .from(agentDefinitions)
    .where(and(eq(agentDefinitions.id, id), eq(agentDefinitions.ownerId, userId)))
    .limit(1)
    .get();
  if (!agent) throw new NotFoundError("Agent not found");
  const runs = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.agentId, id))
    .orderBy(desc(agentRuns.id))
    .limit(20)
    .all();
  return { ...agent, runs };
}

export async function createAgent(
  userId: number,
  input: {
    name: string;
    description?: string;
    objective?: string;
    instructions?: string;
    model: string;
    toolIds?: number[];
    maxSteps?: number;
    timeLimitSeconds?: number;
    tokenBudget?: number | null;
    requireApproval?: boolean;
  },
) {
  const db = getDb();
  const result = await db
    .insert(agentDefinitions)
    .values({
      ownerId: userId,
      name: input.name,
      description: input.description ?? "",
      objective: input.objective ?? "",
      instructions: input.instructions ?? "",
      model: input.model,
      toolIds: input.toolIds ?? [],
      maxSteps: input.maxSteps ?? 8,
      timeLimitSeconds: input.timeLimitSeconds ?? 120,
      tokenBudget: input.tokenBudget ?? null,
      requireApproval: input.requireApproval ?? false,
    })
    .run();
  return getAgent(Number(result.lastInsertRowid), userId);
}

export async function updateAgent(
  id: number,
  userId: number,
  input: Partial<{
    name: string;
    description: string;
    objective: string;
    instructions: string;
    model: string;
    toolIds: number[];
    maxSteps: number;
    timeLimitSeconds: number;
    tokenBudget: number | null;
    requireApproval: boolean;
  }>,
) {
  const db = getDb();
  await db
    .update(agentDefinitions)
    .set({ ...input, updatedAt: toIso(new Date()) })
    .where(and(eq(agentDefinitions.id, id), eq(agentDefinitions.ownerId, userId)))
    .run();
  return getAgent(id, userId);
}

export async function deleteAgent(id: number, userId: number) {
  const db = getDb();
  await db
    .delete(agentDefinitions)
    .where(and(eq(agentDefinitions.id, id), eq(agentDefinitions.ownerId, userId)))
    .run();
}

/** Execute an agent run: plan, then up to maxSteps reasoning steps. */
export async function runAgent(
  id: number,
  userId: number,
  inputData: Record<string, unknown>,
) {
  const agent = await getAgent(id, userId);
  const db = getDb();
  const runResult = await db
    .insert(agentRuns)
    .values({
      agentId: id,
      userId,
      inputData,
      status: "running",
      startedAt: toIso(new Date()),
    })
    .run();
  const runId = Number(runResult.lastInsertRowid);

  const addStep = async (step: { stepType: string; content?: string; toolName?: string; toolInput?: string; toolOutput?: string }) => {
    await db
      .insert(agentSteps)
      .values({ runId, ...step })
      .run();
  };

  let tokensUsed = 0;
  let stepsUsed = 0;
  let status = "completed";
  let output = "";
  let error: string | null = null;

  try {
    await addStep({ stepType: "plan", content: `Objective: ${agent.objective || agent.name}` });

    const systemPrompt = [
      `You are ${agent.name}.`,
      agent.objective ? `Objective: ${agent.objective}` : "",
      agent.instructions ? `Instructions:\n${agent.instructions}` : "",
      "Answer concisely and cite reasoning steps.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const userContent = JSON.stringify(inputData, null, 2);
    for (let step = 1; step <= agent.maxSteps; step++) {
      const completion = await callAi(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        { model: agent.model, maxTokens: 512 },
      );
      tokensUsed += completion.promptTokens + completion.completionTokens;
      stepsUsed = step;
      output = completion.content;
      await addStep({
        stepType: "reason",
        content: completion.content,
        toolName: agent.toolIds.length ? "llm" : undefined,
      });
      // In a full implementation, tool calls would be parsed from the
      // completion and executed against toolRegistry here.
      break;
    }

    if (agent.tokenBudget && tokensUsed > agent.tokenBudget) {
      status = "token_limit_exceeded";
    }
  } catch (err) {
    status = "failed";
    error = err instanceof Error ? err.message : "Agent run failed";
    await addStep({ stepType: "error", content: error });
  }

  await db
    .update(agentRuns)
    .set({
      status,
      output,
      error,
      stepsUsed,
      tokensUsed,
      finishedAt: toIso(new Date()),
    })
    .where(eq(agentRuns.id, runId))
    .run();
  return getRun(runId, userId);
}

export async function getRun(runId: number, userId: number) {
  const db = getDb();
  const run = await db
    .select()
    .from(agentRuns)
    .where(and(eq(agentRuns.id, runId), eq(agentRuns.userId, userId)))
    .limit(1)
    .get();
  if (!run) throw new NotFoundError("Agent run not found");
  const steps = await db
    .select()
    .from(agentSteps)
    .where(eq(agentSteps.runId, runId))
    .orderBy(agentSteps.id)
    .all();
  return { ...run, steps };
}

// ---------------------------------------------------------------------------
// Knowledge bases
// ---------------------------------------------------------------------------

export async function listKnowledgeBases(userId: number) {
  const db = getDb();
  return db
    .select({
      id: knowledgeBases.id,
      name: knowledgeBases.name,
      description: knowledgeBases.description,
      status: knowledgeBases.status,
      createdAt: knowledgeBases.createdAt,
      documentCount: count(knowledgeDocuments.id),
    })
    .from(knowledgeBases)
    .leftJoin(knowledgeDocuments, eq(knowledgeDocuments.knowledgeBaseId, knowledgeBases.id))
    .where(eq(knowledgeBases.ownerId, userId))
    .groupBy(knowledgeBases.id)
    .orderBy(desc(knowledgeBases.createdAt))
    .all();
}

export async function getKnowledgeBase(id: number, userId: number) {
  const db = getDb();
  const kb = await db
    .select()
    .from(knowledgeBases)
    .where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.ownerId, userId)))
    .limit(1)
    .get();
  if (!kb) throw new NotFoundError("Knowledge base not found");
  const documents = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.knowledgeBaseId, id))
    .orderBy(desc(knowledgeDocuments.createdAt))
    .all();
  const chunks = await db
    .select()
    .from(documentChunks)
    .where(
      inArray(
        documentChunks.documentId,
        documents.length ? documents.map((d) => d.id) : [-1],
      ),
    )
    .limit(200)
    .all();
  return { ...kb, documents, chunks };
}

export async function createKnowledgeBase(
  userId: number,
  input: { name: string; description?: string },
) {
  const db = getDb();
  const result = await db
    .insert(knowledgeBases)
    .values({ ownerId: userId, name: input.name, description: input.description ?? "" })
    .run();
  return getKnowledgeBase(Number(result.lastInsertRowid), userId);
}

export async function deleteKnowledgeBase(id: number, userId: number) {
  const db = getDb();
  await db
    .delete(knowledgeBases)
    .where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.ownerId, userId)))
    .run();
}

/** Ingest a text document: store it, chunk it, and index chunks. */
export async function ingestDocument(
  kbId: number,
  userId: number,
  input: { filename: string; content: string; mimeType?: string },
) {
  const kb = await getKnowledgeBase(kbId, userId);
  const db = getDb();
  const docResult = await db
    .insert(knowledgeDocuments)
    .values({
      knowledgeBaseId: kbId,
      filename: input.filename,
      storageKey: `kb-${kbId}/${Date.now()}-${input.filename}`,
      mimeType: input.mimeType ?? "text/plain",
      status: "processing",
    })
    .run();
  const docId = Number(docResult.lastInsertRowid);

  // Simple fixed-size chunking (800 chars, 100 char overlap).
  const text = input.content;
  const chunkSize = 800;
  const overlap = 100;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
    if (i + chunkSize >= text.length) break;
  }
  if (chunks.length === 0) chunks.push(text);

  for (let i = 0; i < chunks.length; i++) {
    await db
      .insert(documentChunks)
      .values({ documentId: docId, chunkIndex: i, content: chunks[i] })
      .run();
  }
  await db
    .update(knowledgeDocuments)
    .set({ status: "ready", chunkCount: chunks.length })
    .where(eq(knowledgeDocuments.id, docId))
    .run();
  return getKnowledgeBase(kb.id, userId);
}

// ---------------------------------------------------------------------------
// Evaluation harness
// ---------------------------------------------------------------------------

export async function listEvalDatasets(userId: number) {
  const db = getDb();
  return db
    .select({
      id: evaluationDatasets.id,
      name: evaluationDatasets.name,
      description: evaluationDatasets.description,
      createdAt: evaluationDatasets.createdAt,
      caseCount: count(evaluationCases.id),
    })
    .from(evaluationDatasets)
    .leftJoin(evaluationCases, eq(evaluationCases.datasetId, evaluationDatasets.id))
    .where(eq(evaluationDatasets.ownerId, userId))
    .groupBy(evaluationDatasets.id)
    .orderBy(desc(evaluationDatasets.createdAt))
    .all();
}

export async function getEvalDataset(id: number, userId: number) {
  const db = getDb();
  const dataset = await db
    .select()
    .from(evaluationDatasets)
    .where(and(eq(evaluationDatasets.id, id), eq(evaluationDatasets.ownerId, userId)))
    .limit(1)
    .get();
  if (!dataset) throw new NotFoundError("Evaluation dataset not found");
  const cases = await db
    .select()
    .from(evaluationCases)
    .where(eq(evaluationCases.datasetId, id))
    .orderBy(evaluationCases.id)
    .all();
  const results = await db
    .select()
    .from(evaluationResults)
    .where(eq(evaluationResults.datasetId, id))
    .orderBy(desc(evaluationResults.id))
    .limit(100)
    .all();
  return { ...dataset, cases, results };
}

export async function createEvalDataset(
  userId: number,
  input: { name: string; description?: string; cases?: { inputText: string; expectedOutput?: string }[] },
) {
  const db = getDb();
  const result = await db
    .insert(evaluationDatasets)
    .values({ ownerId: userId, name: input.name, description: input.description ?? "" })
    .run();
  const id = Number(result.lastInsertRowid);
  for (const c of input.cases ?? []) {
    await db
      .insert(evaluationCases)
      .values({ datasetId: id, inputText: c.inputText, expectedOutput: c.expectedOutput ?? "" })
      .run();
  }
  return getEvalDataset(id, userId);
}

export async function deleteEvalDataset(id: number, userId: number) {
  const db = getDb();
  await db
    .delete(evaluationDatasets)
    .where(and(eq(evaluationDatasets.id, id), eq(evaluationDatasets.ownerId, userId)))
    .run();
}

/** Run every case in the dataset through the model and score similarity. */
export async function runEvaluation(
  id: number,
  userId: number,
  model?: string,
) {
  const dataset = await getEvalDataset(id, userId);
  if (dataset.cases.length === 0) throw new ValidationError("Dataset has no cases");

  const db = getDb();
  const settings = getSettings();
  let passed = 0;

  for (const testCase of dataset.cases) {
    const completion = await callAi([{ role: "user", content: testCase.inputText }], { model });
    const score = similarityScore(completion.content, testCase.expectedOutput ?? "");
    const isPass = score >= 0.6;
    if (isPass) passed++;
    await db
      .insert(evaluationResults)
      .values({
        datasetId: id,
        userId,
        model: completion.model,
        caseId: testCase.id,
        actualOutput: completion.content,
        score: Math.round(score * 100),
        passed: isPass,
      })
      .run();
  }

  await recordUsage(userId, "evaluation_run", {
    content: "",
    model: model ?? settings.aiDefaultModel,
    promptTokens: 0,
    completionTokens: 0,
    latencyMs: 0,
  });

  return {
    totalCases: dataset.cases.length,
    passed,
    passRate: Math.round((passed / dataset.cases.length) * 100),
  };
}

/** Naive token-overlap similarity (0..1) for offline scoring. */
function similarityScore(actual: string, expected: string): number {
  if (!expected) return 0;
  const tokenize = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean));
  const a = tokenize(actual);
  const b = tokenize(expected);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  return intersection / Math.max(a.size, b.size);
}
