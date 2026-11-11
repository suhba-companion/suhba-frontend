import { renderHook, act } from '@testing-library/react'
import { useLegalRoute } from './useLegalRoute'

function goTo(pathname: string): void {
  window.history.replaceState(null, '', pathname)
}

describe('useLegalRoute', () => {
  beforeEach(() => {
    goTo('/')
  })

  it('shows no document on the home path', () => {
    const { result } = renderHook(() => useLegalRoute())
    expect(result.current.legalDocument).toBeNull()
  })

  // The App Store rejects a submission whose privacy policy URL does not open the
  // policy, so a cold load of the address has to render it without any interaction.
  it('opens the privacy policy when the page is loaded at /datenschutz', () => {
    goTo('/datenschutz')
    const { result } = renderHook(() => useLegalRoute())
    expect(result.current.legalDocument).toBe('datenschutz')
  })

  it('opens the imprint when the page is loaded at /impressum', () => {
    goTo('/impressum')
    const { result } = renderHook(() => useLegalRoute())
    expect(result.current.legalDocument).toBe('impressum')
  })

  it('ignores a trailing slash and upper case', () => {
    goTo('/Datenschutz/')
    const { result } = renderHook(() => useLegalRoute())
    expect(result.current.legalDocument).toBe('datenschutz')
  })

  it('leaves an unrelated path alone', () => {
    goTo('/spots')
    const { result } = renderHook(() => useLegalRoute())
    expect(result.current.legalDocument).toBeNull()
  })

  it('puts the document in the address bar when it is opened', () => {
    const { result } = renderHook(() => useLegalRoute())
    act(() => result.current.openLegal('datenschutz'))
    expect(window.location.pathname).toBe('/datenschutz')
    expect(result.current.legalDocument).toBe('datenschutz')
  })

  it('returns to the home path when the document is closed', () => {
    goTo('/datenschutz')
    const { result } = renderHook(() => useLegalRoute())
    act(() => result.current.closeLegal())
    expect(window.location.pathname).toBe('/')
    expect(result.current.legalDocument).toBeNull()
  })

  // Closing from a tab must not push a second history entry, or the back button
  // appears to do nothing on the first press.
  it('does not touch history when closing from a path that is not a document', () => {
    goTo('/')
    const { result } = renderHook(() => useLegalRoute())
    const before = window.history.length
    act(() => result.current.closeLegal())
    expect(window.history.length).toBe(before)
    expect(window.location.pathname).toBe('/')
  })

  it('follows the back button out of the document', () => {
    const { result } = renderHook(() => useLegalRoute())
    act(() => result.current.openLegal('impressum'))

    act(() => {
      goTo('/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.legalDocument).toBeNull()
  })

  it('follows the back button into a document', () => {
    const { result } = renderHook(() => useLegalRoute())

    act(() => {
      goTo('/datenschutz')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.legalDocument).toBe('datenschutz')
  })
})
