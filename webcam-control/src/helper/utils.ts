import { useEffect, useRef } from 'react';

export const getRest = (i: number, max: number) => ((max + i % max) % max);
export const getBlob = (canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob> => new Promise(res => canvas.toBlob(res as any, type, quality));
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
export const comp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
export const getFormatKeys = (str: string) => (str.match(/%(.+?)%/g) ?? []).map(str => str.slice(1, -1));
export const replacePhoneFormat = (str: string) => str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,"$1-$2-$3");

export const progressPromise = ( promises: Promise<any>[], tickCallback: (progress: number, length: number) => void ) => {
  const length: number = promises.length;
  let progress = 0;
  
  function tick(promise: Promise<any>) {
    promise.then(function () {
      progress++;
      tickCallback(progress, length);
    });
    return promise;
  }
  return Promise.all(promises.map(tick));
}

export const drawCover = (
  ctx: CanvasRenderingContext2D, 
  img: HTMLVideoElement|HTMLImageElement|HTMLCanvasElement,
  x = 0, 
  y = 0, 
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

  const iw = img.width || (img as HTMLVideoElement).videoWidth;
  const ih = img.height || (img as HTMLVideoElement).videoHeight;
  const r = Math.min(w / iw, h / ih)
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

export const drawContain = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement|HTMLCanvasElement|HTMLVideoElement
) => {
  const canvas = ctx.canvas ;
  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.width || (img as any).videoWidth;
  const ih = img.height || (img as any).videoHeight;
  const hRatio = cw / iw;
  const vRatio =  ch / ih;
  const ratio = Math.min(hRatio, vRatio);
  const sx = (cw - iw*ratio) / 2;
  const sy = (ch - ih*ratio) / 2;  
  ctx.drawImage(img, 0, 0, iw, ih, sx, sy, iw*ratio, ih*ratio);  
}

export const flipX = (ctx: CanvasRenderingContext2D, direction?: string) => {
  ctx.save();
  ctx.translate(ctx.canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
};

// https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
export const useCombinedRefs = (...refs: any[]) => {
  const targetRef = useRef();

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current
      }
    })
  }, [refs])

  return targetRef;
}