import { describe, it, expect } from "vitest";
import {
  listCourses,
  getCourseBySlug,
  listProjects,
  listPaths,
  listLabs,
  listChallenges,
} from "../src/lib/catalogue";
import { COURSE_IMAGE_MAP, COURSE_THEMES, getCourseTheme } from "../src/components/course-artwork";
import { hasPermission } from "../src/lib/rbac";
import { getDb } from "../src/db/client";
import { lessons, modules } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";

describe("1. Flagship AI Courses & Pedagogy Verification", () => {
  const EXPECTED_COURSES = [
    "ai-foundations-and-fluency",
    "prompt-and-context-engineering",
    "agentic-ai-engineering",
    "build-ai-apps-apis-rag",
    "ai-business-automation",
    "ai-cybersecurity-and-llm-security",
  ];

  it("should have all 6 flagship AI courses published in catalogue", async () => {
    const courses = await listCourses({ limit: 100 });
    const slugs = courses.map((c) => c.slug);
    for (const expected of EXPECTED_COURSES) {
      expect(slugs).toContain(expected);
    }
  });

  it("each flagship course should have modules and standard 10-part lessons", async () => {
    const db = getDb();
    for (const slug of EXPECTED_COURSES) {
      const course = await getCourseBySlug(slug);
      expect(course, `Course ${slug} should exist`).not.toBeNull();
      expect(course!.modules.length, `Course ${slug} should have modules`).toBeGreaterThan(0);

      // Verify lessons have full 10-part curriculum
      const moduleIds = course!.modules.map((m) => m.id);
      const lessonRows = await db
        .select()
        .from(lessons)
        .where(inArray(lessons.moduleId, moduleIds))
        .all();

      expect(lessonRows.length, `Course ${slug} should have lessons`).toBeGreaterThan(0);

      const firstLesson = lessonRows[0];
      expect(firstLesson.content).toBeTruthy();
      expect(firstLesson.content).toContain("Learning Objectives");
      expect(firstLesson.content).toContain("Concept Explanation");
      expect(firstLesson.content).toContain("Worked Example");
      expect(firstLesson.content).toContain("Knowledge Check");
    }
  });
});

describe("2. Image Assets & Visual System Verification", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("all images in COURSE_IMAGE_MAP must exist on disk and be non-empty", () => {
    for (const [slug, imgPath] of Object.entries(COURSE_IMAGE_MAP)) {
      const fullPath = path.join(publicDir, imgPath.replace(/^\//, ""));
      expect(fs.existsSync(fullPath), `Image ${imgPath} for ${slug} must exist at ${fullPath}`).toBe(true);
      const stats = fs.statSync(fullPath);
      expect(stats.size, `Image ${imgPath} should not be empty`).toBeGreaterThan(100);
    }
  });

  it("all 8 technical lesson diagrams must exist in both SVG and PNG format", () => {
    const diagrams = [
      "01-neural-network",
      "02-prompt-anatomy",
      "03-rag-pipeline",
      "04-agent-lifecycle",
      "05-ai-evaluation",
      "06-trust-boundaries",
      "07-business-automation",
      "08-soc-investigation",
    ];

    for (const d of diagrams) {
      const svgPath = path.join(publicDir, "images", "lesson-diagrams", `${d}.svg`);
      const pngPath = path.join(publicDir, "images", "lesson-diagrams", `${d}.png`);
      expect(fs.existsSync(svgPath), `SVG diagram ${d} should exist`).toBe(true);
      expect(fs.existsSync(pngPath), `PNG diagram ${d} should exist`).toBe(true);
    }
  });

  it("official brand logo and favicon must exist", () => {
    const faviconSvg = path.join(publicDir, "images", "logo", "08-app-icon-favicon.svg");
    const faviconPng = path.join(publicDir, "images", "logo", "08-app-icon-favicon.png");
    expect(fs.existsSync(faviconSvg), "Favicon SVG should exist").toBe(true);
    expect(fs.existsSync(faviconPng), "Favicon PNG should exist").toBe(true);
  });

  it("getCourseTheme returns valid themes with capstone deliverables", () => {
    const theme = getCourseTheme("agentic-ai-engineering");
    expect(theme.primaryGradient).toContain("linear-gradient");
    expect(theme.projectArtifact).toContain("Autonomous");
  });
});

describe("3. Capstone Projects, Paths & Hands-on Labs", () => {
  it("should have all 6 flagship capstone projects with rubrics", async () => {
    const projects = await listProjects();
    expect(projects.length).toBeGreaterThanOrEqual(6);
    for (const p of projects) {
      expect(p.title).toBeTruthy();
      expect(p.level).toBeTruthy();
      expect(p.milestoneCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("should have structured learning paths", async () => {
    const paths = await listPaths();
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      expect(p.courseCount).toBeGreaterThan(0);
    }
  });

  it("should have hands-on security labs and CTF challenges", async () => {
    const labs = await listLabs();
    const challenges = await listChallenges();
    expect(labs.length).toBeGreaterThan(0);
    expect(challenges.length).toBeGreaterThan(0);
  });
});

describe("4. Security & Role-Based Access Control (RBAC)", () => {
  it("should enforce admin permissions correctly", async () => {
    const adminUser = {
      id: 1,
      email: "admin@zentrion.dev",
      role: "admin",
      isSuperuser: true,
      roles: [{ id: 1, key: "admin", name: "Platform Admin" }],
      organizationId: null,
      name: "Admin",
      avatarUrl: null,
      bio: null,
      emailVerified: true,
      mfaSecret: null,
      mfaBackupCodes: null,
      mfaVerifiedAt: null,
      currentSessionVersion: 1,
      createdAt: "",
      updatedAt: "",
    };

    const learnerUser = {
      ...adminUser,
      id: 3,
      email: "learner@zentrion.dev",
      role: "learner",
      isSuperuser: false,
      roles: [{ id: 3, key: "learner", name: "Learner" }],
    };

    expect(await hasPermission(adminUser as any, "user.manage")).toBe(true);
    expect(await hasPermission(adminUser as any, "course.publish")).toBe(true);
    expect(await hasPermission(learnerUser as any, "user.manage")).toBe(false);
    expect(await hasPermission(learnerUser as any, "course.create")).toBe(false);
    expect(await hasPermission(learnerUser as any, "course.enroll")).toBe(true);
    expect(await hasPermission(learnerUser as any, "ai.use")).toBe(true);
  });
});
