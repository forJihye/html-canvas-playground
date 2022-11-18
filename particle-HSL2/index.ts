import { canvas, img } from 'element-mold/dist/html';
import {
  gcd,
  divisors,
  getRandomRGB,
  getRandItem,
  RGB2HSL,
  getRandomHSL,
  getHSL
} from './helper';

const CANVAS_WIDTH = 30 * 20;
const CANVAS_HEIGHT = 8 * 20;
const NUMBER_OF_PARTICLES = 5000;
const MAX_GRID = 1000;
const RADIUS = 2;
const AGE_OFFSET = 60;
const LIFE_OFFSET = 60;

const canvasElement = canvas({
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  style: {
    position: 'absolute',
    left: '0%',
    width: '50%',
    height: '100%'
  }
});
const canvasElement2 = canvas({
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  style: {
    position: 'absolute',
    left: '50%',
    width: '50%',
    height: '100%'
  }
});
const ctx = <CanvasRenderingContext2D>canvasElement.getContext('2d');
const ctx2 = <CanvasRenderingContext2D>canvasElement2.getContext('2d');

document.body.appendChild(canvasElement);
document.body.appendChild(canvasElement2);

canvasElement.style.background = `black`;
document.body.setAttribute(
  'style',
  `
  margin: 0; 
  width: 100%; 
  height: 100%;
  position: relative;
  overflow: hidden;`
);

const gcdVal = gcd(CANVAS_WIDTH, CANVAS_HEIGHT);
const gcdDivisors = divisors(gcdVal);
const availableGcdDivisors = gcdDivisors.filter((val) => {
  return (CANVAS_WIDTH / val) * (CANVAS_HEIGHT / val) < MAX_GRID;
});

const changeImage = (targetArray: any[][], blur: number = 0) => {
  targetArray.splice(0);
  const currentDivisors = getRandItem(availableGcdDivisors);

  const edge = currentDivisors;
  const rows = CANVAS_HEIGHT / edge;
  const cols = CANVAS_WIDTH / edge;
  const canvasElement = canvas({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    style: {
      background: 'black'
    }
  });
  const ctx = <CanvasRenderingContext2D>canvasElement.getContext('2d');
  ctx.fillStyle = getRandomHSL(100, 1);
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.filter = `blur(${blur}px)`;
  for (let i = 0; i < rows * cols; i++) {
    const x = i % cols;
    const y = Math.floor(i / cols);

    ctx.fillStyle = getRandomHSL(100, 10);
    ctx.fillRect(x * edge, y * edge, edge, edge);
  }

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const [h] = RGB2HSL(r, g, b);
    targetArray.push([h]);
  }

  return canvasElement;
};
const applyPhoto = (
  photo: HTMLImageElement,
  targetArray: any[][],
  blur: number = 0
) => {
  console.log('applyPhoto');
  targetArray.splice(0);

  const canvasElement = canvas({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    style: {
      background: 'black'
    }
  });
  const ctx = <CanvasRenderingContext2D>canvasElement.getContext('2d');
  ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(photo, 0, 0);

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const [h] = RGB2HSL(r, g, b);
    targetArray.push([h]);
  }
  console.log(canvasElement, targetArray);
  return canvasElement;
};

const metaArray: any[][] = [];
ctx2.drawImage(changeImage(metaArray), 0, 0);

const particles: Particle[] = [];

const ROUND = Math.PI * 2;
class Particle {
  x: number = 0;
  y: number = 0;
  velocity: number = 0;
  accelation: number = 0;
  angle: number = 0;
  posX: number = 0;
  posY: number = 0;

  life: number = 0;
  age: number = 0;

  width!: number;
  height!: number;

  r: number = 255;
  g: number = 255;
  b: number = 255;
  fillStyle!: string;
  get color() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  constructor(canvas: HTMLCanvasElement) {
    ({ width: this.width, height: this.height } = canvas);
    this.init();
  }

  init() {
    this.x = Math.random() * this.width;
    this.y = Math.random() * this.height;
    this.velocity = Math.random() * 0.25 + 1.0;
    this.accelation = Math.random() * 0.001 + 0.001;
    this.angle = Math.random() * Math.PI * 2;
    this.r = Math.floor(Math.random() * 256);
    this.g = Math.floor(Math.random() * 256);
    this.b = Math.floor(Math.random() * 256);

    this.life = Math.floor(Math.random() * 200 + AGE_OFFSET + LIFE_OFFSET);
    this.age = 0;
  }

  next() {
    this.posX = Math.floor(this.x);
    this.posY = Math.floor(this.y);
    this.x += Math.sin(this.angle) * this.velocity;
    this.y += Math.cos(this.angle) * this.velocity;
    this.velocity += this.accelation;
    this.life--;
    this.age++;
    this.fillStyle = getHSL((this.angle / Math.PI) * 180, 100, 50);
    if (
      this.x < 0 ||
      this.y < 0 ||
      this.x > this.width ||
      this.y > this.height ||
      this.life < 0
    ) {
      this.init();
    }
  }
}

particles.push(
  ...Array.from(
    { length: NUMBER_OF_PARTICLES },
    () => new Particle(canvasElement)
  )
);

const raf = () => {
  ctx.globalAlpha = 0.075;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.globalAlpha = 1;
  particles.forEach((particle) => {
    const index = particle.posX + particle.posY * CANVAS_WIDTH;
    const angle: number = metaArray[index][0];
    particle.angle = (Math.PI / 180) * angle;
    particle.next();
    ctx.beginPath();
    if (particle.age < AGE_OFFSET) ctx.globalAlpha = particle.age / AGE_OFFSET;
    if (particle.life < LIFE_OFFSET)
      ctx.globalAlpha = particle.life / LIFE_OFFSET;
    ctx.fillStyle = particle.fillStyle;
    // ctx.fillStyle = getRandomRGB();
    ctx.arc(particle.x, particle.y, RADIUS, 0, ROUND);
    ctx.fill();
  });
  // compCtx(ctx, 25);
  requestAnimationFrame(raf);
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const main = async () => {
  while (1) {
    await sleep(1000);
    ctx2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx2.drawImage(changeImage(metaArray, 2), 0, 0);
    await sleep(1000);
    ctx2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx2.drawImage(changeImage(metaArray, 4), 0, 0);
    await sleep(1000);
    ctx2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx2.drawImage(changeImage(metaArray, 8), 0, 0);
    await sleep(1000);
    ctx2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx2.drawImage(changeImage(metaArray, 12), 0, 0);
    await sleep(1000);
    ctx2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx2.drawImage(changeImage(metaArray, 16), 0, 0);
    await sleep(1000);
    ctx2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx2.drawImage(changeImage(metaArray, 20), 0, 0);
    await sleep(1000);
    ctx2.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx2.drawImage(changeImage(metaArray, 25), 0, 0);
    await sleep(5000);
  }
};
setTimeout(() => {
  raf();
  main();
}, 1000);
