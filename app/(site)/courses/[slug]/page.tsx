"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { where } from "firebase/firestore";
import EnrollPanel from "@/components/site/EnrollPanel";
import { useCollection } from "@/lib/useCollection";
import type { CourseDoc, ModuleDoc } from "@/lib/types";

const INCLUDED = [
  "Lifetime access from your student dashboard",
  "Video lessons and downloadable resources",
  "Progress tracking and a certificate",
  "Live classes with Preeti",
];

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const { data: matches, loading } = useCollection<CourseDoc>("courses", [where("slug", "==", params.slug)]);
  const course = matches[0];

  const { data: modulesRaw } = useCollection<ModuleDoc>("modules", course ? [where("courseId", "==", course.id)] : []);
  const modules = useMemo(() => [...modulesRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [modulesRaw]);

  if (loading) return <div className="px-5 py-32 text-center text-ink-soft">Loading…</div>;

  if (!course) {
    return (
      <div className="px-5 py-32 text-center">
        <p className="font-display text-3xl">That course could not be found.</p>
        <Link href="/courses" className="mt-4 inline-block underline decoration-gold decoration-2 underline-offset-4">
          Back to all courses
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <Link href="/courses" className="label hover:text-ink">← All courses</Link>
          {course.categoryName && <p className="label mt-8">{course.categoryName}</p>}
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.08] sm:text-6xl">{course.title}</h1>
          {course.description && <p className="mt-6 max-w-xl text-lg text-ink-soft">{course.description}</p>}
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:gap-16 lg:py-20">
          <div>
            <p className="label">Curriculum</p>
            {modules.length === 0 ? (
              <p className="mt-5 text-ink-soft">The curriculum will be published soon.</p>
            ) : (
              <ol className="mt-5 divide-y divide-ink/15 border-y border-ink/15">
                {modules.map((m, i) => (
                  <li key={m.id} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                    <span className="font-mono text-sm text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-xl">{m.title}</span>
                  </li>
                ))}
              </ol>
            )}

            <p className="label mt-12">What is included</p>
            <ul className="mt-5 space-y-3">
              {INCLUDED.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2.5 h-2 w-2 shrink-0 bg-gold" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <EnrollPanel course={course} />
          </div>
        </div>
      </section>
    </>
  );
}
