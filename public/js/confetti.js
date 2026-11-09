const canvas = document.querySelector("#confetti-canvas");
const context = canvas.getContext("2d");
const COLORS = ["#e64739", "#ffe291", "#50a76b", "#4a90d9", "#ec79a4", "#ffffff"];
const DURATION_MS = 5000;
let frameId = null;

export function stopConfetti() {
  cancelAnimationFrame(frameId);
  frameId = null;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

export function launchConfetti() {
  stopConfetti();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.6,
    size: 6 + Math.random() * 7,
    speed: 2 + Math.random() * 4,
    drift: Math.random() * 3 - 1.5,
    angle: Math.random() * Math.PI * 2,
    spin: Math.random() * 0.4 - 0.2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  const endTime = performance.now() + DURATION_MS;

  function draw(now) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let visible = 0;

    for (const piece of pieces) {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.angle += piece.spin;

      if (piece.y > canvas.height + 20) {
        if (now >= endTime) continue;
        piece.y = -20;
      }

      visible += 1;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
      context.restore();
    }

    if (visible > 0) frameId = requestAnimationFrame(draw);
    else stopConfetti();
  }

  frameId = requestAnimationFrame(draw);
}
