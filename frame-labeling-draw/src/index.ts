import './index.css';

type ImageMask = {
  [labelIndex: number]: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    alpha: [number, number][]
  }
}

const loadImage = (src: string) => new Promise(res => {
  const img = new Image;
  img.crossOrigin = "Anonymous";
  img.onload = () => res(img);
  img.onerror = () => res(null);
  img.src = src
});

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

  ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);

  return ctx;
};

export const drawContain = (ctx: CanvasRenderingContext2D, img: HTMLImageElement|HTMLCanvasElement|HTMLVideoElement) => {
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

function getPixelByPosition(y: number, x: number, templateImageData: ImageData) {
  const { width, height, data } = templateImageData;
  if (x < 0 || width <= x || y < 0 || height <= y) return null;
  
  const imageDataIndex = (y * width + x) * 4;
  const r = data[imageDataIndex];
  const g = data[imageDataIndex + 1];
  const b = data[imageDataIndex + 2];
  const a = data[imageDataIndex + 3];

  return { r, g, b, a, index: imageDataIndex };
}

const getTransparentByPixels = function* (imageData: ImageData, chckedIndex: Set<number>){ // 이미지 모든 픽셀에서 투명도 픽셀 x,y 위치값과 index 저장
  const {width, height, data} = imageData;
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 255 || chckedIndex.has(i)) continue;

    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    chckedIndex.add(i);
    yield {x, y, a: data[i + 3], index: i}
  }
}

const getLabelPos = function* (x: number, y: number, templateImageData: ImageData, checkedIndex: Set<number>) {
  const stack: [number, number][] = [[x, y]];

  while(stack.length) {
    const [x, y] = stack.shift() as [number, number];

    const dir8 = [
      [x - 1, y - 1],
      [x, y - 1],
      [x + 1, y - 1],
      [x - 1, y],
      // [x, y], // 기준점
      [x + 1, y],
      [x - 1, y + 1],
      [x, y + 1],
      [x + 1, y + 1],
    ].map(([x, y]) => ([x, y, getPixelByPosition(y, x, templateImageData)])) as [
      number, 
      number, 
      {r: number; g: number; b: number; a: number; index: number}
    ][];

    const nextTransparentPixels = dir8.filter(
      ([, , meta]) => meta && !checkedIndex.has(meta.index) && meta.a !== 255
    );

    for (const pos of nextTransparentPixels) {
      const [x, y, { index }] = pos;
      checkedIndex.add(index);
      stack.push([x, y]);
      yield pos;
    }
  }
}

const getLabelPixels = function* (result: ImageMask, templateImageData: ImageData, checkedIndex: Set<number>){
  let labelId: number = -1;
  for (const {x, y, a, index} of getTransparentByPixels(templateImageData, checkedIndex)) {
    result[++labelId] = {
      x1: Infinity,
      y1: Infinity,
      x2: -Infinity,
      y2: -Infinity,
      width: 0,
      height: 0,
      alpha: []
    }
    
    for (const pos of getLabelPos(x, y, templateImageData, checkedIndex)) {
      const [x, y] = pos;
      const target = result[labelId];

      if (target.x1 > x) target.x1 = x;
      if (target.y1 > y) target.y1 = y;
      if (target.x2 < x) target.x2 = x;
      if (target.y2 < y) target.y2 = y;
      target.width = target.x2 - target.x1;
      target.height = target.y2 - target.y1;
      target.alpha.push([x, y]);

      yield {
        [labelId]: {
          ...target,
          alpha: [[x, y]] as [number, number][],
        },
      };
    }
  }
}

const main = async () => { try {
  const template = await loadImage('./test.png') as HTMLImageElement;
  const templateCanvas = document.createElement('canvas') as HTMLCanvasElement;
  const templateCtx = templateCanvas.getContext('2d') as CanvasRenderingContext2D;
  document.body.prepend(templateCanvas);

  templateCanvas.width = template.width;
  templateCanvas.height = template.height;
  templateCtx.drawImage(template, 0, 0);
  
  const checkedImageDataIndex: Set<number> = new Set();
  const templateImageData = templateCtx.getImageData(0, 0, templateCanvas.width, templateCanvas.height) as ImageData;  

  const images = [
    'https://picsum.photos/600/600?1',
    'https://picsum.photos/1080/1920?2',
    'https://picsum.photos/480/500?3'
  ].map(src => loadImage(src));
  const imageEls = await Promise.all(images) as HTMLImageElement[];
  
  const result: ImageMask = {};
  for (const diff of getLabelPixels(result, templateImageData, checkedImageDataIndex)) { }
  console.log(result);

  // 라벨 1번 영역에 이미지 그리기
  const img1 = imageEls[0];
  const labelMark1 = result[0];

  const imageCanvas = document.createElement('canvas') as HTMLCanvasElement;
  const imageCtx = imageCanvas.getContext('2d') as CanvasRenderingContext2D;
  imageCanvas.width = labelMark1.width;
  imageCanvas.height = labelMark1.height;
  drawCover(imageCtx, img1, 0, 0);

  // templateCtx.drawImage(imageCanvas, labelMark1.x1, labelMark1.y1);

  const markFrameCanvas = document.createElement('canvas') as HTMLCanvasElement;
  const markFrameCtx = markFrameCanvas.getContext('2d') as CanvasRenderingContext2D;
  markFrameCanvas.width = labelMark1.width;
  markFrameCanvas.height = labelMark1.height;

  markFrameCtx.fillStyle = '#fff'
  markFrameCtx.fillRect(0, 0, labelMark1.width, labelMark1.height);

  const absolutePixelPos = labelMark1.alpha.map(([x, y]) => [x - labelMark1.x1, y - labelMark1.y1])
  absolutePixelPos.forEach(([x, y]) => {
    markFrameCtx.fillStyle = '#000';
    markFrameCtx.fillRect(x, y, 1, 1);
  });

  const markFrameData = markFrameCtx.getImageData(0, 0, markFrameCanvas.width, markFrameCanvas.height)
  for (let i = 0; i < markFrameData.data.length; i += 4) {
    const r = markFrameData.data[i];
    const g = markFrameData.data[i + 1];
    const b = markFrameData.data[i + 2];
    const a = markFrameData.data[i + 3];
    if (r === 0 && g === 0 && b === 0) {
      markFrameData.data[i + 3] = 0;
    }
  }
  markFrameCtx.putImageData(markFrameData, 0, 0);
  imageCtx.drawImage(markFrameCanvas, 0, 0);
  
  templateCtx.globalCompositeOperation = 'multiply';
  templateCtx.drawImage(imageCanvas, labelMark1.x1, labelMark1.y1)

  imageCtx.drawImage(markFrameCanvas, 0, 0);
  templateCtx.drawImage(imageCanvas, labelMark1.x1, labelMark1.y1)

  imageCtx.globalCompositeOperation  = 'screen';
  markFrameCtx.drawImage(imageCanvas, 0, 0);
  markFrameCtx.drawImage(imageCanvas, 100, 100);

  // const imageCanvas = document.createElement('canvas') as HTMLCanvasElement;
  // const imageCtx = imageCanvas.getContext('2d') as CanvasRenderingContext2D;
  // imageCanvas.width = labelMark1.width;
  // imageCanvas.height = labelMark1.height;
  // imageCtx.drawImage(img, 0, 0);
  drawCover(imageCtx, img1, 0, 0);
  templateCtx.drawImage(imageCanvas, labelMark1.x1, labelMark1.y1);
} catch(err: any) { console.error(err) }}
main();
