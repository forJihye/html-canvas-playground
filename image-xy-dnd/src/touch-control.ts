type TouchStartEvent = TouchEvent & {ox: number; oy: number;};
type TouchMoveEvent = TouchEvent & {dx: number; dy: number; tx: number; ty: number};
type TouchUpEvent = TouchEvent & {dx: number; dy: number; tx: number; ty: number};

class TouchControl {
  down?: (ev: TouchStartEvent) => void;
  move?: (ev: TouchMoveEvent, payload?: any) => void;
  up?: (ev: TouchUpEvent, payload?: any) => void;

  prevX: number = 0;
  prevY: number = 0;
  tx: number = 0;
  ty: number = 0;
  payload!: any;
  constructor() {
    window.addEventListener('touchstart', this.touchstart.bind(this), { passive: false });
    window.addEventListener('touchmove', this.touchmove.bind(this), { passive: false });
    window.addEventListener('touchend', this.touchend.bind(this), { passive: false });
  }
  getTouches (event: TouchEvent) {
    return Array.from(event.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
    }));
  }
  touchstart(ev: TouchEvent) {
    const touch = this.getTouches(ev)[0];
    const {x, y} = touch;
    this.tx = x;
    this.ty = y;
    this.prevX = x;
    this.prevY = y;
    this.down?.(Object.assign(ev, {ox: this.prevX, oy: this.prevY}))
  }
  touchmove(ev: TouchEvent) {
    const touch = this.getTouches(ev)[0];
    const {x, y} = touch;
    const dx = x - this.prevX;
    const dy = y - this.prevY;
    this.prevX = x;
    this.prevY = y;
    this.move?.(Object.assign(ev, {dx, dy, tx: x - this.tx, ty: y - this.ty}), this.payload)
  }
  touchend(ev: TouchEvent) {
    ev.stopPropagation();
    ev.preventDefault();
    this.up?.(Object.assign(ev), this.payload)
    this.clear();
    this.payload = undefined;
  }
  setDown(f?: (ev: TouchStartEvent) => void) {
    this.down = f;
  }
  setMove(f?: (ev: TouchMoveEvent) => void) {
    this.move = f;
  }
  setUp(f?: (ev: TouchUpEvent) => void) {
    this.up = f;
  }
  clear() {
    this.setDown();
    this.setMove();
    this.setUp();
  }
}

const touchControl = new TouchControl();
const addTouchControl = (
  target: HTMLElement,
  handlers: {
    down: (ev: TouchStartEvent) => void;
    move: (ev: TouchMoveEvent, payload?: any) => void;
    up: (ev: TouchUpEvent, payload?: any) => void;
    cancel?: (ev: TouchEvent) => void;
  }
  ) => {
  const {down, move, up, cancel } = handlers;
  const downHandler = (ev: TouchEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const payload = down(ev as TouchStartEvent);
    if (payload === null || payload === undefined) {
      touchControl.setMove();
      touchControl.setUp();
      cancel && cancel(ev);
    } else {
      touchControl.payload = payload;
      touchControl.setMove(move);
      touchControl.setUp(up);
    }
  }
  target.addEventListener('touchstart', downHandler)
  return () => {
    touchControl.clear();
    target.removeEventListener('touchstart', downHandler)
  }
}

export default addTouchControl;
