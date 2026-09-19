export function generateKeyframes(config) {

  const animationName =
    config.name || "customMotion"

  return `
    @keyframes ${animationName} {
      0% {
        transform: translate3d(${config.fromX}px, ${config.fromY}px, 0) scale(${config.scaleFrom}) rotate(${config.rotateFrom}deg);
        opacity: ${config.opacityFrom};
      }

      ${
        config.overshoot > 0 ? 
        `60% {
          transform: translate3d(${config.overshoot}px, 0, 0);
        }` : ""
      }

      100% {
        transform: translate3d(0,0,0);
        opacity:1;
      }
    }
  `
}