import { useEffect, useRef } from 'react'
import styles from './ElementsPanel.module.scss'
import shared from '../../styles/shared.module.scss'
const icons = { text:'T', image:'▧', background:'▣', svg:'◇', bars:'▤', segmented:'¶', gradient:'▨', sequence:'☷' }
export default function ElementsPanel({ scene, active, setActive, addElement, duplicate, move, removeElement, collapsed, toggle, onSelect, requestConfirmation }) {
  const panel = useRef(null)
  useEffect(() => {
    panel.current?.querySelectorAll('details[data-element]').forEach(menu => { if (menu.dataset.element !== active) menu.open = false })
  }, [active])
  const execute = (event, action) => { event.currentTarget.closest('details').open = false; action() }
  return <section ref={panel} className={styles.panel} data-collapsed={collapsed} aria-label="Elements">
    <div className={styles.heading}><h2>{collapsed ? 'Layers' : 'Elements'}</h2><button type="button" className={shared.iconButton} onClick={toggle} aria-label={collapsed ? 'Expand elements panel' : 'Collapse elements panel'} aria-expanded={!collapsed}>{collapsed ? '›' : '‹'}</button></div>
    <button type="button" className={shared.primary} disabled={scene.length >= 100} onClick={addElement} title="Add element">{collapsed ? '+' : '+ Add element'}</button>
    <ul className={styles.list}>
      {scene.map((element,index) => <li key={element.id} className={styles.row} data-active={active === element.id}>
        <button type="button" className={styles.select} aria-pressed={active === element.id} title={`${element.label} · ${element.appearance.type}`} aria-label={`Select ${element.label}`} onClick={() => { setActive(element.id); onSelect?.() }}><span className={styles.type} aria-hidden="true">{icons[element.appearance.type]}</span>{!collapsed && <span className={styles.label}>{element.label || 'Untitled element'}</span>}</button>
        {!collapsed && <details data-element={element.id} className={styles.context} onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus() } }}>
          <summary aria-label={`Actions for ${element.label}`} onClick={() => setActive(element.id)}>•••</summary>
          <div className={styles.contextActions}>
            <button type="button" disabled={scene.length >= 100} onClick={event => execute(event,duplicate)}>Duplicate</button>
            <button type="button" disabled={index === 0} onClick={event => execute(event,()=>move(-1))}>Move earlier</button>
            <button type="button" disabled={index === scene.length - 1} onClick={event => execute(event,()=>move(1))}>Move later</button>
            <button type="button" className={styles.danger} disabled={scene.length === 1} onClick={event => execute(event,()=> requestConfirmation({ title: `Delete “${element.label}”?`, message: 'This cannot be undone. Other elements will remain in your project.', confirmLabel: 'Delete element', action: removeElement }))}>Delete</button>
          </div>
        </details>}
      </li>)}
    </ul>
    <p className={styles.count}>{scene.length} {collapsed ? '' : scene.length === 1 ? 'element' : 'elements'}</p>
  </section>
}
