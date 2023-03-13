import './style.css';
import { AlphaFrame, drawCover, setTransform, loadImage, sleep, flipX } from "../src/utils";
import { raf, webcamLoaded } from '../src/webcam';

const $ = document.querySelector.bind(document);
const result = $('.result');

const MEDIA_LABEL = 'c922' //'Logitech BRIO';
const isFlipX = true;
const isColorsize = false;

const main = async () => { try {
  const webcam = await webcamLoaded(MEDIA_LABEL);
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d')
  canvas.width = 1280;
  canvas.height = 720;

  raf.clear();
  raf.add(() => {
    drawCover(ctx, webcam);
    isFlipX && flipX(ctx);
    isColorsize && colorsize(ctx, {r: 245, g: 27, b: 58});
  });

  const frame = await loadImage('./frame.png');
  const photos = await Promise.all([...['./photo1.png', './photo2.png', './photo3.png', './photo4.png'].map(src => loadImage(src))]);
  const frames = await Promise.all([...['./frame1.png', './frame2.png', './frame3.png', './frame4.png'].map(src => loadImage(src))]);  

  const pcanvas = Object.assign(document.createElement('canvas'), { width: 1280, height: 720});
  const pctx = pcanvas.getContext('2d');

  const takeBtn = document.getElementById('takePhoto')
  takeBtn.addEventListener('click', ev => {
    ev.preventDefault();
  })

} catch(err){
  console.error(err);
}}

main();