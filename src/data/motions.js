import { specialMotions } from './specialMotions.js'

// Frames use percentages and complete neutral defaults in the generator.
const frame = (at, values = {}) => ({ at, ...values })
const finish = frame(100)
export const motions = {
  ...specialMotions,
  wipeLeft: { label: 'Wipe From Left', category: 'Reveals', frames: [frame(0, { clip: 'inset(0 100% 0 0)' }), frame(100, { clip: 'inset(0 0% 0 0)' })] },
  wipeRight: { label: 'Wipe From Right', category: 'Reveals', frames: [frame(0, { clip: 'inset(0 0 0 100%)' }), frame(100, { clip: 'inset(0 0 0 0%)' })] },
  wipeUp: { label: 'Wipe From Bottom', category: 'Reveals', frames: [frame(0, { clip: 'inset(100% 0 0 0)', y: 30 }), frame(100, { clip: 'inset(0% 0 0 0)' })] },
  iris: { label: 'Circular Reveal', category: 'Reveals', frames: [frame(0, { clip: 'circle(0% at 50% 50%)', scale: .85 }), frame(100, { clip: 'circle(150% at 50% 50%)' })] },
  flipX: { label: 'Flip X 3D', category: '3D entrances', frames: [frame(0, { rx: -85, opacity: 0 }), frame(65, { rx: 12 }), finish] },
  flipY: { label: 'Flip Y 3D', category: '3D entrances', frames: [frame(0, { ry: 85, opacity: 0 }), frame(65, { ry: -12 }), finish] },
  hinge: { label: 'Hinge Unfold', category: '3D entrances', origin: 'top center', frames: [frame(0, { rx: -90, opacity: 0 }), frame(60, { rx: 18 }), frame(82, { rx: -6 }), finish] },
  tilt: { label: 'Tilt And Focus', category: '3D entrances', frames: [frame(0, { ry: -35, rx: 20, scale: .75, blur: 8, opacity: 0 }), frame(70, { ry: 5, scale: 1.03 }), finish] },
  spring: { label: 'Spring Settle', category: 'Elastic entrances', frames: [frame(0, { scale: .2, opacity: 0 }), frame(45, { scale: 1.18 }), frame(65, { scale: .92 }), frame(82, { scale: 1.04 }), finish] },
  drop: { label: 'Drop And Settle', category: 'Elastic entrances', frames: [frame(0, { y: -160, opacity: 0 }), frame(45, { y: 0, sx: 1.12, sy: .85 }), frame(65, { y: -30 }), frame(82, { y: 0, sx: 1.04, sy: .96 }), finish] },
  rubber: { label: 'Rubber Entrance', category: 'Elastic entrances', frames: [frame(0, { scale: .6, opacity: 0 }), frame(40, { sx: 1.25, sy: .75 }), frame(60, { sx: .8, sy: 1.2 }), frame(80, { sx: 1.08, sy: .92 }), finish] },
  jelly: { label: 'Jelly Slide', category: 'Elastic entrances', frames: [frame(0, { x: -100, skew: 15, opacity: 0 }), frame(50, { x: 12, skew: -12 }), frame(70, { x: -6, skew: 6 }), frame(85, { skew: -3 }), finish] },
  pulse: { label: 'Double Pulse', category: 'Emphasis', frames: [frame(0), frame(20, { scale: 1.12 }), frame(40), frame(60, { scale: 1.08 }), finish] },
  shake: { label: 'Shake', category: 'Emphasis', frames: [frame(0), frame(15, { x: -12 }), frame(30, { x: 12 }), frame(45, { x: -9 }), frame(60, { x: 9 }), frame(75, { x: -4 }), finish] },
  wobble: { label: 'Wobble', category: 'Emphasis', frames: [frame(0), frame(20, { x: -18, rotate: -8 }), frame(40, { x: 14, rotate: 6 }), frame(60, { x: -8, rotate: -4 }), frame(80, { x: 4, rotate: 2 }), finish] },
  tada: { label: 'Tada', category: 'Emphasis', frames: [frame(0), frame(20, { scale: .9, rotate: -4 }), frame(40, { scale: 1.1, rotate: 4 }), frame(55, { scale: 1.1, rotate: -4 }), frame(70, { scale: 1.1, rotate: 4 }), finish] },
  float: { label: 'Floating Cycle', category: 'Cycles', duration: 2400, frames: [frame(0), frame(50, { y: -18 }), finish] },
  sway: { label: 'Sway Cycle', category: 'Cycles', duration: 2000, origin: 'top center', frames: [frame(0), frame(25, { rotate: 6 }), frame(75, { rotate: -6 }), finish] },
  breathe: { label: 'Breathing Cycle', category: 'Cycles', duration: 2600, frames: [frame(0), frame(50, { scale: 1.07 }), finish] },
  orbit: { label: 'Orbit Cycle', category: 'Cycles', duration: 2200, frames: [frame(0), frame(25, { x: 20, y: -20 }), frame(50, { x: 40 }), frame(75, { x: 20, y: 20 }), finish] },
  fadeOut: { label: 'Fade Out', category: 'Exits', frames: [frame(0), frame(100, { opacity: 0 })] },
  slideOut: { label: 'Slide Down Out', category: 'Exits', frames: [frame(0), frame(100, { y: 70, opacity: 0 })] },
  zoomOut: { label: 'Zoom Blur Out', category: 'Exits', frames: [frame(0), frame(100, { scale: .6, blur: 8, opacity: 0 })] },
  flipOut: { label: 'Flip Y Out', category: 'Exits', frames: [frame(0), frame(100, { ry: 90, scale: .8, opacity: 0 })] },
}

export const motionDefaults = { motion: 'basic', intensity: 100, iterations: 1, direction: 'normal', origin: 'center center', stagger: 100, cyclePause: 0 }
export const advancedPresets = Object.fromEntries(Object.entries(motions).map(([motion, definition]) => [definition.label, {
  ...motionDefaults, motion, name: motion, category: definition.category,
  fromX: 0, fromY: 0, scaleFrom: 1, rotateFrom: 0,
  opacityFrom: definition.category === 'Reveals' || definition.target === 'parts' ? 0 : definition.frames[0].opacity ?? 1, overshoot: 0,
  duration: definition.duration || 1000, delay: 0, easing: 'ease-in-out',
  iterations: ['Cycles', 'Animated backgrounds'].includes(definition.category) ? 3 : 1,
  origin: definition.origin || 'center center', stagger: definition.stagger ?? 100,
}]))
