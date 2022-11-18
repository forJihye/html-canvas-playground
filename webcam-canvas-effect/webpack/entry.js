require('../src');

if(module.hot) {
  let prevTimeoutIndex = -1;
  let prevIntervalIndex = -1;
  let prevRAFIndex = -1;
  module.hot.accept((err) => {
    console.log('err', err);
  });
  module.hot.dispose(data => {
    console.log(module.hot.status());
    const tIdx = setTimeout(() => {});
    for (let i = prevTimeoutIndex; i < tIdx; i++) clearTimeout(i);
    prevTimeoutIndex = tIdx;

    const iIdx = setInterval(() => {});
    for (let i = prevIntervalIndex; i < iIdx; i++) clearInterval(i);
    prevIntervalIndex = iIdx;
    
    const rIdx = requestAnimationFrame(() => {});
    for (let i = prevRAFIndex; i < rIdx; i++) cancelAnimationFrame(i);
    prevRAFIndex = rIdx;
  });
}

