import { motions } from '../data/motions'
import { motionDefaults } from '../data/motions'
import { useRef, useState } from 'react'
import { presets, customPreset } from '../data/presets'
import { generateScene } from '../utils/generateScene'
import { createElement } from '../utils/createElement'

export function useAnimationBuilder() {
  const [elements, setElements] = useState(() => [createElement(1)])
  const [active, setActive] = useState('element1')
  const nextId = useRef(2)
  const [playKey, setPlayKey] = useState(0)
  const replay = () => setPlayKey(key => key + 1)
  const change = (id, transform) => setElements(previous => previous.map(element => element.id === id ? transform(element) : element))
  const update = (key, value) => {
    change(active, element => ({ ...element, config: { ...element.config, [key]: value }, preset: ['trigger', 'unit', 'position', 'zIndex'].includes(key) ? element.preset : '' }))
    replay()
  }
  const selectPreset = name => {
    change(active, element => ({ ...element,
      appearance: { ...element.appearance, type: motions[presets[name]?.motion]?.elementType || element.appearance.type },
      config: { ...element.config, ...motionDefaults, ...(name ? presets[name] : customPreset), unit: 'px' }, preset: name,
    }))
    replay()
  }
  const addElement = () => {
    const element = createElement(nextId.current++)
    setElements(previous => [...previous, element])
    setActive(element.id)
    replay()
  }
  const removeElement = () => {
    if (elements.length === 1) return
    setElements(previous => previous.filter(element => element.id !== active))
    setActive(elements.find(element => element.id !== active).id)
    replay()
  }
  const setAppearance = (transform, id = active) => {
    change(id, element => {
      const appearance = transform(element.appearance)
      const requiredType = motions[element.config.motion]?.elementType
      const incompatible = requiredType && appearance.type !== requiredType
      return { ...element, appearance,
        config: incompatible ? { ...element.config, motion: 'basic' } : element.config,
        preset: incompatible ? '' : element.preset,
      }
    })
    replay()
  }
  return {
    ...elements.find(element => element.id === active),
    update, selectPreset, replay, playKey, active, setActive,
    addElement, removeElement, setAppearance, scene: elements,
    ...generateScene(elements),
  }
}
