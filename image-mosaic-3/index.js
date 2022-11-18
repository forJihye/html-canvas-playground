const targetCanvas = document.getElementById("canvas");
const targetCtx = targetCanvas.getContext("2d");
targetCtx.imageSmoothingEnabled = false;

const col = 60;
const row = 30;

const canvas = Object.assign(document.createElement("canvas"), {
  width: col,
  height: row
});
const ctx = canvas.getContext("2d");

const main = async () => {
  try {
    const img = await new Promise((res) => {
      const img = new Image();
      img.src = `https://picsum.photos/${targetCanvas.width}/${targetCanvas.height}`;
      img.onload = () => res(img);
    });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    targetCtx.drawImage(canvas, 0, 0, targetCanvas.width, targetCanvas.height);

    document.body.appendChild(img);
  } catch (error) {
    throw Error(error);
  }
};
main();
