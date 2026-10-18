"use client";

import Link from "next/link";
import { where } from "firebase/firestore";
import { useCollection } from "@/lib/useCollection";
import type { PostDoc } from "@/lib/types";

function readTime(content?: string) {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function postDate(p: PostDoc) {
  return p.createdAt?.toDate?.().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) ?? "";
}

export default function Blog() {
  const { data: posts, loading } = useCollection<PostDoc>("posts", [where("status", "==", "published")]);

  return (
    <>
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <p className="label">Journal</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
            Notes on <span className="mark">healing and purpose.</span>
          </h1>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-16">
          {loading ? (
            <p className="text-ink-soft">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="font-display text-2xl">Nothing here yet. The first notes are on the way.</p>
          ) : (
            <ul className="divide-y divide-ink/15 border-y border-ink/15">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link href={`/blog/${p.slug}`} className="group grid gap-5 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="label">
                        {postDate(p)}
                        {postDate(p) ? " · " : ""}
                        {readTime(p.content)}
                      </p>
                      <h2 className="mt-2 font-display text-3xl leading-snug transition group-hover:text-ink-2">{p.title}</h2>
                      {p.excerpt && <p className="mt-2 line-clamp-2 max-w-xl text-ink-soft">{p.excerpt}</p>}
                    </div>
                    {p.coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverUrl} alt="" className="aspect-[4/3] w-full border border-ink object-cover sm:w-44" />
                    )}
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
