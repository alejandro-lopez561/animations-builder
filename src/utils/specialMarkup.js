import { motions } from '../data/motions.js'
export const svgPaths = {
  line: 'M10 50 H90', ring: 'M50 10 A40 40 0 1 1 49.99 10',
  check: 'M15 50 L40 75 L85 25', curve: 'M10 80 C25 5 65 95 90 20',
}
export function getParts(appearance = {}, definition = {}) {
  const text = appearance.text || 'Abbvie — Animations Tool'
  if (definition.elementType === 'bars' || appearance.type === 'bars') return ['60', '90', '75']
  if (definition.elementType === 'sequence' || appearance.type === 'sequence') return text.includes('\n') ? text.split('\n').filter(Boolean) : ['Discover', 'Explore', 'Learn more']
  if (definition.variant === 'letters') return Array.from(text)
  if (definition.variant === 'lines') return text.split('\n')
  return text.split(/\s+/).filter(Boolean)
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
export function specialMarkup(config, appearance, classes) {
  const definition = motions[config.motion]
  if (!definition?.elementType) return ''
  const cls = escapeHtml(classes)
  if (definition.target === 'stroke') return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(appearance?.text || 'Animated illustration')}">\n  <path class="motion-stroke" pathLength="100" d="${svgPaths[definition.variant]}" />\n</svg>`
  if (definition.target === 'parts') {
    const parts = getParts(appearance, definition)
    return `<div class="${cls}">\n${parts.map((part, index) => `  <span class="motion-part" style="--motion-order: ${definition.reverseOrder ? parts.length - 1 - index : index}">${definition.elementType === 'bars' ? '' : escapeHtml(part)}</span>`).join('\n')}\n</div>`
  }
  return `<div class="${cls}" aria-hidden="true"></div>`
}
