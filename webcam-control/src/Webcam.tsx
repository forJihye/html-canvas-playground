import { CSSProperties, FC, MouseEvent, useEffect, useRef, useState } from "react";
import { drawCover } from "./helper/utils";

const raf = new class RAF extends Set {
  play = true;
  constructor() {
    super();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    requestAnimationFrame(function draw(){
      self.play && self.forEach(f => f());
      requestAnimationFrame(draw);
    });
  }
  off() {
    this.play = false;
  }
  on() {
    this.play = true;
  }
}

const findDevicesByLabel = async (str: string) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.error('Does not support enumerateDevices()');
    return [];
  }
  const list = await navigator.mediaDevices.enumerateDevices();
  const filtered = list.filter(({label}) => label.toLowerCase().indexOf(str.toLowerCase()) !== -1);
  return filtered.reduce((acc, data) => {
    const group = acc.find(({groupId}) => groupId === data.groupId) || (acc.push({groupId: data.groupId, devices: []}), acc[acc.length - 1]);
    group.devices.push(data);
    return acc;    
  }, [] as {groupId: string; devices: MediaDeviceInfo[]}[]);
};

const getVideo = async () => {
  const groups = await findDevicesByLabel("Logitech BRIO" as string);
  if (groups.length > 1) {
    console.log(groups);
    throw new Error('To many groups!');
  }
  const group = groups[0];
  const videoDevice = group?.devices.find(({kind}) => kind === 'videoinput')
  if (videoDevice) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: 4096,
        height: 2160,
        frameRate: 30,
        deviceId: { exact: videoDevice.deviceId },
      }
    });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.onerror = err => new Error(err.toString());
    await video.play();
    return video
  } else {
    console.error('No video device!');
    const img = await new Promise<HTMLImageElement>(res => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.src = 'https://dummyimage.com/400x100/666666/ffffff&text=Webcam+not+connected';
    });
    return img;
  }
}

const Webcam: FC<{
  width: number;
  height: number;
  options: Partial<{
    width: number;
    height: number;
    direction: string;
  }>;
  style?: CSSProperties;
}> = ({
  width,
  height,
  options,
  ...props
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement|null>(null);
  useEffect(() => {
    (async() => {
      const video = await getVideo() as HTMLVideoElement;
      if (video instanceof HTMLVideoElement) setVideo(video);
      else setVideo(null);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ref.current || video === null) return;
    const canvas = ref.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // console.log(video.videoWidth, video.videoHeight)
    canvas.width = width;
    canvas.height = height;
    
    raf.add(() => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
      ctx.scale(-1, 1);
      (options?.direction !== 'center') && ctx.rotate(options?.direction === 'right' ? -Math.PI / 2 : Math.PI / 2);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      drawCover(ctx, video);
    });

  }, [video, height, options, width]);

  return <div {...props} style={{ width, height, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', ...props.style }}>
    <canvas ref={ref} style={{position:'relative', width:'100%', height:'auto'}}></canvas>
    <button type="button" onClick={(ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();
      return null
    }}>촬영하기</button>
  </div>
}

export default Webcam;