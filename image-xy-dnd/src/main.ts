import './style.css';
import Assets from './assets-load';
import FramePhoto from './frame-photo';
import addDragControl from './drag-control';

const app = document.getElementById('app') as HTMLDivElement;
const assetsConfig = {
  'frame-default': {
    type: "frame",
    data: "https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/kiosk-editor/hashsnap-template.png"
  },
  "frame-left": {
    type: "frame",
    data: "https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/kiosk-editor/221104_vktest_mini/template/frame3x4-1_1667870051714.png",
    options: {
      left: 0,
      top: 0
    }
  },
  "frame-right": {
    type: "frame",
    data: "https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/kiosk-editor/221104_vktest_mini/template/frame3x4-2_1667870051705.png",
    options: {
      left: 900,
      top: 0
    }
  },
  'photo1': {
    type: "image",
    data: "https://media.hashsn.app/uploaded-posts/de575236-7361-45a0-8065-1b2c2906dda8.jpg",
  },
  'photo2': {
    type: 'image',
    data: "https://media.hashsn.app/uploaded-posts/1cf519ed-d10d-4ba6-ba3e-f736f3ca412a.jpg"
  },
  'photo3': {
    type: 'image',
    data: "https://media.hashsn.app/uploaded-posts/071a563e-8300-4dbf-b1a0-e0b2d0da530e.jpg"
  }
}

const frameData = {
  width: 1800,
  height: 1200,
  'cropped-width': 1800,
  'cropped-height': 1200,
  'cropped-left': 0,
  'cropped-top': 0,
}
const main = async () => { try {
  const assets = new Assets();
  const assetsPromise = Object.entries(assetsConfig).map(async ([key, value]) => await assets.save(key, value));
  await Promise.all(assetsPromise);
  console.log(assets);

  const canvas = Object.assign(document.createElement('canvas'), {width: frameData['cropped-width'], height: frameData['cropped-height']}) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const photo = assets.get('photo3')?.data;
  const frameLeft = assets.get('frame-left');
  const frameRight = assets.get('frame-right');
  const frameCanvas = [frameLeft, frameRight].map(frame => {
    const {data, options} = frame;
    const photoRect = {
      img: photo,
      x: data.alphaRect.left,
      y: data.alphaRect.top,
      width: data.alphaRect.width + 1,
      height: data.alphaRect.height + 1,
    }
    const framePhoto = new FramePhoto(photoRect);
    ctx.save();
    ctx.translate(-Number(frameData['cropped-left']), -Number(frameData['cropped-top']));
    ctx.drawImage(framePhoto.canvas, photoRect.x + options.left, photoRect.y + options.top, photoRect.width, photoRect.height);
    ctx.drawImage(data.image, options.left, options.top);
    ctx.restore();
    return {
      framePhoto,
      photoRect,
      options
    }
  });

  addDragControl(canvas, {
    down: () => {
      return true;
    },
    move: (ev) => {
      const {dx, dy} = ev;
      frameCanvas.map(({framePhoto, photoRect, options}) => {
        ctx.save();
        ctx.translate(-Number(frameData['cropped-left']), -Number(frameData['cropped-top']));
        framePhoto.drawImage({x: dx, y: dy});
        ctx.clearRect(photoRect.x + options.left, photoRect.y + options.top, photoRect.width, photoRect.height);
        ctx.drawImage(framePhoto.canvas, photoRect.x + options.left, photoRect.y + options.top, photoRect.width, photoRect.height);
        ctx.restore();
      })
    },
    up: () => {}
  });
  
  app.appendChild(canvas);
} catch(err) {
  console.error(err)
}}
main();