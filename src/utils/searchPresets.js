import { presets } from '../data/presets.js'
import { motions } from '../data/motions.js'
export const presetCategories = ['Basic entrances', ...new Set(Object.values(presets).map(p => p.category).filter(Boolean))]
const entrances = new Set(['Basic entrances', 'Reveals', '3D entrances', 'Elastic entrances'])
const aliases = {
  'Basic entrances': 'entrada aparecer desvanecer desplazar escala',
  Reveals: 'entrada revelar recorte', '3D entrances': 'entrada giro perspectiva',
  'Elastic entrances': 'entrada rebote elastico', Emphasis: 'enfasis pulso sacudir',
  Exits: 'salida desaparecer', 'Segmented text': 'texto palabras letras lineas',
  'SVG drawing': 'svg dibujo trazo', Bars: 'barras crecer',
  'Animated backgrounds': 'fondo gradiente brillo', 'Group sequences': 'grupo secuencia', Cycles: 'ciclo repetir flotar',
}
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export function searchPresets({ query = '', quick = 'all', category = 'all', type = 'all', sort = 'catalog' } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const matches = Object.entries(presets).filter(([name, preset]) => {
    const family = preset.category || 'Basic entrances'
    const required = motions[preset.motion]?.elementType || 'generic'
    const text = normalize(`${name} ${family} ${required} ${aliases[family] || ''}`)
    const quickMatch = quick === 'all' || (quick === 'entrances' && entrances.has(family)) || (quick === 'exits' && family === 'Exits') || (quick === 'emphasis' && family === 'Emphasis') || (quick === 'text' && required === 'segmented')
    const typeMatch = type === 'all' || required === 'generic' || required === type
    return terms.every(term => text.includes(term)) && quickMatch && typeMatch && (category === 'all' || category === family)
  })
  if (sort === 'name') matches.sort(([a],[b]) => a.localeCompare(b))
  if (sort === 'duration') matches.sort(([,a],[,b]) => a.duration - b.duration)
  return matches
}
