import styles from './DocumentationPage.module.scss'
const sections = [
  ['Introduction', 'Animation Builder lets you configure CSS animations, preview a scene and copy CSS for AEM. The builder uses JavaScript; exported animations use CSS and, for special elements, HTML.'],
  ['Creating elements', 'Use Add element in Elements. Select an element to edit its label, type and content. Its actions menu offers duplication, ordering and deletion. Specialized presets lock the content type they require.'],
  ['Selecting presets', 'Search by name or effect. Quick filters and More filters narrow the catalog. Select a card to apply it; editing its settings keeps the preset name marked as modified.'],
  ['Custom animations', 'Choose Custom animation in Animation. Existing defaults start with zero numeric motion values and an empty animation name. Set a duration above zero in Timing, then adjust the starting transform, opacity and rebound in Advanced.'],
  ['Live Preview', 'Configuration changes replay the scene. On scroll waits for the block to enter the preview viewport; scroll inside the canvas and use Replay to test again. Canvas width and expansion affect only the preview layout.'],
  ['Exporting for AEM', 'Open Generated CSS or use Export CSS in the header. Copy the classes, CSS and required HTML, when shown. Scroll exports rely on the client’s existing abbv-animation / inView behavior. Confirm markup support and final appearance in the actual AEM component.'],
  ['Importing and exporting projects', 'Project contains Import JSON, Export JSON and Restore backup. Projects save locally in this browser and origin. Export JSON for a portable backup. Import replaces the scene and keeps a previous-import backup. New project asks for confirmation and uses that same backup mechanism.'],
]
export default function DocumentationPage() {
  return <article className={styles.page}><header><p>ANIMATION BUILDER</p><h1>Documentation</h1><p>A practical starting point for creating and exporting animations.</p></header><nav aria-label="Documentation sections">{sections.map(([title],index)=><a key={title} href={`#documentation-${index}`}>{title}</a>)}</nav>{sections.map(([title,body],index)=><section id={`documentation-${index}`} key={title}><h2>{title}</h2><p>{body}</p></section>)}</article>
}
