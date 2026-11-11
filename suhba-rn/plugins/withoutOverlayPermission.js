const { withAndroidManifest } = require('expo/config-plugins')

const OVERLAY = 'android.permission.SYSTEM_ALERT_WINDOW'

/**
 * Suhba never draws over other apps. The permission lands in the generated *main*
 * manifest anyway, so it would ship in the release APK, where Google Play treats
 * "display over other apps" as a sensitive permission that needs justifying.
 *
 * Only `main` is touched. Expo's own `app/src/debug/AndroidManifest.xml` declares the
 * same permission, and the debug source set outranks main in the merge, so the dev
 * client's overlay keeps working while release builds come out without it.
 */
module.exports = function withoutOverlayPermission(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest
    const permissions = manifest['uses-permission']
    if (!Array.isArray(permissions)) return cfg
    manifest['uses-permission'] = permissions.filter(
      (p) => p.$?.['android:name'] !== OVERLAY,
    )
    return cfg
  })
}
