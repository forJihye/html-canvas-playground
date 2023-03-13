export const sleep = (ms) => new Promise(res => setTimeout(() => res(), ms))

export const loadImage = (src, ms = 10000) => {
  return new Promise(res => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src + '?date=' + Date.now();
    setTimeout(() => res(null), ms);
  });
}

export const drawCover = (
  ctx, 
  source,
  x = 0, 
  y = 0, 
  w = ctx.canvas.width, 
  h = ctx.canvas.height,
  offsetX = 0.5, 
  offsetY = 0.5
) => {
  offsetX = typeof offsetX === 'number' ? offsetX : 0.5
  offsetY = typeof offsetY === 'number' ? offsetY : 0.5

  if (offsetX < 0) offsetX = 0
  if (offsetY < 0) offsetY = 0
  if (offsetX > 1) offsetX = 1
  if (offsetY > 1) offsetY = 1

  let iw = source.width || (source).videoWidth;
  let ih = source.height || (source).videoHeight;
  let r = Math.min(w / iw, h / ih)
  let nw = iw * r
  let nh = ih * r
  let cx = 1
  let cy = 1
  let cw = 1
  let ch = 1
  let ar = 1

  if (nw < w) ar = w / nw                             
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh
  nw *= ar
  nh *= ar

  cw = iw / (nw / w)
  ch = ih / (nh / h)

  cx = (iw - cw) * offsetX
  cy = (ih - ch) * offsetY

  if (cx < 0) cx = 0
  if (cy < 0) cy = 0
  if (cw > iw) cw = iw
  if (ch > ih) ch = ih

  ctx.drawImage(source, cx, cy, cw, ch,  x, y, w, h)
};

export const flipX = (ctx) => {
  ctx.save();
  ctx.translate(ctx.canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
}

export const colorsize = (ctx, {r, g, b}) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const percent = data[i] / 255;
    data[i] = r + (255 - r) * percent;
    data[i + 1] = g + (255 - g) * percent;
    data[i + 2] = b + (255 - b) * percent;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export const setTransform = (ctx, { x, y }, f) => {
  ctx.save();
  ctx.translate(x, y);
  f();
  ctx.restore();
};

class AlphaRect {
  constructor (width, height) {
    this._width = width;
    this._height = height;
    this.minX = width;
    this.minY = height;
    this.maxX = 0;
    this.maxY = 0;
  }
  push(index) {
    const x = index % this._width;
    const y = Math.floor(index / this._width);
    if (x < this.minX) {
      this.minX = x;
    }
    if (y < this.minY) {
      this.minY = y;
    }
    if (x > this.maxX) {
      this.maxX = x;
    }
    if (y > this.maxY) {
      this.maxY = y;
    }
  }
  get top() {
    return this.minY;
  }
  get left() {
    return this.minX;
  }
  get width() {
    return this.maxX - this.minX;
  }
  get height() {
    return this.maxY - this.minY;
  }
}

export class AlphaFrame {
  constructor(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    this.alphaRect = new AlphaRect(image.width, image.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) this.alphaRect.push(i/4)
    }
  }
}