import { useEffect, useId, useRef, useState } from 'react'
import { motions } from '../../data/motions'
import { presetCategories, searchPresets } from '../../utils/searchPresets'
import styles from './PresetSelector.module.scss'
const quickFilters = [['all','All'],['entrances','Entrances'],['exits','Exits'],['emphasis','Emphasis'],['text','Text']]
const typeNames = {generic:'Any element',svg:'SVG drawing',bars:'Bars',segmented:'Segmented text',gradient:'Gradient',sequence:'Sequence'}
export default function PresetSelector({ value, modified, onChange, onSearchFocus }) {
  const [filters, setFilters] = useState({query:'', quick:'all', category:'all', type:'all', sort:'catalog'})
  const [expanded, setExpanded] = useState(false)
  const [limit, setLimit] = useState(8)
  const input = useRef(null)
  const id = useId()
  const matches = searchPresets(filters)
  const change = (key, val) => { setFilters(previous => ({...previous, [key]:val})); setLimit(8) }
  const clear = () => { setFilters({query:'',quick:'all',category:'all',type:'all',sort:'catalog'}); setLimit(8) }
  const activeCount = Number(filters.category !== 'all') + Number(filters.type !== 'all')
  useEffect(() => {
    const shortcut = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (document.querySelector('[data-builder-view]')?.hidden) return
        event.preventDefault(); onSearchFocus?.(); requestAnimationFrame(() => { input.current?.focus(); input.current?.select() })
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [onSearchFocus])
  return <section className={styles.searchSection} aria-label="Find an animation">
    <label className={styles.searchLabel} htmlFor={`${id}-search`}>Search animations</label>
    <div className={styles.searchBox}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></svg>
      <input id={`${id}-search`} ref={input} className={styles.searchInput} type="search" placeholder="Search animations by name or effect…" value={filters.query} aria-controls={`${id}-results`} aria-describedby={`${id}-hint`} aria-keyshortcuts="Meta+K Control+K" onChange={event => change('query',event.target.value)} />
      <button type="button" className={styles.shortcut} title="Focus search (⌘K / Ctrl+K)" aria-label="Focus animation search" onClick={() => input.current?.focus()}>⌘ K</button>
    </div>
    <p id={`${id}-hint`} className={styles.hint}>Type to see matching animations. Select a result to preview it.</p>
    <p className={styles.filterTitle}>Quick filters</p>
    <div className={styles.quickRow}>
      <div className={styles.chips} role="group" aria-label="Quick filters">{quickFilters.map(([key,label]) => <button type="button" key={key} className={styles.chip} aria-pressed={filters.quick === key} onClick={() => { setFilters(previous => ({...previous, quick:key, category:'all'})); setLimit(8) }}>{label}</button>)}</div>
      <button type="button" className={styles.more} aria-expanded={expanded} aria-controls={`${id}-filters`} onClick={() => setExpanded(previous => !previous)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></svg>More filters{activeCount ? ` (${activeCount})` : ''}</button>
    </div>
    <div className={styles.families} role="group" aria-label="Preset families">{presetCategories.map(family => <button type="button" className={styles.chip} key={family} aria-pressed={filters.category === family} onClick={() => { setFilters(previous => ({...previous,quick:'all',category:previous.category === family ? 'all' : family})); setLimit(8) }}>{family}</button>)}</div>
    <div id={`${id}-filters`} className={styles.advanced} hidden={!expanded}>
      <label className={styles.field}>Element type<select className={styles.input} value={filters.type} onChange={event => change('type',event.target.value)}><option value="all">All types</option>{Object.entries(typeNames).filter(([key])=>key!=='generic').map(([key,label])=><option key={key} value={key}>{label}</option>)}<option value="text">Text / image / background</option></select></label>
      <label className={styles.field}>Sort by<select className={styles.input} value={filters.sort} onChange={event => change('sort',event.target.value)}><option value="catalog">Catalog order</option><option value="name">Name A–Z</option><option value="duration">Shortest duration</option></select></label>
      <label className={styles.field}>Preset family<select className={styles.input} value={filters.category} onChange={event => change('category',event.target.value)}><option value="all">All families</option>{presetCategories.map(category=><option key={category}>{category}</option>)}</select></label>
      <p className={styles.hint}>Element filters include whole-element animations compatible with that type.</p>
    </div>
    <div className={styles.resultsHeader}><p role="status" aria-live="polite">{matches.length} {matches.length === 1 ? 'animation found' : 'animations found'}</p><button type="button" className={styles.clear} onClick={clear}>Clear filters</button></div>
    <div className={styles.current}><span>Selected: <strong>{value || 'Custom animation'}{modified ? ' — modified' : ''}</strong></span><button type="button" className={styles.custom} onClick={() => onChange('')}>Custom animation</button></div>
    <ul id={`${id}-results`} className={styles.results} aria-label="Matching animations">
      {matches.slice(0,limit).map(([name,preset]) => <li key={name}><button type="button" className={styles.result} aria-pressed={value === name} onClick={() => onChange(name)}><span className={styles.resultName}>{name}{value === name && <span aria-hidden="true"> ✓</span>}</span><span className={styles.resultMeta}>{preset.category || 'Basic entrances'} · {typeNames[motions[preset.motion]?.elementType || 'generic']}</span></button></li>)}
    </ul>
    {!matches.length && <p className={styles.empty}>No animations match “{filters.query || 'these filters'}”. Try another term or clear the filters.</p>}
    {matches.length > limit && <button type="button" className={styles.moreResults} onClick={() => setLimit(previous => previous + 8)}>Show more ({matches.length - limit} remaining)</button>}
  </section>
}
