import { canvas } from "element-mold/dist/html";

const canvasEl = canvas({ width: 500, height: 500 });
const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D;
document.body.append(canvasEl);
const drawLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: string = "",
  dash: number[] = []
) => {
  ctx.beginPath();
  ctx.setLineDash(dash);
  ctx.moveTo(x1, -y1);
  ctx.lineTo(x2, -y2);
  ctx.strokeStyle = style;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.closePath();
};
const drawHorizonLine = (height: number, style: string = "black") => {
  ctx.beginPath();
  ctx.moveTo(-canvasEl.width, height);
  ctx.lineTo(canvasEl.width, height);
  ctx.strokeStyle = style;
  ctx.stroke();
  ctx.closePath();
};
const drawVerticalLine = (width: number, style: string = "black") => {
  ctx.beginPath();
  ctx.moveTo(width, -canvasEl.height);
  ctx.lineTo(width, canvasEl.height);
  ctx.strokeStyle = style;
  ctx.stroke();
  ctx.closePath();
};
const drawGrid = () => {
  ctx.save();
  const style = "#ddd";
  const max = 35;
  const dist = 20;
  for (let i = 0; i < max; i++) {
    if (dist / 2 + (-max / 2) * dist + dist * i !== 0) {
      drawHorizonLine(dist / 2 + (-max / 2) * dist + dist * i, style);
      drawVerticalLine(dist / 2 + (-max / 2) * dist + dist * i, style);
    }
  }
  drawHorizonLine(0, "#333");
  drawVerticalLine(0, "#333");
  ctx.restore();
};
const getSizeOfVec = (...val: number[]) =>
  Math.pow(
    val.reduce((acc, val) => (acc += val * val), 0),
    1 / 2
  );
const getUnitVec = (x: number, y: number) => {
  const size = getSizeOfVec(x, y);
  return [x / size, y / size];
};

let x = 0;
let y = 0;

requestAnimationFrame(function draw() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.save();
  ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
  drawGrid();
  const [ux, uy] = getUnitVec(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.strokeStyle = "green";
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(ux * 100, uy * 100, 5, 0, Math.PI * 2);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();
  drawLine(0, 0, ux * 100, -uy * 100, "green");
  ctx.restore();
  requestAnimationFrame(draw);
});

(canvasEl as any).onpointermove = ({
  layerX,
  layerY
}: {
  layerX: number;
  layerY: number;
}) => {
  x = layerX - canvasEl.width / 2;
  y = layerY - canvasEl.height / 2;
};
