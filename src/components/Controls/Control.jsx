export default function Control({
  label,
  value,
  onChange,
  type = "number",
  step = "1",
}) {

  return (
    <div className="control-group">

      <label className="control-label">
        {label}
      </label>

      <input
        className="control-input"
        type={type}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  )

}