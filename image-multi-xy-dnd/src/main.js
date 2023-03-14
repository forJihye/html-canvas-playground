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
    return { background: frame, photo: photos[i], x: alpha.alphaRect.left - 1, y: alpha.alphaRect.top - 1, width: alpha.alphaRect.width + 1, height: alpha.alphaRect.height + 1 }
  });

  const frameMain = new FrameMain(canvas);
  const framesCanvas = framesRect.map((frame, i) => {
    const { background, photo } = frame;
    
    const or = background.width / background.height;
    const ir = photo.width / photo.height;
  
    const width = (or < ir) ? (photo.width * frame.height) / photo.height : frame.width;
    const height = (or < ir) ? frame.height : (photo.height * frame.width) / photo.width;
    const framePhoto = new FramePhoto({
      id: i, 
      img: photo,
      x: (or < ir) ? (frame.width) - (photo.width/2) : frame.x,
      y: (or < ir) ? frame.y : (frame.height) - (photo.height/2),
      width,
      height,
      minX: frame.x,
      maxX: (or < ir) ? (frame.width) - (photo.width/2) : frame.x, // (or < ir) ? frame.width - photo.width : frame.x,
      minY: frame.y,
      maxY: (or < ir) ? frame.y : (frame.height) - (photo.height/2), //(or < ir) ? frame.y : frame.height - photo.height, 
    });
    const frameCanvas = new FrameCanvas({ 
      background, 
      x: framePosition[i][0],
      y: framePosition[i][1],
      width: 600, 
      height: 900,
      alphaRect: { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
      fillStyle: ['orange', 'pink', 'red', 'blue'][i],
    });

    frameCanvas.add(framePhoto);
    return frameCanvas;
  });
  frameMain.init(framesCanvas);

} catch(err){
  console.error(err);
}}

main();