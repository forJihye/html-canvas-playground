import './style.css';
import addDragControl from './drag-control';
import addTouchControl from './touch-control';
import { loadImage } from './utils';

const app = document.getElementById('app') as HTMLDivElement;
const assets = {
  photo3: "https://media.hashsn.app/uploaded-posts/de575236-7361-45a0-8065-1b2c2906dda8.jpg",
  photo4: "https://media.hashsn.app/uploaded-posts/fb740d1c-4238-4d2d-9f8a-90094fd76ddc.jpg",
  // photo2: "https://picsum.photos/1440/960",
}

const assetsMap: Map<string, (HTMLImageElement|null)> = new Map();
const assetsLoad = Object.entries(assets).map(async (assets) => {
  const [name, data] = assets;
  const img = await loadImage(data) as HTMLImageElement;
  assetsMap.set(name, img);
  return [name, img];
});
await Promise.all(assetsLoad);

const img = assetsMap.get('photo3') as HTMLImageElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
canvas.width = 960;
canvas.height = 960;
app.appendChild(canvas);

const or = canvas.width / canvas.height // 투명영역 비율
const ir = img.width / img.height // 이미지 비율
// const ratio = Math.min(canvas.width/img.width, canvas.height/img.height) // 종횡비 기준

let align = '';
let iwidth = 0;
let iheight = 0;
let ix = 0;
let iy = 0;

let minX = 0;
let minY = 0;
let maxX = 0;
let maxY = 0;

if (or < ir) { // 높이 Fill
  align = 'vertical'
  iwidth = (img.width * canvas.height) / img.height;
  iheight = canvas.height;
  ix = (canvas.width - iwidth) / 2;
  iy = 0;
  maxX = canvas.width - iwidth;
  console.log(ix)
  ctx.drawImage(img, ix, 0, iwidth, iheight);
} 
if (or > ir) { // 너비 Fill
  align = 'horizontal'
  iwidth = canvas.width;
  iheight = (img.height * canvas.width) / img.width;
  ix = 0;
  iy = (canvas.height - iheight) / 2;
  maxY = canvas.height - iheight;
  ctx.drawImage(img, 0, iy, canvas.width, iheight);
} 

addDragControl(canvas, {
  down: (ev) => {
    console.log('pointer down', ev.type, ev)
    return true;
  },
  move: (ev) => {
    console.log('pointer move', ev)
    if (align === 'vertical') {
      ix += ev.dx;
      if (ix >= minX) ix = minX;
      if (ix <= maxX) ix = maxX;
      ctx.clearRect(0, 0, iwidth, iheight);
      ctx.drawImage(img, ix, 0, iwidth, iheight);
    } 
    if (align === 'horizontal') {
      iy += ev.dy;
      if (iy >= minY) iy = minY;
      if (iy <= maxY) iy = maxY;
      ctx.clearRect(0, 0, iwidth, iheight);
      ctx.drawImage(img, 0, iy, iwidth, iheight);
    }
  },
  up: () => {
    // console.log('pointer up', ev)
  },
})

addTouchControl(canvas, {
  down: (ev) => {
    console.log('touch down', ev.type, ev)
    return true
  },
  move: (ev) => {
    // console.log('touch move', ev)
    if (align === 'vertical') {
      ix += ev.dx;
      if (ix >= minX) ix = minX;
      if (ix <= maxX) ix = maxX;
      ctx.clearRect(0, 0, iwidth, iheight);
      ctx.drawImage(img, ix, 0, iwidth, iheight);
    } 
    if (align === 'horizontal') {
      iy += ev.dy;
      if (iy >= minY) iy = minY;
      if (iy <= maxY) iy = maxY;
      ctx.clearRect(0, 0, iwidth, iheight);
      ctx.drawImage(img, 0, iy, iwidth, iheight);
    }
  },
  up: () => {
    // console.log('touch up', ev)
  }
})