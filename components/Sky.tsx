/**
 * The sky — Daybreak's signature. Four fixed gradient stages (night →
 * daybreak) stacked behind the app, plus fading stars and a growing horizon
 * glow. Which stage shows is driven entirely by the `--sky-t` CSS custom
 * property on <html> (0 = night, 3 = daybreak), set by the Feed as the
 * reader scrolls: the more good news you read, the closer the sun gets.
 *
 * All crossfades are opacity-only (see globals.css), so scroll never
 * triggers paint — just compositing.
 */
export function Sky() {
  return (
    <div aria-hidden>
      <div className="sky-layer sky-stage-0" />
      <div className="sky-layer sky-stage-1" />
      <div className="sky-layer sky-stage-2" />
      <div className="sky-layer sky-stage-3" />
      <div className="sky-layer sky-stars" />
      <div className="sky-layer sky-glow" />
    </div>
  )
}

/** Number of cards a reader scrolls past to bring the sky to full daybreak */
export const CARDS_TO_DAYBREAK = 8

/** Clamp + write sky progress. `cards` = fractional card index scrolled. */
export function setSkyProgress(cards: number) {
  const t = Math.min(3, Math.max(0, (cards * 3) / CARDS_TO_DAYBREAK))
  document.documentElement.style.setProperty('--sky-t', t.toFixed(3))
}
