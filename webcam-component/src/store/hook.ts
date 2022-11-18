import { BACK } from "@/constant";
import { colorize, flipX, getRest, grayscale, raf } from "@/helper/utils";
import { useEffect, useState } from "react";
import store, { state } from ".";

let render: () => void;

export const useRender = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    render = () => setCount(count => count + 1);
  }, [count]);

  return {...state};
}

export const send = async (params: NodeSendActions) => {
  // console.log('send', state, params);
  await handler[params.type]?.(params as any);
  render();
}

const delaygoto = new class WaitGoto {
  timer!: ReturnType<typeof setTimeout>;
  active: boolean = false;
  next!: string | Symbol;
  delay: number = 0;
  constructor() {
    window.addEventListener('pointerdown', () => this.reset());
  }
  set(next: string | Symbol, delay: number) {
    this.active = true;
    this.next = next;
    this.delay = delay;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.active = false;
      (handler as any).goto({next});
      render();
    }, this.delay * 1000);
  }
  reset() {
    this.active && this.set(this.next, this.delay);
  }
  clear() {
    this.active = false;
    this.next = '';
    this.delay = 0;
    clearTimeout(this.timer);
  }
}

const handler: SendHandler = {
  goto({next}){
    if (next === BACK) {
      const i = state.pages.indexOf(state.path);
      const backIndex = getRest(i - 1, state.pages.length);
      state.path = state.pages[backIndex];
    }
    state.path = next as string;

    // 페이지 이동시 핸들러 정리
    delaygoto.clear();
    raf.clear();
  },
  delaygoto({next, delay}){
    delaygoto.set(next, delay);
  },
  connectcanvas: ({src, save, target: canvas, options}) => {
    const {type, data} = store.get<HTMLCanvasElement|HTMLVideoElement>(src);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    if (type === 'webcam' || type === 'video') {
      const video = data as HTMLVideoElement;
      canvas.width = options?.width ?? video.videoWidth;
      canvas.height = options?.height ?? video.videoWidth;
      let filter: string;
      if (options && options.filter) {
        filter = options.filter.map(filter => Object.keys(filter).map((key => `${key}(${((filter as any)[key])})`))).join(' ');
      }
      raf.clear();
      raf.add(() => {
        ctx.filter = filter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        options.flipX && flipX(ctx);
        options.colorize && colorize(ctx, options.colorize);
      })
    }
  }
}