import ProjectControls from '../ProjectControls/ProjectControls'
import styles from './AppHeader.module.scss'
import shared from '../../styles/shared.module.scss'
export default function AppHeader({ page, theme, toggleTheme, openCode, project }) {
  return <header className={styles.header}>
    <a className={styles.brand} href="#builder" aria-label="Animation Builder home"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m5 19 14-14M4 4h5M4 4v5M20 20h-5M20 20v-5"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="8" r="2"/></svg><span>DH - Animation Builder</span></a>
    <nav aria-label="Main navigation"><a href="#builder" aria-current={page === 'builder' ? 'page' : undefined}>Builder</a><a href="#documentation" aria-current={page === 'documentation' ? 'page' : undefined}>Documentation</a></nav>
    <div className={styles.actions}>
      <span className={styles.saved} role="status" title={project.projectStatus}>{project.projectStatus === 'Saved on this browser.' ? '✓ Saved locally' : project.projectStatus}</span>
      <button type="button" className={shared.iconButton} onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀' : '☾'}</button>
      <ProjectControls {...project} />
      <button type="button" className={shared.primary} onClick={openCode}>Export CSS</button>
    </div>
  </header>
}
