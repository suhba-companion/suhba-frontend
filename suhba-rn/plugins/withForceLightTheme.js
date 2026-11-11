const { withAndroidStyles } = require('expo/config-plugins')

const THEME = 'AppTheme'
const ITEM = 'android:forceDarkAllowed'

/**
 * Spec §6: the app has no dark mode, so light has to be pinned rather than half-ported.
 *
 * `userInterfaceStyle: "light"` in app.json makes `expo-system-ui` force the colour
 * scheme at runtime, which is what RN's `useColorScheme()` reads. It does not stop
 * Android's own "force dark", which repaints views at the framework level on Android 10+
 * and on OEM skins that apply it — that needs `android:forceDarkAllowed` on the theme,
 * and `AppTheme` inherits from `Theme.AppCompat.DayNight.NoActionBar`.
 *
 * This lives in a plugin rather than in `android/` because that directory is generated
 * and `expo prebuild --clean` throws any hand edit away.
 *
 * The item is added to the existing `AppTheme` group. The `AndroidConfig.Styles`
 * helpers match on name *and* parent, and appending a second `<style name="AppTheme">`
 * would silently drop every item the first one carries — the last definition wins.
 */
module.exports = function withForceLightTheme(config) {
  return withAndroidStyles(config, (cfg) => {
    const styles = cfg.modResults.resources?.style
    if (!Array.isArray(styles)) return cfg

    const theme = styles.find((s) => s.$?.name === THEME)
    if (theme === undefined) {
      throw new Error(`withForceLightTheme: no <style name="${THEME}"> to add ${ITEM} to.`)
    }

    theme.item = theme.item ?? []
    const existing = theme.item.find((i) => i.$?.name === ITEM)
    if (existing !== undefined) existing._ = 'false'
    else theme.item.push({ $: { name: ITEM }, _: 'false' })

    return cfg
  })
}
