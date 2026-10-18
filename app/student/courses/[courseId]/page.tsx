"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { addDoc, collection, doc, onSnapshot, query as fsQuery, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { Progress, when } from "@/components/student/kit";
import { PrimaryButton, TextArea } from "@/components/admin/ui";
import { useCollection } from "@/lib/useCollection";
import { useDoc } from "@/lib/useDoc";
import { useStudentAuth } from "@/lib/student-auth";
import { db } from "@/lib/firebase";
import type { CourseDoc, EnrollmentDoc, LessonDoc, LessonProgressDoc, ModuleDoc, NoteDoc } from "@/lib/types";

type Tab = "about" | "notes" | "downloads" | "questions" | "quiz";

type Comment = { id: string; userName: string; content: string; createdAt?: { toDate: () => Date } };

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, profile } = useStudentAuth();
  const uid = user?.uid ?? "__none__";

  const { data: course, loading: courseLoading } = useDoc<CourseDoc>("courses", courseId);
  const { data: modulesRaw } = useCollection<ModuleDoc>("modules", [where("courseId", "==", courseId)]);
  const { data: lessonsRaw, loading: lessonsLoading } = useCollection<LessonDoc>("lessons", [where("courseId", "==", courseId)]);
  const { data: progressDocs } = useCollection<LessonProgressDoc>("lesson_progress", [where("userId", "==", uid), where("courseId", "==", courseId)]);
  const { data: enrollments, loading: enrollLoading } = useCollection<EnrollmentDoc>("enrollments", [where("userId", "==", uid), where("courseId", "==", courseId)]);

  const modules = useMemo(() => [...modulesRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [modulesRaw]);
  // Flat list in the order a student walks through it: module order, then lesson order.
  const lessons = useMemo(() => {
    const rank = new Map(modules.map((m, i) => [m.id, i]));
    return [...lessonsRaw].sort((a, b) => (rank.get(a.moduleId) ?? 999) - (rank.get(b.moduleId) ?? 999) || (a.order ?? 0) - (b.order ?? 0));
  }, [lessonsRaw, modules]);
  const enrollment = enrollments[0];

  const done = useMemo(() => {
    const ids = new Set(lessons.map((l) => l.id));
    return new Set(progressDocs.filter((p) => p.completed && ids.has(p.lessonId)).map((p) => p.lessonId));
  }, [progressDocs, lessons]);

  const [picked, setPicked] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("about");
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // No effect needed: until the student picks a lesson, show the first unfinished one.
  const activeId = picked ?? (lessons.find((l) => !done.has(l.id)) ?? lessons[0])?.id ?? null;
  const idx = lessons.findIndex((l) => l.id === activeId);
  const lesson = idx >= 0 ? lessons[idx] : null;
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
  const pct = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;

  function open(id: string) {
    setPicked(id);
    setTab("about");
    setListOpen(false);
  }

  async function complete(advance: boolean) {
    if (!lesson || uid === "__none__") return;
    setBusy(true);
    try {
      await setDoc(doc(db, "lesson_progress", `${uid}_${lesson.id}`), {
        userId: uid,
        courseId,
        lessonId: lesson.id,
        moduleId: lesson.moduleId,
        completed: true,
        completedAt: serverTimestamp(),
      });
      const after = new Set(done).add(lesson.id);
      const p = lessons.length ? Math.round((after.size / lessons.length) * 100) : 0;
      if (enrollment) await updateDoc(doc(db, "enrollments", enrollment.id), { progress: p, status: p >= 100 ? "completed" : "active" });
      if (p >= 100 && user) {
        // The endpoint is idempotent, so a second call is harmless.
        user
          .getIdToken()
          .then((t) => fetch("/api/certificates/generate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify({ courseId }) }))
          .catch(() => null);
      }
      if (advance && next) open(next.id);
    } finally {
      setBusy(false);
    }
  }

  if (courseLoading || lessonsLoading || enrollLoading) return <p className="p-8 text-ink-soft">Loading…</p>;

  if (!course || !enrollment) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-ink-soft">{!course ? "This course could not be found." : "You are not enrolled in this course."}</p>
        <Link href="/student/courses" className="mt-4 inline-block underline underline-offset-4">Back to my courses</Link>
      </div>
    );
  }

  const tabs: Tab[] = lesson?.type === "quiz" ? ["quiz", "about", "notes", "downloads", "questions"] : ["about", "notes", "downloads", "questions"];
  const activeTab = tabs.includes(tab) ? tab : tabs[0];
  const isDone = lesson ? done.has(lesson.id) : false;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-ink/30 bg-paper px-4 py-3 sm:px-8">
        <Link href="/student/courses" className="shrink-0 text-sm underline underline-offset-4">← My courses</Link>
        <p className="min-w-0 flex-1 truncate font-display text-lg">{course.title}</p>
        <button onClick={() => setListOpen(true)} className="shrink-0 border border-ink/40 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] lg:hidden">Lessons</button>
      </header>

      <div className="lg:grid lg:grid-cols-[1fr_20rem]">
        <main className="min-w-0 p-4 sm:p-8">
          {!lesson ? (
            <p className="py-16 text-center text-ink-soft">No lessons have been added yet.</p>
          ) : (
            <>
              {lesson.type === "video" && lesson.videoUrl && <Video url={lesson.videoUrl} />}
              <p className="label mt-6">Lesson {idx + 1} of {lessons.length}</p>
              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="font-display text-3xl leading-tight">{lesson.title}</h1>
                <button
                  onClick={() => complete(false)}
                  disabled={busy || isDone}
                  className={`shrink-0 border px-4 py-2.5 text-sm font-medium ${isDone ? "border-leaf bg-sage text-ink" : "border-ink bg-ink text-paper hover:bg-ink-2"} disabled:opacity-70`}
                >
                  {isDone ? "Done ✓" : "Mark as done"}
                </button>
              </div>

              <div role="tablist" className="mt-6 flex gap-5 overflow-x-auto border-b border-ink/30">
                {tabs.map((t) => (
                  <button key={t} role="tab" aria-selected={activeTab === t} onClick={() => setTab(t)} className={`shrink-0 border-b-2 pb-2 text-sm capitalize ${activeTab === t ? "border-gold font-medium" : "border-transparent text-ink-soft hover:text-ink"}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="py-6">
                {activeTab === "about" && (
                  <div className="max-w-2xl space-y-4">
                    {lesson.content ? <p className="whitespace-pre-wrap leading-relaxed">{lesson.content}</p> : <p className="text-ink-soft">No written notes for this lesson.</p>}
                    {lesson.durationMinutes ? <p className="text-sm text-ink-soft">About {lesson.durationMinutes} minutes.</p> : null}
                  </div>
                )}
                {activeTab === "notes" && <NotesPane key={lesson.id} uid={uid} courseId={courseId} lesson={lesson} />}
                {activeTab === "downloads" && <Downloads lesson={lesson} />}
                {activeTab === "questions" && <Questions key={lesson.id} uid={uid} name={profile?.name ?? user?.email ?? "Student"} courseId={courseId} lesson={lesson} />}
                {activeTab === "quiz" && <Quiz key={lesson.id} lesson={lesson} />}
              </div>

              <nav className="flex items-center justify-between border-t border-ink/30 pt-5" aria-label="Lesson navigation">
                <button onClick={() => prev && open(prev.id)} disabled={!prev} className="text-sm underline underline-offset-4 disabled:no-underline disabled:opacity-30">← Previous</button>
                {next ? (
                  <PrimaryButton onClick={() => complete(true)} disabled={busy}>Done, next lesson →</PrimaryButton>
                ) : (
                  <PrimaryButton onClick={() => complete(false)} disabled={busy || isDone}>{isDone ? "Course finished" : "Finish the course"}</PrimaryButton>
                )}
              </nav>
            </>
          )}
        </main>

        <aside className={`${listOpen ? "fixed inset-0 z-40 block bg-ink/50 lg:static lg:bg-transparent" : "hidden lg:block"}`} onClick={() => setListOpen(false)}>
          <div className="ml-auto h-full w-80 max-w-[88vw] overflow-y-auto border-l border-ink/30 bg-white lg:sticky lg:top-[3.4rem] lg:h-[calc(100vh-3.4rem)] lg:w-auto lg:max-w-none" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-ink/30 p-5">
              <p className="label">Your progress</p>
              <Progress value={pct} className="mt-3" />
              <p className="mt-2 text-sm text-ink-soft">{done.size} of {lessons.length} lessons · {pct}%</p>
            </div>
            {modules.map((m, mi) => (
              <div key={m.id} className="border-b border-ink/10">
                <p className="bg-paper-2 px-5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">{String(mi + 1).padStart(2, "0")} · {m.title}</p>
                <ul>
                  {lessons.filter((l) => l.moduleId === m.id).map((l) => (
                    <li key={l.id}>
                      <button onClick={() => open(l.id)} className={`flex w-full items-start gap-3 px-5 py-3 text-left text-sm ${l.id === activeId ? "bg-sage-soft font-medium" : "hover:bg-paper"}`}>
                        <span aria-hidden className={`mt-1 h-3 w-3 shrink-0 border ${done.has(l.id) ? "border-leaf bg-leaf" : "border-ink/50"}`} />
                        <span>{l.title}<span className="sr-only">{done.has(l.id) ? " (done)" : ""}</span></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function Video({ url }: { url: string }) {
  const yt = youtubeId(url);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube.com/embed/${yt}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : null;
  return (
    <div className="border border-ink bg-ink shadow-[6px_6px_0_0_var(--gold)]">
      {src ? <iframe src={src} className="aspect-video w-full" allowFullScreen title="Lesson video" /> : <video src={url} controls className="aspect-video w-full bg-black" />}
    </div>
  );
}

function NotesPane({ uid, courseId, lesson }: { uid: string; courseId: string; lesson: LessonDoc }) {
  const noteId = `${uid}_${lesson.id}`;
  const { data: note, loading } = useDoc<NoteDoc>("notes", uid !== "__none__" ? noteId : undefined);
  if (loading) return <p className="text-ink-soft">Loading…</p>;
  return <NoteEditor noteId={noteId} uid={uid} courseId={courseId} lesson={lesson} initial={note?.content ?? ""} />;
}

function NoteEditor({ noteId, uid, courseId, lesson, initial }: { noteId: string; uid: string; courseId: string; lesson: LessonDoc; initial: string }) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (uid === "__none__") return;
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "notes", noteId), { userId: uid, courseId, lessonId: lesson.id, lessonTitle: lesson.title, content: text, updatedAt: serverTimestamp() });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <TextArea className="min-h-44" value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} placeholder="Your own notes for this lesson. Only you can see them." aria-label="Your notes" />
      <div className="flex items-center gap-4">
        <PrimaryButton onClick={save} disabled={saving}>{saving ? "Saving…" : "Save note"}</PrimaryButton>
        {saved && <span className="text-sm text-leaf">Saved.</span>}
      </div>
    </div>
  );
}

function Downloads({ lesson }: { lesson: LessonDoc }) {
  const items = lesson.resources ?? [];
  if (items.length === 0) return <p className="text-ink-soft">Nothing to download for this lesson.</p>;
  return (
    <ul className="max-w-xl divide-y divide-ink/15 border-y border-ink/30">
      {items.map((r, i) => (
        <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 py-3 hover:underline">{r.name}<span aria-hidden>↗</span></a></li>
      ))}
    </ul>
  );
}

function Questions({ uid, name, courseId, lesson }: { uid: string; name: string; courseId: string; lesson: LessonDoc }) {
  const [rows, setRows] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    // Sorted in the browser so no composite Firestore index is needed.
    const q = fsQuery(collection(db, "lesson_comments"), where("lessonId", "==", lesson.id));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment);
      list.sort((a, b) => (a.createdAt?.toDate().getTime() ?? 0) - (b.createdAt?.toDate().getTime() ?? 0));
      setRows(list);
      setLoading(false);
    });
  }, [lesson.id]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || uid === "__none__") return;
    setPosting(true);
    try {
      await addDoc(collection(db, "lesson_comments"), { courseId, lessonId: lesson.id, userId: uid, userName: name, content: text.trim(), createdAt: serverTimestamp() });
      setText("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <form onSubmit={post}>
        <TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question or share a thought about this lesson" aria-label="Your question" />
        <PrimaryButton type="submit" disabled={posting || !text.trim()}>{posting ? "Posting…" : "Post"}</PrimaryButton>
      </form>
      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-ink-soft">No questions yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="border-l-4 border-gold bg-white px-4 py-3">
              <p className="text-sm font-medium">{c.userName} <span className="font-normal text-ink-soft">· {when(c.createdAt)}</span></p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Quiz({ lesson }: { lesson: LessonDoc }) {
  const qs = lesson.quiz ?? [];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  if (qs.length === 0) return <p className="text-ink-soft">No questions have been added to this quiz yet.</p>;
  const score = qs.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);

  return (
    <div className="max-w-2xl space-y-5">
      {qs.map((q, qi) => (
        <fieldset key={qi} className="border border-ink/30 bg-white p-4">
          <legend className="px-1 font-medium">{qi + 1}. {q.question}</legend>
          <div className="mt-2 space-y-2">
            {q.options.map((o, oi) => {
              const right = submitted && oi === q.correctIndex;
              const wrong = submitted && answers[qi] === oi && oi !== q.correctIndex;
              return (
                <label key={oi} className={`flex items-center gap-3 border px-3 py-2.5 text-sm ${right ? "border-leaf bg-sage" : wrong ? "border-rose-300 bg-rose-50" : "border-ink/20"}`}>
                  <input type="radio" name={`q${qi}`} disabled={submitted} checked={answers[qi] === oi} onChange={() => setAnswers({ ...answers, [qi]: oi })} />
                  {o}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      {submitted ? (
        <div className="flex items-center gap-4">
          <p className="font-display text-xl">You got {score} of {qs.length}.</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-sm underline underline-offset-4">Try again</button>
        </div>
      ) : (
        <PrimaryButton onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < qs.length}>Check my answers</PrimaryButton>
      )}
    </div>
  );
}
