"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { where } from "firebase/firestore";
import { useCollection } from "@/lib/useCollection";
import { inputClass } from "@/components/forms";
import type { CourseDoc, CategoryDoc } from "@/lib/types";

const tints = ["bg-mist", "bg-sage", "bg-gold-soft"];

export default function CoursesCatalogPage() {
  const { data: coursesRaw, loading } = useCollection<CourseDoc>("courses", [where("status", "==", "published")]);
  const { data: categories } = useCollection<CategoryDoc>("categories");

  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");

  const courses = useMemo(
    () =>
      coursesRaw
        .filter((c) => (categoryId === "all" ? true : c.categoryId === categoryId))
        .filter((c) => c.title.toLowerCase().includes(search.toLowerCase())),
    [coursesRaw, categoryId, search]
  );

  const chip = (active: boolean) =>
    `border px-4 py-2 text-sm transition ${active ? "border-ink bg-ink text-paper" : "border-ink/30 hover:border-ink"}`;

  return (
    <>
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <p className="label">Courses</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
            Learn <span className="mark">at your own pace.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Video lessons, notes and live classes, all inside your own student dashboard.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategoryId("all")} className={chip(categoryId === "all")}>
                All
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCategoryId(c.id)} className={chip(categoryId === c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses"
              aria-label="Search courses"
              className={`${inputClass} sm:max-w-64`}
            />
          </div>

          {loading ? (
            <p className="py-16 text-ink-soft">Loading…</p>
          ) : courses.length === 0 ? (
            <div className="border border-dashed border-ink/40 px-6 py-20 text-center">
              <p className="font-display text-2xl">No courses here yet.</p>
              <p className="mt-2 text-ink-soft">New courses are on the way. Join Sacred Mornings to hear first.</p>
            </div>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.slug}`} className="group flex h-full flex-col border border-ink bg-white transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]">
                    <div className={`relative flex aspect-[16/10] items-end overflow-hidden border-b border-ink ${tints[i % tints.length]}`}>
                      {c.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="arch ml-6 block h-[70%] w-24 border border-b-0 border-ink bg-paper" aria-hidden />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      {c.categoryName && <span className="label">{c.categoryName}</span>}
                      <h2 className="mt-2 font-display text-2xl leading-snug">{c.title}</h2>
                      {c.description && <p className="mt-2 line-clamp-2 text-[0.95rem] text-ink-soft">{c.description}</p>}
                      <div className="mt-auto flex items-baseline gap-3 pt-6">
                        <span className="font-display text-2xl">₹{c.price?.toLocaleString("en-IN")}</span>
                        {c.compareAtPrice && c.compareAtPrice > c.price && (
                          <span className="text-sm text-ink-soft line-through">₹{c.compareAtPrice.toLocaleString("en-IN")}</span>
                        )}
                        <span className="ml-auto text-sm font-medium underline decoration-gold decoration-2 underline-offset-4 group-hover:text-ink-2">View →</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
