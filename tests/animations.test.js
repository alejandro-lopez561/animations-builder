import test from 'node:test'
import assert from 'node:assert/strict'
import { presets, customPreset } from '../src/data/presets.js'
import { generateCss, animationClasses } from '../src/utils/generateCss.js'
import { generateKeyframes, animationName } from '../src/utils/generateKeyframes.js'

const config = { ...presets['Slide + Bounce'], trigger: 'scroll', unit: 'px', delay: 250 }
test('AEM gates animation on inView and exports required classes', () => {
  const css = generateCss(config)
  assert.match(css, /\.abbv-animation\.slideBounce \{\s*opacity: 0;\s*animation-name: none;/)
  assert.match(css, /\.abbv-animation\.slideBounce\.inView \{/)
  assert.equal(animationClasses(config), 'abbv-animation inView slideBounce')
  assert.match(css, /1200ms ease-out 250ms 1 normal both/)
})
test('load mode does not depend on client classes', () => {
  const c = { ...config, trigger: 'load' }
  assert.doesNotMatch(generateCss(c), /inView|abbv-animation/)
  assert.equal(animationClasses(c), 'slideBounce')
})
test('preview and export use identical keyframes for every preset', () => {
  for (const preset of Object.values(presets)) {
    const c = { ...config, ...preset }
    assert.ok(generateCss(c).includes(generateKeyframes(c)))
    assert.ok(generateCss(c, '[data-animation-preview] ').includes(generateKeyframes(c)))
  }
})
test('reduced motion restores visibility even before activation', () => {
  assert.match(generateCss(config), /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(generateCss(config), /animation: none;\s*opacity: 1;\s*transform: none;/)
})
test('names cannot inject CSS and units are preserved', () => {
  assert.match(animationName({ name: '9 bad;} name' }), /^[a-zA-Z_][a-zA-Z0-9_-]*$/)
  assert.match(generateKeyframes({ ...config, unit: 'rem', fromX: -2 }), /translate3d\(-2rem, 0rem/)
})
test('vertical and scale presets rebound on the relevant axis', () => {
  assert.match(generateKeyframes({ ...config, fromX: 0, fromY: 100 }), /translate3d\(0px, -30px, 0\)/)
  assert.match(generateKeyframes({ ...config, fromX: 0, fromY: 0 }), /scale\(1.3\)/)
})

test('custom preset starts empty with all numeric settings at zero', () => {
  assert.equal(customPreset.name, '')
  for (const value of Object.values(customPreset)) if (typeof value === 'number') assert.equal(value, 0)
  assert.match(generateCss(customPreset), /customMotion 0ms linear 0ms/)
})
test('valid custom names are preserved without prefixes; reserved names are safe', () => {
  assert.equal(animationName({ name: 'heroReveal' }), 'heroReveal')
  assert.equal(animationName({ name: 'none' }), 'customMotion')
  assert.equal(animationName({ name: '' }), 'customMotion')
  assert.equal(animationName({ name: '123' }), 'customMotion')
})

test('unnamed fields stay empty but export receives usable automatic names', async () => {
  const { generateScene } = await import('../src/utils/generateScene.js')
  const scene = generateScene([{ id: 'text', label: 'Text', config: customPreset }])
  assert.equal(scene.exports[0].classes, '')
  assert.match(scene.css, /@keyframes customText/);
  assert.equal(scene.exports[0].copyClasses, 'customText');
  assert.equal(scene.error, '')
})
test('two elements export independent timings and resolve colliding names', async () => {
  const { generateScene } = await import('../src/utils/generateScene.js')
  const elements = [
    { id: 'text', label: 'Text', config: { ...config, name: 'headline', duration: 800 } },
    { id: 'extra', label: 'Second element', config: { ...config, name: 'picture', delay: 700, trigger: 'load' } },
  ]
  const scene = generateScene(elements)
  assert.equal(scene.error, '')
  assert.match(scene.css, /headline 800ms/)
  assert.match(scene.css, /picture 1200ms ease-out 700ms/)
  assert.equal(scene.exports[1].classes, 'picture')
  elements[1].config.name = 'headline'
  assert.match(generateScene(elements).css, /@keyframes headline-2/);
  assert.equal(generateScene(elements).exports[1].copyClasses, 'headline-2')
})

test('position and stacking export match the shared parent contract', async () => {
  const { generateScene } = await import('../src/utils/generateScene.js')
  const scene = generateScene([
    {id:'text',label:'Text',config:{...config,name:'text',position:'relative',zIndex:2}},
    {id:'extra',label:'Second element',config:{...config,name:'',position:'absolute',zIndex:-1}},
  ])
  assert.match(scene.css, /motion-container[\s\S]*isolation: isolate/)
  assert.match(scene.css, /position: absolute;\s*z-index: -1/)
  assert.match(scene.css, /position: relative;\s*z-index: 2/)
  assert.ok(scene.exports.every(e => e.copyClasses))
})

test('multiple elements have independent content and unique export names', async () => {
  const { createElement } = await import('../src/utils/createElement.js')
  const { generateScene } = await import('../src/utils/generateScene.js')
  const elements = Array.from({ length: 5 }, (_, index) => createElement(index + 1))
  assert.equal(elements[0].appearance.text, 'Abbvie — Animations Tool')
  elements[0].appearance.text = 'Custom text'
  elements[0].config.duration = 800
  elements[1].appearance.type = 'image'
  elements[2].appearance.type = 'background'
  assert.equal(elements[1].config.duration, 0)
  assert.equal(elements[3].appearance.text, 'Abbvie — Animations Tool')
  const output = generateScene(elements)
  assert.equal(new Set(output.exports.map(entry => entry.copyClasses)).size, 5)
  assert.equal((output.css.match(/@keyframes/g) || []).length, 5)
  assert.equal(generateScene(elements.filter(element => element.id !== 'element2')).exports.length, 4)
})

test('catalog contains 77 presets and 44 distinct multi-step effects', async () => {
  const { motions, advancedPresets } = await import('../src/data/motions.js')
  assert.equal(Object.keys(presets).length, 77)
  assert.equal(Object.keys(advancedPresets).length, 44)
  const outputs = new Set()
  for (const [motion, definition] of Object.entries(motions)) {
    const preset = advancedPresets[definition.label]
    assert.equal(definition.frames[0].at, 0)
    assert.equal(definition.frames.at(-1).at, 100)
    assert.ok(definition.frames.every((frame, index) => index === 0 || frame.at > definition.frames[index - 1].at))
    const css = generateCss({ ...preset, name: 'sameName' })
    assert.doesNotMatch(css, /undefined|NaN/)
    outputs.add(css)
    assert.ok(generateCss(preset).includes(generateKeyframes(preset)), motion)
  }
  assert.equal(outputs.size, 44)
})
test('advanced intensity, repetition and accessibility settings are exported', async () => {
  const { advancedPresets } = await import('../src/data/motions.js')
  const tilt = advancedPresets['Tilt And Focus']
  const css = generateCss({ ...tilt, intensity: 50, iterations: 'infinite', direction: 'alternate', delay: 300 })
  assert.match(css, /perspective\(800px\)/)
  assert.match(css, /rotateY\(-17.5deg\)/)
  assert.match(css, /blur\(4px\)/)
  assert.match(css, /300ms infinite alternate both/)
  assert.match(css, /filter: none;\s*clip-path: none;/)
  assert.match(generateCss(advancedPresets['Hinge Unfold']), /transform-origin: top center/)
})
test('cycle endpoints match and exits end hidden', async () => {
  const { motions } = await import('../src/data/motions.js')
  for (const definition of Object.values(motions)) {
    if (definition.category === 'Cycles') {
      const { at: firstAt, ...start } = definition.frames[0]
      const { at: lastAt, ...end } = definition.frames.at(-1)
      assert.equal(firstAt, 0); assert.equal(lastAt, 100)
      assert.deepEqual(start, end)
    }
    if (definition.category === 'Exits') assert.equal(definition.frames.at(-1).opacity, 0)
  }
})

test('scroll reveals remain hidden until inView is applied', async () => {
  const { advancedPresets } = await import('../src/data/motions.js')
  for (const preset of Object.values(advancedPresets).filter(p => p.category === 'Reveals')) {
    const css = generateCss({ ...preset, trigger: 'scroll' })
    assert.match(css, /opacity: 0;\s*animation-name: none;/)
    assert.match(css, /\.inView \{/)
  }
})

test('special presets generate the required HTML and scoped child animations', async () => {
  const { specialMotions } = await import('../src/data/specialMotions.js')
  const { advancedPresets } = await import('../src/data/motions.js')
  const { generateScene } = await import('../src/utils/generateScene.js')
  assert.equal(Object.keys(specialMotions).length, 20)
  for (const definition of Object.values(specialMotions)) {
    const config = { ...advancedPresets[definition.label], trigger: 'scroll' }
    const scene = generateScene([{id:'one',label:'One',config,appearance:{type:definition.elementType,text:'<Hello> & world'}}])
    assert.ok(scene.exports[0].markup)
    assert.doesNotMatch(scene.css, /undefined|NaN/)
    assert.match(scene.css, /\.inView/)
    if (definition.target === 'stroke') {
      assert.match(scene.exports[0].markup, /pathLength="100"/)
      assert.match(scene.css, /stroke-dasharray: 100/)
      assert.match(scene.css, /stroke-dashoffset: 0/)
    }
    if (definition.target === 'parts') {
      assert.match(scene.exports[0].markup, /motion-part/)
      assert.match(scene.css, /animation-delay: calc\(/)
    }
  }
})
test('text markup is escaped and reverse sequences have descending order', async () => {
  const { specialMarkup } = await import('../src/utils/specialMarkup.js')
  const { advancedPresets } = await import('../src/data/motions.js')
  const html = specialMarkup(advancedPresets['Words Rise'], {text:'<script>alert</script>'}, 'words')
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
  const reverse = specialMarkup(advancedPresets['Sequence Reverse'], {text:'A\nB\nC'}, 'reverse')
  assert.ok(reverse.indexOf('--motion-order: 2') < reverse.indexOf('--motion-order: 0'))
})
