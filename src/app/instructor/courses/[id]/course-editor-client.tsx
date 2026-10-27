"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/webclient";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

interface CurriculumLesson {
  id: number;
  title: string;
  lessonType: string;
  orderIndex: number;
  durationMinutes: number | null;
  isPreview: boolean;
}

interface CurriculumModule {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: CurriculumLesson[];
}

interface CourseDetail {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: string;
  level: string;
  language: string;
  estimatedHours: number | null;
  priceCents: number;
  currency: string;
  isPublished: boolean;
  categoryId: number | null;
  modules: CurriculumModule[];
}

/** Full course editor: metadata form + curriculum tree CRUD. */
export function CourseEditorClient({
  initialCourse,
}: {
  initialCourse?: CourseDetail;
}) {
  const router = useRouter();
  const isNew = !initialCourse;

  const [title, setTitle] = useState(initialCourse?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialCourse?.subtitle ?? "");
  const [description, setDescription] = useState(initialCourse?.description ?? "");
  const [level, setLevel] = useState(initialCourse?.level ?? "beginner");
  const [language, setLanguage] = useState(initialCourse?.language ?? "en");
  const [estimatedHours, setEstimatedHours] = useState(
    initialCourse?.estimatedHours?.toString() ?? "",
  );
  const [priceCents, setPriceCents] = useState(
    initialCourse ? String(initialCourse.priceCents) : "0",
  );
  const [status, setStatus] = useState(initialCourse?.status ?? "draft");

  const [modules, setModules] = useState<CurriculumModule[]>(
    initialCourse?.modules ?? [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Module / lesson forms
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newLesson, setNewLesson] = useState<Record<number, { title: string; type: string; content: string }>>({});
  const [editingLesson, setEditingLesson] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", type: "text", content: "", duration: "" });

  const post = async (path: string, body: Record<string, unknown>) => {
    const res = await apiFetch<{ course: CourseDetail }>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    setModules(res.course.modules);
    setNotice("Saved");
    return res.course;
  };

  const saveMeta = async (e: FormEvent) => {
    e.preventDefault();
    if (isNew) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await apiFetch(`/api/v1/instructor/courses/${initialCourse!.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          subtitle,
          description,
          level,
          language,
          estimatedHours: estimatedHours ? Number(estimatedHours) : null,
          priceCents: Number(priceCents),
          status,
        }),
      });
      setNotice("Course updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const createCourse = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{ course: CourseDetail }>(
        "/api/v1/instructor/courses",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            subtitle,
            description,
            level,
            priceCents: Number(priceCents),
          }),
        },
      );
      router.replace(`/instructor/courses/${res.course.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const addModule = async (e: FormEvent) => {
    e.preventDefault();
    if (isNew || !newModuleTitle.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await post(`/api/v1/instructor/courses/${initialCourse!.id}/modules`, {
        title: newModuleTitle,
      });
      setNewModuleTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add module");
    } finally {
      setBusy(false);
    }
  };

  const removeModule = async (moduleId: number) => {
    if (isNew || !window.confirm("Delete this module and all its lessons?")) return;
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch<{ course: CourseDetail }>(
        `/api/v1/instructor/courses/${initialCourse!.id}/modules/${moduleId}`,
        { method: "DELETE" },
      );
      setModules(data.course.modules);
      setNotice("Module deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete module");
    } finally {
      setBusy(false);
    }
  };

  const addLesson = async (moduleId: number) => {
    if (isNew) return;
    const form = newLesson[moduleId] ?? { title: "", type: "text", content: "" };
    if (!form.title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await post(`/api/v1/instructor/courses/${initialCourse!.id}/lessons`, {
        moduleId,
        title: form.title,
        lessonType: form.type,
        content: form.content,
      });
      setNewLesson((prev) => ({
        ...prev,
        [moduleId]: { title: "", type: "text", content: "" },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add lesson");
    } finally {
      setBusy(false);
    }
  };

  const startEditLesson = (lesson: CurriculumLesson) => {
    setEditingLesson(lesson.id);
    setLessonForm({
      title: lesson.title,
      type: lesson.lessonType,
      content: "",
      duration: lesson.durationMinutes?.toString() ?? "",
    });
  };

  const saveLesson = async (moduleId: number, lessonId: number) => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/instructor/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: lessonForm.title,
          lessonType: lessonForm.type,
          durationMinutes: lessonForm.duration ? Number(lessonForm.duration) : null,
        }),
      });
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId
                    ? {
                        ...l,
                        title: lessonForm.title,
                        lessonType: lessonForm.type,
                        durationMinutes: lessonForm.duration ? Number(lessonForm.duration) : null,
                      }
                    : l,
                ),
              }
            : m,
        ),
      );
      setEditingLesson(null);
      setNotice("Lesson updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setBusy(false);
    }
  };

  const removeLesson = async (moduleId: number, lessonId: number) => {
    if (isNew || !window.confirm("Delete this lesson?")) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/instructor/lessons/${lessonId}`, {
        method: "DELETE",
      });
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m,
        ),
      );
      setNotice("Lesson deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lesson");
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <form onSubmit={isNew ? createCourse : saveMeta}>
      <Card raised>
        <h3 style={{ marginBottom: "var(--space-4)" }}>
          {isNew ? "New course" : "Course details"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Field label="Title" htmlFor="course-title" required>
            <Input
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Subtitle" htmlFor="course-subtitle">
            <Input
              id="course-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </Field>
          <Field label="Description" htmlFor="course-description">
            <Textarea
              id="course-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-4)" }}>
            <Field label="Level" htmlFor="course-level">
              <Select id="course-level" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </Field>
            <Field label="Language" htmlFor="course-language">
              <Input id="course-language" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </Field>
            <Field label="Estimated hours" htmlFor="course-hours">
              <Input
                id="course-hours"
                type="number"
                min={1}
                max={500}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </Field>
            <Field label="Price (cents)" htmlFor="course-price">
              <Input
                id="course-price"
                type="number"
                min={0}
                value={priceCents}
                onChange={(e) => setPriceCents(e.target.value)}
              />
            </Field>
            {!isNew && (
              <Field label="Status" htmlFor="course-status">
                <Select id="course-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="in_review">In review</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
            )}
          </div>
          {error && <p role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
          {notice && <p style={{ color: "var(--success)", margin: 0 }}>{notice}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !title.trim()}>
              {busy ? "Saving…" : isNew ? "Create course" : "Save changes"}
            </Button>
            {!isNew && (
              <Link href={`/courses/${initialCourse!.slug}`} className="btn btn-ghost">
                Preview
              </Link>
            )}
          </div>
        </div>
      </Card>
    </form>
  );

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", gap: "var(--space-6)", alignItems: "start" }}>
      {form}

      <section>
        <h2 style={{ marginBottom: "var(--space-4)" }}>Curriculum</h2>
        {isNew ? (
          <Card>
            <EmptyState
              title="Create the course first"
              description="Once the course exists you can add modules and lessons."
            />
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {modules.map((m, moduleIndex) => (
              <Card key={m.id} raised>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      Module {moduleIndex + 1}: {m.title}
                    </p>
                    {m.description && (
                      <p className="text-muted text-sm">{m.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void removeModule(m.id)}
                  >
                    Delete
                  </Button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", margin: "var(--space-4) 0" }}>
                  {m.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      style={{
                        padding: "var(--space-3)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      {editingLesson === lesson.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                          <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                            <Input
                              aria-label="Lesson title"
                              value={lessonForm.title}
                              onChange={(e) =>
                                setLessonForm((prev) => ({ ...prev, title: e.target.value }))
                              }
                            />
                            <Select
                              aria-label="Lesson type"
                              value={lessonForm.type}
                              onChange={(e) =>
                                setLessonForm((prev) => ({ ...prev, type: e.target.value }))
                              }
                            >
                              {["video", "reading", "text", "quiz", "assignment", "project", "lab"].map(
                                (t) => (
                                  <option key={t} value={t}>{t}</option>
                                ),
                              )}
                            </Select>
                            <Input
                              aria-label="Duration (minutes)"
                              type="number"
                              min={1}
                              placeholder="Minutes"
                              value={lessonForm.duration}
                              onChange={(e) =>
                                setLessonForm((prev) => ({ ...prev, duration: e.target.value }))
                              }
                              style={{ maxWidth: 140 }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => void saveLesson(m.id, lesson.id)} disabled={busy}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingLesson(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center" style={{ gap: "var(--space-3)" }}>
                            <span className="text-muted text-sm">{lessonIndex + 1}.</span>
                            <span className="font-semibold text-sm">{lesson.title}</span>
                            <span className="badge">{lesson.lessonType}</span>
                            {lesson.isPreview && <span className="badge badge-info">preview</span>}
                            {lesson.durationMinutes && (
                              <span className="text-muted text-sm">{lesson.durationMinutes} min</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => startEditLesson(lesson)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void removeLesson(m.id, lesson.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {m.lessons.length === 0 && (
                    <p className="text-muted text-sm">No lessons in this module.</p>
                  )}
                </div>

                <form
                  className="flex gap-2"
                  style={{ flexWrap: "wrap" }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    void addLesson(m.id);
                  }}
                >
                  <Input
                    aria-label={`New lesson title for module ${moduleIndex + 1}`}
                    placeholder="New lesson title…"
                    value={(newLesson[m.id] ?? { title: "" }).title}
                    onChange={(e) =>
                      setNewLesson((prev) => ({
                        ...prev,
                        [m.id]: {
                          title: e.target.value,
                          type: (prev[m.id] ?? { type: "text" }).type,
                          content: (prev[m.id] ?? { content: "" }).content,
                        },
                      }))
                    }
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <Select
                    aria-label={`New lesson type for module ${moduleIndex + 1}`}
                    value={(newLesson[m.id] ?? { type: "text" }).type}
                    onChange={(e) =>
                      setNewLesson((prev) => ({
                        ...prev,
                        [m.id]: {
                          title: (prev[m.id] ?? { title: "" }).title,
                          type: e.target.value,
                          content: (prev[m.id] ?? { content: "" }).content,
                        },
                      }))
                    }
                  >
                    {["video", "reading", "text", "quiz", "assignment", "project", "lab"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                  <Button type="submit" size="sm" disabled={busy}>
                    Add lesson
                  </Button>
                </form>
              </Card>
            ))}

            <form onSubmit={addModule} className="flex gap-2">
              <Input
                aria-label="New module title"
                placeholder="New module title…"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" disabled={busy || !newModuleTitle.trim()}>
                Add module
              </Button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
