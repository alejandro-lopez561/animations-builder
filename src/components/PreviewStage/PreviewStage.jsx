export default function PreviewStage({
  playKey,
  config,
}) {

  const previewStyle = {

    animation: `${config.name} ${config.duration}ms ${config.easing} forwards`

  }

  return (

    <div className="preview-card">

      <div
        key={playKey}
        style={previewStyle}
        className="preview-content"
      >
        Abbvie - Animations Tool
      </div>

    </div>

  )

}