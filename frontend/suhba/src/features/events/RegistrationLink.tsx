import { useTranslation } from 'react-i18next'
import { Check, Copy } from '@phosphor-icons/react'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'

interface RegistrationLinkProps {
  url: string
}

/**
 * The link is shown in full rather than behind a "Zur Anmeldung" button: a visible
 * URL says where the tap goes before it is taken, and it can be copied for someone
 * who wants to open it elsewhere or pass it on.
 */
export function RegistrationLink({ url }: RegistrationLinkProps): JSX.Element {
  const { t } = useTranslation()
  const { copied, copy } = useCopyToClipboard()
  const copyLabel = t(copied ? 'events.linkCopied' : 'events.copyLink')

  return (
    <div className="flex items-center gap-2 bg-sage-tint rounded-card p-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline underline-offset-2 break-all min-w-0 flex-1 hover:text-moss active:text-moss transition-colors"
      >
        {url}
      </a>
      <button
        type="button"
        onClick={() => void copy(url)}
        title={copyLabel}
        aria-label={copyLabel}
        className="shrink-0 p-2 rounded-pill text-primary hover:bg-sage-light active:bg-sage-light transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
      >
        {copied
          ? <Check size={16} weight="bold" aria-hidden="true" />
          : <Copy size={16} aria-hidden="true" />}
      </button>
    </div>
  )
}
