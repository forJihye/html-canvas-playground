import { drawCover } from "../src/utils";

const setTransform = (ctx, { x, y }, f) => {
  ctx.save();
  ctx.translate(x, y);
  f();
  ctx.restore();
};

export class PhotoItem {
  constructor(img, {id, x, y, width, height}) {
    Object.assign(this, {
      img,
      id,
      x,
      y,
      width: width,
      height: height,
    })
  }
  move(x, y) {
    this.x += x;
    this.y += y;
  }
}

export class FrameCanvas {
  constructor(canvas) {
    this.canvas = Object.assign(canvas, {width: canvas.width, height: canvas.height});
    this.ctx = this.canvas.getContext('2d');

    this.frames = [];
    this.photos = [];
  }
  correction(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * this.canvas.width / rect.width,
      y: (clientY - rect.top) * this.canvas.height / rect.height
    }
  }
  addFrame({img, x, y, width, height}) {
    const canvas = Object.assign(document.createElement('canvas'), {width, height})
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    this.ctx.drawImage(canvas, x, y, canvas.width, canvas.height);
    this.frames.push(ctx);
  }
  addPhoto(photoItem) {
    this.photos.push(photoItem);
    this.draw()
  }
  draw() {
    this.photos.map((photo, i) => {
      const {img, x, y, width, height} = photo;
      if (this.frames[i]) {
        this.frames[i].drawImage(img, 0, 0, width, height);
      }
      // drawCover(this.ctx, img, x, y, width, height);
    });
  }
}

