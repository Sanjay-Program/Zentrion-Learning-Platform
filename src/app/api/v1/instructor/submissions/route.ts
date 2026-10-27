import { requireUser } from "@/lib/server";
import { handle } from "@/lib/api";
import { listInstructorSubmissions } from "@/lib/instructor";

/** List submissions for the user's courses. */
export const GET = handle(async () => {
  const user = await requireUser();
  const submissions = await listInstructorSubmissions(user);
  return { submissions };
});
