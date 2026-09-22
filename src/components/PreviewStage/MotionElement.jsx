import { contentDefinition, getParts, svgPaths } from '../../utils/specialMarkup'
import styles from './PreviewStage.module.scss'

export default function MotionElement({ element, entered }) {
  const { appearance, config, id, label } = element
  const definition = contentDefinition(config, appearance)
  const variant = definition.variant || appearance.variant || 'words'
  const className = `${styles.target} preview_${id} ${config.trigger === 'scroll' ? `abbv-animation ${entered ? 'inView' : ''}` : ''}`
  if (appearance.type === 'svg') return <svg className={className} viewBox="0 0 100 100" width="180" height="180" role="img" aria-label={`${label} drawing`}>
    <path className="motion-stroke" pathLength="100" d={svgPaths[variant] || svgPaths.line} fill="none" stroke="currentColor" strokeWidth={appearance.strokeWidth || 4} />
  </svg>
  if (['bars', 'sequence', 'segmented'].includes(appearance.type)) {
    const parts = getParts(appearance, { ...definition, variant })
    return <div className={`${className} ${styles[appearance.type]}`}>
      {parts.map((part, index) => <span className="motion-part" key={index} style={{ '--motion-order': definition.reverseOrder ? parts.length - 1 - index : index }}>{appearance.type === 'bars' ? '' : part}</span>)}
    </div>
  }
  if (appearance.type === 'gradient') return <div className={`${className} ${styles.gradient}`} aria-label="Animated gradient" />
  return <div className={className}>
    {appearance.type === 'text' ? <div className={styles.preview_content}>{appearance.text}</div>
      : appearance.type === 'image' ? appearance.image ? <img className={styles.image} src={appearance.image} alt={`${label} image`} /> : <div className={styles.placeholder}>Choose an image in the editor</div>
        : <div className={styles.background} style={{ backgroundColor: appearance.color }} aria-label="Animated background block" />}
  </div>
}
