class AlphaRect {
  minX: number;
  minY: number;
  maxX: number = 0;
  maxY: number = 0;
  constructor (public _width: number, public _height: number) {
    this.minX = _width;
    this.minY = _height;
  }
  push(index: number) {
    const x = index % this._width;
    const y = Math.floor(index / this._width);
    if (x < this.minX) this.minX = x
    if (y < this.minY) this.minY = y
    if (x > this.maxX) this.maxX = x
    if (y > this.maxY) this.maxY = y
  }
  get top() {
    return this.minY;
  }
  get left() {
    return this.minX;
  }
  get width() {
    return this.maxX - this.minX;
  }
  get height() {
    return this.maxY - this.minY;
  }
}

class AssetsFrame {
  alphaRect!: AlphaRect;
  constructor(public image: HTMLImageElement) {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    this.alphaRect = new AlphaRect(image.width, image.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] !== 255) this.alphaRect.push(i/4)
    }
  }
}

export default AssetsFrame;