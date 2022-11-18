const loadImage = (src) =>
  new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

const app = document.getElementById("app");
const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 450;
const CELL_WIDTH = 10;
const CELL_HEIGHT = 10;

const main = async () => {
  try {
    const img = await loadImage(
      `https://picsum.photos/${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
    );
    const canvas = Object.assign(document.createElement("canvas"), {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT
    });
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const getImageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const { data, width, height } = getImageData;
    const imageData = [];
    for (let i = 0; i < width * height * 4; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const index = i / 4;
      const x = index % width;
      const y = Math.floor(index / width);
      imageData.push({ r, g, b, a, x, y });
    }
    // console.log(imageData);

    const cols = Math.ceil(CANVAS_WIDTH / CELL_WIDTH);
    const rows = Math.ceil(CANVAS_HEIGHT / CELL_HEIGHT);
    // console.log(cols, rows);
    const cellPosition = Array.from({ length: cols * rows }, (_, i) => {
      const x = i % cols;
      const y = Math.floor(i / cols);
      return [
        x * CELL_WIDTH,
        x * CELL_WIDTH + CELL_WIDTH,
        y * CELL_HEIGHT,
        y * CELL_HEIGHT + CELL_HEIGHT
      ];
    });
    // console.log(cellPosition);

    const mappingCellData = cellPosition.map(() => []);
    imageData.forEach((data) => {
      const { r, g, b, a, x, y } = data;
      const index = cellPosition.findIndex(
        ([x1, x2, y1, y2]) =>
          (x1 < x && x2 > x && y1 < y && y2 > y) ||
          (x1 <= x && x2 >= x && y1 <= y && y2 >= y)
      );
      if (index > -1) {
        mappingCellData[index].push(data);
      }
    });
    // console.log(mappingCellData);
    const cellAverageColor = mappingCellData.map((cellData) => {
      const colors = cellData.reduce(
        (acc, val, i) => {
          acc[0] += val.r;
          acc[1] += val.g;
          acc[2] += val.b;
          acc[3] += val.a;
          if (i === cellData.length - 1) {
            return [
              Math.floor(acc[0] / cellData.length),
              Math.floor(acc[1] / cellData.length),
              Math.floor(acc[2] / cellData.length),
              Math.floor(acc[3] / cellData.length)
            ];
          }
          return acc;
        },
        [0, 0, 0, 0]
      );
      return colors;
    });
    // console.log(cellAverageColor);
    const colorizedPixels = Array.from({ length: width * height }, (_, i) => {
      const x = i % width;
      const y = Math.floor(i / width);
      const index = cellPosition.findIndex(
        ([x1, x2, y1, y2]) => x1 <= x && x2 > x && y1 <= y && y2 > y
      );
      return cellAverageColor[index];
    }).flat();

    const uintc8 = new Uint8ClampedArray(colorizedPixels);
    const newImageData = new ImageData(
      uintc8,
      ctx.canvas.width,
      ctx.canvas.height
    );
    ctx.putImageData(newImageData, 0, 0);
    app.appendChild(canvas);
  } catch (err) {
    console.error(err);
  }
};
main();
