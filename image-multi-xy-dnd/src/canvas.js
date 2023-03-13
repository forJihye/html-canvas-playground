// 프레임 사진
// 프레임 캔버스 메인

import { drawCover } from "./utils";

export class FramePhoto {
  constructor({id, img, x, y, width, height}) {
    Object.assign(this, {id, img, x, y, width, height});
  }
  move(x, y) {
    this.x += x;
    this.y += y;
  }
}

export class FrameCanvas {
  constructor({background, x, y, width, height}) {
    this.background = background;
    this.canvas = Object.assign(document.createElement('canvas'), {width: background.width, height: background.height});
    this.ctx = this.canvas.getContext('2d');
    Object.assign(this, {x, y, width, height});
  }
  add(framePhoto) {
    const {img, x, y, width, height} = framePhoto;
    this.photo = framePhoto
    drawCover(this.ctx, img, x, y, width, height);
    drawCover(this.ctx, this.background, 0, 0, this.background.width, this.background.height);
  }
}

export class FrameMain {
  framePosition = [ [0, 0], [600, 0], [0, 900], [600, 900] ];

  constructor(canvas) {
    this.canvas = Object.assign(canvas, {width: canvas.width, height: canvas.height})
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
      this.frames.forEach((frameCanvas, i) => {
        const [fx, fy] = this.framePosition[i];
        if (x >= fx && x <= fx + frameCanvas.width && y >= fy && y <= fy + frameCanvas.height) {
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
      this.focus.move(this.dx, this.dy);
    });
    window.addEventListener('pointerup', (ev) => {
      ev.preventDefault();
      this.focus = null;
    });
  }
  add(frameCanvas) {
    this.frames.push(frameCanvas);
    this.draw();
  }
  draw() {
    this.frames.map((frameCanvas, i) => {
      this.ctx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
      const [x, y] = this.framePosition[i];
      const { canvas: fcanvas } = frameCanvas;
      frameCanvas.add(frameCanvas.photo);
      this.ctx.drawImage(fcanvas, x, y, fcanvas.width, fcanvas.height)
    })
  }
  correction (clientX, clientY){
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * this.canvas.width / rect.width,
      y: (clientY - rect.top) * this.canvas.height / rect.height
    }
  }
  
}