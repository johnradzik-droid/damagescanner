export function makeSamplePhoto(label: string, seed: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 960;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;

  const sky = ctx.createLinearGradient(0, 0, 0, 960);
  sky.addColorStop(0, `hsl(${hue}, 18%, 28%)`);
  sky.addColorStop(1, `hsl(${hue}, 12%, 12%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 960);

  ctx.fillStyle = "#1b1f18";
  ctx.fillRect(0, 640, 1280, 320);

  ctx.fillStyle = `hsl(${(hue + 40) % 360}, 10%, 22%)`;
  roundRect(ctx, 180, 250, 920, 380, 48);
  ctx.fill();

  ctx.fillStyle = "#0e1116";
  roundRect(ctx, 260, 290, 760, 160, 16);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(360, 640, 70, 0, Math.PI * 2);
  ctx.arc(920, 640, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffe14a";
  ctx.font = "700 56px system-ui, sans-serif";
  ctx.fillText("SAMPLE LOT PHOTO", 80, 90);
  ctx.fillStyle = "#f6f3eb";
  ctx.font = "700 72px system-ui, sans-serif";
  ctx.fillText(label, 80, 180);

  return canvas.toDataURL("image/jpeg", 0.82);
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
