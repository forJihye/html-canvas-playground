import './assets/css/style.css';

const DEG = Math.PI/180;
const canvas = Object.assign(document.createElement('canvas'), {id: 'canvas'});
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;
document.body.appendChild(canvas);

const createGrid = (column, row) => {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width/column;
  const height = rect.height/row;
  ctx.beginPath();
  for(let x = 0; x <= rect.width; x+=width){
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rect.height);
  }
  for(let y = 0; y <= rect.height; y+=height){
    ctx.moveTo(0, y);
    ctx.lineTo(rect.width, y);
  }
  ctx.strokeStyle = '#ddd';
  ctx.stroke();
  return {length: column*row, width, height};
}

const eachArc = (x, y, width, height) => {
  ctx.beginPath();
  ctx.arc((x*width) + (width/2), (y*height) + (height/2), 1, 0, 360, false);
  ctx.fillStyle = '#999';
  ctx.fill();
}

class Node {
  x;
  y;
  connected = new Set;
  constructor(x, y){
    this.x = x; 
    this.y = y;
  }
  connect(node){
    this.connected.add(node);
    node.connected.add(this);
  }
}

const extend = node => {
  const r = 100;
  const theta = Math.random() * 180;
  const x = (Math.cos(DEG*theta) * r) + node.x;
  const y = (Math.sin(DEG*theta) * r) + node.y;
  const nextNode = new Node(x, y);
  node.connect(nextNode);
  return {start: node, end: nextNode};
}

const createStruct = (node, length) => {
  let target = node;
  for(let i = 0; i < length; i++){
    const {start, end} = extend(target);
    target = end;
  }
  return node;
}

const nodeDraw = node => {
  ctx.beginPath();
  ctx.arc(node.x, node.y, 3, 0, 360, false);
  ctx.fill();
}

(function(){
  const column = 30;
  const row = 30;
  const {length, width, height} = createGrid(column, row);
  Array.from({length}, (_, i) => ({x: i%column, y: Math.floor(i/column)})).forEach(({x, y}) => eachArc(x, y, width, height));
  
  const node = createStruct(new Node(320, 300), 3);
  const drawed = new Set;
  const stack = [node];
  let target;
  while(stack.length){
    target = stack.shift();
    if(drawed.has(target)) continue;
    console.log(target);
    nodeDraw(target);
    drawed.add(target);
    stack.push(...target.connected);
  }
})();
