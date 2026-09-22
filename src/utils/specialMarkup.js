import { motions } from '../data/motions.js'
export const svgPaths = {
  line: 'M10 50 H90', ring: 'M50 10 A40 40 0 1 1 49.99 10',
  check: 'M15 50 L40 75 L85 25', curve: 'M10 80 C25 5 65 95 90 20',
}
export function getParts(appearance = {}, definition = {}) {
  const text = appearance.text ?? 'Abbvie — Animations Tool'
  if (definition.elementType === 'bars' || appearance.type === 'bars') return Array.from({ length: Math.max(1, Math.min(20, Math.round(appearance.barCount || 3))) }, () => '')
  if (definition.elementType === 'sequence' || appearance.type === 'sequence') return text.split('\n').filter(line => line.trim())
  if (definition.variant === 'letters') return typeof Intl.Segmenter === 'function' ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), part => part.segment) : Array.from(text)
  if (definition.variant === 'lines') return text.split('\n')
  return text.split(/\s+/).filter(Boolean)
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
export function specialMarkup(config, appearance, classes) {
  const definition = contentDefinition(config, appearance)
  if (!definition?.elementType) return ''
  const cls = escapeHtml(classes)
  if (definition.elementType === 'svg') return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(appearance?.text || 'Animated illustration')}">\n  <path class="motion-stroke" pathLength="100" d="${svgPaths[definition.variant] || svgPaths.line}" />\n</svg>`
  if (['bars', 'sequence', 'segmented'].includes(definition.elementType)) {
    const parts = getParts(appearance, definition)
    return `<div class="${cls}">\n${parts.map((part, index) => `  <span class="motion-part" style="--motion-order: ${definition.reverseOrder ? parts.length - 1 - index : index}">${definition.elementType === 'bars' ? '' : escapeHtml(part)}</span>`).join('\n')}\n</div>`
  }
  return `<div class="${cls}" aria-hidden="true"></div>`
}

export function contentDefinition(config, appearance = {}) {
  const motion = motions[config.motion]
  const type = motion?.elementType || appearance.type
  if (!['svg', 'bars', 'segmented', 'gradient', 'sequence'].includes(type)) return {}
  return { ...motion, elementType: type, variant: motion?.variant || appearance.variant || (type === 'svg' ? 'line' : 'words') }
}
export function compatibility(config, appearance) {
  const type = contentDefinition(config, appearance).elementType
  return type === 'svg' ? 'Requires inline SVG' : type ? 'Requires HTML structure' : 'CSS only'
}
