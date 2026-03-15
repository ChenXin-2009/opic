export const PLAYER_CONFIG = {
  ship: {
    size: 0.0004,
    color: 0x7ee8ff,
    glowColor: 0x2bd6ff,
  },
  physics: {
    maxStepSeconds: 1 / 60,
    thrustAUPerSec2: 8e-10,
    strafeMultiplier: 0.6,
    liftMultiplier: 0.6,
    boostMultiplier: 4,
    linearDamping: 0.0,
    maxSpeedAUPerSec: null as number | null,
  },
  rotation: {
    pitchRadPerSec: 0.9,
    yawRadPerSec: 0.9,
    rollRadPerSec: 1.2,
  },
  gravity: {
    minDistanceAU: 0.00005,
    radiusFactor: 0.6,
  },
  camera: {
    distanceAU: 0.0006,
    heightAU: 0.0002,
    sideAU: 0.0,
    lookAheadAU: 0.0006,
    followLerp: 6,
  },
  spawn: {
    offsetAU: 0.002,
    velocitySampleSeconds: 300,
  },
  controls: {
    toggleKey: 'KeyP',
  },
};
