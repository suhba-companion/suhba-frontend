import { toSafeHttpUrl } from './url'

describe('toSafeHttpUrl', () => {
  it('keeps an https url as is', () => {
    expect(toSafeHttpUrl('https://example.com/anmeldung')).toBe('https://example.com/anmeldung')
  })

  it('keeps an http url as is', () => {
    expect(toSafeHttpUrl('http://example.com/')).toBe('http://example.com/')
  })

  it('adds https:// when the scheme is missing', () => {
    expect(toSafeHttpUrl('example.com/anmeldung')).toBe('https://example.com/anmeldung')
  })

  it('trims surrounding whitespace', () => {
    expect(toSafeHttpUrl('  https://example.com/  ')).toBe('https://example.com/')
  })

  it('rejects a javascript: url', () => {
    expect(toSafeHttpUrl('javascript:alert(1)')).toBeUndefined()
  })

  it('rejects a data: url', () => {
    expect(toSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined()
  })

  it('returns undefined for empty or missing input', () => {
    expect(toSafeHttpUrl('   ')).toBeUndefined()
    expect(toSafeHttpUrl(undefined)).toBeUndefined()
  })
})
