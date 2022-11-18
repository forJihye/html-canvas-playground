
const IMAGE_WIDTH = 200;
const IMAGE_HEIGHT = 150;
const ROTATE_VALUE = (Math.PI / 180) * 45;

const getRGBAByXYIndex = (imageData, i) => {
  return [
    imageData.data[i],
    imageData.data[i + 1],
    imageData.data[i + 2],
    imageData.data[i + 3]
  ];
};
const getCenterColor = (weight, rgb1, rgb2) => {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  return [
    Math.floor((r2 - r1) * weight) + r1,
    Math.floor((g2 - g1) * weight) + g1,
    Math.floor((b2 - b1) * weight) + b1
  ];
};

// hole 발생
const main = async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  document.body.append(canvas);

  const img = new Image();
  await new Promise((res) => {
    img.crossOrigin = "anonymous";
    img.onload = res;
    img.src = `https://picsum.photos/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`;
  });

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  canvas.width = img.width * 1.5;
  canvas.height = img.height * 1.5;
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // const radius = 50;
  // for (let i = 0; i < 300; i++) {
  //   const x = radius * Math.cos((Math.PI / 180) * i);
  //   const y = radius * Math.sin((Math.PI / 180) * i);

  //   ctx.fillRect(x, y, 1, 1);
  // }

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = ((i / 4) % img.width) - img.width / 2;
    const y = Math.floor(i / 4 / img.width) - img.height / 2;

    const newX = x * Math.cos(ROTATE_VALUE) - y * Math.sin(ROTATE_VALUE);
    const newY = x * Math.sin(ROTATE_VALUE) + y * Math.cos(ROTATE_VALUE);

    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    ctx.fillStyle = `rgb(${r},${g}, ${b})`;
    ctx.fillRect(newX, newY, 1, 1);
  }
};

// hole 해결
const main2 = async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  document.body.append(canvas);

  const img = new Image();
  await new Promise((res) => {
    img.crossOrigin = "anonymous";
    img.onload = res;
    img.src = `https://picsum.photos/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`;
  });

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  canvas.width = img.width * 1.5;
  canvas.height = img.height * 1.5;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = ((i / 4) % img.width) - img.width / 2;
    const y = Math.floor(i / 4 / img.width) - img.height / 2;

    const newX = x * Math.cos(ROTATE_VALUE) - y * Math.sin(ROTATE_VALUE);
    const newY = x * Math.sin(ROTATE_VALUE) + y * Math.cos(ROTATE_VALUE);
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    ctx.fillStyle = `rgb(${r},${g}, ${b})`;
    ctx.fillRect(
      Math.floor(newX + canvas.width / 2),
      Math.floor(newY + canvas.height / 2),
      1,
      1
    );
  }

  {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(imageData);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const [r1, g1, b1, a1] = getRGBAByXYIndex(imageData, i - 4);
      const [r2, g2, b2, a2] = getRGBAByXYIndex(imageData, i);
      const [r3, g3, b3, a3] = getRGBAByXYIndex(imageData, i + 4);

      if (a1 && !a2 && a3) {
        const [r, g, b] = getCenterColor(0.5, [r1, g1, b1], [r3, g3, b3]);
        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = 255;
      }
      // if (a1 && !a2 && a3) {
      //   return console.log(r1, r2, r3);
      // }
      // ctx.fillStyle = `rgb(${r},${g}, ${b})`;
      // ctx.fillRect(newX, newY, 1, 1);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }
};
// main2();

// 애니메이션
const main3 = async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  document.body.append(canvas);

  const img = new Image();
  await new Promise((res) => {
    img.crossOrigin = "anonymous";
    img.onload = res;
    img.src = `https://picsum.photos/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`;
  });

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  canvas.width = img.width * 1.5;
  canvas.height = img.height * 1.5;
  // ctx.translate(canvas.width / 2, canvas.height / 2);

  // const radius = 50;
  // for (let i = 0; i < 300; i++) {
  //   const x = radius * Math.cos((Math.PI / 180) * i);
  //   const y = radius * Math.sin((Math.PI / 180) * i);

  //   ctx.fillRect(x, y, 1, 1);
  // }
  const rotateFunction = (value) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = ((i / 4) % img.width) - img.width / 2;
      const y = Math.floor(i / 4 / img.width) - img.height / 2;

      const newX = x * Math.cos(value) - y * Math.sin(value);
      const newY = x * Math.sin(value) + y * Math.cos(value);
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];

      ctx.fillStyle = `rgb(${r},${g}, ${b})`;
      ctx.fillRect(
        Math.floor(newX + canvas.width / 2),
        Math.floor(newY + canvas.height / 2),
        1,
        1
      );
    }

    {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const [r1, g1, b1, a1] = getRGBAByXYIndex(imageData, i - 4);
        const [r2, g2, b2, a2] = getRGBAByXYIndex(imageData, i);
        const [r3, g3, b3, a3] = getRGBAByXYIndex(imageData, i + 4);

        if (a1 && !a2 && a3) {
          const [r, g, b] = getCenterColor(0.5, [r1, g1, b1], [r3, g3, b3]);
          imageData.data[i] = r;
          imageData.data[i + 1] = g;
          imageData.data[i + 2] = b;
          imageData.data[i + 3] = 255;
        }
        // if (a1 && !a2 && a3) {
        //   return console.log(r1, r2, r3);
        // }
        // ctx.fillStyle = `rgb(${r},${g}, ${b})`;
        // ctx.fillRect(newX, newY, 1, 1);
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
  };
  let i = 0;
  requestAnimationFrame(function draw() {
    const value = (Math.PI / 180) * i++;
    rotateFunction(value);
    requestAnimationFrame(draw);
  });
};
main3();
