import "./styles.css";

const index2pos = (index: number, width: number, height: number) => {
  return [index % width, Math.floor(index / width)];
};
const pos2index = (x: number, y: number, width: number, height: number) => {
  if (x < 0 || width <= x || y < 0 || height <= y) return -1;
  return y * width + x;
};
const getAround8Pos = (x: number, y: number) => [
  [x - 1, y - 1],
  [x, y - 1],
  [x + 1, y - 1],
  [x - 1, y],
  [x + 1, y],
  [x - 1, y + 1],
  [x, y + 1],
  [x + 1, y + 1]
];
const getAround4Pos = (x: number, y: number) => [
  [x, y - 1],
  [x - 1, y],
  [x + 1, y],
  [x, y + 1]
];
const randInt = (n: number) => Math.floor(Math.random() * n);
const randItem = <T>(a: T[]) => a[randInt(a.length)];

enum Grow2DDotType {
  empty,
  disable,
  fill
}

class Grow2D {
  static EMPTY = { type: Grow2DDotType.empty, x: 0, y: 0 };

  state: { type: Grow2DDotType; x: number; y: number }[] = [];
  count: number = 0;

  private boundary: Set<number> = new Set();
  get boundarySize() {
    return this.boundary.size;
  }

  constructor(public width: number, public height: number) {
    this.init();
  }
  init() {
    this.state = Array.from(
      { length: this.width * this.height },
      () => Grow2D.EMPTY
    );
    this.count = 0;
  }
  seed(x: number, y: number) {
    const index = pos2index(x, y, this.width, this.height);
    this.state[index] = { type: Grow2DDotType.fill, x, y };
    this.count++;
    const around = getAround8Pos(x, y);

    around
      .map(([x, y]) => pos2index(x, y, this.width, this.height))
      .filter((n) => n !== -1 && this.state[n].type === Grow2DDotType.empty)
      .forEach((n) => this.boundary.add(n));
  }
  up() {
    if (!this.boundary.size) return this.state;

    const index = randItem([...this.boundary]);

    const [x, y] = index2pos(index, this.width, this.height);
    this.state[index] = { type: Grow2DDotType.fill, x, y };
    this.count++;
    this.boundary.delete(index);

    const around = getAround8Pos(x, y);
    around
      .map(([x, y]) => pos2index(x, y, this.width, this.height))
      .filter((n) => n !== -1 && this.state[n].type === Grow2DDotType.empty)
      .forEach((n) => this.boundary.add(n));

    return this.state;
  }
}

const WIDTH = 200;
const HEIGHT = 200;

const grow2d = new Grow2D(WIDTH, HEIGHT);

const canvas = Object.assign(document.createElement("canvas"), {
  width: WIDTH,
  height: HEIGHT,
  onclick({ pageX, pageY }: MouseEvent) {
    const { x, y, width, height } = canvas.getBoundingClientRect();
    const w = width - x;
    const h = height - y;
    const px = Math.floor((pageX / w) * canvas.width);
    const py = Math.floor((pageY / h) * canvas.height);
    grow2d.seed(px, py);
  }
});
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;
document.body.append(canvas);

requestAnimationFrame(function run() {
  let max = Math.ceil(grow2d.boundarySize / 20);
  max > 500 && (max = 500);
  for (let i = 0; i < max; i++) grow2d.up();

  grow2d.state.forEach(({ type, x, y }) => {
    if (type === Grow2DDotType.fill) {
      ctx.fillRect(x, y, 1, 1);
    }
  });
  requestAnimationFrame(run);
});
