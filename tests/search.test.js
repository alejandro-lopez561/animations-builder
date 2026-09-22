import test from 'node:test'
import assert from 'node:assert/strict'
import { searchPresets } from '../src/utils/searchPresets.js'
test('search matches names and effects immediately, ignoring case and accents', () => {
  assert.ok(searchPresets({query:'  fade UP '}).some(([name])=>name==='Fade Up'))
  assert.equal(searchPresets({query:'énfasis'}).length,4)
  assert.equal(searchPresets({query:'zz-no-effect'}).length,0)
})
test('quick filters and advanced filters compose and reset to the full catalog', () => {
  assert.equal(searchPresets().length,77)
  assert.equal(searchPresets({quick:'exits'}).length,4)
  assert.equal(searchPresets({quick:'text'}).length,4)
  assert.equal(searchPresets({quick:'exits',category:'Bars'}).length,0)
  const svg=searchPresets({type:'svg'})
  assert.ok(svg.some(([name])=>name==='Fade Up'))
  assert.ok(svg.some(([name])=>name==='SVG Line Draw'))
  assert.ok(!svg.some(([name])=>name==='Bar Grow Up'))
})
test('sorting is deterministic and does not mutate catalog', () => {
  const duration=searchPresets({sort:'duration'})
  assert.ok(duration.every(([,p],i)=>i===0 || p.duration>=duration[i-1][1].duration))
  const names=searchPresets({sort:'name'}).map(([name])=>name)
  assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)))
})
