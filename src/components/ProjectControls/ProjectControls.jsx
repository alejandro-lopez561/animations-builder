import { useRef } from 'react'
import shared from '../../styles/shared.module.scss'
export default function ProjectControls({ exportProject, requestImport, restoreBackup, newProject, projectStatus }) {
  const menu = useRef(null)
  const run = handler => { menu.current.open = false; handler() }
  return <details className={shared.menu} ref={menu} onKeyDown={event => { if (event.key === 'Escape') { menu.current.open = false; menu.current.querySelector('summary').focus() } }}>
    <summary>Project <span aria-hidden="true">⌄</span></summary>
    <div className={shared.menuContent}>
      <button type="button" onClick={() => run(newProject)}>New project</button>
      <button type="button" onClick={() => run(requestImport)}>Import JSON</button>
      <button type="button" onClick={() => run(exportProject)}>Export JSON</button>
      <button type="button" onClick={() => run(restoreBackup)}>Restore backup</button>
      <p className={shared.hint}>{projectStatus}</p>
    </div>
  </details>
}
