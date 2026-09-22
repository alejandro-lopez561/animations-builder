import { motions } from '../data/motions.js'
import { specialMarkup, getParts, compatibility } from './specialMarkup.js'
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
    const names = candidate => {
      const d = motions[element.config.motion]
      const parts = d?.target === 'parts' && (element.config.iterations === 'infinite' || element.config.iterations > 1)
        ? getParts(element.appearance, d).map((_, i) => `${candidate}-part-${i + 1}`) : []
      return [candidate, ...parts]
    }
    while (names(name).some(n => used.has(n) || (n !== name && reserved.has(n))) || used.has(name) || (!supplied && reserved.has(name)) || (name !== base && reserved.has(name))) name = `${base}-${suffix++}`
    names(name).forEach(n => used.add(n))
    return { ...element, config: { ...element.config, name }, automatic: !supplied || name !== animationName(element.config) }
  })
  const parent = elements.some(e => e.config.position === 'absolute')
  return {
    error: '',
    css: (parent ? '/* Apply motion-container to the shared parent. Give it the height required by your design. */\n.motion-container {\n  position: relative;\n  isolation: isolate;\n}\n\n' : '') + resolved.map(e => `/* ${e.label.replaceAll('*/', '* /')} */\n${generateCss(e.config, '', e.appearance)}`).join('\n\n'),
    exports: resolved.map(e => ({
      id: e.id, label: e.label, compatibility: compatibility(e.config, e.appearance), markup: specialMarkup(e.config, e.appearance, animationClasses(e.config)), classes: e.automatic && !elements.find(original => original.id === e.id).config.name.trim() ? '' : animationClasses(e.config),
      copyClasses: animationClasses(e.config), automatic: e.automatic,
      scroll: e.config.trigger === 'scroll',
    })),
  }
}
