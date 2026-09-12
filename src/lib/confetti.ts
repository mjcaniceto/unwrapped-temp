import confetti from 'canvas-confetti';

const PALETTE = ['#FFD873', '#FFB4C8', '#A3E4C1', '#A8D6F5', '#FFC199', '#D3C3F5'];

export function fireFinaleConfetti() {
  const duration = 2600;
  const end = Date.now() + duration;

  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: PALETTE,
    shapes: ['square', 'circle'],
  });

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors: PALETTE,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors: PALETTE,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function fireBurst(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 40,
    spread: 70,
    origin: { x, y },
    colors: PALETTE,
    scalar: 0.8,
  });
}
