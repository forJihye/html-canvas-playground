import 'reflect-metadata';
import { Inject, Service } from 'typedi';
import { groupBy } from './utils';

@Service()
class Webcam {
  public video: HTMLVideoElement;
  public device: MediaDeviceInfo;
  constructor( @Inject('deviceName') deviceName: string ){
    this.video = Object.assign(document.createElement('video'), {autoplay: 'autoplay', muted: true});
    
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(async() => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const grouping = groupBy((data) => data.groupId, devices);
      const targetDevice = devices.find(({label}) => label.indexOf(deviceName) !== -1);
      if(!targetDevice) return;
      const deviceGroup = grouping[targetDevice.groupId];
      this.device = deviceGroup.filter(({kind}) => kind === 'videoinput')[0];
      navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: this.device.deviceId}}})
      .then(stream => {
        this.video.srcObject = stream;
        this.video.play();
      });
    });
  } 
  static getDeviceGroups(): Promise<Record<string, MediaDeviceInfo[]>> {
    return navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(async() => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const grouping = groupBy((data) => data.groupId, devices);
      return grouping;
    });
  }
}

export {
  Webcam
}

// c922 PLEOMAX
// Container.set('width', 400);
// Container.set('height', 400);
// Container.set('deviceName', 'PLEOMAX');

// Container.get(AppendComponent);
// Container.get(Flip);
// Container.get(Crop);