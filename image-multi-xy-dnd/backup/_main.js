import './style.css';
import { AlphaFrame, drawCover, loadImage, sleep } from "../src/utils";

const $ = document.querySelector.bind(document);

// 전체 캔버스
const canvas = $('.canvas');
const ctx = canvas.getContext('2d');

// 사진 캔버스
const pcanvas1 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const pcanvas2 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const pcanvas3 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const pcanvas4 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const pctx1 = pcanvas1.getContext('2d');
const pctx2 = pcanvas2.getContext('2d');
const pctx3 = pcanvas3.getContext('2d');
const pctx4 = pcanvas4.getContext('2d');

// 사진 각 프레임 캔버스
const fcanvas1 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const fcanvas2 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const fcanvas3 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const fcanvas4 = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
const fctx1 = fcanvas1.getContext('2d');
const fctx2 = fcanvas2.getContext('2d');
const fctx3 = fcanvas3.getContext('2d');
const fctx4 = fcanvas4.getContext('2d');


async function renderCanvas(photos, frames) {
  const framesRect = frames.map(img => {
    const assetsFrame = new AlphaFrame(img);
    const result = { x: assetsFrame.alphaRect.left - 1, y: assetsFrame.alphaRect.top - 1, width: assetsFrame.alphaRect.width + 1, height: assetsFrame.alphaRect.height + 1,};
    return result;
  });

  drawCover(pctx1, photos[0], 0, 0, 600, 900);
  drawCover(pctx2, photos[1], 0, 0, 600, 900);
  drawCover(pctx3, photos[2], 0, 0, 600, 900);
  drawCover(pctx4, photos[3], 0, 0, 600, 900);
  
  fctx1.drawImage(pcanvas1, 0, 0, 600, 900);
  fctx2.drawImage(pcanvas2, 0, 0, 600, 900);
  fctx3.drawImage(pcanvas3, 0, 0, 600, 900);
  fctx4.drawImage(pcanvas4, 0, 0, 600, 900);

  // fctx1.drawImage(frames[0], 0, 0, 600, 900);
  // fctx2.drawImage(frames[1], 0, 0, 600, 900);
  // fctx3.drawImage(frames[2], 0, 0, 600, 900);
  // fctx4.drawImage(frames[3], 0, 0, 600, 900);

  ctx.drawImage(fcanvas1, 0, 0, 600, 900);
  ctx.drawImage(fcanvas2, 600, 0, 600, 900);
  ctx.drawImage(fcanvas3, 0, 900, 600, 900);
  ctx.drawImage(fcanvas4, 600, 900, 600, 900);
}

const correction = (x, y) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (x - rect.left) * canvas.width / rect.width,
    y: (y - rect.top) * canvas.height / rect.height,
  }
}
const main = async () => { try {
  const photos = await Promise.all([...['./photo1.png', './photo2.png', './photo3.png', './photo4.png'].map(src => loadImage(src))]);
  const frames = await Promise.all([...['./frame1.png', './frame2.png', './frame3.png', './frame4.png'].map(src => loadImage(src))]);
  await renderCanvas(photos, frames);

  let trigger = false
  let ox, oy, dx, dy;
  let moveX = 0; 
  let moveY = 0;
  window.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    const { clientX, clientY } = ev;
    const {x, y} = correction(clientX, clientY);
    trigger = true;
    ox = x;
    oy = y;
    console.log(ox, oy)
  });
  window.addEventListener('pointermove', (ev) => {
    if (!trigger) return;
    const { clientX, clientY } = ev;
    const {x, y} = correction(clientX, clientY);
    dx = x - ox;
    dy = y - oy;
    ox = x;
    oy = y;

    pctx1.clearRect(0, 0, 600, 900);
    fctx1.clearRect(0, 0, 600, 900);
    ctx.clearRect(0, 0, 600, 900);

    moveX += dx;
    moveY += dy;    
    drawCover(pctx1, photos[0], moveX, moveY, 600, 900);
    fctx1.drawImage(pcanvas1, 0, 0, 600, 900);
    ctx.drawImage(fcanvas1, 0, 0, 600, 900);
    console.log(moveX, moveY)
  });
  window.addEventListener('pointerup', (ev) => {
    const { clientX, clientY } = ev;
    trigger = false;
    ox = clientX;
    oy = clientY;
  });
} catch(err){
  console.error(err);
}}

main();