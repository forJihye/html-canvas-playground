import { CanvasUtils, Crop } from './canvas';
import { Mirroring } from './canvas'

class FilterApply {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;  
  editCanvas: HTMLCanvasElement;
  editCtx: CanvasRenderingContext2D;
  cropCanvas: HTMLCanvasElement;
  cropCtx: CanvasRenderingContext2D;
  constructor(public canvasUtils: CanvasUtils){
    this.canvas = Object.assign(document.createElement('canvas'), {id: 'canvas'});
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    
    this.editCanvas = Object.assign(document.createElement('canvas'), {id: 'edit'});
    this.editCtx = this.editCanvas.getContext('2d') as CanvasRenderingContext2D;

    this.cropCanvas = Object.assign(document.createElement('canvas'), {id: 'cropped'});
    this.cropCtx = this.cropCanvas.getContext('2d') as CanvasRenderingContext2D;
  }
  render(){
    let target = this.canvasUtils;
    const stack: CanvasUtils[] = [];
    while(1){
      stack.unshift(target);
      if(!target.canvasUtils) break;
      target = target.canvasUtils;
    }
    stack.forEach(target => {
      if(target instanceof Mirroring){
        if(!target.width) return;
        this.editCanvas.width = target.width;
        this.editCanvas.height = target.height;
        target.apply(this.editCtx);
      }else if(target instanceof Crop){
        if(!this.editCanvas.width) return;
        this.cropCanvas.width = target.width;
        this.cropCanvas.height = target.height;
        target.apply(this.cropCtx, this.editCanvas);
        this.editCanvas.width = target.width;
        this.editCanvas.height = target.height;
        this.editCtx.drawImage(this.cropCanvas, 0, 0);
      }else{
        target.apply(this.editCtx);
      }
    });
    
    this.canvas.width = this.editCanvas.width;
    this.canvas.height = this.editCanvas.height;
    this.ctx.drawImage(this.editCanvas, 0, 0);
  }
}

export {
  FilterApply
}