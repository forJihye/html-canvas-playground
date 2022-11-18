import photo from "./image.png";

const getImage = (src) =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = src;
    img.crossOrigin = "Anonymous";
  });

class Canvas {
  constructor(width, height) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;
  }
  drawImage(image) {
    this.ctx.drawImage(image, 0, 0, this.width, this.height);
  }
  getImageData(x, y, width, height) {
    return this.ctx.getImageData(x, y, width, height);
  }
  putImageData(imageData) {
    this.ctx.putImageData(imageData, 0, 0);
  }
  rect() {
    return this.canvas.getBoundingClientRect();
  }
}

const main = async () => {
  try {
    const image = await getImage(photo);

    const width = 500;
    const height = (image.height * width) / image.width;

    const canvas1 = new Canvas(width, height);
    const canvas2 = new Canvas(width, height);
    const ctx1 = canvas1.ctx;
    const ctx2 = canvas2.ctx;

    const app = document.getElementById("app");
    app.appendChild(canvas1.canvas);
    app.appendChild(canvas2.canvas);

    canvas1.drawImage(image);
    canvas2.drawImage(image);

    const rect = canvas1.rect();

    const colorbox = document.getElementById("color");
    const redEl = document.querySelector(".r");
    const greenEl = document.querySelector(".g");
    const blueEl = document.querySelector(".b");
    const brightnessEl = document.querySelector(".brightness");
    const brightnessBar = document.querySelector(".bar1");
    const colorizeBar = document.querySelector(".bar2");

    const imageData = ctx2.getImageData(0, 0, width, height);
    const colorHexs = imageData.data;
    const startColor = [237, 140, 12];
    const endColor = [89, 153, 36];

    const grayscale = (r, g, b) => Math.floor((r + g + b) / 3);
    const brightness = (grayscale) => grayscale / 255;

    for (let i = 0; i < imageData.width * imageData.height * 4; i += 4) {
      const r = colorHexs[i];
      const g = colorHexs[i + 1];
      const b = colorHexs[i + 2];
      const v = grayscale(r, g, b);
      const brightnessWeight = brightness(grayscale(r, g, b));

      colorHexs[i] =
        (endColor[0] - startColor[0]) * brightnessWeight + startColor[0];
      colorHexs[i + 1] =
        (endColor[1] - startColor[1]) * brightnessWeight + startColor[1];
      colorHexs[i + 2] =
        (endColor[2] - startColor[2]) * brightnessWeight + startColor[2];
      // colorHexs[i] = v;
      // colorHexs[i + 1] = v;
      // colorHexs[i + 2] = v;
    }

    canvas2.putImageData(imageData);

    document.addEventListener("pointermove", (ev) => {
      const { clientX, clientY } = ev;
      if (
        clientX < rect.x ||
        clientX > rect.x + rect.width ||
        clientY < rect.y ||
        clientY > rect.y + rect.height
      )
        return;

      const pick = ctx1.getImageData(clientX - rect.x, clientY - rect.y, 1, 1);
      const r = pick.data[0];
      const g = pick.data[1];
      const b = pick.data[2];
      const a = pick.data[3];
      const brightnessWeight = brightness(grayscale(r, g, b));

      colorbox.style.background = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      redEl.innerText = r;
      greenEl.innerText = g;
      blueEl.innerText = b;
      brightnessEl.innerText = brightnessWeight.toFixed(2);
      brightnessBar.style.left = `${brightnessWeight.toFixed(2) * 100}%`;
      colorizeBar.style.left = `${brightnessWeight.toFixed(2) * 100}%`;
    });
  } catch (error) {
    console.error(error);
  }
};
main();
