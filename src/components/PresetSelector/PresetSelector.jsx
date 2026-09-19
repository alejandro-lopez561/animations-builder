import { presets }
  from "../../data/presets"

export default function PresetSelector({
  setConfig,
}) {

  return (

    <select
      onChange={(e) => setConfig(presets[e.target.value])}
    >

      {
        Object.keys(presets)
          .map((preset) => (

          <option key={preset} value={preset}>
            {preset}
          </option>

        ))
      }

    </select>

  )

}