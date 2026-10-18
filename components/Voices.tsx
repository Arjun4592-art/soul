'use client'

import { useCollection } from '@/lib/useCollection'
import { FALLBACK_VOICES } from '@/lib/content'
import type { TestimonialDoc } from '@/lib/types'

type Voice = { id: string; name: string; role?: string; quote: string }

/** Drop quote marks that wrap the whole text and curl any inside, so the card's own opening mark is the only one. */
function tidy(q: string) {
  let t = q.trim()
  // Only strip marks that wrap the whole text; a quote that opens a phrase mid-sentence stays.
  if (/^["“][\s\S]*["”]$/.test(t) && (t.match(/["“”]/g) ?? []).length === 2)
    t = t.slice(1, -1).trim()
  t = t.replace(/(^|[\s(])"/g, '$1\u201C').replace(/"/g, '\u201D')
  return t
}

/** Testimonials from Admin → Testimonials; falls back to the saved set until some exist. */
export function useVoices(): { voices: Voice[]; loading: boolean } {
  const { data, loading } = useCollection<TestimonialDoc>('testimonials')
  if (loading) return { voices: [], loading: true }
  const list: Voice[] =
    data.length === 0
      ? FALLBACK_VOICES
      : [...data].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  return {
    voices: list.map((v) => ({ ...v, quote: tidy(v.quote) })),
    loading: false,
  }
}
