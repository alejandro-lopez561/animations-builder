import { useState } from 'react'
import PreviewStage from '../PreviewStage/PreviewStage'
import styles from './LivePreviewPanel.module.scss'
import shared from '../../styles/shared.module.scss'
export default function LivePreviewPanel({ scene, replay, playKey, expanded, toggleExpand }) {
  const [size, setSize] = useState('desktop')
  return <div className={styles.panel} data-size={size}>
    <PreviewStage key={playKey} scene={scene} replay={replay} toolbar={<div className={styles.toolbar}>
      <div className={styles.sizes} role="group" aria-label="Preview canvas width">{[['desktop','Desktop'],['tablet','Tablet'],['mobile','Mobile']].map(([key,label])=><button type="button" key={key} aria-pressed={size === key} title={`${label} canvas width`} aria-label={`${label} canvas width`} onClick={()=>setSize(key)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x={key==='desktop'?3:key==='tablet'?6:8} y="3" width={key==='desktop'?18:key==='tablet'?12:8} height="16" rx="2"/>{key==='desktop' && <path d="M8 22h8m-4-3v3"/>}</svg></button>)}</div>
      <button type="button" className={shared.iconButton} onClick={toggleExpand} aria-label={expanded ? 'Restore workspace' : 'Expand preview'} aria-pressed={expanded} title={expanded ? 'Restore workspace' : 'Expand preview'}>{expanded ? '↙' : '↗'}</button>
      <button type="button" className={shared.button} onClick={replay}>Replay</button>
    </div>} />
  </div>
}
