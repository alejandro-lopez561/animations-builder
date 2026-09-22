import { timing } from './timing.js'
import { getParts, contentDefinition } from './specialMarkup.js'
import { motions } from '../data/motions.js'
import { animationName, generateKeyframes, generateAdvancedKeyframes } from './generateKeyframes.js'

export function specialCss(config, scope = '', layout = '', appearance) {
  const d = motions[config.motion]
  const base = `${scope}${config.trigger === 'scroll' ? '.abbv-animation' : ''}.${animationName(config)}`
  const active = `${base}${config.trigger === 'scroll' ? '.inView' : ''}`
  const suffix = d.target === 'stroke' ? ' > .motion-stroke' : d.target === 'parts' ? ' > .motion-part' : ''
  const target = base + suffix
  const start = d.frames[0]
  const extras = contentCss(config, appearance, base)
  const sequence = d.target === 'parts' && (config.iterations === 'infinite' || Number(config.iterations) > 1)
    ? repeatedParts(config, appearance, d, active + suffix) : null
  return `${base} {\n  ${layout}\n}\n${extras}\n\n${target} {
  transform-origin: ${config.origin || 'center center'};
  opacity: ${config.trigger === 'scroll' ? config.opacityFrom : start.opacity ?? 1};
  animation: none;
}
${active}${suffix} {
  animation: ${animationName(config)} ${sequence ? sequence.duration : timing(config, appearance).cycle}ms ${config.easing} ${config.delay || 0}ms ${config.iterations || 1} ${config.direction || 'normal'} both;${d.target === 'parts' && !sequence ? `\n  animation-delay: calc(${config.delay || 0}ms + var(--motion-order, 0) * ${config.stagger ?? 100}ms);` : ''}
}

${sequence ? sequence.css : generateKeyframes(config)}

@media (prefers-reduced-motion: reduce) {
  ${target}, ${active}${suffix}${sequence ? ":nth-child(n)" : ""} {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
    clip-path: none;
    stroke-dashoffset: 0;
  }
}`
}

// All children share a cycle. Their stagger is inside the keyframes rather than
// a one-time CSS delay, so no child starts the next cycle before the last finishes.
export function repeatedParts(config, appearance, definition, selector) {
  const count = getParts(appearance, definition).length
  const duration = Math.max(0, Number(config.duration) || 0)
  const stagger = Math.max(0, Number(config.stagger ?? 100) || 0)
  const cycle = timing(config, appearance).cycle
  const css = Array.from({ length: count }, (_, index) => {
    const order = definition.reverseOrder ? count - 1 - index : index
    const start = cycle ? order * stagger / cycle * 100 : 0
    const frames = cycle ? [
      { ...definition.frames[0], at: 0 },
      ...definition.frames.map(frame => ({ ...frame, at: start + frame.at * duration / cycle })),
      { ...definition.frames.at(-1), at: 100 },
    ] : definition.frames
    const name = `${animationName(config)}-part-${index + 1}`
    return `${selector}:nth-child(${index + 1}) { animation-name: ${name}; }\n${generateAdvancedKeyframes({ ...config, name }, frames)}`
  }).join('\n\n')
  return { duration: cycle, css }
}

const color = (value, fallback) => /^#[\da-f]{6}$/i.test(value || '') ? value : fallback
export function contentCss(config, appearance = {}, base) {
  const d = contentDefinition(config, appearance)
  if (!d.elementType) return ''
  const css = d.elementType === 'svg'
    ? `${base} { width: 180px; height: 180px; overflow: visible; }\n${base} > .${d.elementType === 'svg' ? 'motion-stroke' : 'motion-part'} { fill: none; stroke: currentColor; stroke-width: ${Math.max(1, Math.min(20, Number(appearance.strokeWidth) || 4))}; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 100; stroke-dashoffset: ${d.target === 'stroke' ? 100 : 0}; transform-box: fill-box; }`
    : d.elementType === 'gradient'
      ? `${base} { width: 240px; height: 180px; border-radius: 16px; background: linear-gradient(135deg, ${color(appearance.gradientStart, '#312e81')}, ${color(appearance.gradientMiddle, '#a78bfa')}, ${color(appearance.gradientEnd, '#f0abfc')}, ${color(appearance.gradientStart, '#312e81')}); background-size: 300% 300%; }`
      : `${base} { display: flex; flex-wrap: wrap; gap: ${d.variant === 'letters' ? '0' : '.3em'};${d.elementType === 'bars' ? ` width: 240px; height: 180px; align-items: ${d.variant === 'vertical' ? 'flex-end' : 'stretch'}; flex-direction: ${d.variant === 'vertical' ? 'row' : 'column'};` : ''} }\n${base} > .${d.elementType === 'svg' ? 'motion-stroke' : 'motion-part'} { display: ${d.variant === 'lines' ? 'block' : 'inline-block'};${d.variant === 'lines' ? ' width: 100%;' : ''}${d.elementType === 'bars' ? ' flex: 1; min-width: 20px; min-height: 20px; background: #8b5cf6; border-radius: 4px;' : ''}${d.elementType === 'sequence' ? ' padding: 20px; border-radius: 12px; background: #ede9fe; color: #312e81;' : ''}${d.variant === 'letters' ? ' white-space: pre;' : ''} }`
  if (config.includeAppearance === false) return css.replace(/(?<=[;{])\s*(?:width|height|min-width|min-height|padding|gap|border-radius|color):[^;{}]*;/g, '').replace(/background: #[\da-f]+;/gi, '')
  return `/* Component appearance: sample dimensions and colors; adapt to your AEM design. */\n${css}`
}
