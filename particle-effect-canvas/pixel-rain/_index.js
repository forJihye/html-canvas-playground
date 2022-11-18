import coco from './image2.jpg';
import her from './image3.jpg';

const image = new Image();
image.src = coco;

image.addEventListener('load', () => {
  const canvas = document.getElementById('canvas2');
  const ctx = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 700;
  
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let particlesArray = [];
  const numberOfPartcles = 5000;

  /**
   * (y * 4 * pixels.width) + (x * 4)
   * row 1
   * (0*4*500) + (0*4) 0
   * (0*4*500) + (1*4) 4
   * (0*4*500) + (2*4) 8
   * (0*4*500) + (3*4) 16
   * ...
   * 
   * row 2
   * (1*4*500) + (0*4) 2000
   * (1*4*500) + (1*4) 2004
   * (1*4*500) + (2*4) 2008
   * (1*4*500) + (3*4) 2016
   * ...
   * 
   * row 2
   * (2*4*500) + (0*4) 28 000
   * (2*4*500) + (1*4) 28 004
   * (2*4*500) + (2*4) 28 008
   * (2*4*500) + (3*4) 28 016
   * ...
   */

  const calculateRelativeBrightness = (red, green, blue) => { // color 가중치설정
    return Math.sqrt(
      (red * red) * 0.299 + 
      (green * green) * 0.587 + 
      (blue * blue) * 0.114
    )/100
  }

  let mappedImage = [];
  let cellBrightness, cellColor;
  for(let y = 0; y < canvas.height; y++){
    let row = [];
    for(let x = 0; x < canvas.width; x++){
      const red = pixels.data[(y * 4 * pixels.width) + (x * 4)];
      const green = pixels.data[(y * 4 * pixels.width) + (x * 4 + 1)];
      const blue = pixels.data[(y * 4 * pixels.width) + (x * 4 + 2)];
      const brightness = calculateRelativeBrightness(red, green, blue);
      const cell = [
        cellBrightness = brightness,
        cellColor = `rgb(${red}, ${green}, ${blue})`
      ];
      row.push(cell);
    }
    mappedImage.push(row);
  }
  
  class Particle {
    constructor(){
      this.x = Math.random() * canvas.width;
      this.y = 0;
      this.speed = 0;
      // this.velocity = Math.random() * 3.5;
      this.velocity = Math.random() * 0.5;
      this.size = Math.random() * 2.5 + 0.2;
      this.position1 = Math.floor(this.y);
      this.position2 = Math.floor(this.x);
      this.angle = 0;
    }
    update(){
      this.position1 = Math.floor(this.y);
      this.position2 = Math.floor(this.x);
      if((mappedImage[this.position1]) && (mappedImage[this.position1][this.position2])){
        this.speed = mappedImage[this.position1][this.position2][0];
      }
      let movement = (2.5 - this.speed) + this.velocity;
      // this.angle+=0.2;

      // this.y += this.velocity;
      this.y += movement + Math.sin(this.angle);
      this.x += movement + Math.cos(this.angle);
      if(this.y >= canvas.height){
        this.y = 0;
        this.x = Math.random() * canvas.width;
      }
      if(this.x >= canvas.width){
        this.x = 0;
        this.y = Math.random() * canvas.height;
      }
    }
    draw(){
      ctx.beginPath();
      // ctx.fillStyle = '#fff';
      if((mappedImage[this.position1]) && (mappedImage[this.position1][this.position2])){
        ctx.fillStyle = mappedImage[this.position1][this.position2][1];
      }
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill();
    }
  }

  const init = () => {
    for(let i = 0; i < numberOfPartcles; i++){
      particlesArray.push(new Particle);
    }
  }
  init();

  const animate = () => {
    // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.2;

    for(let i = 0; i < particlesArray.length; i++){
      particlesArray[i].update();
      ctx.globalAlpha = particlesArray[i].speed * 0.5;
      particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
})
