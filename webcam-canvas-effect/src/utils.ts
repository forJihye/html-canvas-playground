export const groupBy = <T, K extends keyof any>(f: (p: T) => K, arr: T[]) => arr.reduce((acc, val) => {
  const key = f(val);
  acc[key] ? acc[key].push(val) : (acc[key] = [val])
  return acc;
}, {} as Record<K, T[]>);

export const drawCrop = (ctx: CanvasRenderingContext2D, img: any, x: number, y: number, w: number, h: number, offsetX = 0.5, offsetY = 0.5) => {
  if (x === undefined && y === undefined && w === undefined && h === undefined) {
    x = y = 0
    w = ctx.canvas.width
    h = ctx.canvas.height
  }
  offsetX = typeof offsetX === 'number' ? offsetX : 0.5
  offsetY = typeof offsetY === 'number' ? offsetY : 0.5

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
  
  ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
  return ctx;
}
