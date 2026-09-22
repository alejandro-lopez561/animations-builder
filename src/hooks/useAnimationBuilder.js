import { parseProject, serializeProject, storageKey, duplicateElement, moveElement } from '../utils/project'
import { motions } from '../data/motions'
import { motionDefaults } from '../data/motions'
import { useEffect, useRef, useState } from 'react'
import { presets, customPreset } from '../data/presets'
import { generateScene } from '../utils/generateScene'
import { createElement } from '../utils/createElement'
import { updateAppearance } from '../utils/updateAppearance'

export function useAnimationBuilder() {
  const [initial] = useState(() => {
    try { const saved = localStorage.getItem(storageKey); if (saved) return parseProject(saved) }
    catch { return { elements: [createElement(1)], active: 'element1', warning: 'Saved project could not be restored. Import a backup JSON to recover it.' } }
    return { elements: [createElement(1)], active: 'element1' }
  })
  const [elements, setElements] = useState(initial.elements)
  const [active, setActive] = useState(initial.active)
  const [projectStatus, setProjectStatus] = useState(initial.warning || 'Autosave is enabled on this browser.')
  const nextId = useRef(initial.elements.length + 1)
  const importBackup = useRef(null)
  useEffect(() => {
    if (initial.warning && elements === initial.elements && active === initial.active) return
    const timer = setTimeout(() => {
      try { localStorage.setItem(storageKey, serializeProject(elements, active)); setProjectStatus('Saved on this browser.') }
      catch { setProjectStatus('Local saving unavailable or full. Export JSON to keep your work.') }
    }, 0)
    return () => clearTimeout(timer)
  }, [elements, active, initial])
  const [playKey, setPlayKey] = useState(0)
  const replay = () => setPlayKey(key => key + 1)
  const change = (id, transform) => setElements(previous => previous.map(element => element.id === id ? transform(element) : element))
  const update = (key, value) => {
    change(active, element => ({ ...element, config: { ...element.config, [key]: value }, modified: true }))
    replay()
  }
  const selectPreset = name => {
    change(active, element => ({ ...element,
      appearance: { ...element.appearance, type: motions[presets[name]?.motion]?.elementType || element.appearance.type, variant: motions[presets[name]?.motion]?.variant || element.appearance.variant },
      config: { ...element.config, ...motionDefaults, ...(name ? presets[name] : customPreset), unit: 'px' }, preset: name, modified: false,
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
    change(id, element => updateAppearance(element, transform))
    replay()
  }
  const duplicate = () => {
    const copy = duplicateElement(elements.find(e => e.id === active), nextId.current++)
    setElements(previous => [...previous, copy]); setActive(copy.id); replay()
  }
  const move = offset => { setElements(previous => moveElement(previous, active, offset)); replay() }
  const rename = label => change(active, element => ({ ...element, label }))
  const importProject = async file => {
    if (!file) return
    try {
      if (file.size > 15000000) throw new Error('Project file is too large (15 MB maximum).')
      const project = parseProject(await file.text())
      // Keep the current project recoverable before replacing it.
      importBackup.current = serializeProject(elements, active)
      try { localStorage.setItem(`${storageKey}.backup`, importBackup.current) } catch { /* JSON export remains available. */ }
      setElements(project.elements); setActive(project.active); nextId.current = project.elements.length + 1
      setProjectStatus('Project imported.'); replay()
    } catch (error) { setProjectStatus(`Import failed: ${error.message}`) }
  }
  const restoreBackup = () => {
    try {
      const backup = importBackup.current || localStorage.getItem(`${storageKey}.backup`)
      if (!backup) throw new Error('No previous import backup available.')
      const project = parseProject(backup)
      setElements(project.elements); setActive(project.active); nextId.current = project.elements.length + 1; replay()
      setProjectStatus('Previous project restored.')
    } catch (error) { setProjectStatus(error.message) }
  }
  const exportProject = () => {
    const url = URL.createObjectURL(new Blob([serializeProject(elements, active)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'animation-builder.json'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return {
    duplicate, move, rename, importProject, exportProject, restoreBackup, projectStatus,
    ...elements.find(element => element.id === active),
    update, selectPreset, replay, playKey, active, setActive,
    addElement, removeElement, setAppearance, scene: elements,
    ...generateScene(elements),
  }
}
