export const hasFile = (ev) => !!ev.target.files.length;

export const firstFile = (ev) => ev.target.files[0];

export const typeOfFile = (ev) => ev.target.files[0].type;

export const getImage = (src) => 
  new Promise(resolve => {
    const img = new Image;
    img.onload = () => resolve(img);
    img.src = src;
  });

export const canvasToBlob = (canvas, { type, quality }) => 
  new Promise(
    resolve => canvas.toBlob(resolve, type, quality)
  );

export const blobToFile = (blob, { name, type }) => 
  new Promise(
    resolve => resolve(new File([blob], name, { type, lastModified: Date.now() }))
  );

export const fileToFormData = (params) =>
  new Promise(resolve => {
    const fd = new FormData;
    for (const name in params) fd.append(name, params[name]); 
    resolve(fd);
  });

export const sendFormData = (fd, src, f = () => {}) => {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest;
    xhr.onload = (ev) => resolve(ev);
    xhr.upload.onprogress = ({ loaded, total}) => f(loaded / total);
    xhr.open('POST', src, true);
    xhr.send(fd);
  });
};

export const size = (canvas, w, h) => {
  canvas.width = w;
  canvas.height = h;
};

export const clear = (v) => {
  if (v instanceof HTMLCanvasElement) v.getContext('2d').clearRect(0, 0, v.width, v.height);
  if (v instanceof CanvasRenderingContext2D) v.clearRect(0, 0, v.canvas.width, v.canvas.height);
}

export const rotate = (ctx, deg) => {
  const { width, height } = ctx.canvas
  ctx.translate(width / 2, height / 2);
  ctx.rotate(deg);
  ctx.translate(-height / 2, -width / 2);
};

export const drawCrop = (ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) => {
  if (x === undefined, y === undefined, w === undefined, h === undefined) {
      x = y = 0;
      w = ctx.canvas.width;
      h = ctx.canvas.height;
  }
  // console.log(arguments, arguments.length, x, y, w, h);
  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  var iw = img.width,
      ih = img.height,
      r = Math.min(w / iw, h / ih),
      nw = iw * r,
      nh = ih * r,
      cx, cy, cw, ch, ar = 1;

  if (nw < w) ar = w / nw;                             
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;

  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
};

export const getCanvasPosition = (canvas, x, y) => {
  const { width, height, left, top } = canvas.getBoundingClientRect();
  return {
    x: (x - left) * (canvas.width / width),
    y: (y - top) * (canvas.height / height),
  };
};
