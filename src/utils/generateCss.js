import { motions } from '../data/motions.js'
import { specialCss } from './specialCss.js'
import { animationName, generateKeyframes } from './generateKeyframes.js'

export function animationClasses(config) {
  return `${config.trigger === 'scroll' ? 'abbv-animation inView ' : ''}${animationName(config)}`
}

export function generateCss(config, scope = '') {
  const name = animationName(config)
  const scroll = config.trigger === 'scroll'
  const base = `${scope}${scroll ? '.abbv-animation' : ''}.${name}`
  const active = `${base}${scroll ? '.inView' : ''}`
  const layout = `position: ${config.position === 'absolute' ? 'absolute' : 'relative'};\n  z-index: ${Math.trunc(config.zIndex || 0)};${config.position === 'absolute' ? '\n  inset: 0;\n  margin: auto;\n  width: fit-content;\n  height: fit-content;\n  max-width: 100%;' : ''}`
  if (motions[config.motion]?.elementType) return specialCss(config, scope, layout)
  return `${base} {
  ${layout}
  transform-origin: ${config.origin || 'center center'};
}

${scroll ? `/* AEM: uses the client's existing viewport activation. No JavaScript included. */
${base} {
  opacity: ${config.opacityFrom};
  animation-name: none;
}

` : ''}${active} {
  animation: ${name} ${config.duration}ms ${config.easing} ${config.delay || 0}ms ${config.iterations || 1} ${config.direction || 'normal'} both;
}

${generateKeyframes(config)}

@media (prefers-reduced-motion: reduce) {
  ${base}${scroll ? `, ${active}` : ''} {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
    clip-path: none;
  }
}`
}
