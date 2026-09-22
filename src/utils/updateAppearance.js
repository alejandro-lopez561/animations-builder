import { motions } from '../data/motions.js'

export function updateAppearance(element, transform) {
  const appearance = transform(element.appearance)
  const requiredType = motions[element.config.motion]?.elementType
  return { ...element, appearance: {
    ...appearance,
    type: requiredType || appearance.type,
  } }
}
