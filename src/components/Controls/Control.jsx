import { useId } from 'react'
import styles from './Control.module.scss'
export default function Control({ label, value, onChange, type = 'number', step = '1', min, max, placeholder }) {
  const id = useId()
  return <div className={styles.field}>
    <label htmlFor={id}>{label}</label>
    <input id={id} placeholder={placeholder} className={styles.input} type={type} step={step} min={min} max={max} value={value}
      onChange={event => {
        const raw = event.target.value
        if (type === 'text') return onChange(raw)
        const number = Number(raw)
        if (Number.isFinite(number)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, number)))
      }} />
  </div>
}
