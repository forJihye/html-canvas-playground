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
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  connect(node){
    this.connected.add(node);
    node.connected.add(this);
  }
}

const DEG = Math.PI/180; // 1도

// 노드만들고 노드끼리 연결관계의 데이터 구조 생성함수과 데이터 배열을 캔버스에 그려주는 함수을 구분해야한다.
const nodeConnect = (length, x, y) => {
  const nodes = [];
  for(let i = 0; i < length; i++){
    const node = new Node(x, y);
    nodes.push(node);
  }
  return nodes;
}

const nodeDrawing = (node) => {
  const r = 40;
  const theta = Math.random() * 360;
  const radius = 5;
  const sin = Math.sin(DEG*theta) * r; //y
  const cos = Math.cos(DEG*theta) * r; //x

  [...node.connected].forEach((connect, i) => {
    connect.x = cos + node.x;
    connect.y = sin + node.y;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 360, false);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(connect.x, connect.y);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();
  });
}

const main = () => {
  const length = 8;
  const nodes = nodeConnect(length, 90, 150);
  nodes.forEach((node, i) => {
    const index = i+1;
    index < nodes.length && nodes[i].connect(nodes[index]);
    nodeDrawing(node);
  });
  console.log(...nodes);
}
main();

const startNode = new Node(250, 250);
const nodes = (length, x, y) => {
  for(let i=0; i<length; i++){
    const instance = new Node(x, y);
    startNode.connect(instance);
  }
}
const oneToMany = () => {
  const length = 10;
  const radius = 5;
  
  nodes(length, 0, 0);
  ctx.beginPath();
  ctx.arc(startNode.x, startNode.y, radius, 0, 360, false);
  ctx.fill();  
  
  [...startNode.connected].forEach((node, i) => {
    const r = 50;
    const theta = Math.random() * 360;
    const cos = Math.cos(DEG * theta) * r; // x
    const sin = Math.sin(DEG * theta) * r; // y
    node.x = cos + startNode.x;
    node.y = sin + startNode.y;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 360, false);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();
  });
}
const oneToOne = () => {
  const a = new Node(0, 0);
  const b = new Node(0, 0);
  a.connect(b);
  
  const r = 60;
  const theta = Math.floor(Math.random() * 270);
  const cos = Math.cos(DEG * theta) * r; // x
  const sin = Math.sin(DEG * theta) * r; // y
  
  const x = 300;
  const y = 150;
  a.x = x;
  a.y = y;
  ctx.beginPath();
  ctx.arc(a.x, a.y, 5, 0, 360, false);
  ctx.fill();
  
  b.x = cos + a.x;
  b.y = sin + a.y;
  ctx.beginPath();
  ctx.arc(b.x, b.y, 5, 0, 360, false);
  ctx.fill();
  
  // line
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}