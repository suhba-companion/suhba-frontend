import { Linking } from 'react-native'

/**
 * `window.open` on the web. `tel:` has no handler on an Android tablet without a dialer,
 * where opening it unchecked throws.
 */
export async function openUrl(url: string): Promise<void> {
  try {
    if (url.startsWith('tel:') && !(await Linking.canOpenURL(url))) return
    await Linking.openURL(url)
  } catch {
    // Nothing on the device can open it. The destination is on screen either way.
  }
}
