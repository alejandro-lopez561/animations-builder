import { motions } from '../data/motions.js'

export function animationName(config) {
  const safe = String(config.name || '').trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/^[^a-zA-Z_]+/, '')
  const reserved = /^(none|initial|inherit|unset|revert|revert-layer|default)$/i
  return !safe || reserved.test(safe) ? 'customMotion' : safe
}

export function generateKeyframes(config) {
  const css = rawKeyframes(config)
  const pause = (config.iterations === 'infinite' || config.iterations > 1) ? Math.max(0, Number(config.cyclePause) || 0) : 0
  if (!pause) return css
  const duration = Math.max(0, Number(config.duration) || 0)
  const ratio = duration / (duration + pause)
  const end = css.match(/(?:to|100%) \{([\s\S]*?)\n {2}\}/)?.[1]
  const mapped = css.replace(/(from|to|[\d.]+%) \{/g, (_, at) => `${(at === 'from' ? 0 : at === 'to' ? 100 : parseFloat(at)) * ratio}% {`)
  return mapped.replace(/\n}$/, `\n  100% {${end}\n  }\n}`)
}

function rawKeyframes(config) {
  if (motions[config.motion]) return generateAdvancedKeyframes(config)
  const { fromX, fromY, scaleFrom, rotateFrom, opacityFrom, overshoot } = config
  // Rebound follows the incoming direction; scale-only presets rebound in scale.
  const length = Math.hypot(fromX, fromY)
  const x = length ? -fromX / length * overshoot : 0
  const y = length ? -fromY / length * overshoot : 0
  const scale = length ? 1 : 1 + overshoot / 100
  return `@keyframes ${animationName(config)} {
  from {
    transform: translate3d(${fromX}${config.unit || 'px'}, ${fromY}${config.unit || 'px'}, 0) scale(${scaleFrom}) rotate(${rotateFrom}deg);
    opacity: ${opacityFrom};
  }${overshoot > 0 ? `
  60% {
    transform: translate3d(${Number(x.toFixed(3))}${config.unit || 'px'}, ${Number(y.toFixed(3))}${config.unit || 'px'}, 0) scale(${scale}) rotate(0deg);
    opacity: 1;
  }` : ''}
  to {
    transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
}`
}

export function generateAdvancedKeyframes(config, frames = motions[config.motion].frames) {
  const definition = motions[config.motion]
  const strength = Math.max(0, Math.min(200, config.intensity ?? 100)) / 100
  const n = value => Number(value.toFixed(4))
  const delta = value => n((value || 0) * strength)
  const scale = value => n(1 + ((value ?? 1) - 1) * strength)
  const unit = config.unit || 'px'
  const threeD = definition.frames.some(frame => frame.rx || frame.ry)
  const hasBlur = definition.frames.some(frame => frame.blur)
  return `@keyframes ${animationName(config)} {\n${frames.map(frame => `  ${frame.at}% {
    transform: ${threeD ? 'perspective(800px) ' : ''}translate3d(${delta(frame.x)}${unit}, ${delta(frame.y)}${unit}, 0) rotate(${delta(frame.rotate)}deg)${threeD ? ` rotateX(${delta(frame.rx)}deg) rotateY(${delta(frame.ry)}deg)` : ''} scale(${scale(frame.scale)}, ${scale(frame.scale)}) scaleX(${scale(frame.sx)}) scaleY(${scale(frame.sy)}) skewX(${delta(frame.skew)}deg);
    opacity: ${frame.opacity ?? 1};${hasBlur ? `\n    filter: blur(${delta(frame.blur)}px);` : ''}${frame.clip ? `\n    clip-path: ${frame.clip};` : ''}${frame.dash !== undefined ? `\n    stroke-dashoffset: ${frame.dash};` : ''}${frame.bg ? `\n    background-position: ${frame.bg};` : ''}
  }`).join('\n')}\n}`
}
