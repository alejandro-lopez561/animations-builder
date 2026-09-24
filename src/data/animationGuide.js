import { presets } from './presets.js'
import { motions } from './motions.js'
import { propertyRelevance } from '../utils/propertyRelevance.js'

// Editorial copy is kept outside preset configuration so it never enters project JSON.
// Names, groups, membership and basic trajectories come from the live catalog.
const motionDescriptions = {
  drawLine: 'A horizontal line gradually draws itself across the space.',
  drawRing: 'A circular outline gradually draws itself into a ring.',
  drawCheck: 'A check mark draws its short stroke first, then finishes the longer stroke.',
  drawCurve: 'A curved line draws itself while becoming fully visible.',
  barLeft: 'Bars grow horizontally from their left edges, one after another.',
  barUp: 'Vertical bars grow upward from their bottom edges, one after another.',
  barCenter: 'Bars fade in and expand outward from their centers, one after another.',
  barCascade: 'Bars grow from the left in sequence, briefly stretch past their final size, then settle.',
  wordRise: 'Words rise into place and become visible one after another.',
  wordFocus: 'Words come into focus, gently enlarge and become visible in sequence.',
  lineReveal: 'Each line of text is uncovered from left to right, with a pause between starts.',
  letterWave: 'Letters rise in a wave, briefly lift above their final positions, then settle.',
  gradientX: 'The background colors travel horizontally and return to their starting positions.',
  gradientY: 'The background colors travel vertically and return to their starting positions.',
  gradientDiagonal: 'The background colors move diagonally and return, with a gentle change in size.',
  shimmer: 'A band of background color sweeps horizontally across the block.',
  sequenceRise: 'Items rise into place and become visible one after another.',
  sequenceReverse: 'Items move in from the right and become visible, starting with the last item.',
  sequenceTilt: 'Items turn toward the viewer, grow slightly and become visible in sequence.',
  sequencePop: 'Items pop into view in sequence, grow beyond their final size and bounce into place.',
  wipeLeft: 'The element is uncovered from left to right.',
  wipeRight: 'The element is uncovered from right to left.',
  wipeUp: 'The element is uncovered from the bottom as it moves upward into place.',
  iris: 'A circular opening grows from the center to reveal the element as it gently enlarges.',
  flipX: 'The element folds into view around a horizontal axis, briefly passes its final angle and settles.',
  flipY: 'The element turns into view around a vertical axis, briefly passes its final angle and settles.',
  hinge: 'The element unfolds from its top edge with a small back-and-forth settling motion.',
  tilt: 'A small, tilted and blurred element turns toward the viewer, sharpens and settles at full size.',
  spring: 'The element grows from a small size, bounces through several sizes and settles into place.',
  drop: 'The element drops from above, squashes on arrival, bounces up and settles.',
  rubber: 'The element appears while stretching and squeezing in alternating directions.',
  jelly: 'The element slides in from the left with a soft side-to-side lean before settling.',
  pulse: 'The element grows and returns to its normal size twice, with a smaller second pulse.',
  shake: 'The element shakes from side to side, with gradually smaller movements.',
  wobble: 'The element moves side to side while tilting, then settles back into place.',
  tada: 'The element shrinks slightly, grows and rocks from side to side before returning to normal.',
  float: 'The element gently rises and returns to its starting position during each cycle.',
  sway: 'The element swings to either side around its top edge and returns to its starting angle.',
  breathe: 'The element gently grows and returns to its original size during each cycle.',
  orbit: 'The element follows a small loop to the right and returns to its starting position.',
  fadeOut: 'The element gradually disappears without moving.',
  slideOut: 'The element moves downward while disappearing.',
  zoomOut: 'The element shrinks, becomes blurred and disappears.',
  flipOut: 'The element turns away around a vertical axis, shrinks and disappears.',
}
const uses = {
  'Basic entrances': 'Introducing headings, images, cards or content sections.',
  'SVG drawing': 'Illustrating a path, progress or a completed step with an outline.',
  Bars: 'Revealing simple visual comparisons or decorative bars.',
  'Segmented text': 'Introducing a short headline or a small amount of supporting text.',
  'Animated backgrounds': 'Adding subtle movement behind a short section; keep reading contrast clear.',
  'Group sequences': 'Introducing related cards, steps or short items in an intentional order.',
  Reveals: 'Uncovering a heading, image or section with a clear focal point.',
  '3D entrances': 'Giving a featured card or image a turning entrance.',
  'Elastic entrances': 'Giving a short entrance a playful, springy finish.',
  Emphasis: 'Briefly drawing attention to an element that is already visible.',
  Cycles: 'Adding a gentle repeating accent to an illustration or decorative element.',
  Exits: 'Ending a visual sequence by removing an element from view.',
}
function describeBasic(config) {
  const travel = [config.fromY < 0 ? 'above' : config.fromY > 0 ? 'below' : '', config.fromX < 0 ? 'the left' : config.fromX > 0 ? 'the right' : ''].filter(Boolean)
  const actions = []
  if (travel.length) actions.push(`moves into place from ${travel.join(' and ')}`)
  if (config.scaleFrom < 1) actions.push('grows to its final size')
  if (config.scaleFrom > 1) actions.push('shrinks to its final size')
  if (config.rotateFrom) actions.push(`turns ${Math.abs(config.rotateFrom)} degrees into its final orientation`)
  if (config.opacityFrom < 1) actions.push(config.opacityFrom === 0 ? 'fades into view' : 'becomes fully visible')
  let text = `The element ${actions.join(', ').replace(/, ([^,]*)$/, ' and $1') || 'stays in place'}.`
  if (config.overshoot > 0) text += travel.length ? ' It briefly moves past its destination before settling.' : ' It briefly grows beyond its final size before settling.'
  return text
}
export function animationGuideEntry(name, config) {
  const definition = motions[config.motion]
  const category = config.category || 'Basic entrances'
  const controls = ['Duration', 'Delay', 'Easing']
  if (!definition) {
    if (config.fromX || config.fromY) controls.push('From X / From Y', 'Distance unit')
    if (config.scaleFrom !== 1) controls.push('Scale from')
    if (config.rotateFrom) controls.push('Rotation')
    if (config.opacityFrom !== 1) controls.push('Opacity from')
    if (config.overshoot) controls.push('Rebound')
  } else {
    if (definition.frames.some(frame => ['x', 'y', 'rotate', 'rx', 'ry', 'scale', 'sx', 'sy', 'skew', 'blur'].some(key => frame[key] !== undefined))) controls.push('Intensity')
    if (definition.frames.some(frame => frame.x || frame.y)) controls.push('Distance unit')
    if (definition.target === 'parts') controls.push('Stagger between items')
    if (definition.elementType === 'bars') controls.push('Number of bars')
    if (definition.elementType === 'svg') controls.push('Stroke width')
    if (definition.elementType === 'gradient') controls.push('Gradient colors')
    if (['segmented', 'sequence'].includes(definition.elementType)) controls.push('Text content')
  }
  if (!propertyRelevance(config).origin) controls.push('Transform origin')
  if (config.iterations > 1) controls.push('Repetitions', 'Pause per cycle')
  return { name, category, description: definition ? motionDescriptions[config.motion] : describeBasic(config), goodFor: uses[category], controls,
    note: name === 'Flip In' ? 'This is a flat turn. Use Flip X 3D or Flip Y 3D for a folding effect.' : name === 'Stagger Ready' ? 'This preset moves the whole element. Use a group sequence for separately timed items.' : name === 'Gentle Float' ? 'This is a single entrance. Use Floating Cycle for a repeating up-and-down motion.' : category === 'Exits' ? 'The element ends hidden with the default direction. Replay to see it again.' : null }
}
export const animationGuide = Object.entries(presets).map(([name, config]) => animationGuideEntry(name, config))
