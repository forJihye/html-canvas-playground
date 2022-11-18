import { canvas } from "element-mold/dist/html";
import "./index.css";

const canvasEl = canvas({ width: 500, height: 500 });
const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D;
document.body.append(canvasEl);

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
const drawLineNText = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: string = "",
  text: string = "",
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
  ctx.beginPath();
  ctx.font = "16px 'Segoe UI'";
  ctx.strokeText(text, x2, -y2 - 10);
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = style;
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.arc(x2, -y2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  return [x2, y2, style];
};
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

let ctxDegree = 0;
let targetDegree = 1;
let ctxScale = 1;
let ctxScaleWeightDestination = 1;
const drawGrid = () => {
  ctx.save();
  // ctx.rotate((ctxDegree += (Math.random() - 0.5) / 50));
  const w = (Math.random() - 0.5) * 0.01;
  ctx.scale(ctxScale + w, ctxScale + w);
  const style = "#666";
  const max = 35;
  const dist = 20;
  for (let i = 0; i < max; i++) {
    if (dist / 2 + (-max / 2) * dist + dist * i !== 0) {
      drawHorizonLine(dist / 2 + (-max / 2) * dist + dist * i, style);
      drawVerticalLine(dist / 2 + (-max / 2) * dist + dist * i, style);
    }
  }
  drawHorizonLine(0, "white");
  drawVerticalLine(0, "white");
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

const main = () => {};

let blueX = 0;
let blueY = 0;
let redX = 200;
let redY = -90;
const ANGLE_SIZE = 10;
const comp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

let degree = ((Math.random() * Math.PI) / 180) * 360;
const MOVE_POSITION_DIST = 3;
const MOVE_DEGREE_DIST = 10;

requestAnimationFrame(function draw() {
  ctxScale += (ctxScaleWeightDestination - ctxScale) / 15;

  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.save();
  ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
  drawGrid();

  const blueVec = [blueX, blueY];
  const redVec = [redX, redY];

  const scala = blueVec.reduce((acc, val, i) => (acc += val * redVec[i]), 0);
  const redVecSize = getSizeOfVec(...redVec);
  const projWeight = scala / redVecSize / redVecSize;

  const greenX = (redVec[0] as number) * projWeight;
  const greenY = (redVec[1] as number) * projWeight;

  const angleHVec = [-greenX, -greenY] as const;
  const angleVVec = [blueX - greenX, blueY - greenY] as const;
  const angleVUnitVec = getUnitVec(...angleVVec);
  const angleHUnitVec = getUnitVec(...angleHVec);
  const angleHStartPoint = [
    greenX + angleHUnitVec[0] * ANGLE_SIZE,
    greenY + angleHUnitVec[1] * ANGLE_SIZE
  ];
  const angleHEndPoint = [
    angleHStartPoint[0] + angleVUnitVec[0] * ANGLE_SIZE,
    angleHStartPoint[1] + angleVUnitVec[1] * ANGLE_SIZE
  ];

  drawLine(blueX, blueY, greenX, greenY, "#999", [3, 3]);
  drawLine(
    angleHStartPoint[0],
    angleHStartPoint[1],
    angleHEndPoint[0],
    angleHEndPoint[1],
    "#999"
  );
  drawLine(
    angleHEndPoint[0],
    angleHEndPoint[1],
    angleHEndPoint[0] - angleHUnitVec[0] * ANGLE_SIZE,
    angleHEndPoint[1] - angleHUnitVec[1] * ANGLE_SIZE,
    "#999"
  );

  // const angleHVec = [blueX - greenX, blueY - greenY] as const;

  const dash = redX / greenX > 0 ? [] : [3, 3];

  drawLineNText(0, 0, blueX, blueY, "cyan", "V");
  if (redX * greenX < 1) {
    drawLineNText(0, 0, greenX, greenY, "yellow", "Vproj", [3, 3]); // greenLine is blueProj
    drawLineNText(0, 0, redX, redY, "magenta", "W");
  } else if (getSizeOfVec(redX, redY) > getSizeOfVec(greenX, greenY)) {
    drawLineNText(greenX, greenY, redX, redY, "magenta", "W");
    drawLineNText(0, 0, greenX, greenY, "yellow", "Vproj", dash); // greenLine is blueProj
  } else {
    drawLineNText(redX, redY, greenX, greenY, "yellow", "Vproj", [3, 3]); // greenLine is blueProj
    drawLineNText(0, 0, redX, redY, "magenta", "W");
  }

  const currentMoveDist = Math.random() * MOVE_POSITION_DIST;
  degree += ((Math.random() - 0.5) * MOVE_DEGREE_DIST) / 10;
  redX = comp(
    redX + currentMoveDist * Math.cos(degree),
    -canvasEl.width / 2,
    canvasEl.width / 2
  );
  redY = comp(
    redY + currentMoveDist * Math.sin(degree),
    -canvasEl.height / 2,
    canvasEl.height / 2
  );

  // redX = Math.min(
  //   Math.max(redX + (Math.random() - 0.5) * 5, -canvasEl.width / 2),
  //   canvasEl.width / 2
  // );
  // redY = Math.min(
  //   Math.max(redY + (Math.random() - 0.5) * 5, -canvasEl.height / 2),
  //   canvasEl.height / 2
  // );

  ctx.restore();
  requestAnimationFrame(draw);
});

(canvasEl as any).onpointerdown = () => {
  ctxScaleWeightDestination = Math.random() * 20 + 2;
  const moveHandler: any = ({
    movementX,
    movementY
  }: {
    movementX: number;
    movementY: number;
  }) => {
    redX += movementX;
    redY -= movementY;
  };
  const upHandler = () => {
    ctxScaleWeightDestination = 1.2 - Math.random() * 0.35;
    document.removeEventListener("pointermove", moveHandler);
    document.removeEventListener("pointerup", upHandler);
  };
  document.addEventListener("pointermove", moveHandler);
  document.addEventListener("pointerup", upHandler);
};
(canvasEl as any).onpointermove = ({
  layerX,
  layerY
}: {
  layerX: number;
  layerY: number;
}) => {
  blueX = layerX - canvasEl.width / 2;
  blueY = -(layerY - canvasEl.height / 2);
};
main();
