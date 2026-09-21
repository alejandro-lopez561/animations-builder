import { presets } from '../../data/presets'
import styles from './PresetSelector.module.scss'
export default function PresetSelector({ value, onChange }) {
  return <label className={styles.field}>Preset animation
    <select className={styles.input} value={value} onChange={event => onChange(event.target.value)}>
      <option value="">Custom animation</option>
      {['Basic entrances', ...new Set(Object.values(presets).map(preset => preset.category).filter(Boolean))].map(category => <optgroup key={category} label={category}>
        {Object.entries(presets).filter(([, preset]) => (preset.category || 'Basic entrances') === category).map(([name]) => <option key={name}>{name}</option>)}
      </optgroup>)}
    </select>
  </label>
}
