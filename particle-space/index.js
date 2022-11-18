const PARTICLE_SIZE = 5;
const PARTICLE_LIMIT = 1000;
const PARTICLE_ITER_LENGTH = 10;
const PARTICLE_CREATE_DELAY = 5;

const h = (t, o) => Object.assign(document.createElement(t), o);
const canvas = h('canvas', {width: 400, height: 300, style: 'background: black;'});
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const particleSet = new Set();
requestAnimationFrame(function draw(time) {
  particleSet.forEach(f => f(time));
  requestAnimationFrame(draw);
});

const sleep = ms => new Promise(res => setTimeout(res, ms));

class Dot {
  x = 0.5;
  y = 0.5;
  velX;
  velY;
  accX;
  accY;
  constructor(velX, velY, accX = 0, accY = 0) {
    this.velX = velX;
    this.velY = velY;
    this.accX = accX;
    this.accY = accY;
  }
  grow() {
    this.x += this.velX;
    this.y += this.velY;
    this.velX += this.accX;
    this.velY += this.accY;
  }
}

particleSet.add(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const main = async () => { try {
  while (1) {
    if (particleSet.size < PARTICLE_LIMIT) {
      Array.from({length: PARTICLE_ITER_LENGTH}).forEach(() => {
        const vx = (Math.random() - 0.5) * 0.01;
        const vy = (Math.random() - 0.5) * 0.01;
        const dot = new Dot(vx, vy, vx * 0.1, vy * 0.1);
        const grow = () => {
          dot.grow();
          ctx.fillStyle = 'white';
          ctx.fillRect(canvas.width * dot.x, canvas.height * dot.y, PARTICLE_SIZE, PARTICLE_SIZE);
          if (Math.abs(dot.x) > 1 || Math.abs(dot.y) > 1 || dot.x < 0 || dot.y < 0) particleSet.delete(grow);
        };
        particleSet.add(grow);
      });
    }
    
    await sleep(PARTICLE_CREATE_DELAY);
  }
} catch (error) {
  throw Error(error);
}};
main();
