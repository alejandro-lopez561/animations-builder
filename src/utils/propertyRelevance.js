import { generateKeyframes } from './generateKeyframes.js'
import { motions } from '../data/motions.js'
import { contentDefinition, getParts } from './specialMarkup.js'

// Read the generated values, including intensity rounding and rebound frames.
// A neutral editable starting value is not evidence that its control is irrelevant.
export function propertyRelevance(config, appearance = {}) {
  const frames = [...generateKeyframes(config).matchAll(/(?:from|to|[\d.]+%) \{([^}]+)\}/g)].map(match => match[1].trim())
  const transforms = frames.map(frame => frame.match(/transform: ([^;]+);/)?.[1] || '')
  const hasTranslation = transforms.some(transform => [...transform.matchAll(/translate3d\(([^)]+)\)/g)].some(match => match[1].split(',').slice(0, 2).some(value => parseFloat(value) !== 0)))
  const hasPivot = transforms.some(transform => [...transform.matchAll(/(rotate[XY]?|scale[XY]?|skewX)\(([^)]+)\)/g)].some(([, fn, values]) => values.split(',').some(value => parseFloat(value) !== (fn.startsWith('scale') ? 1 : 0))))
  const signatures = frames.map(frame => frame.replace(/(-?[\d.]+)(px|rem|%|deg)/g, (value, number) => Number(number) === 0 ? '0' : value).replace(/\s+/g, ''))
  const staticFrames = signatures.length > 0 && signatures.every(frame => frame === signatures[0])
  const definition = motions[config.motion]
  const result = {}
  if (!hasPivot) result.origin = 'The generated movement has no scaling, rotation or skew. Translation alone does not use a pivot.'
  if (!hasTranslation) result.unit = 'The generated movement has no horizontal or vertical travel.'
  if (Number(config.duration) === 0 || staticFrames) result.easing = 'There is no gradual visual change to shape during each part’s animation.'
  if (staticFrames) result.direction = 'Every generated keyframe has the same appearance.'
  if (definition?.target === 'parts' && getParts(appearance, definition).length <= 1) result.stagger = 'Spacing between starts needs at least two parts.'
  if (!contentDefinition(config, appearance).elementType) result.includeAppearance = 'This element does not generate sample dimensions or colors in the CSS export.'
  return result
}
