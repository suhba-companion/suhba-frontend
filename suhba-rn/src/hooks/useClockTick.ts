import { useState, useEffect } from 'react'

export function useClockTick(): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>
    const bump = (): void => setTick((t) => t + 1)

    const now = new Date()
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const timeoutId = setTimeout(() => {
      bump()
      intervalId = setInterval(bump, 60_000)
    }, msToNextMinute)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return tick
}
