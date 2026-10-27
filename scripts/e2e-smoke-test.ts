/**
 * End-to-end smoke test script for Zentrion Learntech.
 * Verifies that all key routes, assets, and APIs respond with HTTP 200/302.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const ROUTES_TO_TEST = [
  // Core Public Routes
  "/",
  "/courses",
  "/courses/agentic-ai-engineering",
  "/courses/build-ai-apps-apis-rag",
  "/courses/prompt-and-context-engineering",
  "/courses/ai-cybersecurity-and-llm-security",
  "/courses/ai-business-automation",
  "/courses/ai-foundations-and-fluency",
  "/paths",
  "/labs",
  "/challenges",
  "/projects",
  "/projects/build-an-autonomous-agent",
  "/cyber",
  "/pricing",
  "/for-colleges",
  "/for-enterprises",
  "/auth/sign-in",
  "/auth/sign-up",
  "/app",
  "/ai",
  "/admin",
  "/instructor",
  "/blog",
  "/help",
  "/legal/privacy",
  "/legal/terms",

  // Static Visual Assets & Covers
  "/images/course-covers/A-agentic-ai.png",
  "/images/course-covers/B-ai-application-development-rag.png",
  "/images/course-covers/C-prompt-engineering.png",
  "/images/course-covers/D-ai-cybersecurity.png",
  "/images/course-covers/E-ai-business-automation.png",
  "/images/lesson-diagrams/01-neural-network.svg",
  "/images/lesson-diagrams/02-prompt-anatomy.svg",
  "/images/lesson-diagrams/03-rag-pipeline.svg",
  "/images/lesson-diagrams/04-agent-lifecycle.svg",
  "/images/lesson-diagrams/05-ai-evaluation.svg",
  "/images/lesson-diagrams/06-trust-boundaries.svg",
  "/images/lesson-diagrams/07-business-automation.svg",
  "/images/lesson-diagrams/08-soc-investigation.svg",
  "/images/logo/08-app-icon-favicon.svg",
];

async function run() {
  console.log(`Running E2E Smoke Tests against ${BASE_URL}…\n`);
  let passed = 0;
  let failed = 0;

  for (const route of ROUTES_TO_TEST) {
    const url = `${BASE_URL}${route}`;
    const startTime = Date.now();
    try {
      const res = await fetch(url, { redirect: "manual" });
      const duration = Date.now() - startTime;
      const status = res.status;

      // HTTP 200 (OK) or 302/307/308 (Redirects for auth/canonical URLs) are valid
      if (status >= 200 && status < 400) {
        console.log(`✓ [${status}] ${route} (${duration}ms)`);
        passed++;
      } else {
        console.error(`✗ [${status}] ${route} (${duration}ms) FAILED`);
        failed++;
      }
    } catch (err: any) {
      console.error(`✗ [ERR] ${route}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Public & Asset Routes: ${passed} passed, ${failed} failed (Total: ${ROUTES_TO_TEST.length})`);
  console.log(`========================================\n`);

  // --- Authenticated User Session Flow ---
  console.log("Testing Authenticated Session Flow…");
  try {
    // 1. Fetch sign-in page to acquire CSRF cookie
    const getSigninRes = await fetch(`${BASE_URL}/auth/sign-in`);
    const setCookieHeader = getSigninRes.headers.get("set-cookie") || "";
    const csrfMatch = setCookieHeader.match(/zcsrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : "test-token";

    // 2. Perform Login POST
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        "Cookie": `zcsrftoken=${csrfToken}`,
      },
      body: JSON.stringify({
        email: "learner@zentrion.dev",
        password: "Learner12345!",
      }),
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
    }

    const loginData = await loginRes.json();
    console.log(`✓ [${loginRes.status}] Login successful for ${loginData.user.email} (role: ${loginData.user.role})`);

    const loginSetCookie = loginRes.headers.get("set-cookie") || "";
    const sessionMatch = loginSetCookie.match(/zsession=([^;]+)/);
    if (!sessionMatch) {
      throw new Error("No zsession cookie returned from login!");
    }
    const sessionToken = sessionMatch[1];
    const authCookie = `zsession=${sessionToken}; zcsrftoken=${csrfToken}`;

    // 3. Access Authenticated /app Dashboard
    const appRes = await fetch(`${BASE_URL}/app`, {
      headers: { Cookie: authCookie },
    });
    if (appRes.status === 200) {
      console.log(`✓ [200] Authenticated /app dashboard accessible`);
    } else {
      throw new Error(`Authenticated /app returned status ${appRes.status}`);
    }

    // 4. Access Authenticated /ai Workspace
    const aiRes = await fetch(`${BASE_URL}/ai`, {
      headers: { Cookie: authCookie },
    });
    if (aiRes.status === 200) {
      console.log(`✓ [200] Authenticated /ai workspace accessible`);
    } else {
      throw new Error(`Authenticated /ai returned status ${aiRes.status}`);
    }

    console.log(`\n✓ All Authenticated Session Tests Passed Cleanly!\n`);
  } catch (authErr: any) {
    console.error(`✗ Authenticated session flow failed: ${authErr.message}`);
    failed++;
  }

  if (failed > 0) {
    process.exit(1);
  }

}

run();
