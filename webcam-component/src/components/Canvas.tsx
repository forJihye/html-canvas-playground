import store from "@/store";
import { send } from "@/store/hook";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import CommonNode from "./CommonNode";

export type CanvasHandle = {
  draw: () => void;
};

export type Filters = (
  { 'grayscale': string }|
  { 'blur': string }|
  { 'brightness': string }|
  { 'contrast': string }|
  { 'drop-shadow': string }|
  { 'hue-rotate': string }|
  { 'invert': string }|
  { 'opacity': string }|
  { 'saturate': string }|
  { 'sepia': string }
)[];

type Props = {
  src: string;
  save?: string;
  width: number;
  height: number;
  flipX?: boolean;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filter?: Filters;
  colorize?: string;
  ref?: any;
};

const Canvas: NodeFC<Props> = forwardRef<CanvasHandle, Props>(({src, save, width, height, flipX, filter, crop, colorize, ...props}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [grayscale, setGrayscale] = useState(100);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(150);
  const [blur, setBlur] = useState(0.2);

  useEffect(() => {
    if (canvasRef.current) {
      if (flipX === undefined) flipX = true;
      send({
        type: 'connectcanvas', 
        src, 
        save, 
        target: canvasRef.current, 
        options: {width, height, flipX, crop, 
          filter: [
            {'grayscale': `${grayscale}%`},
            {'blur': `${blur}px`}, // 0.89
            {'brightness': `${brightness}`}, // 228
            {'contrast': `${contrast}%`},
          ], 
          colorize
        }
      });
    }
  }, [grayscale, brightness, contrast, blur]);

  useImperativeHandle(ref, () => ({
    draw: () => console.log('draw')
  }))

  return <>
    <canvas ref={canvasRef}></canvas>
    <div>grayscale {grayscale} <input type="range" min={0} max={100} step={10} value={grayscale} onInput={(ev) => setGrayscale(Number((ev.target as HTMLInputElement).value))} /></div>
    <div>brightness {brightness} <input type="range" min={0} max={1} step={0.1} value={brightness} onInput={(ev) => setBrightness(Number((ev.target as HTMLInputElement).value))} /></div>
    <div>contrast {contrast} <input type="range" min={100} max={3000} step={50} value={contrast} onInput={(ev) => setContrast(Number((ev.target as HTMLInputElement).value))} /></div>
    <div>blur {blur} <input type="range" min={0} max={10} step={0.1} value={blur} onInput={(ev) => setBlur(Number((ev.target as HTMLInputElement).value))} /></div>
  </>
  // return <CommonNode {...props}>
  //   <canvas ref={canvasRef}></canvas>
  // </CommonNode>
})

export default Canvas;