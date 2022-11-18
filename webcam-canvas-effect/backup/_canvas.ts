import Container, { Inject, Service } from 'typedi';
import { drawCrop } from '../src/utils';

interface CanvasComponentInterface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  snapshot(): HTMLCanvasElement;
}

class CanvasComponentClass implements CanvasComponentInterface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  get width(){
    return this.canvas.width;
  }
  get height(){
    return this.canvas.height;
  }
  snapshot(){
    throw new Error('Should overwrite!');
    return this.canvas;
  }
}

@Service()
class CanvasUtils {
  constructor(protected canvasUtils?: CanvasUtils){}
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    return ctx.canvas;
  }
}

@Service()
class Flip extends CanvasUtils {
  // @prevApply
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    this.canvasUtils && this.canvasUtils.apply(ctx);
    ctx.save();
    ctx.translate(ctx.canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.restore();
    return ctx.canvas;
  }
}

@Service()
class Crop extends CanvasUtils {
  x: number;
  y: number;
  dWidth: number;
  dHeight: number;
  constructor(
    canvasUtils: CanvasUtils, 
    x: number, 
    y: number, 
    dWidth: number, 
    dHeight: number
  ){
    super();
    this.canvasUtils = canvasUtils;
    this.x = x;
    this.y = y;
    this.dWidth = dWidth;
    this.dHeight = dHeight;
  }
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    if(this.canvasUtils){
      const canvas = this.canvasUtils.apply(ctx);
      drawCrop(ctx, canvas, this.x, this.y, this.dWidth, this.dHeight);
    }
    return ctx.canvas;
  }
}

@Service()
class Grayscale extends CanvasUtils {
  constructor(canvasUtils: CanvasUtils){
    super();
    this.canvasUtils = canvasUtils;
  }
  setGrayscale(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement){
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for(let i = 0; i < data.length; i += 4){
      const total = data[i] + data[i+1] + data[i+2];
      const averageColor = total/3;
      data[i] = averageColor;
      data[i+1] = averageColor;
      data[i+2] = averageColor;
    }
    ctx.putImageData(imageData, 0, 0)
  }
  apply(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
    if(this.canvasUtils){
      const canvas = this.canvasUtils.apply(ctx);
      this.setGrayscale(ctx, canvas);
    }
    return ctx.canvas;
  }
}

@Service()
class Contrast {
  canvasUtils: CanvasUtils;
  constructor(canvasUtils: CanvasUtils){
    this.canvasUtils = canvasUtils;
  }
}

export {
  CanvasComponentClass,
  CanvasComponentInterface,
  Flip,
  Crop,
  Grayscale,
  Contrast
}