import './style.css'
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
  },
  "frame-right": {
    type: "frame",
    data: "https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/kiosk-editor/221104_vktest_mini/template/frame3x4-2_1667870051705.png",
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

const frameConfig = {
  frame: [
    {
      assetName: 'frame-left',
      width: 900,
      height: 1200,
      left: 0,
      top: 0
    },
    {
      assetName: 'frame-right',
      width: 900,
      height: 1200,
      left: 900,
      top: 0
    }
  ],
  cropWidth: 1800,
  cropHeight: 1200,
  cropLeft: 0,
  cropTop: 0,
}

const main = async () => { try {
  const assets = new Assets();
  const assetsPromise = Object.entries(assetsConfig).map(async ([key, value]) => await assets.save(key, value));
  await Promise.all(assetsPromise);
  console.log(assets);

  const photo = assets.get('photo3')?.data as HTMLImageElement;
  const halfFrame = frameConfig.frame.map((config) => {
    const {assetName, width, height, left, top} = config;
    const frame = assets.get(assetName)?.data;
    return { img: frame.image, x: left, y: top, width, height, alphaRect: frame.alphaRect }
  });

  const canvas = Object.assign(document.createElement('canvas'), {width: frameConfig.cropWidth, height: frameConfig.cropHeight}) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  app.appendChild(canvas);

  const frameCanvas = halfFrame.map(frame => {
    const photoRect = {
      x: frame.alphaRect.left,
      y: frame.alphaRect.top,
      width: frame.alphaRect.width + 1,
      height: frame.alphaRect.height + 1,
    };
    const framePhoto = new FramePhoto({ img: photo, ...photoRect});
    ctx.save();
    ctx.translate(-frameConfig.cropLeft, -frameConfig.cropTop);
    ctx.drawImage(framePhoto.canvas, (photoRect.x + frame.x), photoRect.y, photoRect.width, photoRect.height);
    ctx.drawImage(frame.img, frame.x, frame.y, frame.width, frame.height);
    ctx.restore();
    return { ...frame, photo: framePhoto };
  });

  addDragControl(canvas, {
    down: () => { return true },
    move: (ev) => {
      frameCanvas.map(frame => {
        const photoRect = {
          x: frame.alphaRect.left,
          y: frame.alphaRect.top,
          width: frame.alphaRect.width + 1,
          height: frame.alphaRect.height + 1,
        };
        frame.photo.drawImage({x: ev.dx, y: ev.dy});
        ctx.clearRect((photoRect.x + frame.x), photoRect.y, photoRect.width, photoRect.height);
        ctx.drawImage(frame.photo.canvas, (photoRect.x + frame.x), photoRect.y, photoRect.width, photoRect.height);
      })
    },
    up: () => {}
  })
} catch(e: any) {
  console.error(e)
}}
main();

// framePhoto.drawImage({x: ev.dx, y: ev.dy});
// ctx.clearRect(photoConfig.x, photoConfig.y, photoConfig.width, photoConfig.height);
// ctx.drawImage(framePhoto.canvas, photoConfig.x, photoConfig.y, photoConfig.width, photoConfig.height);
