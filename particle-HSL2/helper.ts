export const getRandomRGB = () =>
  `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256
  )}, ${Math.floor(Math.random() * 256)})`;

export const getRandomHSL = (s: number, l: number) =>
  `hsl(${360 * Math.random()},${s}%,${l}%)`;
export const getHSL = (h: number, s: number, l: number) =>
  `hsl(${h},${s}%,${l}%)`;

export const RGB2HSL = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;

  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return [h, s, l];
};
export const HUE2RGB = (p: number, q: number, t: number) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};
export const HSL2RGB = (h: number, s: number, l: number) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = HUE2RGB(p, q, h + 1 / 3);
    g = HUE2RGB(p, q, h);
    b = HUE2RGB(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
export const gcd = (a: number, b: number): number => {
  if (b === 0) return a;
  return gcd(b, a % b);
};
export const divisors = (n: number) =>
  <number[]>(
    Array.from({ length: n }, (_, i) => !(n % (i + 1)) && i + 1).filter(
      (val) => val
    )
  );
export const getRandItem = <T extends any>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const compCtx = (ctx: CanvasRenderingContext2D, brightness: number) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    if ((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 < brightness) {
      pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
};
