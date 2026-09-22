import { presets } from '../src/data/presets.js'
import { motions } from '../src/data/motions.js'
import { generateScene } from '../src/utils/generateScene.js'
import { createElement } from '../src/utils/createElement.js'
const fixtures = document.querySelector('#fixtures')
const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
const assert = (value, message) => { if (!value) throw new Error(message) }
function fixture(config, appearance = {}) {
  const e = createElement(1)
  e.config = { ...e.config, ...config }; e.appearance = { ...e.appearance, ...appearance }
  const generated = generateScene([e])
  const holder = document.createElement('div'), style = document.createElement('style')
  style.textContent = generated.css
  holder.append(style)
  const content = document.createElement('div')
  content.innerHTML = generated.exports[0].markup || `<div class="${generated.exports[0].copyClasses}">Test content</div>`
  holder.append(content); fixtures.append(holder)
  const root = content.firstElementChild
  return { holder, style, root, animated: motions[config.motion]?.target === 'parts' ? [...root.children] : [motions[config.motion]?.target === 'stroke' ? root.firstElementChild : root] }
}
async function run() {
  const results = document.querySelector('#results'), status = document.querySelector('#status')
  results.replaceChildren(); fixtures.replaceChildren()
  let passed = 0, failed = 0
  async function check(name, fn) {
    const li = document.createElement('li')
    try { await fn(); passed++; li.textContent = `PASS: ${name}` }
    catch (error) { failed++; li.textContent = `FAIL: ${name}: ${error.message}` }
    results.append(li); fixtures.replaceChildren()
  }
  for (const [index, [name, preset]] of Object.entries(presets).entries()) {
    await check(`${name}: generated CSS creates an animation`, async () => {
      const f = fixture({ ...preset, name:`case${index}`, trigger:'load' }, { type:motions[preset.motion]?.elementType || 'text', text:'A B C' })
      await nextFrame()
      assert(f.animated.length > 0, 'No target')
      for (const target of f.animated) assert(target.getAnimations().length > 0 || matchMedia('(prefers-reduced-motion: reduce)').matches, 'No CSS animation created')
    })
  }
  await check('Repeated bars wait for every part, including the pause', async () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const f = fixture({ ...presets['Bar Grow From Left'], name:'timingBars', iterations:2, duration:1000, stagger:200, cyclePause:500 }, {type:'bars', barCount:3})
    await nextFrame()
    const animations = f.animated.map(e=>e.getAnimations()[0])
    for (const a of animations) { assert(a.effect.getTiming().duration === 1900, 'Wrong group cycle'); a.pause(); a.currentTime = 1700 }
    await nextFrame()
    for (const node of f.animated) assert(Math.abs(new DOMMatrix(getComputedStyle(node).transform).a - 1) < .01, 'A bar restarted during the hold')
    for (const a of animations) a.currentTime = 1950
    await nextFrame()
    assert(new DOMMatrix(getComputedStyle(f.animated[2]).transform).a < .01, 'Last bar did not wait in cycle two')
  })
  await check('Scroll CSS waits for inView and reduced motion keeps content visible', async () => {
    const f = fixture({...presets['Words Rise'],name:'scrollText',trigger:'scroll',iterations:2}, {type:'segmented',text:'A B C'})
    f.root.classList.remove('inView'); await nextFrame()
    assert(f.animated.every(e=>e.getAnimations().length===0), 'Animated before inView')
    f.root.classList.add('inView'); await nextFrame()
    assert(f.animated.every(e=>e.getAnimations().length>0) || matchMedia('(prefers-reduced-motion: reduce)').matches, 'Did not activate')
    f.style.textContent = f.style.textContent.replaceAll('@media (prefers-reduced-motion: reduce)', '@media all')
    await nextFrame()
    assert(f.animated.every(e=>getComputedStyle(e).opacity==='1' && e.getAnimations().length===0), 'Reduced motion did not override part animations')
  })
  await check('Generic SVG remains visible and exports a real path', async () => {
    const f = fixture({...presets['Fade Up'],name:'genericSvg'}, {type:'svg'})
    await nextFrame()
    assert(f.root.querySelector('path'), 'Missing path')
    assert(getComputedStyle(f.root.querySelector('path')).strokeDashoffset === '0px', 'Generic SVG path hidden')
  })
  status.textContent = `${passed} passed, ${failed} failed. ${navigator.userAgent}`
}
document.querySelector('#run').addEventListener('click', run)
