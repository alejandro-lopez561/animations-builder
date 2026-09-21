import { specialMarkup } from './specialMarkup.js'
import { animationClasses, generateCss } from './generateCss.js'
import { animationName } from './generateKeyframes.js'

export function generateScene(elements) {
  const used = new Set()
  const reserved = new Set(elements.filter(e => e.config.name.trim()).map(e => animationName(e.config)))
  const resolved = elements.map(element => {
    const supplied = element.config.name.trim()
    const base = supplied ? animationName(element.config) : element.appearance?.type === 'text' || element.id === 'text' ? 'customText' : 'customElement'
    let name = base
    let suffix = 2
    while (used.has(name) || (!supplied && reserved.has(name)) || (name !== base && reserved.has(name))) name = `${base}-${suffix++}`
    used.add(name)
    return { ...element, config: { ...element.config, name }, automatic: !supplied || name !== animationName(element.config) }
  })
  const parent = elements.some(e => e.config.position === 'absolute')
  return {
    error: '',
    css: (parent ? '/* Apply motion-container to the shared parent. Give it the height required by your design. */\n.motion-container {\n  position: relative;\n  isolation: isolate;\n}\n\n' : '') + resolved.map(e => `/* ${e.label} */\n${generateCss(e.config)}`).join('\n\n'),
    exports: resolved.map(e => ({
      id: e.id, label: e.label, markup: specialMarkup(e.config, e.appearance, animationClasses(e.config)), classes: e.automatic && !elements.find(original => original.id === e.id).config.name.trim() ? '' : animationClasses(e.config),
      copyClasses: animationClasses(e.config), automatic: e.automatic,
      scroll: e.config.trigger === 'scroll',
    })),
  }
}
