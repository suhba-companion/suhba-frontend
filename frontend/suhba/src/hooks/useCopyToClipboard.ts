import { useCallback, useEffect, useRef, useState } from 'react'

// Long enough to read the confirmation, short enough that the button is back to
// its normal state before anyone reaches for it again.
const CONFIRM_MS = 2000

export interface CopyState {
  copied: boolean
  copy: (text: string) => Promise<void>
}

export function useCopyToClipboard(): CopyState {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // A modal can close while the confirmation is still counting down, so the
  // pending reset has to be dropped rather than fire on an unmounted component.
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Denied permission or an insecure origin. The link is on screen either
      // way, so the user can still select it by hand.
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), CONFIRM_MS)
  }, [])

  return { copied, copy }
}
