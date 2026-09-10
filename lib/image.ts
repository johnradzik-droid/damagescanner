const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.76;

function canvasToJpeg(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

async function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<string> {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(source, 0, 0, w, h);
  return canvasToJpeg(canvas);
}

export async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const dataUrl = await drawToCanvas(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      return dataUrl;
    } catch {
      /* fall through to HTMLImageElement */
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read that photo"));
      img.src = objectUrl;
    });
    return await drawToCanvas(image, image.naturalWidth, image.naturalHeight);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((b64.length * 3) / 4);
}
