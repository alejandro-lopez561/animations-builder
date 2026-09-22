import { useEffect, useRef, useState } from 'react'
import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog'
import AppHeader from './components/AppHeader/AppHeader'
import ElementsPanel from './components/ElementsPanel/ElementsPanel'
import BuilderPanel from './components/BuilderPanel/BuilderPanel'
import LivePreviewPanel from './components/LivePreviewPanel/LivePreviewPanel'
import DocumentationPage from './components/DocumentationPage/DocumentationPage'
import CssOutput from './components/CssOutput/CssOutput'
import { useAnimationBuilder } from './hooks/useAnimationBuilder'
import { useTheme } from './hooks/useTheme'
import { createElement } from './utils/createElement'
import { serializeProject } from './utils/project'
import styles from './App.module.scss'
import shared from './styles/shared.module.scss'

export default function App() {
  const builder = useAnimationBuilder()
  const { theme, toggleTheme } = useTheme()
  const [page, setPage] = useState(() => location.hash.startsWith('#documentation') ? 'documentation' : 'builder')
  const [confirmation, setConfirmation] = useState(null)
  const [codeOpen, setCodeOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [mobileView, setMobileView] = useState('settings')
  const fileInput = useRef(null)
  useEffect(() => {
    const navigate = () => setPage(location.hash.startsWith('#documentation') ? 'documentation' : 'builder')
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])
  const newProject = () => setConfirmation({ title: 'Create a new project?', message: 'This replaces the current scene and keeps it as the previous import backup. Export JSON first for a separate copy.', confirmLabel: 'New project', action: () => {
    const first = createElement(1)
    builder.importProject(new File([serializeProject([first], first.id)], 'new-project.json', { type: 'application/json' }))
  } })
  const restoreBackup = () => setConfirmation({ title: 'Restore previous backup?', message: 'This replaces your current scene. Export JSON first if you want to keep it.', confirmLabel: 'Restore backup', action: builder.restoreBackup })
  const requestImport = () => fileInput.current?.click()
  return <div className={styles.app}>
    <AppHeader page={page} theme={theme} toggleTheme={toggleTheme} openCode={() => setCodeOpen(true)} project={{ ...builder, requestImport, newProject, restoreBackup }} />
    <input ref={fileInput} className={styles.fileInput} type="file" accept=".json,application/json" aria-label="Import project JSON" onChange={event => { builder.importProject(event.target.files?.[0]); event.target.value = '' }} />
    <main className={styles.main}>
      <div className={styles.builder} data-builder-view hidden={page !== 'builder'}>
        <section className={styles.intro} aria-label="Builder introduction"><div><h1>Build production-ready CSS animations for AEM.</h1><p>Create, preview and export accessible animations.</p></div><div className={styles.introActions}><button type="button" className={shared.button} onClick={newProject}>New project</button><button type="button" className={shared.button} onClick={requestImport}>↑ Import JSON</button></div></section>
        <nav className={styles.mobileNav} aria-label="Workspace view">{['elements','settings','preview'].map(view=><button type="button" key={view} aria-pressed={mobileView===view} onClick={()=>{ setMobileView(view); if(view!=='preview')setExpanded(false) }}>{view[0].toUpperCase()+view.slice(1)}</button>)}</nav>
        <div className={styles.layout} data-collapsed={collapsed} data-expanded={expanded} data-mobile-view={mobileView}>
          <div className={styles.elements}><ElementsPanel {...builder} requestConfirmation={setConfirmation} collapsed={collapsed} toggle={()=>setCollapsed(value=>!value)} onSelect={()=>setMobileView('settings')} /></div>
          <div className={styles.inspector}><BuilderPanel {...builder} /></div>
          <div className={styles.preview}><LivePreviewPanel scene={builder.scene} replay={builder.replay} playKey={builder.playKey} expanded={expanded} toggleExpand={()=>{setExpanded(value=>!value);setMobileView('preview')}} /></div>
        </div>
      </div>
      <div className={styles.documentation} hidden={page !== 'documentation'}><DocumentationPage /></div>
    </main>
    {confirmation && <ConfirmDialog request={confirmation} onClose={() => setConfirmation(null)} />}
    <CssOutput css={builder.css} exports={builder.exports} error={builder.error} open={codeOpen} setOpen={setCodeOpen} />
  </div>
}
