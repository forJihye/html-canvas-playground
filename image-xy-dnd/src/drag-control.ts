type PointerDownEvent = PointerEvent & {ox: number; oy: number;};
type PointerMoveEvent = PointerEvent & {dx: number; dy: number; tx: number; ty: number};
type PointerUpEvent = PointerEvent & {dx: number; dy: number; tx: number; ty: number};

class DragControl {
  down?: (ev: PointerDownEvent) => void;
  move?: (ev: PointerMoveEvent, payload?: any) => void;
  up?: (ev: PointerUpEvent, payload?: any) => void;

  prevX: number = 0;
  prevY: number = 0;
  tx: number = 0;
  ty: number = 0;
  payload!: any;
  constructor() {
    window.addEventListener('pointerdown', this.pointerdown.bind(this));
    window.addEventListener('pointermove', this.pointermove.bind(this));
    window.addEventListener('pointerup', this.pointerup.bind(this));
  }
  pointerdown(ev: PointerEvent) {
    const {clientX, clientY} = ev;
    this.tx = clientX;
    this.ty = clientY;
    this.prevX = clientX;
    this.prevY = clientY;
    
    this.down?.(Object.assign(ev, {ox: this.prevX, oy: this.prevY}))
  }
  pointermove(ev: PointerEvent) {
    const {clientX, clientY} = ev;
    const dx = clientX - this.prevX;
    const dy = clientY - this.prevY;
    this.prevX = clientX;
    this.prevY = clientY;

    this.move?.(Object.assign(ev, {dx, dy, tx: clientX - this.tx, ty: clientY - this.ty}), this.payload)
  }
  pointerup(ev: PointerEvent) {
    const {clientX, clientY} = ev;
    const dx = clientX - this.prevX;
    const dy = clientY - this.prevY;
    this.prevX = clientX;
    this.prevY = clientY;

    this.up?.(Object.assign(ev, {dx, dy, tx: clientX - this.tx, ty: clientY - this.ty}), this.payload)
    this.clear();
    this.payload = undefined;
  }
  setDown(f?: (ev: PointerDownEvent) => void) {
    this.down = f;
  }
  setMove(f?: (ev: PointerMoveEvent) => void) {
    this.move = f;
  }
  setUp(f?: (ev: PointerUpEvent) => void) {
    this.up = f;
  }
  clear() {
    this.setDown();
    this.setMove();
    this.setUp();
  }
}

const dragControl = new DragControl();

const addDragControl = (
  target: HTMLElement,
  handlers: {
    down: (ev: PointerDownEvent) => void;
    move: (ev: PointerMoveEvent, payload?: any) => void;
    up: (ev: PointerUpEvent, payload?: any) => void;
    cancel?: (ev: PointerEvent) => void;
  }
) => {
  const {down, move, up, cancel } = handlers;

  const downHandler = (ev: PointerEvent) => {
    ev.preventDefault();
    const payload = down(Object.assign(ev, {ox: ev.clientX, oy: ev.clientY}));
    if (payload === null || payload === undefined) {
      dragControl.setMove();
      dragControl.setUp();
      cancel && cancel(ev);
    } else {
      dragControl.payload = payload;
      dragControl.setMove(move);
      dragControl.setUp(up);
    }
  }
  target.addEventListener('pointerdown', downHandler)

  return () => {
    dragControl.clear();
    target.removeEventListener('pointerdown', downHandler)
  }
}

export default addDragControl;