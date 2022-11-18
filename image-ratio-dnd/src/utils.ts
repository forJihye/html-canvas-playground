export const loadImage = (src: string, ms: number = 10000) => {
  return new Promise(res => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src + '?date=' + Date.now();
    setTimeout(() => res(null), ms);
  });
}

export const canvas2blob = (canvas: HTMLCanvasElement, options: {type: string; quality: number}) => new Promise(res => canvas.toBlob(res, options.type, options.quality));

export const drawCropCover = (
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  x: number,
  y: number, 
  w: number,
  h: number, 
  offsetX = 0.5, 
  offsetY = 0.5
) => {
  if (offsetX < 0) offsetX = 0
  if (offsetY < 0) offsetY = 0
  if (offsetX > 1) offsetX = 1
  if (offsetY > 1) offsetY = 1

  let iw = img.width
  let ih = img.height
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
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h)
  return {cx, cy, cw, ch, x, y, w, h}
}

export const drawContain = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const iw = img.width;
  const ih = img.height;
  
  const hRatio = cw/iw;
  const vRatio = ch/ih;
  const ratio = Math.min(hRatio, vRatio);

  const sw = iw * ratio;
  const sh = ih * ratio;
  const sx = (cw - sw) / 2;
  const sy = (ch - sh) / 2;
  ctx.drawImage(img, 0, 0, iw, ih, sx, sy, sw, sh);
}

export const clearRect = (ctx: CanvasRenderingContext2D ) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

export const setTransform = (
  ctx: CanvasRenderingContext2D, 
  { x, y }: { x: number, y: number },
  f: () => void
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.translate(-x, -y);
  f();
  ctx.restore();
};

export const getDrawImageParams = (image: HTMLImageElement, scale: number) => {
  const {naturalWidth: imageWidth, naturalHeight: imageHeight} = image;
  
  return {
    sx: 0,
    sy: 0,
    sWidth: imageWidth,
    sHeight: imageHeight,
    dx: 0,
    dy: 0,
    dWidth: imageWidth * scale,
    dHeight: imageHeight * scale,
  };
};

export const getAspectRatioCropParams = (
  originalWidth: number, 
  originalHeight: number, 
  transformedRatio: number, 
  fill = false
) => {
  // Initial data, if the image does not change aspect it stays like this. 
  let sx = 0;
  let sy = 0;
  let sWidth = originalWidth;
  let sHeight = originalHeight;
  let dx = 0;
  let dy = 0;
  let dWidth = originalWidth;
  let dHeight = originalHeight;
  let canvasWidth = originalWidth;
  let canvasHeight = originalHeight;

  const originalRatio = originalWidth / originalHeight;

  if (originalRatio > transformedRatio) {
    if(fill) {
      canvasHeight = originalWidth / transformedRatio;
      dy = Math.abs(canvasHeight - originalHeight) / 2;
    } else {
      sWidth = originalWidth * transformedRatio;
      canvasWidth = sWidth;
      dWidth = sWidth;
      sx = Math.abs(originalWidth - sWidth) / 2;
    }
  }

  if (originalRatio < transformedRatio) {
    if(fill) {
      canvasWidth = originalHeight * transformedRatio;
      dx = Math.abs(canvasWidth - originalWidth) / 2;
    } else {
      sHeight = originalWidth / transformedRatio;
      canvasHeight = sHeight;
      dHeight = sHeight;
      sy = Math.abs(originalHeight - sHeight) / 2;
    }
  }

  return {
    sx,
    sy,
    sWidth,
    sHeight,
    dx,
    dy,
    dWidth,
    dHeight,
    canvasWidth,
    canvasHeight
  };
};

