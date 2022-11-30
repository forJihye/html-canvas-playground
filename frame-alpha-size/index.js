const loadImage = (src) => new Promise(res => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => res(img)
  img.onerror = () => res(null)
  img.src = src;
});

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d');

const main = async () => { try {
  const img = await loadImage('https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/kiosk-custom/221017_hyundai_mabuk/files/frame1.png')
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const alpha = [];
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  let minX = img.width;
  let minY = img.height;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const index = i / 4;
    const x = index % imageData.width;
    const y = Math.floor(index / imageData.width);
    if (imageData.data[i + 3] === 0) {
      if (minX > x) minX = x;
      if (minY > y) minY = y;
      if (maxX < x) maxX = x;
      if (maxY < y) maxY = y;
    }
  }
  
  const width = (maxX - minX) + 1;
  const height = (maxY - minY) + 1;
  const top = minY;
  const left = minX;
  const result = {width, height, top, left}

  document.body.appendChild(Object.assign(canvas, {style: 'width: 300px;'}));
  document.body.appendChild(Object.assign(document.createElement('div'), {
    innerText: `이미지 투명영역 사이즈 및 위치 ${JSON.stringify(result)}`
  }));
} catch (e) {
  console.error(e)
}}
main();
