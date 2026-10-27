import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { json } from "./json";

export { categories };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const now = () => sql`(datetime('now'))`;

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name").notNull(),
  status: text("status", {
    enum: ["active", "suspended", "pending_verification", "deleted"],
  }).notNull().default("pending_verification"),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  isSuperuser: integer("is_superuser", { mode: "boolean" }).notNull().default(false),
  lastLoginAt: text("last_login_at"),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  createdAt: text("created_at").notNull().default(now()),
  updatedAt: text("updated_at").notNull().default(now()),
});

export const userProfiles = sqliteTable("user_profiles", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  location: text("location"),
  website: text("website"),
  interests: json<string[]>()("interests").notNull().default([]),
  careerGoal: text("career_goal"),
  experienceLevel: text("experience_level"),
  weeklyHours: integer("weekly_hours"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).notNull().default(false),
});

export const userPreferences = sqliteTable("user_preferences", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"),
  language: text("language").notNull().default("en"),
  emailNotifications: integer("email_notifications", { mode: "boolean" }).notNull().default(true),
  marketingEmails: integer("marketing_emails", { mode: "boolean" }).notNull().default(false),
  aiDataRetention: integer("ai_data_retention", { mode: "boolean" }).notNull().default(true),
  reducedMotion: integer("reduced_motion", { mode: "boolean" }).notNull().default(false),
});

export const sessions = sqliteTable(
  "user_sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tokenHash: text("token_hash").notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: text("created_at").notNull().default(now()),
    expiresAt: text("expires_at").notNull(),
    revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
  },
  (t) => ({ tokenIdx: index("sessions_token_hash_idx").on(t.tokenHash) }),
);

export const mfaMethods = sqliteTable("mfa_methods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  methodType: text("method_type").notNull(), // totp
  secretEncrypted: text("secret_encrypted").notNull(),
  label: text("label"),
  confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now()),
});

export const recoveryTokens = sqliteTable(
  "recovery_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    purpose: text("purpose").notNull(), // password_reset | email_verify
    expiresAt: text("expires_at").notNull(),
    used: integer("used", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ tokenIdx: index("recovery_tokens_hash_idx").on(t.tokenHash) }),
);

export const loginEvents = sqliteTable("login_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: integer("success", { mode: "boolean" }).notNull(),
  reason: text("reason"),
  createdAt: text("created_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// RBAC
// ---------------------------------------------------------------------------

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  scope: text("scope").notNull().default("platform"),
});

export const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
});

export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => ({ uniq: unique().on(t.roleId, t.permissionId) }),
);

export const userRoles = sqliteTable(
  "user_roles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => ({ uniq: unique().on(t.userId, t.roleId) }),
);

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export const organizations = sqliteTable("organizations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  orgType: text("org_type").notNull().default("college"),
  branding: json<Record<string, unknown>>()("branding").notNull().default({}),
  createdAt: text("created_at").notNull().default(now()),
});

export const organizationMembers = sqliteTable(
  "organization_members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    orgRole: text("org_role").notNull().default("member"),
    departmentId: integer("department_id"),
    joinedAt: text("joined_at").notNull().default(now()),
  },
  (t) => ({ uniq: unique().on(t.organizationId, t.userId) }),
);

export const departments = sqliteTable("departments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export const cohorts = sqliteTable("cohorts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
});

export const invitations = sqliteTable(
  "invitations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    orgRole: text("org_role").notNull().default("learner"),
    tokenHash: text("token_hash").notNull(),
    invitedBy: integer("invited_by").references(() => users.id, { onDelete: "set null" }),
    accepted: integer("accepted", { mode: "boolean" }).notNull().default(false),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ tokenIdx: index("invitations_hash_idx").on(t.tokenHash) }),
);

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const courses = sqliteTable(
  "courses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    status: text("status", { enum: ["draft", "in_review", "published", "archived"] }).notNull().default("draft"),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    level: text("level").notNull().default("beginner"),
    language: text("language").notNull().default("en"),
    estimatedHours: integer("estimated_hours"),
    priceCents: integer("price_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    instructorId: integer("instructor_id").references(() => users.id, { onDelete: "set null" }),
    reviewNotes: text("review_notes"),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({ slugIdx: index("courses_slug_idx").on(t.slug) }),
);

export const courseTags = sqliteTable(
  "course_tags",
  {
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.courseId, t.tagId] }) }),
);

export const modules = sqliteTable("course_modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  lessonType: text("lesson_type", {
    enum: ["video", "reading", "text", "quiz", "assignment", "project", "lab"],
  }).notNull().default("text"),
  orderIndex: integer("order_index").notNull().default(0),
  content: text("content"),
  durationMinutes: integer("duration_minutes"),
  videoUrl: text("video_url"),
  isPreview: integer("is_preview", { mode: "boolean" }).notNull().default(false),
  assessmentId: integer("assessment_id"),
  labId: integer("lab_id"),
});

export const lessonBlocks = sqliteTable("lesson_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  blockType: text("block_type").notNull(),
  content: text("content"),
  orderIndex: integer("order_index").notNull().default(0),
  meta: json<Record<string, unknown>>()("meta").notNull().default({}),
});

export const learningPaths = sqliteTable(
  "learning_paths",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    level: text("level").notNull().default("beginner"),
    estimatedHours: integer("estimated_hours"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ slugIdx: index("learning_paths_slug_idx").on(t.slug) }),
);

export const learningPathItems = sqliteTable("learning_path_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pathId: integer("path_id").notNull().references(() => learningPaths.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull().default(0),
  isRequired: integer("is_required", { mode: "boolean" }).notNull().default(true),
});

export const mediaAssets = sqliteTable("media_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  kind: text("kind").notNull().default("attachment"),
  createdAt: text("created_at").notNull().default(now()),
});

export const courseReviews = sqliteTable(
  "course_reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ uniq: unique().on(t.courseId, t.userId) }),
);

export const instructorApplications = sqliteTable("instructor_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  expertise: text("expertise"),
  status: text("status").notNull().default("pending"),
  decidedAt: text("decided_at"),
  createdAt: text("created_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Learning activity
// ---------------------------------------------------------------------------

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["active", "completed", "dropped"] }).notNull().default("active"),
    source: text("source").notNull().default("direct"),
    enrolledAt: text("enrolled_at").notNull().default(now()),
    completedAt: text("completed_at"),
    lastAccessedAt: text("last_accessed_at"),
  },
  (t) => ({ uniq: unique().on(t.userId, t.courseId) }),
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    positionSeconds: integer("position_seconds").notNull().default(0),
    completedAt: text("completed_at"),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => ({ uniq: unique().on(t.enrollmentId, t.lessonId) }),
);

export const lessonBookmarks = sqliteTable(
  "lesson_bookmarks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    note: text("note"),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ uniq: unique().on(t.userId, t.lessonId) }),
);

export const learnerNotes = sqliteTable("learner_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  tags: json<string[]>()("tags").notNull().default([]),
  videoTimestamp: integer("video_timestamp"),
  createdAt: text("created_at").notNull().default(now()),
  updatedAt: text("updated_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export const assessments = sqliteTable("assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
  description: text("description"),
  timeLimitMinutes: integer("time_limit_minutes"),
  passingScore: integer("passing_score").notNull().default(70),
  maxAttempts: integer("max_attempts"),
  shuffleQuestions: integer("shuffle_questions", { mode: "boolean" }).notNull().default(false),
  showFeedback: text("show_feedback").notNull().default("after_submit"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(now()),
});

export const assessmentQuestions = sqliteTable("assessment_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assessmentId: integer("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  questionType: text("question_type", {
    enum: ["single", "multiple", "true_false", "short_answer", "long_answer", "code"],
  }).notNull(),
  prompt: text("prompt").notNull(),
  explanation: text("explanation"),
  points: integer("points").notNull().default(1),
  orderIndex: integer("order_index").notNull().default(0),
});

export const assessmentOptions = sqliteTable("assessment_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull().references(() => assessmentQuestions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
});

export const assessmentAttempts = sqliteTable("assessment_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assessmentId: integer("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  enrollmentId: integer("enrollment_id").references(() => enrollments.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["in_progress", "submitted", "graded"] }).notNull().default("in_progress"),
  scorePercent: integer("score_percent"),
  passed: integer("passed", { mode: "boolean" }),
  startedAt: text("started_at").notNull().default(now()),
  submittedAt: text("submitted_at"),
});

export const assessmentAnswers = sqliteTable("assessment_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  attemptId: integer("attempt_id").notNull().references(() => assessmentAttempts.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => assessmentQuestions.id, { onDelete: "cascade" }),
  selectedOptions: json<number[]>()("selected_options").notNull().default([]),
  textAnswer: text("text_answer"),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  scorePoints: integer("score_points"),
  feedback: text("feedback"),
});

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  projectId: integer("project_id"),
  content: text("content"),
  storageKeys: json<string[]>()("storage_keys").notNull().default([]),
  status: text("status").notNull().default("submitted"),
  submittedAt: text("submitted_at").notNull().default(now()),
});

export const gradingRecords = sqliteTable("grading_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: integer("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  graderId: integer("grader_id").references(() => users.id, { onDelete: "set null" }),
  scorePercent: integer("score_percent").notNull(),
  rubricScores: json<unknown[]>()("rubric_scores").notNull().default([]),
  feedback: text("feedback"),
  isAiSuggestion: integer("is_ai_suggestion", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

export const certificates = sqliteTable(
  "certificates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    verificationCode: text("verification_code").notNull().unique(),
    issuedAt: text("issued_at").notNull().default(now()),
    revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
    revokedReason: text("revoked_reason"),
  },
  (t) => ({ codeIdx: index("certificates_code_idx").on(t.verificationCode) }),
);

export const certificateEvents = sqliteTable("certificate_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  certificateId: integer("certificate_id").notNull().references(() => certificates.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  details: text("details"),
  createdAt: text("created_at").notNull().default(now()),
});

export const skillDefinitions = sqliteTable("skill_definitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category"),
});

export const skillEvidence = sqliteTable("skill_evidence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: integer("skill_id").notNull().references(() => skillDefinitions.id, { onDelete: "cascade" }),
  evidenceType: text("evidence_type").notNull(),
  referenceId: integer("reference_id"),
  note: text("note"),
  createdAt: text("created_at").notNull().default(now()),
});

export const portfolioItems = sqliteTable("portfolio_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  projectSubmissionId: integer("project_submission_id"),
  visibility: text("visibility").notNull().default("public"),
  createdAt: text("created_at").notNull().default(now()),
});

export const projectDefinitions = sqliteTable(
  "project_definitions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    brief: text("brief"),
    level: text("level").notNull().default("intermediate"),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    rubric: json<unknown[]>()("rubric").notNull().default([]),
    milestones: json<string[]>()("milestones").notNull().default([]),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ slugIdx: index("project_definitions_slug_idx").on(t.slug) }),
);

export const projectSubmissions = sqliteTable("project_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projectDefinitions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  storageKeys: json<string[]>()("storage_keys").notNull().default([]),
  milestoneIndex: integer("milestone_index").notNull().default(0),
  status: text("status").notNull().default("submitted"),
  feedback: text("feedback"),
  scorePercent: integer("score_percent"),
  submittedAt: text("submitted_at").notNull().default(now()),
});

export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  earnedAt: text("earned_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// AI workspace
// ---------------------------------------------------------------------------

export const aiConversations = sqliteTable("ai_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  contextCourseId: integer("context_course_id").references(() => courses.id, { onDelete: "set null" }),
  mode: text("mode").notNull().default("explain"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now()),
  updatedAt: text("updated_at").notNull().default(now()),
});

export const aiMessages = sqliteTable("ai_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  citations: json<unknown[]>()("citations").notNull().default([]),
  model: text("model"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  createdAt: text("created_at").notNull().default(now()),
});

export const promptTemplates = sqliteTable("prompt_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  template: text("template").notNull(),
  variables: json<string[]>()("variables").notNull().default([]),
  tags: json<string[]>()("tags").notNull().default([]),
  visibility: text("visibility").notNull().default("private"),
  createdAt: text("created_at").notNull().default(now()),
  updatedAt: text("updated_at").notNull().default(now()),
});

export const promptVersions = sqliteTable("prompt_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  promptId: integer("prompt_id").notNull().references(() => promptTemplates.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull().default(1),
  template: text("template").notNull(),
  changelog: text("changelog"),
  createdAt: text("created_at").notNull().default(now()),
});

export const promptRuns = sqliteTable("prompt_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  promptId: integer("prompt_id").references(() => promptTemplates.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  renderedPrompt: text("rendered_prompt").notNull(),
  model: text("model").notNull(),
  output: text("output"),
  error: text("error"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  latencyMs: integer("latency_ms"),
  createdAt: text("created_at").notNull().default(now()),
});

export const agentDefinitions = sqliteTable("agent_definitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  objective: text("objective"),
  instructions: text("instructions"),
  model: text("model").notNull(),
  toolIds: json<number[]>()("tool_ids").notNull().default([]),
  maxSteps: integer("max_steps").notNull().default(8),
  timeLimitSeconds: integer("time_limit_seconds").notNull().default(120),
  tokenBudget: integer("token_budget"),
  requireApproval: integer("require_approval", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now()),
  updatedAt: text("updated_at").notNull().default(now()),
});

export const agentRuns = sqliteTable("agent_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").notNull().references(() => agentDefinitions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inputData: json<Record<string, unknown>>()("input_data").notNull().default({}),
  status: text("status").notNull().default("pending"),
  output: text("output"),
  error: text("error"),
  stepsUsed: integer("steps_used").notNull().default(0),
  tokensUsed: integer("tokens_used").notNull().default(0),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  createdAt: text("created_at").notNull().default(now()),
});

export const agentSteps = sqliteTable("agent_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  runId: integer("run_id").notNull().references(() => agentRuns.id, { onDelete: "cascade" }),
  stepType: text("step_type").notNull(),
  content: text("content"),
  toolName: text("tool_name"),
  toolInput: text("tool_input"),
  toolOutput: text("tool_output"),
  createdAt: text("created_at").notNull().default(now()),
});

export const toolRegistry = sqliteTable("tool_registry", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  inputSchema: json<Record<string, unknown>>()("input_schema").notNull().default({}),
  permission: text("permission"),
  timeoutSeconds: integer("timeout_seconds").notNull().default(30),
  sideEffects: text("side_effects").notNull().default("none"),
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(true),
  implementation: text("implementation").notNull(),
});

export const usageRecords = sqliteTable("usage_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  feature: text("feature").notNull(),
  model: text("model").notNull(),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  latencyMs: integer("latency_ms"),
  error: text("error"),
  date: text("date").notNull(),
  createdAt: text("created_at").notNull().default(now()),
});

export const evaluationDatasets = sqliteTable("evaluation_datasets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull().default(now()),
});

export const evaluationCases = sqliteTable("evaluation_cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  datasetId: integer("dataset_id").notNull().references(() => evaluationDatasets.id, { onDelete: "cascade" }),
  inputText: text("input_text").notNull(),
  expectedOutput: text("expected_output"),
});

export const evaluationResults = sqliteTable("evaluation_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  datasetId: integer("dataset_id").notNull().references(() => evaluationDatasets.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  caseId: integer("case_id").notNull().references(() => evaluationCases.id, { onDelete: "cascade" }),
  actualOutput: text("actual_output"),
  score: integer("score"),
  passed: integer("passed", { mode: "boolean" }),
  createdAt: text("created_at").notNull().default(now()),
});

export const knowledgeBases = sqliteTable("knowledge_bases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(now()),
});

export const knowledgeDocuments = sqliteTable("knowledge_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  knowledgeBaseId: integer("knowledge_base_id").notNull().references(() => knowledgeBases.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  status: text("status").notNull().default("pending"),
  chunkCount: integer("chunk_count").notNull().default(0),
  error: text("error"),
  createdAt: text("created_at").notNull().default(now()),
});

export const documentChunks = sqliteTable("document_chunks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull().references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull().default(0),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Cybersecurity labs
// ---------------------------------------------------------------------------

export const labDefinitions = sqliteTable(
  "lab_definitions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    labType: text("lab_type").notNull(),
    difficulty: text("difficulty").notNull().default("beginner"),
    objectives: json<string[]>()("objectives").notNull().default([]),
    instructions: text("instructions"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(30),
    engineConfig: json<Record<string, unknown>>()("engine_config").notNull().default({}),
    gradingRubric: json<unknown[]>()("grading_rubric").notNull().default([]),
    ttlMinutes: integer("ttl_minutes").notNull().default(120),
    safetyClassification: text("safety_classification").notNull().default("simulated"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ slugIdx: index("lab_definitions_slug_idx").on(t.slug) }),
);

export const labSessions = sqliteTable("lab_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  labId: integer("lab_id").notNull().references(() => labDefinitions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("provisioning"),
  environmentVersion: text("environment_version").notNull().default("1.0"),
  startedAt: text("started_at"),
  expiresAt: text("expires_at"),
  finishedAt: text("finished_at"),
  state: json<Record<string, unknown>>()("state").notNull().default({}),
  submittedAt: text("submitted_at"),
  createdAt: text("created_at").notNull().default(now()),
});

export const labEvents = sqliteTable("lab_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => labSessions.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  details: text("details"),
  createdAt: text("created_at").notNull().default(now()),
});

export const labGrades = sqliteTable("lab_grades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => labSessions.id, { onDelete: "cascade" }),
  scorePercent: integer("score_percent").notNull(),
  rubricScores: json<unknown[]>()("rubric_scores").notNull().default([]),
  feedback: text("feedback"),
  gradedAt: text("graded_at").notNull().default(now()),
});

export const labEvidence = sqliteTable("lab_evidence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => labSessions.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  reference: text("reference").notNull(),
  details: text("details"),
  createdAt: text("created_at").notNull().default(now()),
});

export const challengeDefinitions = sqliteTable(
  "challenge_definitions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("general"),
    difficulty: text("difficulty").notNull().default("easy"),
    points: integer("points").notNull().default(100),
    flagHash: text("flag_hash").notNull(),
    hints: json<string[]>()("hints").notNull().default([]),
    maxAttempts: integer("max_attempts").notNull().default(10),
    expiresAt: text("expires_at"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ slugIdx: index("challenge_definitions_slug_idx").on(t.slug) }),
);

export const challengeAttempts = sqliteTable("challenge_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengeId: integer("challenge_id").notNull().references(() => challengeDefinitions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  submittedFlagHash: text("submitted_flag_hash").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Commerce
// ---------------------------------------------------------------------------

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  productType: text("product_type").notNull(),
  referenceId: integer("reference_id"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(now()),
});

export const prices = sqliteTable("prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  currency: text("currency").notNull().default("USD"),
  amountCents: integer("amount_cents").notNull(),
  interval: text("interval"),
  providerPriceId: text("provider_price_id"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  provider: text("provider"),
  providerSessionId: text("provider_session_id"),
  couponCode: text("coupon_code"),
  createdAt: text("created_at").notNull().default(now()),
  paidAt: text("paid_at"),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  priceId: integer("price_id").notNull().references(() => prices.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
});

export const paymentAttempts = sqliteTable("payment_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerIntentId: text("provider_intent_id"),
  status: text("status").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  errorMessage: text("error_message"),
  createdAt: text("created_at").notNull().default(now()),
});

export const paymentEvents = sqliteTable(
  "payment_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: text("payload"),
    processed: integer("processed", { mode: "boolean" }).notNull().default(false),
    processedAt: text("processed_at"),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ uniq: unique().on(t.provider, t.eventId) }),
);

export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  providerSubscriptionId: text("provider_subscription_id"),
  status: text("status").notNull().default("active"),
  currentPeriodEnds: text("current_period_ends"),
  createdAt: text("created_at").notNull().default(now()),
});

export const entitlements = sqliteTable(
  "entitlements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").notNull(),
    resourceId: integer("resource_id").notNull(),
    source: text("source").notNull(),
    orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
    expiresAt: text("expires_at"),
    grantedAt: text("granted_at").notNull().default(now()),
  },
  (t) => ({
    uniq: unique().on(t.userId, t.resourceType, t.resourceId),
    userIdx: index("entitlements_user_idx").on(t.userId, t.resourceType),
  }),
);

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  maxUses: integer("max_uses"),
  useCount: integer("use_count").notNull().default(0),
  expiresAt: text("expires_at"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const refundRequests = sqliteTable("refund_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  decidedBy: integer("decided_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Live learning & community
// ---------------------------------------------------------------------------

export const liveSessions = sqliteTable("live_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  instructorId: integer("instructor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  seatLimit: integer("seat_limit"),
  provider: text("provider").notNull().default("none"),
  providerMeetingId: text("provider_meeting_id"),
  recordingUrl: text("recording_url"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(now()),
});

export const sessionRegistrations = sqliteTable(
  "session_registrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: integer("session_id").notNull().references(() => liveSessions.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("registered"),
    attended: integer("attended", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ uniq: unique().on(t.sessionId, t.userId) }),
);

export const discussionThreads = sqliteTable("discussion_threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isQuestion: integer("is_question", { mode: "boolean" }).notNull().default(true),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  isLocked: integer("is_locked", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now()),
});

export const discussionPosts = sqliteTable("discussion_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id").notNull().references(() => discussionThreads.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isAcceptedAnswer: integer("is_accepted_answer", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now()),
  updatedAt: text("updated_at").notNull().default(now()),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  referenceType: text("reference_type"),
  referenceId: integer("reference_id"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  emailSent: integer("email_sent", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorRole: text("actor_role"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: text("created_at").notNull().default(now()),
});

export const backgroundJobs = sqliteTable("background_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobType: text("job_type").notNull(),
  payload: text("payload"),
  status: text("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  error: text("error"),
  createdAt: text("created_at").notNull().default(now()),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
});

export const webhookEvents = sqliteTable(
  "webhook_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: text("payload"),
    signatureValid: integer("signature_valid", { mode: "boolean" }),
    processed: integer("processed", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({ uniq: unique().on(t.provider, t.eventId) }),
);

export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: text("updated_at").notNull().default(now()),
});

// ---------------------------------------------------------------------------
// Marketing enquiries (public lead capture — no account required)
// ---------------------------------------------------------------------------
export const enquiries = sqliteTable(
  "enquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    topic: text("topic").notNull().default("general"),
    message: text("message").notNull(),
    source: text("source").notNull().default("contact"),
    courseSlug: text("course_slug"),
    status: text("status", {
      enum: ["new", "contacted", "qualified", "enrolled", "closed", "spam"],
    })
      .notNull()
      .default("new"),
    notes: text("notes"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => ({
    createdIdx: index("enquiries_created_idx").on(t.createdAt),
    emailIdx: index("enquiries_email_idx").on(t.email),
  }),
);

export const supportTickets = sqliteTable("support_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("general"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  createdAt: text("created_at").notNull().default(now()),
});

export const supportTicketMessages = sqliteTable("support_ticket_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  isInternal: integer("is_internal", { mode: "boolean" }).notNull().default(false),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull().default(now()),
});
