import assetsConfig from "@/assets.config";
import assets from ".";

const progressPromise = (
  promises: Promise<any>[], 
  tickCallback: (progress: number, length: number) => void
) => {
  var length: number = promises.length;
  var progress: number = 0;
  
  function tick(promise: Promise<any>) {
    promise.then(function () {
      progress++;
      tickCallback(progress, length);
    });
    return promise;
  }
  return Promise.all(promises.map(tick));
}

const assetsLoaded = async () => {
  const promises = Object.entries(assetsConfig).map(([key, {type, data, options}]) => assets.save(key, type, data, options));
  return progressPromise(promises, (completed, total) => {
    const value = Math.round(completed / total * 100);
    console.log('assetsLoaded', value);
  });
}

export default assetsLoaded;