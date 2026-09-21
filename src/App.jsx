import BuilderPanel from './components/BuilderPanel/BuilderPanel'
import PreviewStage from './components/PreviewStage/PreviewStage'
import CssOutput from './components/CssOutput/CssOutput'
import { useAnimationBuilder } from './hooks/useAnimationBuilder'
import styles from './App.module.scss'

export default function App() {
  const builder = useAnimationBuilder()
  return <main className={styles.app}>
    <div className={styles.layout}>
      <div className={styles.editor} role="region" aria-label="Animation editor" tabIndex={0}><BuilderPanel {...builder} /></div>
      <div className={styles.workspace}>
        <PreviewStage key={builder.playKey} scene={builder.scene} replay={builder.replay} />
      </div>
    </div>
    <div className={styles.export}><CssOutput css={builder.css} exports={builder.exports} error={builder.error} /></div>
  </main>
}
