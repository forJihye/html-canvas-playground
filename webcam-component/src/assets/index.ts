import { AssetData, AssetType } from "@/assets.config";
import { WEBCAM } from "@/constant";
import { groupBy } from "@/helper/utils";

const findMediaDevicesByLabel = async (src: string) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const filter = devices.filter(({label}) => label.toLowerCase().indexOf(src.toLowerCase()) !== -1);
  const devicesGroup = groupBy((data) => data.groupId, filter);
  return devicesGroup;
}

class Assets extends Map<string, 
{
  type: AssetType;
  data: AssetData;
  loaded: boolean;
}> {
  async save(key: string, type: AssetType, data: AssetData, options?: any) {
    if (type === 'string' || type === 'boolean' || type === 'canvas' || type === 'number') {
      this.set(key, {
        type,
        data,
        loaded: true
      })
    } 
    else if (type === 'image') {
      await new Promise(res => {
        const img = new Image;
        img.onload = () => {
          this.set(key, {
            type,
            data: img,
            loaded: true
          });
          res(img);
        };
        img.onerror = () => {
          this.set(key, {
            type,
            data: null,
            loaded: false
          });
          res(null);
        };
        img.src = data as string;
      });
    }
    else if (type === 'video') {
      await new Promise(res => {
        const video = document.createElement('video');
        video.oncanplay = () => {
          this.set(key, {
            type,
            data: video,
            loaded: true
          });
          res(video);
        }
        video.onerror = () => {
          this.set(key, {
            type,
            data: null,
            loaded: false
          });
          res(null);
        }
        video.src = data as string;
        video.playsInline = true // 전체화면 막기
        video.muted = true;
        video.autoplay = true;
        if (options?.loop) video.loop = true;
      })
    } 
    else if (type === 'webcam') {
      const devices = await findMediaDevicesByLabel((data === WEBCAM ? '' : data) as string) as Record<string, MediaDeviceInfo[]>;
      const videoDevice = Object.values(devices).flat().find(({kind}) => kind == 'videoinput');
      
      if (!devices) {
        console.log('Not Found Media Devices!', devices);
        await new Promise(res => {
          const img = new Image;
          img.onload = () => {
            this.set(key, {
              type, 
              data: img, 
              loaded: true
            });    
            res(img);
          }
          img.src = 'https://dummyimage.com/600x100/666666/ffffff&text=webcam+not+connected';
        });
      } else if (videoDevice) {
        try {
          console.log(videoDevice)
          const video = document.createElement('video');
          const stream = await navigator.mediaDevices.getUserMedia({
            // video: {deviceId: {exact: videoDevice.deviceId}}
            video: {deviceId: videoDevice.deviceId}
          });
          video.srcObject = stream;
          await video.play();
          this.set(key, {
            type, 
            data: video, 
            loaded: true
          });
        } catch(err) {
          console.error('webcam', err);
        }
      }
    }
    else if (type === 'virtualKeyboard') {

    }
  }
}

const assets = new Assets();
console.log(assets);
export default assets;