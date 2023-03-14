// 프레임 사진
// 프레임 캔버스 메인

import { drawCover } from "./utils";

export class FramePhoto {
  constructor({id, img, x, y, width, height, minX, maxX, minY, maxY }) {
    // console.log(x, y, width, height, minX, maxX)
    // console.log(minX, maxX)
    Object.assign(this, {id, img, x, y, width, height, minX, maxX, minY, maxY});
  }
  move(x, y) {
    this.x += x;
    this.y += y;
    if (this.x >= this.minX) this.x = this.minX;
    if (this.y >= this.minY) this.y = this.minY;
    if (this.x <= this.maxX) this.x = this.maxX;
    if (this.y <= this.maxY) this.y = this.maxY;
  }
}

export class FrameCanvas {
  constructor({background, x, y, width, height, alphaRect, fillStyle}) {
    Object.assign(this, { background, x, y, width, height, alphaRect, fillStyle });
    this.canvas = Object.assign(document.createElement('canvas'), {
      width: background.width,
      height: background.height
    });
    this.ctx = this.canvas.getContext('2d');
  }
  add(framePhoto) {
    this.photo = framePhoto;
    const {img, x, y, width, height} = this.photo;
    console.log(img, x, y, width, height)
    // this.ctx.fillStyle = this.fillStyle;
    // this.ctx.fillRect(0, 0, this.width, this.height);
    drawCover(this.ctx, img, x, y, width, height);
    drawCover(this.ctx, this.background, 0, 0, this.width, this.height);
  }
  draw() {
    const {img, x, y, width, height} = this.photo;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.ctx.fillStyle = this.fillStyle;
    // this.ctx.fillRect(0, 0, this.width, this.height);
    drawCover(this.ctx, img, x, y, width, height);
    drawCover(this.ctx, this.background, 0, 0, this.width, this.height);
  }
}

export class FrameMain {
  constructor(canvas) {
    this.canvas = Object.assign(canvas, {width: canvas.width, height: canvas.height});
    this.ctx = this.canvas.getContext('2d');

    this.frames = [];

    this.focus = null;
    this.ox = 0;
    this.oy = 0;
    this.dx = 0;
    this.dy = 0;
    window.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      const {x, y} = this.correction(ev.clientX, ev.clientY);
      this.ox = x;
      this.oy = y;
      // console.log(x, y)
      this.focus = null;
      this.frames.forEach((frameCanvas, i) => {
        const { alphaRect, x, y, width, height } = frameCanvas;
        if (this.ox > x+1 && this.ox < x+width+1 && this.oy > y+1 && this.oy < y+height+1) {
          this.focus = frameCanvas;
        }
      })
    });
    window.addEventListener('pointermove', (ev) => {
      ev.preventDefault();
      if (this.focus === null) return;
      const {x, y} = this.correction(ev.clientX, ev.clientY);
      this.dx = x - this.ox;
      this.dy = y - this.oy;
      this.ox = x;
      this.oy = y;
      // console.log(this.focus)
      this.frames.map((frameCanvas, i) => {
        const { canvas: fcanvas, photo, background, alphaRect, x, y, width, height } = frameCanvas;
        if (this.focus.photo.id === photo.id)   {
          // console.log(photo)
          this.ctx.clearRect(x, y, width, height);
          photo.move(this.dx, 0);
          frameCanvas.draw();
          this.ctx.drawImage(fcanvas, x, y, width, height);  
        } else {

        }
      });      
    });
    window.addEventListener('pointerup', (ev) => {
      ev.preventDefault();
      const {x, y} = this.correction(ev.clientX, ev.clientY);
      this.focus = null;
      this.ox = x;
      this.oy = y;
    });
  }
  init(framesCanvas) {
    this.frames = framesCanvas;
    this.draw();
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.frames.map((frameCanvas, i) => {
      const { canvas: fcanvas, photo, background, alphaRect, x, y, width, height } = frameCanvas;
      this.ctx.drawImage(fcanvas, x, y, width, height);  
    });
  }
  correction (clientX, clientY){
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * this.canvas.width / rect.width,
      y: (clientY - rect.top) * this.canvas.height / rect.height
    }
  }
  
}