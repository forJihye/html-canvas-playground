import { drawCrop } from "./utils";

interface CanvasComponent {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D; 
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement;
}

class CanvasUtils implements CanvasComponent { // 데코레이터
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width?: number;
  height?: number;
  constructor(public canvasUtils?: CanvasUtils){
    this.canvas = canvasUtils?.canvas as HTMLCanvasElement;
    this.ctx = canvasUtils?.ctx as CanvasRenderingContext2D;
  }
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement{
    return ctx.canvas;
  }
  // get getWidth(): number{
  //   return this.canvas?.width;
  // }
  // get getHeight(): number{
  //   return this.canvas?.height;
  // }
}

class Mirroring extends CanvasUtils {
  width: number;
  height: number;
  constructor(public video: HTMLVideoElement){
    super();
    this.video.oncanplay = () => {
      this.width = this.video.videoWidth;
      this.height = this.video.videoHeight;
    };
  }
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    // this.canvasUtils?.apply(ctx);
    ctx.drawImage(this.video, 0, 0);
    return ctx.canvas;
  }
}

class Flip extends CanvasUtils {
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    // this.canvasUtils?.apply(ctx);
    ctx.save()
    ctx.translate(ctx.canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.restore();
    return ctx.canvas;
  }
}

class Crop extends CanvasUtils {
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;
  constructor(
    public canvasUtils: CanvasUtils,
    width: number = 0,
    height: number = 0,
  ) {
    super(canvasUtils);
    this.width = width;
    this.height = height;
  }
  apply(ctx: CanvasRenderingContext2D, target?: any): HTMLCanvasElement{
    // const canvas = this.canvasUtils?.apply(ctx);
    drawCrop(ctx, target, this.x, this.y, this.width, this.height);
    return ctx.canvas;
  }
}

class Grayscale extends CanvasUtils {
  put(ctx: CanvasRenderingContext2D){
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const colors = imageData.data;
    for(let i = 0; i < colors.length; i += 4){
      const total = colors[i] + colors[i+1]+ colors[i+2];
      const averageColor = total/3;
      colors[i] = averageColor
      colors[i+1] = averageColor
      colors[i+2] = averageColor
    }
    ctx.putImageData(imageData, 0, 0);
  }
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    // const canvas = this.canvasUtils?.apply(ctx) as HTMLCanvasElement;
    this.put(ctx);
    return ctx.canvas;
  }
}

class Contrast extends CanvasUtils {
  put(ctx: CanvasRenderingContext2D){
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height); 
    const colorsData = imageData.data;
    for(let i = 0; i < colorsData.length; i += 4){
      colorsData[i] = 255 - colorsData[i];
      colorsData[i+1] = 255 - colorsData[i+1];
      colorsData[i+2] = 255 - colorsData[i+2];
    }
    ctx.putImageData(imageData, 0, 0);
  }
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement{
    this.put(ctx);
    return ctx.canvas;
  }
}

export {
  CanvasComponent,
  CanvasUtils,
  Mirroring,
  Crop,
  Flip,
  Grayscale,
  Contrast
}

