import { motions } from '../../data/motions'
import Control from '../Controls/Control'
import PresetSelector from '../PresetSelector/PresetSelector'
import { presets } from '../../data/presets'
import styles from './BuilderPanel.module.scss'
import shared from '../../styles/shared.module.scss'

const easings = [...new Set(['ease', 'ease-out', 'ease-in', 'ease-in-out', 'linear', ...Object.values(presets).map(preset => preset.easing)])]
export default function BuilderPanel({ config, preset, selectPreset, update, replay, active, setActive, scene, addElement, removeElement, label, appearance, setAppearance }) {
  return <section className={styles.panel}>
    <h1 className={styles.panel_title}>Animation Builder</h1>
    <p className={styles.panel_description}>Create animations and export CSS for your AEM components.</p>
    <div className={styles.elementControls}>
      <button type="button" className={shared.button} onClick={addElement}>Add element</button>
      <div className={styles.switcher} role="group" aria-label="Element to edit">
        {scene.map(element => <button key={element.id} type="button" aria-pressed={active === element.id} onClick={() => setActive(element.id)}>{element.label}</button>)}
      </div>
      <button type="button" className={styles.remove} disabled={scene.length === 1} onClick={removeElement}>Remove selected element</button>
        <label className={shared.field}>Element type
          <select className={shared.input} value={appearance.type} onChange={event => setAppearance(previous => ({ ...previous, type: event.target.value }))}>
            <option value="text">Text</option><option value="background">Background block</option><option value="image">Image</option><option value="svg">SVG drawing</option><option value="bars">Bars</option><option value="segmented">Segmented text</option><option value="gradient">Gradient</option><option value="sequence">Sequence</option>
          </select>
        </label>
        {['text', 'segmented', 'sequence'].includes(appearance.type)
          ? <label className={shared.field}>Text content<textarea className={`${shared.input} ${styles.textarea}`} rows={3} value={appearance.text} onChange={event => setAppearance(previous => ({ ...previous, text: event.target.value }))} /></label>
          : appearance.type === 'background' 
          ? <label className={shared.field}>Background color<input type="color" value={appearance.color} onChange={event => setAppearance(previous => ({ ...previous, color: event.target.value }))} /></label>
          : appearance.type === 'image' ? <label className={shared.field}>Preview image<input key={active} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => {
              const file = event.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => setAppearance(previous => ({ ...previous, image: String(reader.result) }), active)
              reader.readAsDataURL(file)
            }} /></label> : <p className={shared.hint}>Select a matching preset to animate this element.</p>}
        <p className={shared.hint}>Use existing AEM components for text, images and backgrounds. Special presets include the required HTML structure in AEM export. For lines and sequences, enter one item per line.</p>
    </div>
    <h2 className={styles.editing}>{label} animation</h2>
    <div className={styles.controls}>
    <PresetSelector value={preset} onChange={selectPreset} />
    <label className={shared.field}>Activation
      <select className={shared.input} value={config.trigger} onChange={event => update('trigger', event.target.value)}>
        <option value="load">On page load</option>
        <option value="scroll">On scroll · AEM inView</option>
      </select>
    </label>
    <p className={`${shared.hint} ${styles.fullWidth}`}>{config.trigger === 'scroll' ? 'Uses abbv-animation + inView with the existing AEM viewport behavior.' : 'Starts when the element is rendered. No viewport trigger required.'}</p>
    <Control label="Animation name" placeholder="Custom Animation Class" type="text" value={config.name} onChange={value => update('name', value)} />
    <label className={shared.field}>Distance unit
      <select className={shared.input} value={config.unit} onChange={event => update('unit', event.target.value)}>
        {['px', '%', 'rem'].map(unit => <option key={unit}>{unit}</option>)}
      </select>
    </label>
    <label className={shared.field}>Position
      <select className={shared.input} value={config.position} onChange={event => update('position', event.target.value)}>
        <option value="relative">Relative</option><option value="absolute">Absolute</option>
      </select>
    </label>
    <Control label="Z-index" value={config.zIndex} onChange={value => update('zIndex', Math.trunc(value))} />
    <p className={`${shared.hint} ${styles.fullWidth}`}>Absolute centers the element over the shared block. Higher z-index appears in front; lower values appear behind.</p>
    {!motions[config.motion] && [
      ['fromX', `From X (${config.unit})`], ['fromY', `From Y (${config.unit})`],
      ['duration', 'Duration (ms)', 0], ['delay', 'Delay (ms)', 0],
      ['scaleFrom', 'Scale from', 0, undefined, '0.1'],
      ['rotateFrom', 'Rotation (degrees)'], ['opacityFrom', 'Opacity from', 0, 1, '0.1'],
      ['overshoot', 'Rebound distance / scale %', 0],
    ].map(([key, label, min, max, step]) => <Control key={key} label={label} value={config[key]} min={min} max={max} step={step} onChange={value => update(key, value)} />)}
    {motions[config.motion] && <>
      <p className={`${shared.hint} ${styles.fullWidth}`}>{motions[config.motion].label}: multi-step keyframes. Intensity adjusts movement, scale, rotation and blur; reveal shapes, drawing progress and gradient paths stay fixed.{motions[config.motion].category === 'Exits' ? ' This exit ends with the element hidden.' : ''}</p>
      {motions[config.motion]?.target === 'parts' && <Control label="Stagger between items (ms)" value={config.stagger ?? 100} min={0} onChange={value => update('stagger', value)} />}
      <Control label="Intensity (%)" value={config.intensity ?? 100} min={0} max={200} onChange={value => update('intensity', value)} />
      <Control label="Duration (ms)" value={config.duration} min={0} onChange={value => update('duration', value)} />
      <Control label="Delay (ms)" value={config.delay} min={0} onChange={value => update('delay', value)} />
    </>}
    <label className={shared.field}>Repetitions
      <select className={shared.input} value={config.iterations || 1} onChange={event => update('iterations', event.target.value === 'infinite' ? 'infinite' : Number(event.target.value))}>
        {[1, 2, 3, 5, 10, 'infinite'].map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>
    <label className={shared.field}>Direction
      <select className={shared.input} value={config.direction || 'normal'} onChange={event => update('direction', event.target.value)}>
        {['normal', 'reverse', 'alternate', 'alternate-reverse'].map(value => <option key={value}>{value}</option>)}
      </select>
    </label>
    <label className={shared.field}>Transform origin
      <select className={shared.input} value={config.origin || 'center center'} onChange={event => update('origin', event.target.value)}>
        {['center center', 'top center', 'bottom center', 'left center', 'right center'].map(value => <option key={value}>{value}</option>)}
      </select>
    </label>
    <label className={shared.field}>Easing
      <select className={shared.input} value={config.easing} onChange={event => update('easing', event.target.value)}>
        {easings.map(easing => <option key={easing}>{easing}</option>)}
      </select>
    </label>
    </div>
    <button className={shared.button} onClick={replay}>{config.trigger === 'scroll' ? 'Replay scroll preview' : 'Replay animation'}</button>
  </section>
}
