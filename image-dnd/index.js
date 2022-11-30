import './style.css';
// https://picsum.photos/920/1350

class CanvasImage {
  image;
  resolve;
  complete;
  x = 0;
  y = 0;
  constructor(src){
    this.complete = new Promise(res => this.resolve = res);
    this.image = new Image();
    this.image.onload = () => this.resolve();
    this.image.src = src;
    this.image.crossOrigin = 'anonymous';
  }
}

class Draggle {
  isDrag = false;
  store = new Map;
  target;
  firstX;
  firstY;
  constructor(){
    document.addEventListener('pointerdown', ev => this.pointerDown(ev));
    document.addEventListener('pointermove', ev => this.pointerMove(ev));
    document.addEventListener('pointerup', ev => this.pointerUp(ev));
  }
  pointerDown(ev){
    const {target, clientX, clientY} = ev;
    if(!this.store.has(target)) return;
    this.target = target;
    this.isDrag = true;
    this.firstX = clientX;
    this.firstY = clientY;
  }
  pointerMove(ev){
    if(!this.isDrag) return;
    const {clientX, clientY} = ev;
    if(this.store.has(this.target)) this.store.get(this.target)({type: 'move', x: clientX - this.firstX, y: clientY - this.firstY});
  }
  pointerUp(ev){
    this.isDrag = false;
    const {clientX, clientY} = ev;
    if(this.store.has(this.target)) this.store.get(this.target)({type: 'up', x: clientX - this.firstX, y: clientY - this.firstY});
    this.target = null;
  }
}

export const drawCover = ( ctx, img, x = 0, y = 0, w = ctx.canvas.width, h = ctx.canvas.height, offsetX = 0.5, offsetY = 0.5) => {
  offsetX = typeof offsetX === 'number' ? offsetX : 0.5
  offsetY = typeof offsetY === 'number' ? offsetY : 0.5

  if (offsetX < 0) offsetX = 0
  if (offsetY < 0) offsetY = 0
  if (offsetX > 1) offsetX = 1
  if (offsetY > 1) offsetY = 1

  let iw = img.width;
  let ih = img.height;
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

const draggle = new Draggle();
const canvasImage = new CanvasImage('https://i.picsum.photos/id/685/920/1350.jpg?hmac=cTSNQSLgq0Wbife9wSSxfJHIVDQPWUeDb2RI0SQlZdw');

const main = async() => {
  const app = document.getElementById('app');  
  const rectData = {width: 800, height: 600, x: 0, y: 0};
  const canvas = Object.assign(document.createElement('canvas'), {id: 'canvas'});
  const ctx = canvas.getContext('2d');
  canvas.width = rectData.width;
  canvas.height = rectData.height;
  ctx.fillRect(rectData.x, rectData.y, rectData.width, rectData.height);
    
  await canvasImage.complete;
  const dragImg = canvasImage.image;
  ctx.drawImage(dragImg, canvasImage.x, canvasImage.y);
  // drawCover(ctx, dragImg);

  // const min_cx = Math.min(dx, minX, maxX);
  // const min_cy = Math.min(dy, minY, maxY);
  
  // const max_cx = Math.max(dx, minX, maxX);
  // const max_cy = Math.max(dy, minY, maxY);

  const minX = 0;
  const minY = 0;
  const maxX = canvas.width - dragImg.width;
  const maxY = canvas.height - dragImg.height;
  
  draggle.store.set(canvas, ({type, x, y}) => {
    let dx = canvasImage.x + x;
    let dy = canvasImage.y + y;

    if(dx > minX) dx = 0;
    if(dy > minY) dy = 0;
    if(dy < maxY) dy = maxY;
    if(dx < maxX) dx = maxX;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(dragImg, dx, dy);

    if(type === 'up'){
      canvasImage.x = dx;
      canvasImage.y = dy;
    }
  });
  app.appendChild(canvas);
}
main();
