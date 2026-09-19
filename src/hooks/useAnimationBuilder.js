import { useMemo, useState } from "react"
import { presets } from "../data/presets"
import { generateCss } from "../utils/generateCss"
import { generateKeyframes }from "../utils/generateKeyframes"

export function useAnimationBuilder() {

  const [config, setConfig] = useState(presets["Slide + Bounce"])
  const [playKey, setPlayKey] = useState(0)
  const generatedCSS = useMemo(() => generateCss(config),[config])
  const keyframes = useMemo(() => generateKeyframes(config),[config])

  const replay = () => setPlayKey(prev => prev + 1)
  const update = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  return {
    config,
    update,
    playKey,
    replay,
    generatedCSS,
    keyframes,
    setConfig,
  }
}