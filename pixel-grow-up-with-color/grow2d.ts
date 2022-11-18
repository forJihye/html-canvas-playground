import {
  index2pos,
  pos2index,
  getAround8Pos,
  randInt,
  randItem,
  comp
} from "./helper";

export enum Grow2DDotType {
  empty,
  disable,
  fill
}

export type Grow2DDot = {
  type: Grow2DDotType;
  x: number;
  y: number;
  color: {
    h: number;
    s: number;
    l: number;
  };
};
export default class Grow2D {
  static EMPTY = {
    type: Grow2DDotType.empty,
    x: 0,
    y: 0,
    color: {
      h: 0,
      s: 0,
      l: 0
    }
  };
  hWeight: number;
  sWeight: number;
  lWeight: number;

  state: Grow2DDot[] = [];
  count: number = 0;

  private boundary: Set<number> = new Set();
  get boundarySize() {
    return this.boundary.size;
  }

  constructor(
    public width: number,
    public height: number,
    options: Partial<{
      hWeight: number;
      sWeight: number;
      lWeight: number;
    }> = {}
  ) {
    this.hWeight = options.hWeight ?? 5;
    this.sWeight = options.sWeight ?? 5;
    this.lWeight = options.lWeight ?? 5;
    this.init();
  }
  init() {
    this.boundary.clear();
    this.state = Array.from(
      { length: this.width * this.height },
      () => Grow2D.EMPTY
    );
    this.count = 0;
  }
  findIndexesByPositions(p: [number, number][], f: (n: number) => boolean) {
    return p
      .map(([x, y]) => pos2index(x, y, this.width, this.height))
      .filter((n) => {
        if (n !== -1 && !this.state[n]) console.log(n);
        return n !== -1 && f(n);
      });
  }
  seed(x: number, y: number) {
    const index = pos2index(x, y, this.width, this.height);

    if (this.state[index].type === Grow2DDotType.fill) return null;

    const dot = {
      type: Grow2DDotType.fill,
      x,
      y,
      color: {
        h: randInt(360),
        s: randInt(100),
        l: randInt(100)
      }
    };
    this.state[index] = dot;
    this.count++;
    const around = getAround8Pos(x, y);

    this.findIndexesByPositions(
      around,
      (n) => this.state[n].type === Grow2DDotType.empty
    ).forEach((n) => this.boundary.add(n));

    return [index, dot] as const;
  }
  up() {
    if (!this.boundary.size) return this.state;

    const index = randItem([...this.boundary]);

    const [x, y] = index2pos(index, this.width, this.height);

    const around = getAround8Pos(x, y);
    const newColor = this.findIndexesByPositions(
      around,
      (n) => this.state[n].type === Grow2DDotType.fill
    )
      .map((n) => this.state[n].color)
      .reduce(
        (acc, { h, s, l }, i, { length }) => {
          acc.h += h / length;
          acc.s += s / length;
          acc.l += l / length;
          return acc;
        },
        { h: 0, s: 0, l: 0 }
      );

    const dot = {
      type: Grow2DDotType.fill,
      x,
      y,
      color: {
        h: newColor.h + Math.random() * this.hWeight * (randInt(2) ? -1 : 1),
        s: comp(
          newColor.s + Math.random() * this.sWeight * (randInt(2) ? -1 : 1),
          100,
          0
        ),
        l: comp(
          newColor.l + Math.random() * this.lWeight * (randInt(2) ? -1 : 1),
          100,
          0
        )
      }
    };
    this.state[index] = dot;
    this.count++;
    this.boundary.delete(index);
    this.findIndexesByPositions(
      around,
      (n) => this.state[n].type === Grow2DDotType.empty
    )
    .forEach((n) => this.boundary.add(n));

    return [index, dot] as const;
  }
}
