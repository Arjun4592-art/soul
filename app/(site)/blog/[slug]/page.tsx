"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { where } from "firebase/firestore";
import { useCollection } from "@/lib/useCollection";
import type { PostDoc } from "@/lib/types";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const { data: posts, loading } = useCollection<PostDoc>("posts", [
    where("slug", "==", params.slug),
    where("status", "==", "published"),
  ]);
  const post = posts[0];

  if (loading) return <div className="px-5 py-24 text-center text-ink-soft">Loading…</div>;

  if (!post) {
    return (
      <div className="px-5 py-24 text-center">
        <p className="font-display text-3xl">That post could not be found.</p>
        <Link href="/blog" className="mt-4 inline-block underline decoration-gold decoration-2 underline-offset-4">
          Back to the journal
        </Link>
      </div>
    );
  }

  const date = post.createdAt?.toDate?.().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <Link href="/blog" className="label hover:text-ink">← Journal</Link>
        <p className="label mt-10">
          {post.author ?? "Preeti"}
          {date ? ` · ${date}` : ""}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-5 text-xl leading-relaxed text-ink-soft">{post.excerpt}</p>}

        {post.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverUrl} alt="" className="mt-10 aspect-[16/9] w-full border border-ink object-cover" />
        )}

        <div className="mt-10 whitespace-pre-line text-[1.08rem] leading-[1.8] text-ink/90">
          {post.content || "Content will be added soon."}
        </div>
      </div>
    </article>
  );
}
