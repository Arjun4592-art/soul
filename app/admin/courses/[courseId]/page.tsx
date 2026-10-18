"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import Modal from "@/components/admin/Modal";
import { AdminPage, Notice, RowBtn } from "@/components/admin/kit";
import { Badge, ConfirmDialog, Field, GhostButton, PrimaryButton, Select, TextArea, TextInput } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { useDoc } from "@/lib/useDoc";
import { db } from "@/lib/firebase";
import type { CourseDoc, LessonDoc, LessonResource, LessonType, ModuleDoc, QuizQuestion } from "@/lib/types";

const blankQuestion = (): QuizQuestion => ({ question: "", options: ["", "", "", ""], correctIndex: 0 });

const blankLesson = {
  title: "",
  type: "video" as LessonType,
  videoUrl: "",
  content: "",
  durationMinutes: "",
  resourcesText: "", // one "Name | link" per line
  quiz: [blankQuestion()] as QuizQuestion[],
};

const TYPE_LABEL: Record<LessonType, string> = { video: "Video", text: "Reading", quiz: "Quiz" };

export default function AdminCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course } = useDoc<CourseDoc>("courses", courseId);
  const { data: modulesRaw, loading } = useCollection<ModuleDoc>("modules", [where("courseId", "==", courseId)]);
  const { data: lessonsRaw } = useCollection<LessonDoc>("lessons", [where("courseId", "==", courseId)]);

  const modules = useMemo(() => [...modulesRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [modulesRaw]);
  const lessons = useMemo(() => [...lessonsRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [lessonsRaw]);

  const [moduleOpen, setModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleDoc | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [deleteModule, setDeleteModule] = useState<ModuleDoc | null>(null);

  const [lessonOpen, setLessonOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState("");
  const [editingLesson, setEditingLesson] = useState<LessonDoc | null>(null);
  const [form, setForm] = useState(blankLesson);
  const [deleteLesson, setDeleteLesson] = useState<LessonDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const syncCounts = (moduleCount: number, lessonCount: number) => updateDoc(doc(db, "courses", courseId), { moduleCount, lessonCount });

  async function saveModule(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingModule) await updateDoc(doc(db, "modules", editingModule.id), { title: moduleTitle.trim() });
      else {
        await addDoc(collection(db, "modules"), { courseId, title: moduleTitle.trim(), order: modules.length, createdAt: serverTimestamp() });
        await syncCounts(modules.length + 1, lessons.length);
      }
      setModuleOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function removeModule() {
    if (!deleteModule) return;
    const gone = lessons.filter((l) => l.moduleId === deleteModule.id);
    const batch = writeBatch(db);
    gone.forEach((l) => batch.delete(doc(db, "lessons", l.id)));
    batch.delete(doc(db, "modules", deleteModule.id));
    await batch.commit();
    await syncCounts(modules.length - 1, lessons.length - gone.length);
    setDeleteModule(null);
  }

  /** Swap the order values of two neighbours. */
  async function swap(colName: "modules" | "lessons", a: { id: string; order: number }, b: { id: string; order: number }) {
    const batch = writeBatch(db);
    batch.update(doc(db, colName, a.id), { order: b.order });
    batch.update(doc(db, colName, b.id), { order: a.order });
    await batch.commit();
  }

  function newLesson(moduleId: string) {
    setLessonModuleId(moduleId);
    setEditingLesson(null);
    setForm({ ...blankLesson, quiz: [blankQuestion()] });
    setError("");
    setLessonOpen(true);
  }

  function editLesson(l: LessonDoc) {
    setLessonModuleId(l.moduleId);
    setEditingLesson(l);
    setForm({
      title: l.title,
      type: l.type,
      videoUrl: l.videoUrl ?? "",
      content: l.content ?? "",
      durationMinutes: l.durationMinutes ? String(l.durationMinutes) : "",
      resourcesText: (l.resources ?? []).map((r) => `${r.name} | ${r.url}`).join("\n"),
      quiz: l.quiz?.length ? l.quiz.map((q) => ({ ...q, options: [...q.options] })) : [blankQuestion()],
    });
    setError("");
    setLessonOpen(true);
  }

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let quiz: QuizQuestion[] = [];
    if (form.type === "quiz") {
      quiz = form.quiz
        .map((q) => ({ ...q, question: q.question.trim(), options: q.options.map((o) => o.trim()) }))
        .filter((q) => q.question);
      if (quiz.length === 0) return setError("Add at least one question.");
      for (const q of quiz) {
        const filled = q.options.filter(Boolean);
        if (filled.length < 2) return setError(`"${q.question}" needs at least two answers.`);
        if (!q.options[q.correctIndex]) return setError(`Choose which answer is correct for "${q.question}".`);
      }
      // Drop blank options but keep the correct index pointing at the same answer.
      quiz = quiz.map((q) => {
        const correct = q.options[q.correctIndex];
        const options = q.options.filter(Boolean);
        return { question: q.question, options, correctIndex: options.indexOf(correct) };
      });
    }

    const resources: LessonResource[] = form.resourcesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, url] = line.split("|").map((s) => s.trim());
        return { name: name || url, url: url || name };
      });

    setSaving(true);
    try {
      const payload = {
        courseId,
        moduleId: lessonModuleId,
        title: form.title.trim(),
        type: form.type,
        videoUrl: form.type === "video" ? form.videoUrl.trim() || null : null,
        content: form.content || null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        resources,
        quiz: form.type === "quiz" ? quiz : [],
      };
      if (editingLesson) await updateDoc(doc(db, "lessons", editingLesson.id), payload);
      else {
        const inModule = lessons.filter((l) => l.moduleId === lessonModuleId).length;
        await addDoc(collection(db, "lessons"), { ...payload, order: inModule, createdAt: serverTimestamp() });
        await syncCounts(modules.length, lessons.length + 1);
      }
      setLessonOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function removeLesson() {
    if (!deleteLesson) return;
    await deleteDoc(doc(db, "lessons", deleteLesson.id));
    await syncCounts(modules.length, lessons.length - 1);
    setDeleteLesson(null);
  }

  const setQuestion = (i: number, patch: Partial<QuizQuestion>) => setForm({ ...form, quiz: form.quiz.map((q, j) => (j === i ? { ...q, ...patch } : q)) });
  const setOption = (qi: number, oi: number, v: string) => setQuestion(qi, { options: form.quiz[qi].options.map((o, k) => (k === oi ? v : o)) });

  return (
    <AdminPage title="Course content">
      <Link href="/admin/courses" className="inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink">← All courses</Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl leading-tight">{course?.title ?? "Loading…"}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            {modules.length} modules · {lessons.length} lessons
            {course && <Badge tone={course.status === "published" ? "success" : "warning"}>{course.status}</Badge>}
          </p>
        </div>
        <PrimaryButton onClick={() => { setEditingModule(null); setModuleTitle(""); setModuleOpen(true); }}>Add module</PrimaryButton>
      </div>

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : modules.length === 0 ? (
        <div className="border border-dashed border-ink/40 bg-white/60 px-6 py-16 text-center text-ink-soft">
          Start by adding a module, such as &ldquo;Week 1&rdquo;. Lessons live inside modules.
        </div>
      ) : (
        <ol className="space-y-5">
          {modules.map((m, mi) => {
            const inModule = lessons.filter((l) => l.moduleId === m.id);
            return (
              <li key={m.id} className="border border-ink/30 bg-white">
                <div className="flex flex-col gap-3 border-b border-ink/30 bg-paper-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-display text-xl">
                    <span className="mr-3 font-mono text-sm text-gold-ink">{String(mi + 1).padStart(2, "0")}</span>
                    {m.title}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    <RowBtn disabled={mi === 0} onClick={() => swap("modules", m as { id: string; order: number }, modules[mi - 1] as { id: string; order: number })}>Move up</RowBtn>
                    <RowBtn disabled={mi === modules.length - 1} onClick={() => swap("modules", m as { id: string; order: number }, modules[mi + 1] as { id: string; order: number })}>Move down</RowBtn>
                    <RowBtn onClick={() => { setEditingModule(m); setModuleTitle(m.title); setModuleOpen(true); }}>Rename</RowBtn>
                    <RowBtn tone="danger" onClick={() => setDeleteModule(m)}>Delete</RowBtn>
                  </div>
                </div>

                <ul className="divide-y divide-ink/10">
                  {inModule.length === 0 && <li className="px-4 py-4 text-sm text-ink-soft">No lessons in this module yet.</li>}
                  {inModule.map((l, li) => (
                    <li key={l.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex min-w-0 flex-wrap items-center gap-3">
                        <Badge tone={l.type === "quiz" ? "gold" : l.type === "video" ? "info" : "neutral"}>{TYPE_LABEL[l.type]}</Badge>
                        <span className="font-medium">{l.title}</span>
                        {l.durationMinutes ? <span className="text-sm text-ink-soft">{l.durationMinutes} min</span> : null}
                        {l.type === "quiz" && <span className="text-sm text-ink-soft">{l.quiz?.length ?? 0} questions</span>}
                      </p>
                      <div className="flex shrink-0 gap-x-5">
                        <RowBtn disabled={li === 0} onClick={() => swap("lessons", l as { id: string; order: number }, inModule[li - 1] as { id: string; order: number })}>Up</RowBtn>
                        <RowBtn disabled={li === inModule.length - 1} onClick={() => swap("lessons", l as { id: string; order: number }, inModule[li + 1] as { id: string; order: number })}>Down</RowBtn>
                        <RowBtn onClick={() => editLesson(l)}>Edit</RowBtn>
                        <RowBtn tone="danger" onClick={() => setDeleteLesson(l)}>Delete</RowBtn>
                      </div>
                    </li>
                  ))}
                </ul>
                <button onClick={() => newLesson(m.id)} className="w-full border-t border-dashed border-ink/30 px-4 py-3 text-left text-sm font-medium hover:bg-paper">
                  + Add lesson
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <Modal open={moduleOpen} onClose={() => setModuleOpen(false)} title={editingModule ? "Rename module" : "Add module"}>
        <form onSubmit={saveModule}>
          <Field label="Module title"><TextInput required value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} /></Field>
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setModuleOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={lessonOpen} onClose={() => setLessonOpen(false)} title={editingLesson ? "Edit lesson" : "Add lesson"} wide>
        <form onSubmit={saveLesson}>
          <Field label="Title"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}>
                <option value="video">Video</option>
                <option value="text">Reading</option>
                <option value="quiz">Quiz</option>
              </Select>
            </Field>
            <Field label="Length in minutes (optional)"><TextInput type="number" min={0} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} /></Field>
          </div>

          {form.type === "video" && (
            <Field label="Video link (YouTube, Vimeo or a direct .mp4)"><TextInput type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></Field>
          )}

          <Field label={form.type === "quiz" ? "Introduction (optional)" : "Notes for students"}>
            <TextArea className="min-h-28" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Field>

          {form.type === "quiz" && (
            <div className="mb-5 space-y-4">
              <p className="text-[0.82rem] font-medium">Questions</p>
              {form.quiz.map((q, qi) => (
                <fieldset key={qi} className="border border-ink/30 bg-white p-4">
                  <legend className="px-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">Question {qi + 1}</legend>
                  <TextInput value={q.question} onChange={(e) => setQuestion(qi, { question: e.target.value })} placeholder="Type the question" />
                  <div className="mt-3 space-y-2">
                    {q.options.map((o, oi) => (
                      <label key={oi} className="flex items-center gap-3">
                        <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => setQuestion(qi, { correctIndex: oi })} aria-label={`Answer ${oi + 1} is correct`} />
                        <TextInput value={o} onChange={(e) => setOption(qi, oi, e.target.value)} placeholder={`Answer ${oi + 1}`} />
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-ink-soft">Tick the circle next to the correct answer. Leave unused answers empty.</p>
                  {form.quiz.length > 1 && (
                    <div className="mt-2"><RowBtn tone="danger" onClick={() => setForm({ ...form, quiz: form.quiz.filter((_, j) => j !== qi) })}>Remove question</RowBtn></div>
                  )}
                </fieldset>
              ))}
              <GhostButton type="button" onClick={() => setForm({ ...form, quiz: [...form.quiz, blankQuestion()] })}>Add question</GhostButton>
            </div>
          )}

          <Field label="Downloads (one per line, as: Name | link)">
            <TextArea value={form.resourcesText} onChange={(e) => setForm({ ...form, resourcesText: e.target.value })} placeholder={"Workbook PDF | https://...\nSlides | https://..."} />
          </Field>

          {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setLessonOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save lesson"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteModule} title="Delete module" message={`Delete "${deleteModule?.title}" and all of its lessons?`} onCancel={() => setDeleteModule(null)} onConfirm={removeModule} />
      <ConfirmDialog open={!!deleteLesson} title="Delete lesson" message={`Delete "${deleteLesson?.title}"?`} onCancel={() => setDeleteLesson(null)} onConfirm={removeLesson} />
    </AdminPage>
  );
}
