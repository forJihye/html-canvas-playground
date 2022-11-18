export const index2pos = (index: number, width: number, height: number) => {
  return [index % width, Math.floor(index / width)];
};
export const pos2index = (
  x: number,
  y: number,
  width: number,
  height: number
) => {
  if (x < 0 || width <= x || y < 0 || height <= y) return -1;
  return y * width + x;
};
export const getAround8Pos = (x: number, y: number): [number, number][] => [
  [x - 1, y - 1],
  [x, y - 1],
  [x + 1, y - 1],
  [x - 1, y],
  [x + 1, y],
  [x - 1, y + 1],
  [x, y + 1],
  [x + 1, y + 1]
];
export const getAround4Pos = (x: number, y: number): [number, number][] => [
  [x, y - 1],
  [x - 1, y],
  [x + 1, y],
  [x, y + 1]
];
export const randInt = (n: number) => Math.floor(Math.random() * n);
export const randItem = <T>(a: T[]) => a[randInt(a.length)];
export const comp = (n: number, max: number, min: number) =>
  Math.max(min, Math.min(max, n));
