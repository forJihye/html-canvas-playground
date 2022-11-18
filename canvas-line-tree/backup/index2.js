import './style.css';

const size = {w: 500, h: 500}
const canvas = Object.assign(document.createElement('canvas'), {id: 'canvas'});
const ctx = canvas.getContext('2d');
canvas.width = size.w;
canvas.height = size.h;
document.body.appendChild(canvas);

class Node {
  x = 0;
  y = 0;
  connected = new Set;
  static store = new Set; // 인스턴스화 한 걸 저장하기위해 static 사용
  constructor(x, y){
    this.x = x;
    this.y = y;
    Node.store.add(this);
  }
  connect(node){
    this.connected.add(node);
    node.connected.add(this);
  }
}

const DEG = Math.PI/180; // 1도
const extend = (node) => {
  const r = 100;
  const theta = Math.random() * 180;
  const sin = Math.sin(DEG*theta) * r; //y
  const cos = Math.cos(DEG*theta) * r; //x
  const nextNode = new Node(cos+node.x, sin+node.y);
  node.connect(nextNode);
  return {start: node, end: nextNode}
}
const createStruct = (node, length) => {
  let target = node;
  for(let i=0; i<length; i++){
    const {start, end} = extend(target);
    extend(target);
    target = end;
  }
  return node;
}
const createStruct2 = (node, length) => {
  for(let i=0; i<length; i++){
    [...Node.store].forEach(node => extend(node));
  }
  return node;
}

const main = () => {
  const node = createStruct2(new Node(250, 50), 8);
  const drawed = new Set;
  
  let target = node;
  const stack = [node];
  while(target = stack.shift() || stack.length){
    if(drawed.has(target)) continue;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 5, 0, 360, false);
    ctx.fill();

    target.connected.forEach((node) => {
      ctx.beginPath();
      ctx.moveTo(target.x, target.y);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    });

    drawed.add(target);
    stack.push(...target.connected);
  }
}

main();