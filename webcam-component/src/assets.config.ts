import { WEBCAM } from "./constant";

(window as any).env = {
  SCREEN_WIDTH: 1920,
  SCREEN_HEIGHT: 1080,
};

export type AssetsConfig = {
  [key: string]: {
    type: 'image'|'video'|'canvas'|'webcam'|'virtualKeyboard'|'string'|'number'|'boolean'|'canvas'|'error';
    data: string|symbol|null|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement;
    options?: any;
  }
}

export type Asset = AssetsConfig[keyof AssetsConfig];
export type AssetKeys = keyof Asset;
export type AssetValues = Asset[AssetKeys];
export type AssetType = Asset['type'];
export type AssetData = Asset['data'];

const assetsConfig: AssetsConfig = {
  background: {
    type: 'image',
    data: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/kiosk-editor/hashsnap-intro.jpg'
  },
  video: {
    type: 'video',
    data: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/video/kiosk-hera-2105.mp4',
    options: {
      loop: true
    }
  },
  template: {
    type: 'image',
    data: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/kiosk-editor/hashsnap-template.png'
  },
  webcam: {
    type: 'webcam',
    data: WEBCAM
  },
  koenKey: {
    type: 'virtualKeyboard',
    data: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/virtual-keys/koen-key.json'
  },
  numberKey: {
    type: 'virtualKeyboard',
    data: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/virtual-keys/number-key.json'
  }
}

export default assetsConfig;