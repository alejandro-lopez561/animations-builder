import { motions } from '../data/motions.js'
import { animationName, generateKeyframes } from './generateKeyframes.js'

export function specialCss(config, scope = '', layout = '') {
  const d = motions[config.motion]
  const base = `${scope}${config.trigger === 'scroll' ? '.abbv-animation' : ''}.${animationName(config)}`
  const active = `${base}${config.trigger === 'scroll' ? '.inView' : ''}`
  const suffix = d.target === 'stroke' ? ' > .motion-stroke' : d.target === 'parts' ? ' > .motion-part' : ''
  const target = base + suffix
  const start = d.frames[0]
  const extras = d.target === 'stroke'
    ? `${base} { width: 180px; height: 180px; overflow: visible; }\n${target} { fill: none; stroke: currentColor; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 100; stroke-dashoffset: 100; transform-box: fill-box; }`
    : d.elementType === 'gradient'
      ? `${base} { width: 240px; height: 180px; border-radius: 16px; background: linear-gradient(135deg, #312e81, #a78bfa, #f0abfc, #312e81); background-size: 300% 300%; }`
      : `${base} { display: flex; flex-wrap: wrap; gap: ${d.variant === 'letters' ? '0' : '.3em'};${d.elementType === 'bars' ? ` width: 240px; height: 180px; align-items: ${d.variant === 'vertical' ? 'flex-end' : 'stretch'}; flex-direction: ${d.variant === 'vertical' ? 'row' : 'column'};` : ''} }\n${target} { display: ${d.variant === 'lines' ? 'block' : 'inline-block'};${d.variant === 'lines' ? ' width: 100%;' : ''}${d.elementType === 'bars' ? ' flex: 1; min-width: 20px; min-height: 20px; background: #8b5cf6; border-radius: 4px;' : ''}${d.elementType === 'sequence' ? ' padding: 20px; border-radius: 12px; background: #ede9fe; color: #312e81;' : ''}${d.variant === 'letters' ? ' white-space: pre;' : ''} }`
  return `${base} {\n  ${layout}\n}\n${extras}\n\n${target} {
  transform-origin: ${config.origin || 'center center'};
  opacity: ${config.trigger === 'scroll' ? config.opacityFrom : start.opacity ?? 1};
  animation: none;
}
${active}${suffix} {
  animation: ${animationName(config)} ${config.duration}ms ${config.easing} ${config.delay || 0}ms ${config.iterations || 1} ${config.direction || 'normal'} both;${d.target === 'parts' ? `\n  animation-delay: calc(${config.delay || 0}ms + var(--motion-order, 0) * ${config.stagger ?? 100}ms);` : ''}
}

${generateKeyframes(config)}

@media (prefers-reduced-motion: reduce) {
  ${target}, ${active}${suffix} {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
    clip-path: none;
    stroke-dashoffset: 0;
  }
}`
}
