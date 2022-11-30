type LabelMap = {
  [labelId: number]: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    alpha: [number, number][];
  };
};

const loadImg = (src: string) => {
  return new Promise<HTMLImageElement | null>((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);

    img.src = src;
  });
};

const getPixelByPos = (imageData: ImageData, x: number, y: number) => {
  const { width, height, data } = imageData;
  if (x < 0 || width <= x || y < 0 || height <= y) return null;

  const imageDataIndex = (y * width + x) * 4;
  const r = data[imageDataIndex];
  const g = data[imageDataIndex + 1];
  const b = data[imageDataIndex + 2];
  const a = data[imageDataIndex + 3];

  return { r, g, b, a, index: imageDataIndex };
};

const getTransparentPixels = function* (
  imageData: ImageData,
  checkedIndex: Set<number>
) {
  const imageDataLength = imageData.data.length;
  const width = imageData.width;
  const height = imageData.height;

  for (let i = 0; i < imageDataLength; i += 4) {
    if (imageData.data[i + 3] === 255 || checkedIndex.has(i)) continue;

    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    checkedIndex.add(i);
    yield { x, y, index: i, a: imageData.data[i + 3] } as const;
  }
};

const getLabelPos = function* (
  imageData: ImageData,
  x: number,
  y: number,
  checkedIndex: Set<number>
) {
  const stack = [[x, y]] as [number, number][];
  while (stack.length) {
    const [x, y] = stack.shift() as [number, number];
    
    const dir8 = [ // 라벨링 검사 위치 (기준점으로 상 하 좌 우 상하좌우 대각선)
      [x - 1, y - 1], // 상 왼쪽 대각선
      [x, y - 1], // 상
      [x + 1, y - 1], // 상 오른쪽 대각선
      [x - 1, y], // 좌
      // [x, y],
      [x + 1, y], // 우
      [x - 1, y + 1], // 하 왼쪽 대각선
      [x, y + 1], // 하
      [x + 1, y + 1], // 하 오른쪽 대각선
    ].map(
      ([x, y]) =>
        [x, y, getPixelByPos(imageData, x, y)] as [
          number,
          number,
          ReturnType<typeof getPixelByPos>
        ] // 주변 좌표에 대한 픽셀 RGBA값과 인덱스값 저장
    ) as [ number, number, {r: number; g: number; b: number; a: number; index: number} ][];

    const nextTransparentPixels = dir8.filter(
      ([, , meta]) => meta && !checkedIndex.has(meta.index) && meta.a !== 255
    );

    for (const pos of nextTransparentPixels) {
      const [x, y, { index }] = pos;
      checkedIndex.add(index);
      stack.push([x, y]);
      yield pos;
    }
  }
};
const getLabelPixels = function* (imageData: ImageData, result: LabelMap) {
  const checkedImageDataIndexes = new Set<number>();
  let labelId = -1;

  for (const { x, y } of getTransparentPixels(
    imageData,
    checkedImageDataIndexes
  )) {
    result[++labelId] = {
      x1: Infinity,
      y1: Infinity,
      x2: -Infinity,
      y2: -Infinity,
      width: 0,
      height: 0,
      alpha: [],
    };
    for (const pos of getLabelPos(imageData, x, y, checkedImageDataIndexes)) {
      const [x, y] = pos;
      const target = result[labelId];

      if (target.x1 > x) target.x1 = x;
      if (target.y1 > y) target.y1 = y;
      if (target.x2 < x) target.x2 = x;
      if (target.y2 < y) target.y2 = y;
      target.width = target.x2 - target.x1;
      target.height = target.y2 - target.y1;

      target.alpha.push([x, y]);
      yield {
        [labelId]: {
          ...target,
          alpha: [[x, y]] as [number, number][],
        },
      };
    }
  }
};

const drawResult = (() => {
  const tempColor: any = {};
  const tempCanvas = document.createElement("canvas") as HTMLCanvasElement;
  const tempCtx = tempCanvas.getContext("2d") as CanvasRenderingContext2D;
  tempCanvas.style.position = "absolute";
  tempCtx.textAlign = "center";
  document.body.append(tempCanvas);

  return (
    result: LabelMap,
    ctx: CanvasRenderingContext2D,
    result2: LabelMap
  ) => {
    tempCanvas.width = ctx.canvas.width;
    tempCanvas.height = ctx.canvas.height;

    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.drawImage(tempCanvas, 0, 0);
    for (const labelId in result) {
      const id = Number(labelId);
      if (!tempColor[id])
        tempColor[id] =
          "#" +
          Math.floor(Math.random() * 255)
            .toString(16)
            .padStart(2, "0") +
          Math.floor(Math.random() * 255)
            .toString(16)
            .padStart(2, "0") +
          Math.floor(Math.random() * 255)
            .toString(16)
            .padStart(2, "0");

      const color = tempColor[id];

      const data = result[id];
      data.alpha.forEach(([x, y]) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      });
    }

    const FONT_SIZE = 64;
    for (const labelId in result2) {
      const id = Number(labelId);
      // if (!result[id]) console.log(id, result2, result2[id]);
      const { x1: x, y1: y, width, height } = result2[id];
      tempCtx.strokeStyle = "red";
      tempCtx.strokeRect(x, y, width, height);
      tempCtx.fillStyle = "red";
      tempCtx.font = "64px Arial";
      tempCtx.fillText(id + 1 + "", x + width / 2, y + height / 2, FONT_SIZE);
    }
  };
})();
const frameSleep = () => new Promise((res) => requestAnimationFrame(res));

const main = async () => {
  const template = await loadImg("./test.png");

  if (!template) return;
  const canvas = Object.assign(document.createElement("canvas"), {
    width: template.width,
    height: template.height,
  }) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.drawImage(template, 0, 0);

  const previewCanvas = Object.assign(document.createElement("canvas"), {
    width: canvas.width,
    height: canvas.height,
  }) as HTMLCanvasElement;
  const previewCtx = previewCanvas.getContext("2d") as CanvasRenderingContext2D;
  document.body.append(previewCanvas);

  const templateImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const result: LabelMap = {};
  const drawRound = 1000;
  let i = 0;
  for (const diff of getLabelPixels(templateImageData, result)) {
    drawResult(diff, previewCtx, result);

    if (i++ % drawRound === 0) await frameSleep();
  }
  drawResult(result, previewCtx, result);

  console.log("end", result);
};

main();
