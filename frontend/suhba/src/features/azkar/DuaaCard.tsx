import type { Duaa } from '../../types'

interface DuaaCardProps {
  duaa: Duaa
}

export function DuaaCard({ duaa }: DuaaCardProps): JSX.Element {
  return (
    <li className="bg-cream-card border border-divider rounded-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <span className="inline-block bg-sage-tint text-text-dark text-xs font-semibold px-3 py-1 rounded-pill">
          {duaa.title}
        </span>
      </div>

      <p
        className="font-amiri text-[1.65rem] text-text-dark leading-loose text-right m-0 px-4 pb-5"
        dir="rtl"
        lang="ar"
      >
        {duaa.ar}
      </p>

      <div className="border-t border-divider px-4 py-3 space-y-1.5">
        <p className="text-sm italic text-moss m-0" style={{ fontFamily: 'Georgia, serif' }}>
          {duaa.latin}
        </p>
        <p className="text-[13px] text-text-muted m-0 leading-relaxed">{duaa.en}</p>
      </div>
    </li>
  )
}
