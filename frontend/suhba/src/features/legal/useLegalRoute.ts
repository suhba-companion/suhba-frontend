import { useCallback, useEffect, useState } from 'react'
import type { LegalDocument } from './LegalPage'

/**
 * Impressum and Datenschutz are the only two screens that need an address of their own.
 * § 5 ECG expects the Impressum to be reachable directly, and the App Store will not
 * accept a submission without a privacy policy URL — the text inside the app does not
 * count. Everything else in Suhba is a tab, so pulling in a router for these two would
 * cost more than it is worth; `history.pushState` is the whole mechanism.
 *
 * `vercel.json` already rewrites every path to `index.html`, so these URLs resolve on a
 * cold load, not just on an in-app navigation.
 */
const PATHS: Record<LegalDocument, string> = {
  impressum: '/impressum',
  datenschutz: '/datenschutz',
}

const HOME_PATH = '/'

function documentFromPath(pathname: string): LegalDocument | null {
  const normalised = pathname.replace(/\/+$/, '').toLowerCase()
  const found = Object.entries(PATHS).find(([, path]) => path === normalised)
  return found === undefined ? null : (found[0] as LegalDocument)
}

export interface LegalRoute {
  legalDocument: LegalDocument | null
  openLegal: (documentId: LegalDocument) => void
  closeLegal: () => void
}

export function useLegalRoute(): LegalRoute {
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(() =>
    documentFromPath(window.location.pathname),
  )

  // The back button has to leave the document again, so the browser's own history is
  // the source of truth and this listener follows it rather than driving it.
  useEffect(() => {
    const onPopState = (): void => {
      setLegalDocument(documentFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const openLegal = useCallback((documentId: LegalDocument): void => {
    window.history.pushState(null, '', PATHS[documentId])
    setLegalDocument(documentId)
  }, [])

  const closeLegal = useCallback((): void => {
    if (documentFromPath(window.location.pathname) !== null) {
      window.history.pushState(null, '', HOME_PATH)
    }
    setLegalDocument(null)
  }, [])

  return { legalDocument, openLegal, closeLegal }
}
