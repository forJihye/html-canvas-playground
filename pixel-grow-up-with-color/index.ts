import Grow2D, { Grow2DDotType } from "./grow2d";
import "./styles.css";

const WIDTH = Math.floor(window.innerWidth / 2);
const HEIGHT = Math.floor(window.innerHeight / 2);

const grow2d = new Grow2D(WIDTH, HEIGHT, {
  hWeight: 5,
  sWeight: 2,
  lWeight: 2
});

const canvas = Object.assign(document.createElement("canvas"), {
  width: WIDTH,
  height: HEIGHT,
  onclick(ev: MouseEvent) {
    const { layerX, layerY } = (ev as any) as {
      layerX: number;
      layerY: number;
    };
    const { x, y, width, height } = canvas.getBoundingClientRect();
    const w = width;
    const h = height;

    const px = Math.floor((layerX / w) * canvas.width);
    const py = Math.floor((layerY / h) * canvas.height);
    {
      const result = grow2d.seed(px, py);
      if (!result) return;
      const [
        index,
        {
          type,
          x,
          y,
          color: { h, s, l }
        }
      ] = result;
      if (type === Grow2DDotType.fill) {
        ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
});
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;
document.body.append(canvas);

requestAnimationFrame(function run() {
  let max = Math.ceil(grow2d.boundarySize / 10);
  max > 500 && (max = 500);
  for (let i = 0; i < max; i++) {
    const [
      index,
      {
        type,
        x,
        y,
        color: { h, s, l }
      }
    ] = grow2d.up();
    if (type === Grow2DDotType.fill) {
      ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  requestAnimationFrame(run);
});

let timer: number = 0;
window.onresize = () => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    const WIDTH = Math.floor(window.innerWidth / 2);
    const HEIGHT = Math.floor(window.innerHeight / 2);
    console.log("width", WIDTH, "height", HEIGHT);

    grow2d.init();
    grow2d.width = canvas.width = WIDTH;
    grow2d.height = canvas.height = HEIGHT;
    console.log(grow2d);
  }, 64);
};
