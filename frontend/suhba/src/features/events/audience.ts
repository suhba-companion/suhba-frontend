import type { EventAudience } from '../../types'

// Order matters: this is the order the filter pills are rendered in.
export const AUDIENCE_OPTIONS: readonly EventAudience[] = ['Nur Schwestern', 'Nur Brüder']

export const AUDIENCE_LABEL_KEYS: Record<EventAudience, string> = {
  'Nur Schwestern': 'events.sistersOnly',
  'Nur Brüder':     'events.brothersOnly',
}
