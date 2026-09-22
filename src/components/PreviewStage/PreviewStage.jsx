import MotionElement from './MotionElement'
import { useEffect, useRef, useState } from 'react'
import { generateCss } from '../../utils/generateCss'
import styles from './PreviewStage.module.scss'

export default function PreviewStage({ scene, replay, toolbar }) {
  const viewport = useRef(null)
  const sceneRoot = useRef(null)
  const [entered, setEntered] = useState({})
  const scroll = scene.some(element => element.config.trigger === 'scroll')
  useEffect(() => {
    if (!scroll) return
    const observers = scene.filter(element => element.config.trigger === 'scroll').map(element => {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0)) {
          setEntered(previous => ({ ...previous, [element.id]: true }))
          observer.disconnect()
        }
      }, { root: viewport.current, threshold: [0, 0.01] })
      observer.observe(sceneRoot.current)
      return observer
    })
    return () => observers.forEach(observer => observer.disconnect())
  }, [scene, scroll])
  return <section className={styles.card}>
    <div className={styles.header}>
      <h2>Live preview</h2>
      {toolbar}
    </div>
    <p aria-live="polite">{scroll ? (scene.filter(element => element.config.trigger === 'scroll').every(element => entered[element.id]) ? 'Animation triggered. Reset to try again.' : 'Scroll inside this preview to reveal the block ↓') : 'Changes replay immediately.'}</p>
    <div data-animation-preview ref={viewport} className={styles.viewport} tabIndex={scroll ? 0 : undefined} role="region" aria-label="Animation preview">
      <style>{scene.map(element => generateCss({ ...element.config, name: `preview_${element.id}` }, '[data-animation-preview] ', element.appearance)).join('\n')}</style>
      <button type="button" className={styles.reset} onClick={replay} aria-label="Reset live preview" title="Reset live preview">
        <svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 16.667a15 15 0 1 1 3.333 13.333m-3.333 -23.333v10h10"/>
        </svg>
      </button>
      {scroll && <div className={styles.spacer}>Scroll down ↓</div>}
      <div ref={sceneRoot} className={styles.scene}>
        {scene.map(element => <MotionElement key={element.id} element={element} entered={entered[element.id]} />)}
      </div>
      {scroll && <div className={styles.after} />}
    </div>
  </section>
}
