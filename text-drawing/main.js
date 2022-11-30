const {head, body} = document;

const createElement = (tagName, properties) => Object.assign(document.createElement(tagName), properties);

const canvas = createElement('canvas', {width: 500, height: 500});
const ctx = canvas.getContext('2d');

body.appendChild(canvas);

class CanvasText extends String {
  static GLOBAL_NS = Symbol();
  static map = new Map([[this.GLOBAL_NS, new Set]]);
  static drawAll(ctx, namespace = this.GLOBAL_NS) {
    for (const ns of namespace === this.GLOBAL_NS ? this.map.keys() : [namespace]) {
      this.map.get(ns).forEach(instance => instance.drawTo(ctx));
    }
  }
  static create(value, properties, namespace = this.GLOBAL_NS) {
    const instance = new this(value, properties);
    if (!this.map.has(namespace)) this.map.set(namespace, new Set);
    const chn = this.map.get(namespace);
    chn.add(instance);
    return instance;
  }
  static clear(namespace) {
    if (namespace === undefined) throw 'Namespace is undefined';
    if (namespace === this.GLOBAL_NS) this.map = new Map([[this.GLOBAL_NS, new Set]]);
    else this.map.set(namespace, new Set);
  }

  _terminated = false;
  constructor(value, {x = 0, y = 0, fontFamily = 'Segoe UI', fontSize = '14px', color = 'black'} = {}, namespace = CanvasText.GLOBAL_NS) {
    super(value);
    Object.assign(this, {x, y, fontFamily, color, namespace});
  }
  get fontStyle() {
    return [this.fontSize, this.fontFamily].join(' ');
  }
  drawTo(ctx) {
    if (this._terminated) throw 'Already terminated';
    ctx.save();
    ctx.font = this.fontStyle;
    ctx.fillStyle = this.color;
    ctx.fillText(this, this.x, this.y);
    ctx.restore();
  }
  terminate() {
    this._terminated = true;
    CanvasText.map.get(this.namespace).delete(this);
  }
}

CanvasText.create('abc', {y: 10, color: 'red'});
CanvasText.create('new text', {y: 30}, 'group_1');
CanvasText.create('this is group_1!!!', {y: 60}, 'group_1');
CanvasText.create('I\'m groot.', {y: 20}, 'group_2');
CanvasText.create('canvas access', {y: 10}, 'group_2');

CanvasText.drawAll(ctx, 'group_1');
CanvasText.drawAll(ctx, 'group_2');
CanvasText.drawAll(ctx);