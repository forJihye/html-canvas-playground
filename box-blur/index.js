const BOX_BORDER = 10;

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

const expandH = (size) => {
  const length = size * 2 + 1;
  return Array.from({ length }, (_, i) => {
    const x = i % length;
    const y = Math.floor(i / length);
    return [x - size, 0];
  });
};
const expandV = (size) => {
  const length = size * 2 + 1;
  return Array.from({ length }, (_, i) => {
    const x = i % length;
    const y = Math.floor(i / length);
    return [x, y - size + i];
  });
};

const boxBlur = (imageData, positions) => {
  const resultData = new Uint8ClampedArray(
    imageData.width * imageData.height * 4
  );

  for (const { r, g, b, x, y, i } of loopImageData(imageData)) {
    const pixels = [0, 0, 0, 0];
    let count = 0;
    positions.forEach(([a, b]) => {
      const val = getRGBByImageData(imageData, x + a, y + b);
      if (val) {
        count++;
        pixels[0] += val.r;
        pixels[1] += val.g;
        pixels[2] += val.b;
        pixels[3] += val.a;
      }
    });
    pixels[0] = Math.floor(pixels[0] / count);
    pixels[1] = Math.floor(pixels[1] / count);
    pixels[2] = Math.floor(pixels[2] / count);
    pixels[3] = Math.floor(pixels[3] / count);
    resultData[i] = pixels[0];
    resultData[i + 1] = pixels[1];
    resultData[i + 2] = pixels[2];
    resultData[i + 3] = pixels[3];
  }
  const length = imageData.data.length;
  for (let i = 0; i < length; i++) {
    imageData.data[i] = resultData[i];
  }

  return imageData;
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
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const positions = expand2D(BOX_BORDER);
    ctx.putImageData(boxBlur(imageData, positions), 0, 0);

    const canvas2 = document.createElement("canvas");
    const ctx2 = canvas2.getContext("2d");
    canvas2.width = img.width;
    canvas2.height = img.height;
    ctx2.drawImage(img, 0, 0);
    const imageData2 = ctx2.getImageData(0, 0, canvas.width, canvas.height);
    ctx2.putImageData(boxBlur(imageData2, expandH(BOX_BORDER)), 0, 0);

    const canvas3 = document.createElement("canvas");
    const ctx3 = canvas3.getContext("2d");
    canvas3.width = img.width;
    canvas3.height = img.height;
    ctx3.drawImage(img, 0, 0);
    const imageData3 = ctx3.getImageData(0, 0, canvas.width, canvas.height);
    ctx3.putImageData(boxBlur(imageData3, expandV(BOX_BORDER)), 0, 0);

    document.body.append(img, canvas, canvas2, canvas3);
  } catch (err) {
    console.error(err);
  }
};

main();
