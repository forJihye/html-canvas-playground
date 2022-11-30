import { getImage, size, clear } from './utils';
import { Tag } from './dom';

import './css/main.css';

const winowToCanvas = (canvas, x, y) => {
  const { width, height, left, top } = canvas.getBoundingClientRect();
  return {
    x: (x - left) * (canvas.width / width),
    y: (y - top) * (canvas.height / height),
  };
};

const pinchZoom = new class PinchZoom {
  constructor() {
    this.log = new Tag('div').el;
    document.body.appendChild(this.log);

    this.canvas = new Tag('canvas', { width: 1000, height: 500, style: 'position: relative; background: red;' }).el;
    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('touchstart', (ev) => this.touchDownHandler(ev));
    this.canvas.addEventListener('touchmove', (ev) => this.touchMoveHandler(ev));

    this.canvas.addEventListener('mousedown', (ev) => this.mouseDownHandler(ev));
    this.canvas.addEventListener('mousemove', (ev) => this.mouseMoveHandler(ev));
    this.canvas.addEventListener('mouseup', (ev) => this.mouseUpHandler(ev));

    this.border = [0, 0, this.canvas.width, this.canvas.height];

    this.cx = 0;
    this.cy = 0;
    this.cr = 1;

    getImage('https://thumbs.gfycat.com/CandidClumsyGypsymoth-max-1mb.gif')
      .then((img) => this.photo = img)
      .then(() => {
        window.onresize();
        this.init();
      });

    window.onresize = () => {
      size(this.canvas, innerWidth, innerHeight);
      this.border = [0, 0, this.canvas.width, this.canvas.height];
    };

    document.body.appendChild(this.canvas);
  }

  init() {
    this.cx = this.photo.width / 2;
    this.cy = this.photo.height / 2;
    const dPhotoWidth = this.photo.width  * this.cr;
    const dPhotoHeight = this.photo.height * this.cr;

    this.draw(
      this.photo,
      this.cx,
      this.cy,
      dPhotoWidth,
      dPhotoHeight
    );
  }

  test() {
    // this.draw(this.photo, this.photo.width, this.photo.height, this.photo.width, this.photo.height);
  }

  getTouchesLength(ev) {
    const { changedTouches, touches } = ev;
    return [ changedTouches.length, touches.length ];
  }

  touchToPosition(touch) {
    return [touch.pageX, touch.pageY];
  }

  getDistance(x1, y1, x2, y2) {
    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
      distance: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    };
  }

  isPinching(ev) {
    // 터치 이벤트의 터치입력 개수 확인
    const [changed, touching] = this.getTouchesLength(ev);
    return touching === 2;
  }

  isDragging(ev) {
    const [changed, touching] = this.getTouchesLength(ev);
    return changed === 1 && touching === 1;
  }
  
  touchDownHandler(ev) {
    ev.preventDefault();

    if (this.isDragging(ev)) {
      const { pageX, pageY } = ev.touches[0];
      this.drawdown(winowToCanvas(this.canvas, pageX, pageY));
    }

    if (this.isPinching(ev)) {
      const [touch1, touch2] = ev.touches;
      const point1 = winowToCanvas(this.canvas, ...this.touchToPosition(touch1));
      const point2 = winowToCanvas(this.canvas, ...this.touchToPosition(touch2));

      this.drawdown(this.getDistance(point1.x, point1.y, point2.x, point2.y));
    }
  }
  touchMoveHandler(ev) {
    ev.preventDefault();

    if (this.isDragging(ev)) {
      const { pageX, pageY } = ev.touches[0];
      this.drawmove(winowToCanvas(this.canvas, pageX, pageY));
    }

    if (this.isPinching(ev)) {
      const [touch1, touch2] = ev.touches;
      const point1 = winowToCanvas(this.canvas, ...this.touchToPosition(touch1));
      const point2 = winowToCanvas(this.canvas, ...this.touchToPosition(touch2));

      this.drawmove(this.getDistance(point1.x, point1.y, point2.x, point2.y));
    }
  }

  mouseDownHandler(ev) {
    this.mousePushed = true;
    const { pageX, pageY } = ev;
    this.drawdown(winowToCanvas(this.canvas, pageX, pageY));
  }
  
  mouseMoveHandler(ev) {
    if (!this.mousePushed) return;
    const { pageX, pageY } = ev;
    this.drawmove(winowToCanvas(this.canvas, pageX, pageY));
  }

  mouseUpHandler(ev) {
    this.mousePushed = false;
  }

  moveGuard(x, y, r, w, h, border) {
    const [ minX, minY, maxX, maxY ] = border;
    
    // r guard
    // 이미지 가로 세로 비율 비교 후 더 작은 최대 줌 배율 입력
    const maxR = Math.min((maxX - minX) / w, (maxY - minY) / h);
    const cr = Math.min(r, maxR);
    
    // min max guard
    const wr = w * cr;
    const hr = h * cr;
    let cx = x;
    let cy = y;
    cx = Math.max(cx, minX + wr / 2);
    cy = Math.max(cy, minY + hr / 2);
    cx = Math.min(cx, maxX - wr / 2);
    cy = Math.min(cy, maxY - hr / 2);

    return { cx, cy, cr };
  }

  drawdown({ x, y, distance }) {
    // console.log('drawstart', x, y, distance);
    this.ox = x;
    this.oy = y;
    if (distance) this.od = distance;
  }

  drawmove({ x, y, distance }) {
    if (this.od && !distance) { // distance is gone
      this.od = null;
      this.ox = x;
      this.oy = y;
    }

    const dx = x - this.ox;
    const dy = y - this.oy;
    this.cx += dx;
    this.cy += dy;
    this.oy = y;
    this.ox = x;
    if (distance) {
      const dd = distance / this.od;
      this.cr *= dd;
      this.od = distance;
    }
    
    const { cx, cy, cr } = this.moveGuard(this.cx, this.cy, this.cr, this.photo.width, this.photo.height, this.border);
    this.cx = cx;
    this.cy = cy;
    this.cr = cr;
    const dPhotoWidth = this.photo.width  * this.cr;
    const dPhotoHeight = this.photo.height * this.cr;

    this.draw(
      this.photo,
      this.cx,
      this.cy,
      dPhotoWidth,
      dPhotoHeight
    );
  }

  draw(img, x, y, w, h) {
    clear(this.canvas);
    
    this.ctx.drawImage(img, 0, 0, img.width, img.height, x - w / 2,y - h / 2,w,h);
    
  }
}
