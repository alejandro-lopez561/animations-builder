import test from 'node:test'
import assert from 'node:assert/strict'
import { presets, customPreset } from '../src/data/presets.js'
import { motionDefaults } from '../src/data/motions.js'
import { propertyRelevance } from '../src/utils/propertyRelevance.js'
import { animationGuide } from '../src/data/animationGuide.js'
import { presetCategories } from '../src/utils/searchPresets.js'

const basic = { ...motionDefaults, ...presets['Fade Left'] }
test('translation-only origin is irrelevant, but editable neutral controls are not', () => {
  const result = propertyRelevance(basic, { type: 'text' })
  assert.ok(result.origin)
  for (const key of ['fromX', 'fromY', 'scaleFrom', 'rotateFrom', 'opacityFrom', 'overshoot', 'unit', 'easing']) assert.equal(result[key], undefined, key)
  assert.equal(propertyRelevance({ ...basic, rotateFrom: 15 }).origin, undefined)
  assert.equal(propertyRelevance({ ...basic, scaleFrom: .8 }).origin, undefined)
  assert.ok(propertyRelevance({ ...basic, overshoot: 30 }).origin, 'translation rebound still does not use a pivot')
  assert.equal(propertyRelevance({ ...basic, fromX: 0, overshoot: 30 }).origin, undefined, 'scale rebound needs a pivot')
})
test('distance units follow actual generated translation and intensity rounding', () => {
  assert.ok(propertyRelevance({ ...basic, fromX: 0 }).unit)
  assert.equal(propertyRelevance({ ...basic, fromY: 12 }).unit, undefined)
  assert.ok(propertyRelevance({ ...presets['Words Rise'], intensity: 0 }).unit)
  assert.equal(propertyRelevance(presets['Words Rise']).unit, undefined)
})
test('advanced pivot relevance follows scale, skew and rotation, even constant rotation', () => {
  for (const name of ['Spring Settle', 'Jelly Slide', 'SVG Ring Draw', 'Flip X 3D']) {
    assert.equal(propertyRelevance(presets[name]).origin, undefined, name)
    assert.ok(propertyRelevance({ ...presets[name], intensity: 0 }).origin, name)
  }
  assert.ok(propertyRelevance(presets.Shake).origin)
  assert.equal(propertyRelevance({ ...presets['Spring Settle'], intensity: 0 }).intensity, undefined)
})
test('easing needs gradual change; direction needs different frames', () => {
  assert.ok(propertyRelevance({ ...basic, duration: 0 }).easing)
  assert.equal(propertyRelevance({ ...basic, duration: 0 }).direction, undefined)
  assert.ok(propertyRelevance({ ...basic, fromX: 0, opacityFrom: 1 }).direction)
  for (const name of ['SVG Line Draw', 'Wipe From Left', 'Gradient Horizontal']) assert.equal(propertyRelevance(presets[name]).easing, undefined, name)
})
test('stagger needs multiple parts, including reverse-order sequences', () => {
  assert.ok(propertyRelevance(presets['Bar Grow From Left'], { type: 'bars', barCount: 1 }).stagger)
  assert.equal(propertyRelevance(presets['Bar Grow From Left'], { type: 'bars', barCount: 2 }).stagger, undefined)
  assert.ok(propertyRelevance(presets['Sequence Reverse'], { type: 'sequence', text: 'One' }).stagger)
  assert.equal(propertyRelevance(presets['Sequence Reverse'], { type: 'sequence', text: 'One\nTwo' }).stagger, undefined)
})
test('appearance annotation applies only where export has no sample appearance', () => {
  assert.ok(propertyRelevance(basic, { type: 'image' }).includeAppearance)
  assert.equal(propertyRelevance(basic, { type: 'svg' }).includeAppearance, undefined)
  assert.equal(propertyRelevance(presets['SVG Line Draw']).includeAppearance, undefined)
})
test('custom defaults do not make starting-property controls irrelevant', () => {
  const result = propertyRelevance({ ...motionDefaults, ...customPreset })
  assert.ok(result.easing)
  assert.equal(result.origin, undefined, 'scale starts at zero and can use a pivot')
  for (const key of ['duration', 'fromX', 'fromY', 'rotateFrom', 'scaleFrom', 'overshoot', 'opacityFrom']) assert.equal(result[key], undefined)
})
test('documentation covers exactly the real catalog with real families and useful copy', () => {
  assert.deepEqual(animationGuide.map(entry => entry.name), Object.keys(presets))
  for (const entry of animationGuide) {
    assert.ok(presetCategories.includes(entry.category), entry.name)
    assert.ok(entry.description?.length > 20, entry.name)
    assert.ok(entry.goodFor?.length > 20, entry.name)
    assert.ok(entry.controls.length >= 3, entry.name)
  }
  assert.match(animationGuide.find(entry => entry.name === 'Fade Left').description, /from the right/)
  assert.match(animationGuide.find(entry => entry.name === 'Fade Right').description, /from the left/)
})
