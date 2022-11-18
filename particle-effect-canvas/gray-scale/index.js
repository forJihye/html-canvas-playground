import spider from "./image1.jpg";

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 450;

const image1 = new Image();
image1.src = spider
// image1.src = dataURL;

image1.addEventListener('load', () => {
  ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
  const sannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  console.log(sannedImage)
  
  const sannedData = sannedImage.data;
  for(let i = 0; i < sannedData.length; i += 4){
    const total = sannedData[i] + sannedData[i+1] + sannedData[i+2]
    const averageColorValue = total/3;
    sannedData[i] = averageColorValue;
    sannedData[i+1] = averageColorValue;
    sannedData[i+2] = averageColorValue;
  }
  ctx.putImageData(sannedImage, 0, 0)
})
