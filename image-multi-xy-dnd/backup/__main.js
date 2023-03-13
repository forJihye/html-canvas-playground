import './style.css';
import { AlphaFrame, drawCover, setTransform, loadImage, sleep } from "../src/utils";

const $ = document.querySelector.bind(document);

// 전체 캔버스
const canvas = $('.canvas');
const ctx = canvas.getContext('2d');


export class PhotoItem {
  constructor(id, img, payload = {x, y, width, height}) {
    this.id = id;
    this.img = img;
    this.width = payload.width;
    this.height = payload.height;
    this.x = payload.x;
    this.y = payload.y;
  }
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

export class FrameBoard {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.photos = [];
  }
  setBackground(img, x, y, width, height){
    this.background = img;
    this.ctx.drawImage(this.background, x, y, width, height);
  }
  setPhoto(img, {x, y, width, height}) {
    this.ctx.drawImage(img, x, y, width, height);
  }
  drawImage(img, x, y, width, height) {
    this.ctx.drawImage(img, x, y, width, height);
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.background) this.ctx.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
    this.photos.forEach(photo => {
      const {img, width, height, x, y} = photo;
      setTransform(this.ctx, {x, y}, () => {
        drawCover(this.ctx, img, 0, 0, width, height);
      })
    });
  }
  add(photo) {
    this.photos.push(photo);
  }
}

const main = async () => { try {
  const photos = await Promise.all([...['./photo1.png', './photo2.png', './photo3.png', './photo4.png'].map(src => loadImage(src))]);
  const frames = await Promise.all([...['./frame1.png', './frame2.png', './frame3.png', './frame4.png'].map(src => loadImage(src))]);
  const frame = await loadImage('./frame.png')

  const frameBoard = new FrameBoard(canvas);

  const photo1 = photos[0]
  frameBoard.setPhoto(photo1, {
    x: (600 / 2) - (photo1.width) / 2,
    y: (900 / 2) - (photo1.height) / 2,
    width: photo1.width,
    height: photo1.height
  })

  const photo2 = photos[1]
  frameBoard.setPhoto(photo2, {
    x: (600 / 2) - (photo2.width) / 2 + 600,
    y: (900 / 2) - (photo2.height) / 2,
    width: photo2.width,
    height: photo2.height
  })

  frameBoard.setBackground(frames[0], 0, 0, 600, 900);
  frameBoard.setBackground(frames[1], 600, 0, 600, 900);

} catch(err){
  console.error(err);
}}

main();