import { useEffect, useId, useRef, useState } from 'react'
import { propertyRelevance } from '../../utils/propertyRelevance'
import { PropertyLabel, PropertyLegend } from '../PropertyHint/PropertyHint'
import { timing } from '../../utils/timing'
import { compatibility } from '../../utils/specialMarkup'
import { motions } from '../../data/motions'
import Control from '../Controls/Control'
import PresetSelector from '../PresetSelector/PresetSelector'
import { presets } from '../../data/presets'
import styles from './BuilderPanel.module.scss'
import shared from '../../styles/shared.module.scss'

const easings = [...new Set(['ease', 'ease-out', 'ease-in', 'ease-in-out', 'linear', ...Object.values(presets).map(preset => preset.easing)])]
export default function BuilderPanel({ config, preset, selectPreset, update, replay, active, label, appearance, setAppearance, modified, rename }) {
  const [tab, setTab] = useState('animation')
  const id = useId()
  const body = useRef(null)
  useEffect(() => { if (body.current) body.current.scrollTop = 0 }, [tab])
  const tabs = ['content', 'animation', 'timing', 'advanced']
  const keyboard = event => {
    const current = tabs.indexOf(tab)
    const next = event.key === 'ArrowRight' ? (current + 1) % tabs.length : event.key === 'ArrowLeft' ? (current + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1
    if (next < 0) return
    event.preventDefault(); setTab(tabs[next]); document.getElementById(`${id}-tab-${tabs[next]}`).focus()
  }
  const relevance = propertyRelevance(config, appearance)
  const requiredType = motions[config.motion]?.elementType
  const times = timing(config, appearance)
  const definition = motions[config.motion]
  const intensityUseful = definition?.frames.some(frame => ['x','y','rotate','rx','ry','scale','sx','sy','skew','blur'].some(key => frame[key] !== undefined))
  const translationUseful = !definition || definition.frames.some(frame => frame.x || frame.y)
  return <section className={styles.panel} aria-label="Element inspector">
    <header className={styles.heading}><h2>{label || 'Untitled element'}</h2><span>{appearance.type}</span></header>
    <div className={styles.tabs} role="tablist" aria-label="Inspector sections" onKeyDown={keyboard}>
      {tabs.map(name => <button type="button" key={name} id={`${id}-tab-${name}`} role="tab" aria-selected={tab === name} aria-controls={`${id}-panel-${name}`} tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)}>{name[0].toUpperCase() + name.slice(1)}</button>)}
    </div>
    <div ref={body} className={styles.body}>
    <div className={styles.controls} role="tabpanel" id={`${id}-panel-content`} aria-labelledby={`${id}-tab-content`} hidden={tab !== 'content'}>
      <Control label="Element label" type="text" value={label} onChange={rename} />
        <label className={shared.field}>Element type
          <select className={shared.input} disabled={Boolean(requiredType)} title={requiredType ? `${motions[config.motion].label} requires this element type. Choose another preset to change it.` : undefined} value={appearance.type} onChange={event => setAppearance(previous => ({ ...previous, type: event.target.value }))}>
            <option value="text">Text</option><option value="background">Background block</option><option value="image">Image</option><option value="svg">SVG drawing</option><option value="bars">Bars</option><option value="segmented">Segmented text</option><option value="gradient">Gradient</option><option value="sequence">Sequence</option>
          </select>
        </label>
        <div className={shared.field}><PropertyLabel hintLabel="Include sample dimensions and colors in CSS" reason={relevance.includeAppearance} label={<><input type="checkbox" checked={config.includeAppearance !== false} onChange={event => update('includeAppearance', event.target.checked)} /> Include sample dimensions and colors in CSS</>} /></div>
        <p className={shared.hint}>Disable sample appearance when your AEM component already supplies dimensions and colors. The preview canvas retains its layout helpers.</p>
        <p className={shared.hint}>{compatibility(config, appearance)}{requiredType ? ` — ${definition.label} requires this element type. Choose a generic preset or Custom to unlock it.` : ' — the animation applies to the entire element.'}</p>
        {appearance.type === 'bars' && <Control label="Number of bars" min={1} max={20} value={appearance.barCount || 3} onChange={value => setAppearance(previous => ({ ...previous, barCount: Math.round(value) }))} />}
        {appearance.type === 'svg' && <Control label="Stroke width" min={1} max={20} value={appearance.strokeWidth || 4} onChange={value => setAppearance(previous => ({ ...previous, strokeWidth: value }))} />}
        {appearance.type === 'gradient' && [['gradientStart', 'Gradient start', '#312e81'], ['gradientMiddle', 'Gradient middle', '#a78bfa'], ['gradientEnd', 'Gradient end', '#f0abfc']].map(([key, title, fallback]) => <label key={key} className={shared.field}>{title}<input className={shared.input} type="color" value={appearance[key] || fallback} onChange={event => setAppearance(previous => ({ ...previous, [key]: event.target.value }))} /></label>)}
        {['text', 'segmented', 'sequence'].includes(appearance.type)
          ? <label className={shared.field}>Text content<textarea className={`${shared.input} ${styles.textarea}`} rows={3} value={appearance.text} onChange={event => setAppearance(previous => ({ ...previous, text: event.target.value }))} /></label>
          : appearance.type === 'background' 
          ? <label className={shared.field}>Background color<input className={shared.input} type="color" value={appearance.color} onChange={event => setAppearance(previous => ({ ...previous, color: event.target.value }))} /></label>
          : appearance.type === 'image' ? <label className={shared.field}>Preview image<input className={shared.input} key={active} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => {
              const file = event.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => setAppearance(previous => ({ ...previous, image: String(reader.result) }), active)
              reader.readAsDataURL(file)
            }} /></label> : null}
        <p className={shared.hint}>Use existing AEM components for text, images and backgrounds. Special presets include the required HTML structure in AEM export. For lines and sequences, enter one item per line.</p>
    <section className={styles.activation}>
    <label className={shared.field}>Activation
      <select className={shared.input} value={config.trigger} onChange={event => update('trigger', event.target.value)}>
        <option value="load">On page load</option>
        <option value="scroll">On scroll · AEM inView</option>
      </select>
    </label>
    <p className={`${shared.hint} ${styles.fullWidth}`}>{config.trigger === 'scroll' ? 'Uses abbv-animation + inView with the existing AEM viewport behavior.' : 'Starts when the element is rendered. No viewport trigger required.'}</p>
    </section>
    <PropertyLegend visible={Boolean(relevance.includeAppearance)} />
    </div>
    <div className={styles.controls} role="tabpanel" id={`${id}-panel-animation`} aria-labelledby={`${id}-tab-animation`} hidden={tab !== 'animation'}>
    <div className={styles.fullWidth}><PresetSelector value={preset} modified={modified} onChange={selectPreset} onSearchFocus={() => setTab('animation')} /></div>
    {['Stagger Ready', 'Flip In', 'Gentle Float'].includes(preset) && <p className={`${shared.hint} ${styles.fullWidth}`}>{preset === 'Stagger Ready' ? 'Stagger Ready is a single-element entrance. Use separate element delays or a sequence preset for staggered content.' : preset === 'Flip In' ? 'Flip In uses a 2D rotation. Choose Flip X 3D or Flip Y 3D for a perspective flip.' : 'Gentle Float is an entrance. Choose Floating Cycle for continuous floating.'}</p>}
    </div>
    <div className={styles.controls} role="tabpanel" id={`${id}-panel-timing`} aria-labelledby={`${id}-tab-timing`} hidden={tab !== 'timing'}>
    <section className={styles.nameSection} aria-label="Animation class name">
      <Control label="Animation name" placeholder="Custom Animation Class" type="text" value={config.name} describedBy={`${id}-name-help`} onChange={value => update('name', value)} />
      <p id={`${id}-name-help`} className={shared.hint}>You can edit this name to identify your animation and its CSS class in AEM. Use a descriptive name, such as heroEntrance. The export adjusts invalid or duplicate names; copy the final class shown in Generated CSS.</p>
    </section>
    <Control label="Duration (ms)" value={config.duration} min={0} onChange={value => update('duration', value)} />
    <Control label="Delay (ms)" value={config.delay} min={0} onChange={value => update('delay', value)} />
    {motions[config.motion]?.target === 'parts' && <Control noEffect={relevance.stagger} label="Stagger between items (ms)" value={config.stagger ?? 100} min={0} onChange={value => update('stagger', value)} />}
    <p className={`${shared.hint} ${styles.fullWidth}`}>Parts: {times.count}. Motion: {times.active} ms. Cycle including pause: {times.cycle} ms. Total including delay: {Number.isFinite(times.total) ? `${times.total} ms` : 'infinite'}. Duration controls each part; stagger separates their starts. Reverse/alternate also reverse the sequence and its holds.</p>
    {(config.iterations === 'infinite' || config.iterations > 1) && <Control label="Pause per cycle (ms)" value={config.cyclePause || 0} min={0} onChange={value => update('cyclePause', value)} />}
    <label className={shared.field}>Repetitions
      <select className={shared.input} value={config.iterations || 1} onChange={event => update('iterations', event.target.value === 'infinite' ? 'infinite' : Number(event.target.value))}>
        {[1, 2, 3, 5, 10, 'infinite'].map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>
    <div className={shared.field}><PropertyLabel label="Direction" htmlFor={`${id}-direction`} reason={relevance.direction} />
      <select id={`${id}-direction`} className={shared.input} value={config.direction || 'normal'} onChange={event => update('direction', event.target.value)}>
        {['normal', 'reverse', 'alternate', 'alternate-reverse'].map(value => <option key={value}>{value}</option>)}
      </select>
    </div>
    <div className={shared.field}><PropertyLabel label="Easing" htmlFor={`${id}-easing`} reason={relevance.easing} />
      <select id={`${id}-easing`} className={shared.input} value={config.easing} onChange={event => update('easing', event.target.value)}>
        {easings.map(easing => <option key={easing}>{easing}</option>)}
      </select>
    </div>
    <PropertyLegend visible={Boolean(relevance.easing || relevance.direction || (definition?.target === 'parts' && relevance.stagger))} />
    <div className={styles.replayFooter}><button type="button" className={shared.primary} onClick={replay}>{config.trigger === 'scroll' ? 'Replay scroll preview' : 'Replay animation'}</button></div>
    </div>
    <div className={styles.controls} role="tabpanel" id={`${id}-panel-advanced`} aria-labelledby={`${id}-tab-advanced`} hidden={tab !== 'advanced'}>
    {translationUseful && <div className={shared.field}><PropertyLabel label="Distance unit" htmlFor={`${id}-unit`} reason={relevance.unit} />
      <select id={`${id}-unit`} className={shared.input} value={config.unit} onChange={event => update('unit', event.target.value)}>
        {['px', '%', 'rem'].map(unit => <option key={unit}>{unit}</option>)}
      </select>
    </div>}
    <label className={shared.field}>Position
      <select className={shared.input} value={config.position} onChange={event => update('position', event.target.value)}>
        <option value="relative">Relative</option><option value="absolute">Absolute</option>
      </select>
    </label>
    <Control label="Z-index" value={config.zIndex} onChange={value => update('zIndex', Math.trunc(value))} />
    <p className={`${shared.hint} ${styles.fullWidth}`}>Absolute centers the element over the shared block. Higher z-index appears in front; lower values appear behind.</p>
    {!motions[config.motion] && [
      ['fromX', `From X (${config.unit})`], ['fromY', `From Y (${config.unit})`],
      ['scaleFrom', 'Scale from', 0, undefined, '0.1'],
      ['rotateFrom', 'Rotation (degrees)'], ['opacityFrom', 'Opacity from', 0, 1, '0.1'],
      ['overshoot', 'Rebound distance / scale %', 0],
    ].map(([key, label, min, max, step]) => <Control key={key} label={label} value={config[key]} min={min} max={max} step={step} onChange={value => update(key, value)} />)}
    {definition && <p className={`${shared.hint} ${styles.fullWidth}`}>{definition.label}: multi-step keyframes. Intensity adjusts movement, scale, rotation and blur; reveal shapes, drawing progress and gradient paths stay fixed.{definition.category === 'Exits' ? ' This exit ends with the element hidden.' : ''}</p>}
    {intensityUseful && <Control label="Intensity (%)" value={config.intensity ?? 100} min={0} max={200} onChange={value => update('intensity', value)} />}
    {(!definition || intensityUseful) && <div className={shared.field}><PropertyLabel label="Transform origin" htmlFor={`${id}-origin`} reason={relevance.origin} />
      <select id={`${id}-origin`} className={shared.input} value={config.origin || 'center center'} onChange={event => update('origin', event.target.value)}>
        {['center center', 'top center', 'bottom center', 'left center', 'right center'].map(value => <option key={value}>{value}</option>)}
      </select>
    </div>}
    <PropertyLegend visible={Boolean((translationUseful && relevance.unit) || ((!definition || intensityUseful) && relevance.origin))} />
    </div>
    </div>
  </section>
}
