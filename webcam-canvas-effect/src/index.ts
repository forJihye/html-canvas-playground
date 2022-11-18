import { Webcam } from './webcam';
import { Mirroring, Flip, Crop, Grayscale, Contrast } from './canvas';
import { FilterApply } from './filter';

const rafSet = new Set<() => void>();
const webcam = new Webcam('c922');

const mirroring = new Mirroring(webcam.video);
const crop = new Crop(mirroring, 500, 700);
const flip = new Flip(crop);
const grayscale = new Grayscale(flip);

const filterApply = new FilterApply(grayscale);
document.body.appendChild(filterApply.canvas);

rafSet.add(() => {
  filterApply.render();
});

requestAnimationFrame(function timer(time){
  requestAnimationFrame(timer);
  rafSet.forEach(f => f());
});
