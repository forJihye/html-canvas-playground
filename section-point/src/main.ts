import './style.css'
import backgroundImg from './background.png'

type AlphaRect = {
  width: number;
  height: number;
  x: number;
  y: number;
  index: null|number;
  img: null|HTMLImageElement;
}

const $ = document.querySelectorAll.bind(document);

const alphaRect: AlphaRect[] = [
  { width: 525, height: 695, x: 60, y: 190, index: null, img: null},
  { width: 525, height: 695, x: 615, y: 190, index: null, img: null},
  { width: 525, height: 695, x: 60, y: 915, index: null, img: null},
  { width: 525, height: 695, x: 615, y: 915, index: null, img: null},
]

const getImage = (src: string) => new Promise(res => {
  const img = new Image();
  img.src = src;
  img.onload = () => res(img);
  img.onerror = () => res(null);
});

const app = document.getElementById('app') as HTMLDivElement;
const parent = Object.assign(document.createElement('div'), {className: "container"}) as HTMLDivElement;
const canvas = document.createElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const renderBackground = async () => {
  const background = await getImage(backgroundImg) as HTMLImageElement;
  canvas.width = background.width;
  canvas.height = background.height;
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  parent.appendChild(canvas);
  app.appendChild(parent);
}

const renderImages = async () => {
  const imagesSrc = Array.from({length: 8}, (_, i) => `https://picsum.photos/500/700?random=${i}`);
  const getImages = imagesSrc.map(async (src) => await getImage(src));
  const images = await Promise.all([...getImages]) as HTMLImageElement[];
  const parent = Object.assign(document.createElement('div'), {className: "image-list"}) as HTMLDivElement;
  images.map((img: HTMLImageElement) => parent.appendChild(img));
  app.appendChild(parent);
}

const emptyAlphaRect = () => {
  const index = alphaRect.findIndex(({index}) => index === null);
  return alphaRect[index];
}

const selectImage = (targetIndex: number, targetImg: HTMLImageElement) => {
  const targetRect = emptyAlphaRect();
  if (!targetRect) return;
  const { x, y, width, height } = targetRect;
  targetRect.index = targetIndex;
  targetRect.img = targetImg;
  ctx.drawImage(targetImg, x, y, width, height);
  // ctx.rect(x, y, width, height);
}

let ox = 0;
let oy = 0;
let dx = 0;
let dy = 0;
let clicked = false;

window.addEventListener('pointerdown', (ev: PointerEvent) => {
  const { clientX, clientY } = ev;
  const { left, top, width, height } = canvas.getBoundingClientRect() as DOMRect;
  ox = clientX - left;
  oy = clientY - top;
  if (clientX > left && clientX < left + width && clientY > top && clientY < top + height) { // 캔버스 영역
    clicked = true;
    const scaleX = Math.floor(ox * (canvas.width / width));
    const scaleY = Math.floor(oy * (canvas.height / height));
    alphaRect.forEach((rect) => {
      const { x, y, width, height, index } = rect;
      if (scaleX > x && scaleX < x + width && scaleY > y && scaleY < y + height) {
        if (index === null) return;
        ctx.clearRect(x, y, width, height);
        rect.index = null;
        rect.img = null;
      }
    });
  } else { // 캔버스 외 영역
    clicked = false;
  }
});

window.addEventListener('pointermove', (ev: PointerEvent) => {
  const { clientX, clientY } = ev;
  const { left, top } = canvas.getBoundingClientRect() as DOMRect;
  if (!clicked) return;
  let x = clientX - left;
  let y = clientY - top;
  dx = x - ox;
  dy = y - oy;
  // console.log(dx, dy);
  ox = x;
  oy = y;
});

window.addEventListener('pointerup', () => {
  clicked = false;
})

const main = async() => { try {
  await renderBackground();
  await renderImages();

  const imageList = $(".image-list")[0] as HTMLDivElement;
  const imageChild = imageList.children;
  ([...imageChild as any] as HTMLImageElement[]).forEach((el: HTMLImageElement, i: number) => {
    el.onclick = () => selectImage(i, el)
  });

} catch(err) {
  console.error(err)
}}
main();