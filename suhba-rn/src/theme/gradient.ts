/**
 * CSS measures a gradient angle clockwise from "to top" and extends the gradient line
 * until its perpendiculars touch the view's corners, so `linear-gradient(140deg, …)` is
 * not simply "top-left to bottom-right" — the start and end depend on the measured size.
 * The returned points fall outside 0…1 on purpose; that is what the browser does.
 */
export function cssGradientPoints(
  angleDeg: number,
  w: number,
  h: number,
): { start: { x: number; y: number }; end: { x: number; y: number } } {
  if (w <= 0 || h <= 0) return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
  const a = (angleDeg * Math.PI) / 180
  const dx = Math.sin(a)
  const dy = -Math.cos(a) // screen coords, y grows downward
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2
  return {
    start: { x: 0.5 - (half * dx) / w, y: 0.5 - (half * dy) / h },
    end: { x: 0.5 + (half * dx) / w, y: 0.5 + (half * dy) / h },
  }
}

export const CSS_GRADIENT_ANGLE = 140
