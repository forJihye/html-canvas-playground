import './index.css'
import 'babel-polyfill'
import { datasDummy, getImage } from './utils'
// canvas detect inner path js

let dragData = null
let isDrag = false
let delta = new Object()

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const drawImage = (data) => {
  const {width, height, x, y, image} = data
  ctx.drawImage(image, x, y, width, height)
}

const drawRect = data => {
  const {width, height, x, y, style} = data
  ctx.fillStyle = style
  ctx.fillRect(x, y, width, height)
}

const drawCanvas = (datas) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for(const data of datas) {
    switch(data.type) {
      case 'rect': drawRect(data)
      break;
      case 'image': drawImage(data)
      break;
    }
  }
}

const mousePoint = (canvas, ev) => { 
  const rect = canvas.getBoundingClientRect()
  return {
    pointX: Math.round(ev.clientX - rect.left),
    pointY: Math.round(ev.clientY - rect.top)
  }
}

const handleMouseDown = (ev, datas) => {
  const {pointX, pointY} = mousePoint(canvas, ev)

  for(const data of [...datas].reverse()){
    const {x, y, width, height} = data

    if(pointX > x && pointX < (x+width) && pointY > y && pointY < (y+height)) {
      isDrag = true
      dragData = data
      delta.x = x-pointX
      delta.y = y-pointY

      datas.push(datas.splice(datas.indexOf(data), 1)[0]);
      drawCanvas(datas)
      return 
    }
  }
}

const handleMouseMove = (ev, datas) => {
  if(!isDrag) return
  const {pointX, pointY} = mousePoint(canvas, ev)
  dragData.x = pointX + delta.x
  dragData.y = pointY + delta.y
  drawCanvas(datas)
}

const handleMouseUp = datas => {
  if(!isDrag) return
  isDrag = false
  drawCanvas(datas)
}

const dragCanvas = (datas) => {
  canvas.addEventListener('mousedown', (ev) => handleMouseDown(ev, datas))
  canvas.addEventListener('mousemove', (ev) => handleMouseMove(ev, datas))
  canvas.addEventListener('mouseup', () => handleMouseUp(datas))
}

const main = async() => {
  try{
    const datas = await Promise.all(
      datasDummy.map(async ({url, ...data}) => {
        return data.type === 'image' ? { ...data, image: await getImage(url) } : data
      })
    )
    drawCanvas(datas)      
    dragCanvas(datas)

  }catch(ev){
    console.error
  }
}
main()

