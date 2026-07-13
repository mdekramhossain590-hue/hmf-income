import confetti from 'canvas-confetti';

/**
 * Triggers a simple standard confetti burst from the bottom center.
 */
export function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.75 },
    colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
  });
}

/**
 * Triggers a premium realistic confetti explosion with varied velocities and decays.
 */
export function triggerRealisticConfetti() {
  const count = 150;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
  };

  const fire = (particleRatio: number, opts: any) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  };

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Triggers a spectacular stream from both sides of the screen (Left and Right borders).
 * Runs for a specified duration in milliseconds (default: 1.5 seconds)
 */
export function triggerSchoolPrideConfetti(durationMs: number = 1500) {
  const end = Date.now() + durationMs;
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.85 },
      colors: colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.85 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Triggers continuous floating mini fireworks at random visual coordinates.
 */
export function triggerFireworksConfetti(durationMs: number = 2000) {
  const animationEnd = Date.now() + durationMs;
  const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 99 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 25 * (timeLeft / durationMs);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.15, 0.45), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.55, 0.85), y: Math.random() - 0.2 } });
  }, 200);
}
