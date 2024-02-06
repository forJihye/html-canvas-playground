const constraints: MediaStreamConstraints = {
  video: true,
  audio: true,
};

const errGuard = async (f: Function, {delay = 1000, limit = Infinity}: {delay?: number, limit?: number} = {}) => {
  while (1) {
    try {
      const res = await f();
      return res;
    } catch (err) {
      console.log(err);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// const streamGuard: (c: MediaStreamConstraints, opt?: {delay?: number}) => Promise<MediaStream> = async (constraints, {delay = 1000} = {}) => {
//   while (true) {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia(constraints)
//       const videoTracks = stream.getVideoTracks();
//       if (videoTracks.length === 1 && videoTracks[0].label === 'Logi Capture') throw 'No cam';
//       return stream;
//     } catch (err) {
//       console.log(err);
//       await new Promise(res => setTimeout(res, delay))
//     }
//   }
// }

// const cam = new class Cam extends Set<HTMLVideoElement> {
//   #stream: MediaStream;
  
//   stop() {
//     this.#stream.getTracks().forEach(i => i.stop());
//   }
//   async getUserMedia(constraints: MediaStreamConstraints) {
//     // console.log('getUserMedia: START');
//     this.#stream = await streamGuard(constraints);
//     console.log('getUserMedia: END', this.#stream);
//     this.forEach(video => {
//       video.srcObject = this.#stream;
//       video.play();
//     });
//     this.#stream.getVideoTracks()[0].onended = () => this.getUserMedia(constraints);
//   }
//   subscribe(video: HTMLVideoElement) {
//     this.add(video);
//     video.srcObject = this.#stream;
//   }
// };
type Keys<T> = {
  [K in keyof T]: T[K];
};

type CSSStylePartial = Partial<Record<keyof CSSStyleDeclaration, unknown>>;
type HTMLProperties<T> = Partial<{
  [K in keyof T]: K extends 'style' ? CSSStylePartial : T[K];
}>;
const createElement: <K extends keyof HTMLElementTagNameMap>(t: K, p?: HTMLProperties<HTMLElement>) => HTMLElementTagNameMap[K] = (tagName, properties = {}) => Object.assign(document.createElement(tagName), properties);
const createTagFactory: <K extends keyof HTMLElementTagNameMap>(t: K) => TagFactory<HTMLElementTagNameMap[K]> = tagName => properties => createElement(tagName, properties);
type TagFactory<T extends HTMLElement> = (p?: HTMLProperties<T>) => T;
const Video: TagFactory<HTMLVideoElement> = createTagFactory('video');
const Div: TagFactory<HTMLDivElement> = createTagFactory('div');
const Span: TagFactory<HTMLSpanElement> = createTagFactory('span');
const Button: TagFactory<HTMLButtonElement> = createTagFactory('button');
const btn = Button({innerText: 'test'});
// createElement('div', {style: {boxSizing: 'border-box'}})

// cam.getUserMedia(constraints);
// const v1 = Video();
// const v2 = Video();
// const v3 = Video();
// cam.subscribe(v1);
// cam.subscribe(v2);
// cam.subscribe(v3);
// document.body.appendChild(v1);
// document.body.appendChild(v2);
// document.body.appendChild(v3);



class WebCamDevice {
  readonly name: string;
  readonly groupId: string;
  constructor(private readonly inputvideo: InputDeviceInfo, private readonly inputaudio: InputDeviceInfo) {
    this.name = inputvideo.label;
    this.groupId = inputvideo.groupId;
  };

  async getStream(): Promise<MediaStream> { 
    return await navigator.mediaDevices.getUserMedia({
      video: {deviceId:{exact: this.inputvideo?.deviceId}},
      audio: {deviceId:{exact: this.inputaudio?.deviceId}},
    });
  }
  toString() {
    return `${this.name} (${this.groupId.slice(0, 6)}...)`;
  }
}
const getWebcamList: () => Promise<WebCamDevice[]> = async () => {
  console.log((await navigator.mediaDevices.enumerateDevices()));
  const groupById = (await navigator.mediaDevices.enumerateDevices()).reduce((acc, device, i) => {
    if (['videoinput', 'audioinput'].every(i => i !== device.kind)) return acc;
    const {groupId} = device;
    !acc.has(groupId) && acc.set(groupId, new Map);
    device?.deviceId?.length === 64 && acc.get(groupId).set(device.kind, device);
    return acc;
  }, new Map);
  
  return [...groupById].map(([, deviceMap]) => new WebCamDevice(deviceMap.get('videoinput'), deviceMap.get('audioinput')));
};

class listSearch<T> {
  constructor(private readonly list: Array<T>) {}

  search(str: string, opts?: {}): T[] {
    return this.list.filter(i => Object.values(i).some(j => String(j).indexOf(str) !== -1));
  }
  one(str: string): T | void {
    return this.search(str)[0];
  }
}

const webcamBroadcast = new class WebcamBroadcast extends Map<WebCamDevice, Set<HTMLVideoElement>> {
  private streamStore: Map<WebCamDevice, MediaStream> = new Map;
  async stream(webcam: WebCamDevice, retry: number) {
    !this.has(webcam) && this.set(webcam, new Set);
    let stream;
    try {
      stream = await webcam.getStream();
      stream.getVideoTracks()[0].onended = () => setTimeout(() => this.stream(webcam, retry), retry);
    } catch (err) {
      console.error(err);
      setTimeout(() => this.stream(webcam, retry), retry);
      return;
    }
    this.streamStore.set(webcam, stream);
    const subscribers = this.get(webcam);
    [...subscribers].forEach(video => Object.assign(video, {srcObject: stream}).play());
    return;
  }
  getStream(webcam: WebCamDevice): MediaStream {
    return this.streamStore.get(webcam);
  }
  subscribe(video: HTMLVideoElement, webcam: WebCamDevice) {
    !this.has(webcam) && this.set(webcam, new Set);
    const subscribers = this.get(webcam);
    subscribers.add(video);
    const stream = this.streamStore.get(webcam);
    video.srcObject = stream;
    video.play();
  }
}

class WebcamRecorder {
  private mediaRecorder: MediaRecorder;
  private blob: Blob[] = [];
  constructor(private stream: MediaStream, opt: MediaRecorderOptions = {}) {
    this.mediaRecorder = new MediaRecorder(stream, opt);
    this.mediaRecorder.ondataavailable = ({data}) => data?.size > 0 && this.blob.push(data);
  }
  pause() {
    if (this.mediaRecorder.state === 'paused') this.mediaRecorder.resume();
    else this.mediaRecorder.pause();
  }
  start() {
    this.mediaRecorder.start();
  }
  stop(): Promise<Blob[]> {
    return new Promise(res => {
      this.mediaRecorder.onstop = () => res(this.blob);
      this.mediaRecorder.stop();
    });
  }
  reset() {
    this.blob = [];
  }
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

const main = async () => { try {
  const v1 = Video();
  const v2 = Video();
  const v3 = Video();
  const v4 = Video();
  const btnRecord = Button({innerText: 'Record'});
  const btnPause = Button({innerText: 'Pause'});
  const btnStop = Button({innerText: 'Stop'});
  const btnReset = Button({innerText: 'Reset'});
  document.body.appendChild(v1);
  document.body.appendChild(v2);
  document.body.appendChild(v3);
  document.body.appendChild(v4);
  document.body.appendChild(btnRecord);
  document.body.appendChild(btnPause);
  document.body.appendChild(btnStop);
  document.body.appendChild(btnReset);

  console.log("getWebcamList", await getWebcamList());
  const webcamList = new listSearch(await getWebcamList());
  const c922 = webcamList.one('c922 Pro Stream Webcam');
  const BRIO = webcamList.one('Logitech BRIO');
  const SR305 = webcamList.one('RGB Camera SR305');
  const SR305D = webcamList.one('Depth Camera SR305');
  
  console.log(c922, BRIO, SR305, SR305D);
  // if (!(c922 instanceof WebCamDevice)) return;
  // if (!(BRIO instanceof WebCamDevice)) return;
  // if (!(SR305 instanceof WebCamDevice)) return;
  // if (!(SR305D instanceof WebCamDevice)) return;
  
  if (c922) {
    webcamBroadcast.stream(c922, 1000);
    webcamBroadcast.subscribe(v1, c922);
    console.log(webcamBroadcast);
    await sleep(3000);

    const webcamRecorder = new WebcamRecorder(webcamBroadcast.getStream(c922), {
      audioBitsPerSecond : 128000,
      videoBitsPerSecond : 2500000,
    });
    // return 
    btnRecord.onclick = () => webcamRecorder.start();
    btnPause.onclick = () => webcamRecorder.pause();
    btnStop.onclick = async () => {
      const videoBuffer = new Blob(await webcamRecorder.stop(), {type: 'video/webm'});
      const url = URL.createObjectURL(videoBuffer)
      const atag = document.createElement('a');
      document.body.appendChild(atag);
      atag.href = url;
      atag.download = 'video.webm',
      atag.click();
      window.URL.revokeObjectURL(url)
      document.body.removeChild(atag);
    };
    btnReset.onclick = () => webcamRecorder.reset();
  }
  if (BRIO) {
    webcamBroadcast.stream(BRIO, 1000);
    webcamBroadcast.subscribe(v2, BRIO);
  }
  if (SR305) {
    webcamBroadcast.stream(SR305, 1000);
    webcamBroadcast.subscribe(v3, SR305);
  }
  if (SR305D) {
    // webcamBroadcast.stream(SR305D, 1000);
    // webcamBroadcast.subscribe(v4, SR305D);
  }
  // !(c922 instanceof WebCamDevice && BRIO instanceof WebCamDevice)) return;
} catch (error) {
  console.error(error)
  // throw Error(error)
}}
main()
