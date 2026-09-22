import test from 'node:test'
import assert from 'node:assert/strict'
import { parseProject, serializeProject, duplicateElement, moveElement } from '../src/utils/project.js'
import { createElement } from '../src/utils/createElement.js'
import { generateScene } from '../src/utils/generateScene.js'
import { getParts, specialMarkup } from '../src/utils/specialMarkup.js'
import { generateCss } from '../src/utils/generateCss.js'
import { presets } from '../src/data/presets.js'
import { timing } from '../src/utils/timing.js'
const element = (preset = 'Words Rise', name = 'group', type = 'segmented') => ({ ...createElement(1), config: { ...createElement(1).config, ...presets[preset], name }, appearance: { type, text: 'One two three', barCount: 5 } })

test('project roundtrip preserves content, motion, selection and editable settings', () => {
  const a = element(), b = { ...element('Fade Up', 'fade', 'text'), id: 'element2', modified: true }
  b.config.cyclePause = 300; b.config.includeAppearance = false
  const restored = parseProject(serializeProject([a,b], b.id))
  assert.equal(restored.active, 'element2')
  assert.equal(restored.elements[0].appearance.barCount, 5)
  assert.equal(restored.elements[1].config.cyclePause, 300)
  assert.equal(restored.elements[1].config.includeAppearance, false)
  assert.equal(restored.elements[1].modified, true)
})
test('invalid imports reject unsupported documents and sanitize executable CSS or image fields', () => {
  assert.throws(() => parseProject('{}'))
  assert.throws(() => parseProject('{'))
  const a = element()
  a.config.easing = 'linear; background:url(https://example.com)'
  a.config.duration = -50; a.config.unit = 'px; color:red'
  a.appearance.type = 'image'; a.appearance.image = 'javascript:alert(1)'; a.appearance.gradientStart = 'red;}'
  const out = parseProject({ version:1, elements:[a] }).elements[0]
  assert.equal(out.config.easing, 'linear')
  assert.equal(out.config.duration, 0)
  assert.equal(out.config.unit, 'px')
  assert.equal(out.appearance.type, 'segmented')
  assert.equal(out.appearance.image, '')
})
test('duplicate and reorder retain independent configuration without mutating originals', () => {
  const a = element(), b = duplicateElement(a, 2)
  b.appearance.text = 'Changed'
  assert.equal(a.appearance.text, 'One two three')
  assert.notEqual(a.config.name, b.config.name)
  assert.deepEqual(moveElement([a,b], a.id, 1), [b,a])
  assert.deepEqual(moveElement([a,b], a.id, -1), [a,b])
})
test('all special content types export structure even with generic motion', () => {
  for (const type of ['svg','bars','segmented','sequence','gradient']) {
    const a = element('Fade Up','generic',type)
    const scene = generateScene([a])
    assert.ok(scene.exports[0].markup)
    assert.match(scene.css, /@keyframes generic/)
    if (type === 'svg') assert.match(scene.css, /stroke-dashoffset: 0/)
  }
})
test('single-line and empty sequence content is respected; graphemes remain intact', () => {
  assert.deepEqual(getParts({text:'One item'}, {elementType:'sequence'}), ['One item'])
  assert.deepEqual(getParts({text:''}, {elementType:'sequence'}), [])
  assert.deepEqual(getParts({text:'👩‍💻á'}, {variant:'letters'}), ['👩‍💻','á'])
})
test('derived animation names cannot collide with another root or derived name', () => {
  const a = element(); a.config.iterations = 2
  const b = { ...element('Fade Up','group-part-1','text'), id:'element2' }
  for (const entries of [[a,b], [b,a]]) {
    const css = generateScene(entries).css
    const names = [...css.matchAll(/@keyframes ([^ ]+)/g)].map(m => m[1])
    assert.equal(new Set(names).size, names.length)
  }
})
test('component sample presentation can be excluded without removing motion or structural SVG rules', () => {
  const a = element('Bar Grow From Left','bars','bars'); a.config.includeAppearance = false
  const css = generateCss(a.config, '', a.appearance)
  assert.doesNotMatch(css, /width: 240px|height: 180px|background: #8b5cf6|border-radius/)
  assert.match(css, /flex-direction: column/)
  assert.match(css, /@keyframes bars/)
})
test('pause expands cycles and preserves active movement duration across basic, SVG and parts', () => {
  for (const [preset,type] of [['Fade Up','text'],['SVG Line Draw','svg'],['Words Rise','segmented']]) {
    const a = element(preset, 'paused', type)
    Object.assign(a.config, { duration:1000, stagger:200, cyclePause:500, iterations:2 })
    const t = timing(a.config,a.appearance)
    assert.equal(t.cycle, type === 'segmented' ? 1900 : 1500)
    const css = generateCss(a.config,'',a.appearance)
    assert.ok(css.includes(`${t.cycle}ms`))
    assert.doesNotMatch(css,/undefined|NaN/)
    assert.match(css,/100% \{/)
  }
})
test('bar count and SVG thickness are reflected in export; comments and text cannot escape', () => {
  const a = element('Bar Grow From Left','bars','bars')
  assert.equal((specialMarkup(a.config,a.appearance,'bars').match(/<span/g)||[]).length, 5)
  a.label = '*/ body { display:none } /*'
  assert.ok(generateScene([a]).css.startsWith('/* * /'))
  const svg = element('SVG Line Draw','line','svg'); svg.appearance.strokeWidth = 9
  assert.match(generateScene([svg]).css,/stroke-width: 9/)
})

test('import rejects inherited object keys as preset or motion identifiers', () => {
  const a = element(); a.config.motion = '__proto__'; a.preset = 'constructor'
  const restored = parseProject({version:1, elements:[a]}).elements[0]
  assert.equal(restored.config.motion, 'basic')
  assert.equal(restored.preset, '')
  assert.doesNotThrow(() => generateScene([restored]))
})
