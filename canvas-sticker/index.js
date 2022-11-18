import createStickers from './src/create-stickers';

class Canvas {
  canvas;
  ctx;
  constructor({width, height}){
    this.canvas = Object.assign(document.createElement('canvas'), {id: 'canvas'});
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = width;
    this.canvas.height = height;
  }
  drawing(){
    if(this.canvas.getContext){
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#000000';
    }
  } 
  appendTo(el){
    this.drawing();
    el.appendChild(this.canvas);
  }
}

const background = Object.assign(document.createElement('img'), {src: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/kiosk/201112_hello_museum/intro.jpg'});

const canvas = new Canvas({width: 800, height: 800});
canvas.appendTo(document.body);
const sticker =  createStickers(canvas.canvas);
sticker.setBackground(background);