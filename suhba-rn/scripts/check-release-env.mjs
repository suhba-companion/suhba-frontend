/**
 * Everything the release build needs from the environment. Short, because the map moved
 * to MapKit and the geocoder to the platform's own: neither takes a key any more.
 *
 * Run it before any release build: `npm run check:release`.
 */
import { readFileSync, existsSync } from 'node:fs'

const ENV_FILE = '.env'

const REQUIRED = [
  {
    key: 'EXPO_PUBLIC_API_BASE_URL',
    why: 'Otherwise the build talks to http://localhost:8080 and every screen is empty.',
  },
]

function readEnv() {
  if (!existsSync(ENV_FILE)) return {}
  return Object.fromEntries(
    readFileSync(ENV_FILE, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'))
      .map((line) => {
        const at = line.indexOf('=')
        return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
      }),
  )
}

const env = { ...readEnv(), ...process.env }
const missing = REQUIRED.filter(({ key }) => (env[key] ?? '') === '')

if (missing.length > 0) {
  console.error('\n✗ Not ready for a release build. Set these in .env:\n')
  for (const { key, why } of missing) console.error(`  ${key}\n    ${why}\n`)
  console.error('See .env.example.\n')
  process.exit(1)
}

// Require https explicitly rather than rejecting http: a scheme-less value and an
// upper-case HTTP:// both slip past a `startsWith('http://')` check and are then blocked
// by App Transport Security on device, which is what this guard is here to catch.
if (!/^https:\/\//i.test(env.EXPO_PUBLIC_API_BASE_URL)) {
  console.error(`\n✗ EXPO_PUBLIC_API_BASE_URL must start with https://`)
  console.error(`  Got: ${env.EXPO_PUBLIC_API_BASE_URL}`)
  console.error('  Anything else is blocked by App Transport Security on device.\n')
  process.exit(1)
}

console.log('✓ Release env looks shippable.')
