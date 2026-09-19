export function generateCss(config) {
  const animationName = config.name || "customMotion"
  const bounceFrame = config.overshoot > 0 ? 
    `
      60% {
        transform: translate3d(${config.overshoot}px,0,0) scale(1) rotate(0deg);
        opacity: 1;
      }
    ` : ""

  return `
    .${animationName} {
      opacity: ${config.opacityFrom};
      animation: ${animationName} ${config.duration}ms ${config.easing} forwards;
      will-change: transform, opacity;
    }

    @keyframes ${animationName} {
      0% {
        transform: translate3d(${config.fromX}px, ${config.fromY}px, 0) scale(${config.scaleFrom}) rotate(${config.rotateFrom}deg);
        opacity: ${config.opacityFrom};
      }
      ${bounceFrame}
      100% {
        transform: translate3d(0,0,0) scale(1) rotate(0deg);
        opacity: 1;
      }
    }
  `
}