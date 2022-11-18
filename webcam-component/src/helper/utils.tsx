import hexRgb from 'hex-rgb';

export const groupBy = <T, K extends keyof any>(f: (p: T) => K, arr: T[]) => arr.reduce((acc, val) => {
  const key = f(val);
  acc[key] ? acc[key].push(val) : (acc[key] = [val])
  return acc;
}, {} as Record<K, T[]>);

export const getRest = (i: number, max: number) => ((max + i % max) % max);

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const raf = new class RAF extends Set<Function> {
  private playing: boolean = true;
  constructor() {
    super();

    const self = this;
    requestAnimationFrame(function draw(){
      self.playing && self.forEach(f => f());
      requestAnimationFrame(draw);
    });
  }
  on() {
    this.playing = true;
  }
  off() {
    this.playing = false;
  }
}

export const flipX = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.translate(ctx.canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
};

export function colorize(ctx: CanvasRenderingContext2D, colorHex: string) {
  const {red: r, green: g, blue: b, alpha}: {red: number; green: number; blue: number, alpha: number} = hexRgb(colorHex);
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const pixels = imageData.data;
  
  for (let i = 0; i < pixels.length; i += 4) {
    const per = pixels[i] / 255;
    pixels[i] = r + (255 - r) * per;
    pixels[i + 1] = g + (255 - g) * per;
    pixels[i + 2] = b + (255 - b) * per;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function threshold( ctx: CanvasRenderingContext2D, threshold: number ) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const pixels = imageData.data;
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
  
    // thresholding the current value
    const v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
    
    pixels[i] = pixels[i+1] = pixels[i+2] = v  
  }
  ctx.putImageData(imageData, 0, 0)
};

export const composedFilter = (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
  const minRGB = hexRgb(color1);
  const maxRGB = hexRgb(color2);
  const getBrightnessWeight = (red: number, green: number, blue: number) => (red + green + blue) / 3 / 255;

  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  for(let i = 0; i < data.length; i += 4){
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightnessWeight = getBrightnessWeight(r, g, b);
  
    imageData.data[i] = minRGB.red + (maxRGB.red - minRGB.red) * brightnessWeight;
    imageData.data[i + 1] = minRGB.blue + (maxRGB.blue - minRGB.blue) * brightnessWeight;
    imageData.data[i + 2] = minRGB.green + (maxRGB.green - minRGB.green) * brightnessWeight;
  }

  ctx.putImageData(imageData, 0, 0);
}

export const grayscale = (ctx: CanvasRenderingContext2D) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  for(let i = 0; i < data.length; i += 4){
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const value = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[i] = data[i + 1] = data[i + 2] = value;
  }

  ctx.putImageData(imageData, 0, 0);
}
