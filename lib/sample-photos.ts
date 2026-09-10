export function makeSamplePhoto(label: string, seed: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;

  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, `hsl(${hue}, 18%, 28%)`);
  sky.addColorStop(1, `hsl(${hue}, 12%, 12%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 960, 720);

  ctx.fillStyle = "#1b1f18";
  ctx.fillRect(0, 480, 960, 240);

  ctx.fillStyle = `hsl(${(hue + 40) % 360}, 10%, 22%)`;
  roundRect(ctx, 140, 190, 680, 280, 36);
  ctx.fill();

  ctx.fillStyle = "#0e1116";
  roundRect(ctx, 200, 220, 560, 120, 14);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(270, 480, 52, 0, Math.PI * 2);
  ctx.arc(690, 480, 52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffe14a";
  ctx.font = "700 42px system-ui, sans-serif";
  ctx.fillText("SAMPLE LOT PHOTO", 60, 70);
  ctx.fillStyle = "#f6f3eb";
  ctx.font = "700 54px system-ui, sans-serif";
  ctx.fillText(label, 60, 140);

  return canvas.toDataURL("image/jpeg", 0.7);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
