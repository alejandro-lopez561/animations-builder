import Control
  from "../Controls/Control"

import PresetSelector
  from "../PresetSelector/PresetSelector"

export default function BuilderPanel({

  config,
  update,
  replay,
  setConfig

}) {

  return (

    <div className="panel">
      <div className="panel-content">
        <h1 className="panel-title">
          Animation Builder
        </h1>

        <p className="panel-description">
          Create custom animations and export the CSS code.
        </p>
      </div>
      <p>Select a preset animation</p>
      <PresetSelector
        setConfig={setConfig}
      />

      <Control
        label="Animation Class Name"
        type="text"
        value={config.name}
        onChange={(v) =>
          update("name", v)
        }
      />

      <Control
        label="From X"
        value={config.fromX}
        onChange={(v) =>
          update(
            "fromX",
            Number(v)
          )
        }
      />

      <Control
        label="From Y"
        value={config.fromY}
        onChange={(v) =>
          update(
            "fromY",
            Number(v)
          )
        }
      />

      <Control
        label="Duration"
        value={config.duration}
        onChange={(v) =>
          update(
            "duration",
            Number(v)
          )
        }
      />

       <Control
        label="Scale From"
        value={config.scaleFrom}
        onChange={(v) => update('scaleFrom', Number(v))}
        step="0.1"
      />

      <Control
        label="Rotate From"
        value={config.rotateFrom}
        onChange={(v) => update('rotateFrom', Number(v))}
      />

      <Control
        label="Opacity From"
        value={config.opacityFrom}
        onChange={(v) => update('opacityFrom', Number(v))}
        step="0.1"
      />
      
      <Control
        label="Bounce Overshoot"
        value={config.overshoot}
        onChange={(v) => update('overshoot', Number(v))}
      />

      <div>
        <label>Easing</label>

        <select
          value={config.easing}
          onChange={(e) => update('easing', e.target.value)}
          className="w-full border rounded-xl p-3"
        >
          <option value="ease">ease</option>
          <option value="ease-out">ease-out</option>
          <option value="ease-in">ease-in</option>
          <option value="ease-in-out">ease-in-out</option>
          <option value="linear">linear</option>
          <option value="cubic-bezier(0.22, 1, 0.36, 1)">
            enterprise smooth
          </option>
          <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">
            bounce snappy
          </option>
        </select>
      </div>

      <button
        className="button replay-button"
        onClick={replay}>
        Replay Animation
      </button>

    </div>

  )

}