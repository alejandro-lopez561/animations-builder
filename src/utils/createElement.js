import { motionDefaults } from '../data/motions.js'
import { customPreset } from '../data/presets.js'

export function createElement(number) {
  return {
    id: `element${number}`, label: `Element ${number}`, preset: '',
    config: { ...customPreset, ...motionDefaults, trigger: 'load', unit: 'px', position: 'relative', zIndex: 0 },
    appearance: { type: 'text', text: 'Abbvie — Animations Tool', color: '#c4b5fd', image: '' },
  }
}
