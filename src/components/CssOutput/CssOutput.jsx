import { useEffect, useRef, useState } from 'react'
import styles from './CssOutput.module.scss'
import shared from '../../styles/shared.module.scss'
export default function CssOutput({ css, exports: entries, error }) {
  const [status, setStatus] = useState('')
  const timeout = useRef(null)
  useEffect(() => () => clearTimeout(timeout.current), [])
  const copy = async (text, label) => {
    clearTimeout(timeout.current)
    try { await navigator.clipboard.writeText(text); setStatus(`${label} copied!`) }
    catch { setStatus('Could not copy. Select and copy the text below manually.') }
    timeout.current = setTimeout(() => setStatus(''), 3000)
  }
  return <section className={styles.code_card}>
    <header className={styles.code_header}>
      <h2 className={styles.code_title}>AEM Export CSS</h2>
    </header>
    <div className={styles.code_body}>
      {entries.map(entry => <section className={styles.export_section} key={entry.id} aria-label={`${entry.label} classes`}>
        <div className={styles.section_header}>
          <h3>{entry.label} — AEM classes</h3>
          <button type="button" className={shared.button} disabled={!entry.copyClasses} onClick={() => copy(entry.copyClasses, `${entry.label} classes`)}>Copy {entry.label.toLowerCase()} classes</button>
        </div>
        <label className={styles.classLabel}>Classes to apply
          <input className={styles.classInput} readOnly value={entry.classes} placeholder="Custom Animation Class" />
        </label>
        {entry.automatic && <p>Export class: <code>{entry.copyClasses}</code> (automatically assigned).</p>}
        {entry.markup && <details className={styles.markup}>
          <summary>Required HTML structure</summary>
          <p>Keep the motion-part / motion-stroke classes and inline order values. SVG paths require pathLength="100". Use an AEM component that allows this markup.</p>
          <button type="button" className={shared.button} onClick={() => copy(entry.markup, `${entry.label} HTML`)}>Copy HTML</button>
          <pre><code>{entry.markup}</code></pre>
        </details>}
        <p>{entry.scroll ? 'Use these classes on this element with the existing AEM inView behavior.' : 'This element animates on page load.'}</p>
      </section>)}
      <section className={styles.export_section} aria-label="AEM implementation notes">
        <h3>Implementation in AEM</h3>
        <p>For absolute positioning, add <code>motion-container</code> to the shared parent of the animated components. Keep a height or a relative element so the parent retains its size.</p>
        <p>Add the CSS after the base stylesheet. Apply each class to its corresponding AEM component.</p>
        <p>Apply the animation to an inner element if the component already uses transform for layout.</p>
      </section>
      <section className={styles.export_section} aria-label="Generated CSS">
        <div className={styles.section_header}>
          <h3>Generated CSS</h3>
          <button type="button" className={shared.button} disabled={!css} onClick={() => copy(css, 'CSS')}>Copy CSS</button>
        </div>
        {error && <p role="status">{error}</p>}
        <pre><code>{css || '/* Add an animation name to each enabled element. */'}</code></pre>
      </section>
      <p className={styles.copy_status} role="status">{status}</p>
    </div>
  </section>
}
