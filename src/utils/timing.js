import { motions } from '../data/motions.js'
import { getParts } from './specialMarkup.js'
export function timing(config, appearance) {
  const repeated = config.iterations === 'infinite' || Number(config.iterations) > 1
  const count = motions[config.motion]?.target === 'parts' ? getParts(appearance, motions[config.motion]).length : 1
  const duration = Math.max(0, Number(config.duration) || 0)
  const stagger = count > 1 ? Math.max(0, Number(config.stagger ?? 100) || 0) : 0
  const active = duration + Math.max(0, count - 1) * stagger
  const pause = repeated ? Math.max(0, Number(config.cyclePause) || 0) : 0
  return { count, duration, stagger, active, pause, cycle: active + pause,
    total: config.iterations === 'infinite' ? Infinity : Math.max(0, Number(config.delay) || 0) + (active + pause) * (Number(config.iterations) || 1) }
}
