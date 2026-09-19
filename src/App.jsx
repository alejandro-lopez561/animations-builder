import BuilderPanel from "./components/BuilderPanel/BuilderPanel"

import PreviewStage from "./components/PreviewStage/PreviewStage"

import CssOutput from "./components/CssOutput/CssOutput"

import {useAnimationBuilder} from "./hooks/useAnimationBuilder"

export default function App() {

  const {
    config,
    update,
    playKey,
    replay,
    generatedCSS,
    keyframes,
    setConfig,
  } = useAnimationBuilder()

  return (
    <div className="app">
      <div className="app-container">
        <div className="builder-layout">
          <BuilderPanel
            config={config}
            update={update}
            replay={replay}
            setConfig={setConfig}
          />
        </div>

        <style>
          {keyframes}
        </style>

        <div className="workspace">
          <PreviewStage
            config={config}
            playKey={playKey}
          />

          <CssOutput
            generatedCSS={generatedCSS}
          />
        </div>
      </div>
    </div>
  )
}