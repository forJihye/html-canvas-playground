export class Tag {
  constructor(tagName, attrs = {}, options = {}) {
    this.el = document.createElement(tagName);
    for (const name in attrs) this.el.setAttribute(name, attrs[name]);
    for (const name in options) this.el[name] = options[name];
  }
}

export class LockElement extends Tag {
  constructor() {
    super('div', {
      style: `
        display: none;

        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
      `,
    }).el;
    document.body.appendChild(this.el);
  }
  on() {
    this.el.style['display'] = 'block';
  }
  off() {
    this.el.style['display'] = 'none';
  }
}