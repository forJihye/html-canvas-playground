export const animate = (options: {timing: Function, draw: Function, duration: number, callback?: () => void}) => {
  let start = performance.now();
  function render(time: number) {
    let timeFraction = (performance.now() - start) / options.duration;
    if (timeFraction > 1) {
      timeFraction = 1;
      options.draw(1);
      if (options?.callback) options.callback();
    } else {
      let progress = options.timing(timeFraction);
      options.draw(progress);
      requestAnimationFrame(render);
    }
  }
  requestAnimationFrame(render);
}


export const drawContain = (ctx: CanvasRenderingContext2D, source: HTMLImageElement|HTMLCanvasElement|HTMLVideoElement) => {
  const canvas = ctx.canvas ;
  const cw = canvas.width;
  const ch = canvas.height;
  const iw = source.width || (source as any).videoWidth;
  const ih = source.height || (source as any).videoHeight;
  const hRatio = cw / iw;
  const vRatio =  ch / ih;
  const ratio = Math.min(hRatio, vRatio);
  const sx = (cw - iw*ratio) / 2;
  const sy = (ch - ih*ratio) / 2;  
  ctx.drawImage(source, 0, 0, iw, ih, sx, sy, iw*ratio, ih*ratio);  
}

export const drawCover = (
  ctx: CanvasRenderingContext2D, 
  img: HTMLVideoElement|HTMLImageElement|HTMLCanvasElement,
  x: number = 0, 
  y: number = 0, 
  w: number = ctx.canvas.width, 
  h: number = ctx.canvas.height,
  offsetX = 0.5, 
  offsetY = 0.5
) => {
  offsetX = typeof offsetX === 'number' ? offsetX : 0.5
  offsetY = typeof offsetY === 'number' ? offsetY : 0.5

  if (offsetX < 0) offsetX = 0
  if (offsetY < 0) offsetY = 0
  if (offsetX > 1) offsetX = 1
  if (offsetY > 1) offsetY = 1

  let iw = img.width || (img as HTMLVideoElement).videoWidth;
  let ih = img.height || (img as HTMLVideoElement).videoHeight;
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

  ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h)
};