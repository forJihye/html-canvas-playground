import { animate, drawCover } from "./utils";

// 이미지 가져오기
const loadImage = async (src: string, timeout?: number) => new Promise(res => {
  const img = new Image() as HTMLImageElement;
  img.onload = () => res(img);
  img.onerror = () => res(null)
  img.src = src;
  setTimeout(() => res(null), timeout ?? 10000);
});
// 이미지 로드 상태 확인
const isImgLoaded = async (el: HTMLElement) => {
  if (el.tagName === 'IMG') {
    return [await loadImage((el as HTMLImageElement).src)]
  } else {
    const imgs = el.querySelectorAll('img');
    return [...imgs].map(async (img) => await loadImage(img.src));
  }
}
// pinchzoom container element 생성
const buildElement = (innerHTML: string) => {
  const fragment = document.implementation.createHTMLDocument('');
  fragment.body.innerHTML = innerHTML;
  return [...fragment.body.children][0];
}
// 초기 마크업
const setMarkup = (el: HTMLElement) => {
  const container = buildElement('<div class="pinch-zoom-container"></div>') as HTMLElement;
  el.parentNode?.insertBefore(container, el);
  container.appendChild(el);
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  el.style.transformOrigin = '0% 0%';
  el.style.position = 'absolute';
  return container;
}

const options = {
  maxZoom: 5,
  animationDuration: 3000
}
let initZoom = 0;
let currentZoom = 1;
let initScale = 0;
let currentScale = 0;
let initOffset = {x: 0, y: 0};
let offset = {x: 0, y: 0};

// 핀치줌 메인
const pinchZoom = (el: HTMLElement) => {
  const container = setMarkup(el);
  container.style.height = container.parentElement?.offsetHeight + 'px';
  const initZoomX = container.offsetWidth / el.offsetWidth;
  const initZoomY = container.offsetHeight / el.offsetHeight;
  const defaultZoom = Math.min(initZoomX, initZoomY);
  const zoom = defaultZoom * currentZoom;
  el.style.transform = `scale(${zoom}, ${zoom})`;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const speed = 30;
const scale = 2;
const main = async () => { try {
  const img = await loadImage('https://media.hashsn.app/uploaded-posts/3e8b850c-b575-4ea5-9956-77175483722a.jpg') as HTMLImageElement;
  if (img === null) {
    console.warn('Image not found');
    return;
  }
  
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  function draw (plus: number) {
    let offsetX = 0.5;
    let offsetY = 0.5;
    let w = canvas.width;
    let h = canvas.height;
    let x = 0;
    let y = 0;
    let iw = img.width;
    let ih = img.height;
    let r = Math.min(600 / iw, 600 / ih);
    let nw = iw * r;
    let nh = ih * r;
    let cx = 1;
    let cy = 1;
    let cw = 1;
    let ch = 1;
    let ar = 1;
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    let zoom = 1 + plus / 60;
    let tx = (cx + cw / 2);
    let ty = (cy + ch / 2);

    ctx.clearRect(0, 0, 0, 0);
    ctx.translate(tx, ty);
    ctx.scale(zoom, zoom);
    ctx.translate(-tx, -ty);
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
  }

  // setInterval(draw, 300);

  animate({
    timing: (timeFraction: number) => {
      return timeFraction;
      // return -Math.cos(timeFraction * Math.PI) / 2  + 0.5; // swing timing
    },  
    draw: (progress: number) => {
      draw(progress)
    },
    duration: 5000
  });

  document.body.appendChild(canvas);
} catch (e) {
  console.error(e)
}}

main();
// const el = document.querySelector('.pinch-zoom') as HTMLElement;
// const isImg = await Promise.all([isImgLoaded(el)]);
// if (!isImg.length) {
//   console.warn('Image not found');
//   return;
// };
// pinchZoom(el);
