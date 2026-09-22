import { createElement } from './createElement.js'
import { motions } from '../data/motions.js'
import { presets } from '../data/presets.js'

export const storageKey = 'animation-builder.project.v1'
const types = ['text', 'image', 'background', 'svg', 'bars', 'segmented', 'gradient', 'sequence']
const easings = new Set(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', ...Object.values(presets).map(p => p.easing)])
const numeric = { fromX: [-10000, 10000], fromY: [-10000, 10000], scaleFrom: [0, 100], rotateFrom: [-3600, 3600], opacityFrom: [0, 1], duration: [0, 600000], delay: [0, 600000], overshoot: [0, 10000], intensity: [0, 200], stagger: [0, 600000], cyclePause: [0, 600000], zIndex: [-2147483647, 2147483647] }
const text = (value, fallback, max = 1000) => typeof value === 'string' ? value.slice(0, max) : fallback
const number = (value, fallback, min, max) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
const color = (value, fallback) => /^#[\da-f]{6}$/i.test(value || '') ? value : fallback
export function parseProject(input) {
  const data = typeof input === 'string' ? JSON.parse(input) : input
  if (data?.version !== 1 || !Array.isArray(data.elements) || !data.elements.length || data.elements.length > 100) throw new Error('Choose an Animation Builder project (version 1, 1–100 elements).')
  const elements = data.elements.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid project element.')
    const base = createElement(index + 1)
    const c = item.config || {}, a = item.appearance || {}
    const config = { ...base.config }
    for (const [key, [min, max]] of Object.entries(numeric)) config[key] = number(c[key], config[key] ?? 0, min, max)
    config.includeAppearance = c.includeAppearance !== false
    config.name = text(c.name, '', 100)
    config.motion = Object.hasOwn(motions, c.motion) ? c.motion : 'basic'
    config.trigger = c.trigger === 'scroll' ? 'scroll' : 'load'
    config.unit = ['px', '%', 'rem'].includes(c.unit) ? c.unit : 'px'
    config.position = c.position === 'absolute' ? 'absolute' : 'relative'
    config.direction = ['normal', 'reverse', 'alternate', 'alternate-reverse'].includes(c.direction) ? c.direction : 'normal'
    config.origin = ['center center', 'top center', 'bottom center', 'left center', 'right center'].includes(c.origin) ? c.origin : 'center center'
    config.easing = easings.has(c.easing) ? c.easing : 'linear'
    config.iterations = c.iterations === 'infinite' ? 'infinite' : Math.round(number(c.iterations, 1, 1, 100))
    const appearance = { ...base.appearance, type: motions[config.motion]?.elementType || (types.includes(a.type) ? a.type : 'text'),
      text: text(a.text, base.appearance.text, 10000), color: color(a.color, base.appearance.color),
      image: typeof a.image === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(a.image) && a.image.length < 8000000 ? a.image : '',
      barCount: Math.round(number(a.barCount, 3, 1, 20)), strokeWidth: number(a.strokeWidth, 4, 1, 20),
      gradientStart: color(a.gradientStart, '#312e81'), gradientMiddle: color(a.gradientMiddle, '#a78bfa'), gradientEnd: color(a.gradientEnd, '#f0abfc'),
      variant: ['line','ring','check','curve','words','letters','lines','vertical'].includes(a.variant) ? a.variant : undefined,
    }
    return { ...base, config, appearance, label: text(item.label, base.label, 80), preset: Object.hasOwn(presets, item.preset) ? item.preset : '', modified: Boolean(item.modified) }
  })
  return { version: 1, elements, active: elements[Math.max(0, Math.min(elements.length - 1, Math.floor(Number(data.activeIndex) || 0)))].id }
}
export function serializeProject(elements, active) {
  return JSON.stringify({ version: 1, activeIndex: elements.findIndex(e => e.id === active), elements }, null, 2)
}
export function duplicateElement(element, number) {
  return { ...structuredClone(element), id: `element${number}`, label: `${element.label} copy`, config: { ...element.config, name: element.config.name ? `${element.config.name}-copy` : '' } }
}
export function moveElement(elements, active, offset) {
  const index = elements.findIndex(e => e.id === active), next = index + offset
  if (index < 0 || next < 0 || next >= elements.length) return elements
  const result = [...elements]
  ;[result[index], result[next]] = [result[next], result[index]]
  return result
}
