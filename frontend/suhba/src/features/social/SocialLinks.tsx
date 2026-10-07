import { useTranslation } from 'react-i18next'
import { InstagramLogo, TiktokLogo } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

interface SocialAccount {
  id: 'instagram' | 'tiktok'
  href: string
  IconComponent: Icon
}

const ICON_SIZE = 20

const ACCOUNTS: SocialAccount[] = [
  { id: 'instagram', href: 'https://www.instagram.com/suhba.companion/', IconComponent: InstagramLogo },
  { id: 'tiktok', href: 'https://www.tiktok.com/@suhba.companion', IconComponent: TiktokLogo },
]

interface SocialLinksProps {
  variant?: 'light' | 'dark'
}

export function SocialLinks({ variant = 'light' }: SocialLinksProps): JSX.Element {
  const { t } = useTranslation()
  const isDark = variant === 'dark'

  return (
    <ul
      aria-label={t('social.label')}
      className={isDark ? 'flex items-center gap-3' : 'flex items-center justify-center gap-4'}
    >
      {ACCOUNTS.map(({ id, href, IconComponent }) => (
        <li key={id}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(`social.${id}`)}
            className={[
              'flex rounded-md transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
              isDark ? 'text-cream-card/70 hover:text-cream-card' : 'text-text-muted hover:text-text-dark',
            ].join(' ')}
          >
            <IconComponent size={ICON_SIZE} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}
