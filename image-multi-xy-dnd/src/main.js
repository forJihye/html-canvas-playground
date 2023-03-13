import { FrameCanvas, FrameMain, FramePhoto } from './canvas';
import './style.css';
import { AlphaFrame, drawCover, setTransform, loadImage, sleep, flipX } from "./utils";

const $ = document.querySelector.bind(document);
const canvas = Object.assign($("#canvas"), {width: 1200, height: 1800});
const ctx = canvas.getContext('2d');
const framePosition = [ [0, 0], [600, 0], [0, 900], [600, 900] ];

const correction = (clientX, clientY) => {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (clientX - rect.left) * canvas.width / rect.width,
    y: (clientY - rect.top) * canvas.height / rect.height
  }
}

const main = async () => { try {
  const photos = await Promise.all([...['./images/photo1.png', './images/photo2.png', './images/photo3.png', './images/photo4.png'].map(src => loadImage(src))]);
  const frames = await Promise.all([...['./images/frame1.png', './images/frame2.png', './images/frame3.png', './images/frame4.png'].map(src => loadImage(src))]);  
  const framesRect = frames.map((frame, i) => {
    const alpha = new AlphaFrame(frame);
    return { background: frame, x: alpha.alphaRect.left - 1, y: alpha.alphaRect.top - 1, width: alpha.alphaRect.width + 1, height: alpha.alphaRect.height + 1 }
  });

  const frameMain = new FrameMain(canvas);
  framesRect.map((frame, i) => {
    const { background } = frame;
    const photo = photos[i];
    
    const or = background.width / background.height;
    const ir = photo.width / photo.height;
  
    const framePhoto = new FramePhoto({
      id: i, 
      img: photo,
      x: (or < ir) ? (background.width - photo.width)/2 : 0,
      y: (or < ir) ? 0 : (background.height - photo.height)/2,
      width: (or < ir) ? (photo.width * background.height) / photo.height : background.width,
      height: (or < ir) ? background.height : (photo.height * background.width) / photo.width,
    });
    const frameCanvas = new FrameCanvas({ 
      background, 
      x: frame.x,
      y: frame.y,
      width: frame.width, 
      height: frame.height,
    });
    frameCanvas.add(framePhoto);
    frameMain.add(frameCanvas);
  });
  

  const background = frames[0];
  const photo = photos[0];
  const alphaRect = framesRect[0];
  const [ frameX, frameY ] = framePosition[0];
  const fcanvas = Object.assign(document.createElement('canvas'), {width: 600, height: 900});
  const fctx = fcanvas.getContext('2d');

  const or = background.width / background.height;
  const ir = photo.width / photo.height;
  
  let maxX = 0, minX = 0;

  const target1 = { x: 0, y: 0, width: 0, height: 0};
  if (or < ir) { // 높이 Fill vertical
    console.log("vertical");
    const iwidth = (photo.width * background.height) / photo.height;
    const iheight = background.height;
    const ix = (background.width - iwidth) / 2;
    const iy = 0;
    minX = 0;
    maxX = fcanvas.width - iwidth;
    target1.x = ix;
    target1.y = iy;
    target1.width = iwidth;
    target1.height = iheight;
    fctx.drawImage(photo, target1.x, target1.y, target1.width, target1.height);
  } 
  if (or > ir) { // 너비 Fill horizontal;
    console.log("horizontal");
    const iwidth = background.width;
    const iheight = (photo.height * background.width) / photo.width;
    const ix = 0 + background.x;
    const iy = (background.height - iheight) / 2 + background.y;
    fctx.drawImage(photo, ix, iy, iwidth, iheight);
  }
  fctx.drawImage(background, 0, 0, 600, 900);
  // ctx.drawImage(fcanvas, frameX, frameY, 600, 900);

  
  // let draggable = false;
  // let ox, oy, tx, ty;
  // window.addEventListener('pointerdown', (ev) => {
  //   ev.preventDefault();
  //   const {x, y} = correction(ev.clientX, ev.clientY);
  //   ox = x;
  //   oy = y;
  //   if (x > alphaRect.x && x < alphaRect.x + alphaRect.width && y > alphaRect.y && y < alphaRect.y + alphaRect.height) {
  //     draggable = true;
  //   }
  // })
  // window.addEventListener('pointermove', (ev) => {
  //   ev.preventDefault();
  //   if (!draggable) return;
  //   const {x, y} = correction(ev.clientX, ev.clientY);
  //   tx = x - ox;
  //   ty = y - oy;
  //   ox = x;
  //   oy = y;
  //   target1.x += tx;
  //   target1.y += ty;
  //   if (target1.x >= minX) target1.x = minX;
  //   if (target1.x <= maxX) target1.x = maxX;

  //   fctx.clearRect(0, 0, 600, 900);
  //   ctx.clearRect(frameX, frameY, 600, 900);

  //   fctx.drawImage(photo, target1.x, 0, target1.width, target1.height);
  //   fctx.drawImage(background, 0, 0, 600, 900);
  //   ctx.drawImage(fcanvas, frameX, frameY, 600, 900);
  // })
  // window.addEventListener('pointerup', (ev) => {
  //   ev.preventDefault();
  //   draggable = false;
  // })
} catch(err){
  console.error(err);
}}

main();