/**
 * Animation utilities and timing functions
 */

export const Animations = {
  // Timing values (in ms)
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  
  // Spring animation configs
  SPRING_QUICK: {
    speed: 15,
    bounciness: 10,
  },
  SPRING_SOFT: {
    speed: 12,
    bounciness: 8,
  },
  SPRING_BOUNCY: {
    speed: 10,
    bounciness: 12,
  },
  
  // Easing functions
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number) => t * (2 - t),
  easeIn: (t: number) => t * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 + (--t) * t * t,
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
} as const;

export const AnimationPresets = {
  // Fade animations
  fadeIn: {
    duration: Animations.NORMAL,
    opacity: { from: 0, to: 1 },
  },
  fadeOut: {
    duration: Animations.NORMAL,
    opacity: { from: 1, to: 0 },
  },
  
  // Scale animations
  scaleIn: {
    duration: Animations.NORMAL,
    scale: { from: 0.9, to: 1 },
    opacity: { from: 0, to: 1 },
  },
  scaleOut: {
    duration: Animations.NORMAL,
    scale: { from: 1, to: 0.9 },
    opacity: { from: 1, to: 0 },
  },
  
  // Slide animations
  slideInUp: {
    duration: Animations.NORMAL,
    translateY: { from: 50, to: 0 },
    opacity: { from: 0, to: 1 },
  },
  slideOutUp: {
    duration: Animations.NORMAL,
    translateY: { from: 0, to: -50 },
    opacity: { from: 1, to: 0 },
  },
  slideInDown: {
    duration: Animations.NORMAL,
    translateY: { from: -50, to: 0 },
    opacity: { from: 0, to: 1 },
  },
  slideInLeft: {
    duration: Animations.NORMAL,
    translateX: { from: -50, to: 0 },
    opacity: { from: 0, to: 1 },
  },
  slideInRight: {
    duration: Animations.NORMAL,
    translateX: { from: 50, to: 0 },
    opacity: { from: 0, to: 1 },
  },
};
