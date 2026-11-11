import {
  BookOpenIcon, HandHeartIcon, HandsPrayingIcon, MicrophoneIcon, PencilRulerIcon,
  PersonIcon, QuestionIcon, SoccerBallIcon, UserPlusIcon, UsersIcon,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import type { EventCategory } from '../../types'

export const CATEGORY_ICONS: Record<EventCategory, Icon> = {
  Gebet: HandsPrayingIcon,
  Vortrag: MicrophoneIcon,
  Kurs: BookOpenIcon,
  Workshop: PencilRulerIcon,
  Community: UsersIcon,
  Jugend: PersonIcon,
  Sport: SoccerBallIcon,
  Spende: HandHeartIcon,
  'Neue Muslime': UserPlusIcon,
  Sonstige: QuestionIcon,
}

/**
 * `EventDetailModal`'s CATEGORY_COLORS, resolved out of Tailwind. These are default
 * palette values, not brand tokens, so they are copied literally.
 */
export const CATEGORY_COLORS: Record<EventCategory, { background: string; color: string }> = {
  Gebet: { background: '#d1fae5', color: '#065f46' },
  Vortrag: { background: '#dbeafe', color: '#1e40af' },
  Kurs: { background: '#f3e8ff', color: '#6b21a8' },
  Workshop: { background: '#e0e7ff', color: '#3730a3' },
  Community: { background: '#ffedd5', color: '#9a3412' },
  Jugend: { background: '#fef9c3', color: '#854d0e' },
  Sport: { background: '#fee2e2', color: '#991b1b' },
  Spende: { background: '#fce7f3', color: '#9d174d' },
  'Neue Muslime': { background: '#ccfbf1', color: '#115e59' },
  Sonstige: { background: '#f3f4f6', color: '#1f2937' },
}

const FALLBACK: EventCategory = 'Sonstige'

/** A category the backend adds later must render, not crash. */
export function categoryIcon(category: EventCategory): Icon {
  return CATEGORY_ICONS[category] ?? CATEGORY_ICONS[FALLBACK]
}

export function categoryColors(category: EventCategory): { background: string; color: string } {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS[FALLBACK]
}
