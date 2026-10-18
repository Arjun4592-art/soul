'use client'

import { useVoices } from '@/components/Voices'

export default function VoicesWall() {
  const { voices, loading } = useVoices()
  if (loading) return <p className='py-16 text-ink-soft'>Loading…</p>

  return (
    <ul className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {voices.map((v, i) => (
        <li
          key={v.id}
          className={`flex flex-col justify-between border border-ink p-7 ${i % 4 === 0 ? 'bg-gold-soft' : i % 4 === 2 ? 'bg-sage' : 'bg-white'}`}
        >
          <p className='font-display text-lg leading-snug sm:text-xl'>
            <span className='text-gold-ink' aria-hidden>
              “
            </span>
            {v.quote}
          </p>
          <p className='mt-6 label'>
            {v.name}
            {v.role ? ` · ${v.role}` : ''}
          </p>
        </li>
      ))}
    </ul>
  )
}
