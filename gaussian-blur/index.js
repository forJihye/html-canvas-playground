const BOX_BORDER = 10;
const O = BOX_BORDER;

const normalize = (vals) => {
  const w = 1 / vals.reduce((acc, val) => (acc += val), 0);
  return vals.map((val) => val * w);
};

const gaussian = (w, x, y) =>
  (1 / (2 * Math.PI * w * w)) *
  Math.pow(Math.E, -(x * x + y * y) / (2 * w * w));

function* loopImageData(imageData) {
  const width = imageData.width;
  const length = imageData.data.length;
  for (let i = 0; i < length; i += 4) {
    yield {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
      a: imageData[i + 3],
      x: (i / 4) % width,
      y: Math.floor(i / 4 / width),
      i
    };
  }
}
const getRGBByImageData = (imageData, x, y) => {
  if (x < 0 || x + 1 > imageData.width || y < 0 || y + 1 > imageData.height)
    return null;
  const i = (imageData.width * y + x) * 4;
  return {
    r: imageData.data[i],
    g: imageData.data[i + 1],
    b: imageData.data[i + 2],
    a: imageData.data[i + 3]
  };
};
const expand2D = (size) => {
  const length = size * 2 + 1;
  return Array.from({ length: length * length }, (_, i) => {
    const x = i % length;
    const y = Math.floor(i / length);
    return [x - size, y - size];
  });
};

const main = async () => {
  try {
    const img = await new Promise((res) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => res(img);
      img.src =
        "https://i.picsum.photos/id/1054/400/300.jpg?hmac=q8YJsyYiOLhScvQ4WlA9pnJe11h0ivqh8ykzUcV1Gqs";
    });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    document.body.append(img, canvas);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const gaussianBox = expand2D(BOX_BORDER).map(([x, y]) => gaussian(O, x, y));
    const positions = expand2D(BOX_BORDER);
    const resultData = new Uint8ClampedArray(
      imageData.width * imageData.height * 4
    );

    for (const { r, g, b, x, y, i } of loopImageData(imageData)) {
      const gaussianWeights = [];
      const pixels = [];
      positions.forEach(([a, b], i) => {
        const val = getRGBByImageData(imageData, x + a, y + b);
        if (val) {
          gaussianWeights.push(gaussianBox[i]);
          pixels.push(val);
        }
      });
      const gaussionValues = normalize(gaussianWeights);
      const resultPixel = pixels.reduce(
        (acc, color, i) => {
          acc[0] += color.r * gaussionValues[i];
          acc[1] += color.g * gaussionValues[i];
          acc[2] += color.b * gaussionValues[i];
          acc[3] += color.a * gaussionValues[i];
          return acc;
        },
        [0, 0, 0, 0]
      );

      resultData[i] = Math.floor(resultPixel[0]);
      resultData[i + 1] = Math.floor(resultPixel[1]);
      resultData[i + 2] = Math.floor(resultPixel[2]);
      resultData[i + 3] = Math.floor(resultPixel[3]);
    }
    const length = imageData.data.length;
    for (let i = 0; i < length; i++) {
      imageData.data[i] = resultData[i];
    }
    ctx.putImageData(imageData, 0, 0);
  } catch (err) {
    console.error(err);
  }
};

main();
