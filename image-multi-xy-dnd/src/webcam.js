export const findMediaDevices = async (label) => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  const findDevices = devices.filter((device) => device.label.toLowerCase().indexOf(label.toLowerCase()) !== -1);
  if (!findDevices) return null;
  else return findDevices.reduce((acc, val) => {
    const group = acc.find(({groupId}) => groupId === val.groupId) || (acc.push({groupId: val.groupId, devices: []}), acc[acc.length - 1]);
    group.devices.push(val);
    return acc;
  }, [])
}

export const webcamLoaded = async (label) => {
  const mediaDevices = await findMediaDevices(label)
  if (!mediaDevices.length) console.error(`Not Found Media: ${label}`);
  if (mediaDevices.length > 1) console.error('To Many Media Group!');
  
  const device = mediaDevices[0]
  const videoDevice = device.devices.find(({kind}) => kind === 'videoinput');
  if (videoDevice) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 1280, max: 1920 },
        height: { min: 720, max: 1080 },
        frameRate: { min: 30, max: 60 },
        deviceId: { exact: videoDevice.deviceId }
      }
    });
    const video = document.createElement('video');
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    return video;
  } else {
    console.error('No video device!');
    const img = await new Promise(res => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.src = 'https://dummyimage.com/600x100/666666/ffffff&text=Webcam+not+connected';
    });
    return img;
  }
}

export const raf = new class RAF extends Set {
  constructor() {
    super();
    this.playing = true;

    const self = this;
    requestAnimationFrame(function draw(t) {
      self.playing && self.forEach(f => f());
      requestAnimationFrame(draw);
    });
  }
  stop() {
    this.playing = false;
  }
  play() {
    this.playing = true;
  }
}