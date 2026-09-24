import { useId, useState } from 'react'
import styles from './PropertyHint.module.scss'

export function PropertyHint({ label, reason }) {
  const id = useId()
  const [dismissed, setDismissed] = useState(false)
  if (!reason) return null
  return <span className={styles.hint} data-dismissed={dismissed}>
    <button type="button" className={styles.indicator} aria-label={`${label}: no visual effect`} aria-describedby={id} onFocus={() => setDismissed(false)} onMouseEnter={() => setDismissed(false)} onKeyDown={event => { if (event.key === 'Escape') { setDismissed(true); event.stopPropagation() } }}>◇</button>
    <span role="tooltip" id={id} className={styles.tooltip}>No visual effect with the current animation settings. {reason}</span>
  </span>
}
export function PropertyLabel({ label, htmlFor, reason, hintLabel = label }) {
  return <div className={styles.label}><label htmlFor={htmlFor}>{label}</label><PropertyHint label={hintLabel} reason={reason} /></div>
}
export function PropertyLegend({ visible }) {
  return visible ? <p className={styles.legend}><span aria-hidden="true">◇</span> Property has no visual effect with the current animation settings.</p> : null
}
