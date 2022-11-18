import './index.css'


const datas = [
  {
    type: 'image',
    width: 80,
    height: 80,
    x: 100,
    y: 120,
    style: null,
    url: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/200420_fc_seoul/sticker6.png'
  },
  {
    type: 'rect',
    width: 150,
    height: 150,
    x: 300,
    y: 200,
    style: '#f00f00',
    url: null
  },
  {
    type: 'image',
    width: 100,
    height: 100,
    x: 300,
    y: 40,
    style: null,
    url: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/200420_fc_seoul/sticker9.png'
  }
]

const canvas = document.getElementById('canvas')
if(canvas.getContext){
  const ctx = canvas.getContext('2d')
  let isDrag = false
  let dragData = null
  let active = new Object()

  const drawCanvas = (datas) => {
    // ctx.clearRect(0,0,canvas.width,canvas.height);

    for(const data of datas) {
      const {type, width, height, x, y, style, url} = data
      switch(type) {
        case 'rect' : 
          ctx.fillStyle = style
          ctx.fillRect(x, y, width, height)
          break;
        case 'image' : 
          const img = new Image
          img.onload = () => ctx.drawImage(img, x, y, width, height)
          img.src = url
        break
      }
    }
  }
  drawCanvas(datas)

  const mousePoint = (ev) => {
    const {clientX, clientY} = ev
    const rect = canvas.getBoundingClientRect()
    // clientX, clientY = 마우스 좌표값
    // rect.left, rect.top = 캔버스 위치 좌표값
    return {
      pointX: Math.round(clientX - rect.left),
      pointY: Math.round(clientY - rect.top)
    }
  }

  const handleMouseDown = (ev) => { // 마우스 클릭 시 실행
    const {pointX, pointY} = mousePoint(ev)
    for(const data of datas){
      const {width, height, x, y} = data
      const X = pointX > x && pointX < (x+width)
      const Y = pointY > y && pointY < (y+height)
      if(X && Y) {
        isDrag = true
        dragData = data
        
        active.x = x - pointX
        active.y = y - pointY
        
        drawCanvas(datas)
        break;
      }
    }
  }

  const handleMouseMove = (ev) => { // 마우스 이동
    if(isDrag){
      const {pointX, pointY} = mousePoint(ev)

      dragData.x = pointX + active.x
      dragData.y = pointY + active.y

      drawCanvas(datas)
    }
  } 

  const handleMouseUp = () => { // 마우스 포인트 클릭 후 뗐을 때
    if(isDrag) {
      isDrag = false
      drawCanvas(datas)
    }
  }

  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseup', handleMouseUp)
}
